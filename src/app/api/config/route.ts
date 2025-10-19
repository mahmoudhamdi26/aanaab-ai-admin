import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminConfig, ConfigUpdateRequest } from "@/types/config";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all configuration sections
    const configs = await prisma.systemConfig.findMany({
      orderBy: { section: 'asc' }
    });

    // Convert to AdminConfig format
    const adminConfig: Partial<AdminConfig> = {};

    configs.forEach(config => {
      const section = config.section as keyof AdminConfig;
      const configData = config.config as any;

      // Handle nested provider structures
      if (section === 'llm' && configData.providers) {
        adminConfig.llmProviders = configData.providers;
      } else if (section === 'embedding' && configData.providers) {
        adminConfig.embeddingProviders = configData.providers;
      } else {
        adminConfig[section] = configData;
      }
    });

    return NextResponse.json(adminConfig);
  } catch (error) {
    console.error("Error fetching config:", error);
    return NextResponse.json(
      { error: "Failed to fetch configuration" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: ConfigUpdateRequest = await request.json();
    let { section, data } = body;

    // Handle provider arrays - wrap them in the expected structure
    let configData = data;
    if (section === 'llmProviders') {
      // Get existing LLM config to preserve other settings
      const existingConfig = await prisma.systemConfig.findUnique({
        where: { section: 'llm' }
      });

      configData = {
        ...(existingConfig?.config as any || {}),
        providers: data
      };
      section = 'llm' as any;
    } else if (section === 'embeddingProviders') {
      // Get existing embedding config to preserve other settings
      const existingConfig = await prisma.systemConfig.findUnique({
        where: { section: 'embedding' }
      });

      configData = {
        ...(existingConfig?.config as any || {}),
        providers: data
      };
      section = 'embedding' as any;
    }

    // Get current config
    const currentConfig = await prisma.systemConfig.findUnique({
      where: { section }
    });

    // Create or update config
    const updatedConfig = await prisma.systemConfig.upsert({
      where: { section },
      update: {
        config: configData,
        version: { increment: 1 },
        updated_by: session.user.id
      },
      create: {
        section,
        config: configData,
        updated_by: session.user.id
      }
    });

    // Log the change
    if (currentConfig) {
      await prisma.configHistory.create({
        data: {
          section,
          old_config: currentConfig.config,
          new_config: configData,
          version: currentConfig.version + 1,
          updated_by: session.user.id
        }
      });
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        user_id: session.user.id,
        action: "UPDATE",
        resource: "config",
        resource_id: section,
        details: { section, changes: data }
      }
    });

    return NextResponse.json(updatedConfig);
  } catch (error) {
    console.error("Error updating config:", error);
    return NextResponse.json(
      { error: "Failed to update configuration" },
      { status: 500 }
    );
  }
}
