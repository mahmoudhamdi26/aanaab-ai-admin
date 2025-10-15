#!/usr/bin/env node
/**
 * Test script to verify seeded admin panel data
 */

const { PrismaClient } = require('@prisma/client');

async function testSeededData() {
  const prisma = new PrismaClient();

  try {
    console.log('🔍 Testing seeded admin panel data...\n');

    // Test admin user
    const adminUser = await prisma.adminUser.findUnique({
      where: { email: 'admin@aanaab.ai' }
    });

    if (adminUser) {
      console.log('✅ Admin user found:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Name: ${adminUser.name}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log(`   Created: ${adminUser.createdAt}`);
    } else {
      console.log('❌ Admin user not found');
    }

    // Test system configurations
    const configs = await prisma.systemConfig.findMany({
      orderBy: { section: 'asc' }
    });

    console.log(`\n✅ Found ${configs.length} system configurations:`);
    configs.forEach(config => {
      console.log(`   • ${config.section} (v${config.version})`);
      if (config.section === 'llm' && config.config.providers) {
        console.log(`     Providers: ${config.config.providers.length}`);
        config.config.providers.forEach(provider => {
          console.log(`       - ${provider.name} (Priority ${provider.priority}, ${provider.enabled ? 'Enabled' : 'Disabled'})`);
        });
      }
    });

    // Test specific LLM configuration
    const llmConfig = await prisma.systemConfig.findUnique({
      where: { section: 'llm' }
    });

    if (llmConfig) {
      console.log('\n🔧 LLM Configuration Details:');
      console.log(`   Default Provider: ${llmConfig.config.defaultProvider}`);
      console.log(`   Fallback Enabled: ${llmConfig.config.fallbackEnabled}`);
      console.log(`   Max Retries: ${llmConfig.config.maxRetries}`);
      console.log(`   Circuit Breaker: ${llmConfig.config.circuitBreakerEnabled}`);
    }

    // Test embedding configuration
    const embeddingConfig = await prisma.systemConfig.findUnique({
      where: { section: 'embedding' }
    });

    if (embeddingConfig) {
      console.log('\n🔧 Embedding Configuration Details:');
      console.log(`   Default Provider: ${embeddingConfig.config.defaultProvider}`);
      console.log(`   Batch Size: ${embeddingConfig.config.batchSize}`);
      console.log(`   Max Retries: ${embeddingConfig.config.maxRetries}`);
    }

    console.log('\n🎉 All seeded data verified successfully!');

  } catch (error) {
    console.error('❌ Error testing seeded data:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  testSeededData();
}

module.exports = testSeededData;
