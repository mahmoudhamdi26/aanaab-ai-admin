import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { syncType, config, courseIds } = body;

    // Generate unique job ID
    const jobId = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create sync job
    const syncJob = await prisma.syncJob.create({
      data: {
        jobId,
        syncType,
        config,
        courseIds: courseIds ? JSON.stringify(courseIds) : null,
        status: "queued"
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SYNC_START",
        resource: "sync_job",
        resourceId: jobId,
        details: { syncType, config, courseIds }
      }
    });

    // TODO: Trigger actual sync process via API call to main service
    // This would call the main Aanaab AI service to start the sync

    return NextResponse.json(syncJob);
  } catch (error) {
    console.error("Error starting sync:", error);
    return NextResponse.json(
      { error: "Failed to start sync process" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const syncJobs = await prisma.syncJob.findMany({
      orderBy: { created_at: 'desc' },
      take: 50
    });

    return NextResponse.json(syncJobs);
  } catch (error) {
    console.error("Error fetching sync jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch sync jobs" },
      { status: 500 }
    );
  }
}
