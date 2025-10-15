#!/usr/bin/env node
/**
 * Admin Panel Database Seeding Script
 * 
 * This script generates default configuration values for the Aanaab AI Admin Panel.
 * It creates sensible defaults based on environment variables and populates the database.
 * 
 * Usage:
 *   node scripts/seed-admin-panel.js [--reset] [--dry-run]
 *   
 * Options:
 *   --reset     Reset existing configurations (WARNING: This will delete existing data)
 *   --dry-run   Show what would be created without actually creating it
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

class AdminPanelSeeder {
  constructor(options = {}) {
    this.dryRun = options.dryRun || false;
    this.reset = options.reset || false;
    this.prisma = new PrismaClient();

    // Load environment variables
    this.env = {
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || 'your-openai-api-key',
      OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4',
      OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-ada-002',
      OPENAI_MAX_TOKENS: parseInt(process.env.OPENAI_MAX_TOKENS) || 4096,
      OPENAI_TEMPERATURE: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,

      GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
      GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-pro',
      GEMINI_EMBEDDING_MODEL: process.env.GEMINI_EMBEDDING_MODEL || 'models/embedding-001',

      LIVEKIT_API_KEY: process.env.LIVEKIT_API_KEY || '',
      LIVEKIT_API_SECRET: process.env.LIVEKIT_API_SECRET || '',
      LIVEKIT_WS_URL: process.env.LIVEKIT_WS_URL || '',
      ENABLE_LIVEKIT: process.env.ENABLE_LIVEKIT === 'true' || false,

      QDRANT_HOST: process.env.QDRANT_HOST || 'localhost',
      QDRANT_PORT: parseInt(process.env.QDRANT_PORT) || 6333,
      QDRANT_API_KEY: process.env.QDRANT_API_KEY || '',
      QDRANT_TIMEOUT: parseInt(process.env.QDRANT_TIMEOUT) || 60,
      QDRANT_COLLECTION_NAME: process.env.QDRANT_COLLECTION_NAME || 'aanaab_courses',

      CHUNK_SIZE: parseInt(process.env.CHUNK_SIZE) || 512,
      CHUNK_OVERLAP: parseInt(process.env.CHUNK_OVERLAP) || 50,
      MAX_CHUNKS_PER_DOCUMENT: parseInt(process.env.MAX_CHUNKS_PER_DOCUMENT) || 1000,

      BATCH_DEFAULT_SIZE: parseInt(process.env.BATCH_DEFAULT_SIZE) || 5,
      BATCH_MAX_RETRIES: parseInt(process.env.BATCH_MAX_RETRIES) || 3,
      PROCESSING_MODE_DEFAULT: process.env.PROCESSING_MODE_DEFAULT || 'priority-only',

      AI_DB_HOST: process.env.AI_DB_HOST || 'localhost',
      AI_DB_PORT: parseInt(process.env.AI_DB_PORT) || 5433,
      AI_DB_NAME: process.env.AI_DB_NAME || 'aanaab_ai',
      AI_DB_USER: process.env.AI_DB_USER || 'ai_service',

      LMS_BASE_URL: process.env.LMS_BASE_URL || 'http://localhost:3000',
      LMS_API_KEY: process.env.LMS_API_KEY || '',

      REDIS_HOST: process.env.REDIS_HOST || 'localhost',
      REDIS_PORT: parseInt(process.env.REDIS_PORT) || 6379,
      REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
      REDIS_DB: parseInt(process.env.REDIS_DB) || 0,

      API_HOST: process.env.API_HOST || '0.0.0.0',
      API_PORT: parseInt(process.env.API_PORT) || 8000,
      API_TITLE: process.env.API_TITLE || 'Aanaab AI Microservice',
      API_VERSION: process.env.API_VERSION || '0.1.0',

      MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 50,
      ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES || 'pdf,txt,docx',
      UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',

      RATE_LIMIT_REQUESTS: parseInt(process.env.RATE_LIMIT_REQUESTS) || 100,
      RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW) || 3600,

      CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:8080',
      CORS_METHODS: process.env.CORS_METHODS || 'GET,POST,PUT,DELETE,OPTIONS',
      CORS_HEADERS: process.env.CORS_HEADERS || '*',

      WORKERS: parseInt(process.env.WORKERS) || 1,
      TIMEOUT: parseInt(process.env.TIMEOUT) || 300,
      KEEP_ALIVE: parseInt(process.env.KEEP_ALIVE) || 65,

      ENVIRONMENT: process.env.ENVIRONMENT || 'development',
      DEBUG: process.env.DEBUG === 'true' || true,
      LOG_LEVEL: process.env.LOG_LEVEL || 'INFO',

      JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || 'your-jwt-secret-key',
      API_RATE_LIMIT: parseInt(process.env.API_RATE_LIMIT) || 100,
      RAILS_API_KEY: process.env.RAILS_API_KEY || 'your-rails-api-key',

      KEYCLOAK_SERVER_URL: process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8080',
      KEYCLOAK_REALM_ID: process.env.KEYCLOAK_REALM_ID || 'aanaab',
      KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID || 'aanaab-ai',
      KEYCLOAK_VERIFY_SIGNATURE: process.env.KEYCLOAK_VERIFY_SIGNATURE === 'true' || false
    };
  }

  async hashPassword(password) {
    return await bcrypt.hash(password, 12);
  }

  async createAdminUser() {
    const adminUser = {
      id: 'admin_default_001',
      email: 'admin@aanaab.ai',
      name: 'System Administrator',
      password: await this.hashPassword('admin123!@#'),
      role: 'super_admin'
    };

    if (this.dryRun) {
      console.log(`[DRY RUN] Would create admin user: ${adminUser.email}`);
      return adminUser;
    }

    const user = await this.prisma.adminUser.upsert({
      where: { email: adminUser.email },
      update: {
        name: adminUser.name,
        password: adminUser.password,
        role: adminUser.role
      },
      create: adminUser
    });

    console.log(`✅ Created admin user: ${user.email}`);
    return user;
  }

  async createLLMProvidersConfig() {
    const providers = [
      {
        id: 'openai_primary',
        name: 'OpenAI GPT-4',
        enabled: true,
        priority: 1,
        apiKey: this.env.OPENAI_API_KEY,
        model: this.env.OPENAI_MODEL,
        maxTokens: this.env.OPENAI_MAX_TOKENS,
        temperature: this.env.OPENAI_TEMPERATURE,
        timeout: 30,
        retryAttempts: 2,
        fallbackEnabled: true
      },
      {
        id: 'openai_fallback',
        name: 'OpenAI GPT-3.5 Turbo',
        enabled: true,
        priority: 2,
        apiKey: this.env.OPENAI_API_KEY,
        model: 'gpt-3.5-turbo',
        maxTokens: 2048,
        temperature: 0.7,
        timeout: 30,
        retryAttempts: 1,
        fallbackEnabled: true
      }
    ];

    // Add Gemini if API key is available
    if (this.env.GEMINI_API_KEY) {
      providers.push({
        id: 'gemini_fallback',
        name: 'Google Gemini Pro',
        enabled: true,
        priority: 3,
        apiKey: this.env.GEMINI_API_KEY,
        model: this.env.GEMINI_MODEL,
        maxTokens: 3072,
        temperature: 0.7,
        timeout: 45,
        retryAttempts: 2,
        fallbackEnabled: true
      });
    }

    const config = {
      providers,
      defaultProvider: 'openai_primary',
      fallbackEnabled: true,
      maxRetries: 3,
      circuitBreakerEnabled: true
    };

    if (this.dryRun) {
      console.log(`[DRY RUN] Would create LLM config with ${providers.length} providers`);
      return config;
    }

    const systemConfig = await this.prisma.systemConfig.upsert({
      where: { section: 'llm' },
      update: {
        config,
        version: { increment: 1 },
        updated_by: 'system'
      },
      create: {
        section: 'llm',
        config,
        version: 1,
        updated_by: 'system'
      }
    });

    console.log(`✅ Created LLM providers configuration with ${providers.length} providers`);
    return systemConfig;
  }

  async createEmbeddingProvidersConfig() {
    const providers = [
      {
        id: 'openai_embeddings',
        name: 'OpenAI Embeddings',
        enabled: true,
        apiKey: this.env.OPENAI_API_KEY,
        model: this.env.OPENAI_EMBEDDING_MODEL,
        dimensions: 1536,
        maxTokens: 8191,
        timeout: 30,
        retryAttempts: 2
      }
    ];

    // Add Gemini embeddings if API key is available
    if (this.env.GEMINI_API_KEY) {
      providers.push({
        id: 'gemini_embeddings',
        name: 'Google Gemini Embeddings',
        enabled: true,
        apiKey: this.env.GEMINI_API_KEY,
        model: this.env.GEMINI_EMBEDDING_MODEL,
        dimensions: 768,
        maxTokens: 2048,
        timeout: 45,
        retryAttempts: 2
      });
    }

    const config = {
      providers,
      defaultProvider: 'openai_embeddings',
      batchSize: 100,
      maxRetries: 3
    };

    if (this.dryRun) {
      console.log(`[DRY RUN] Would create embedding config with ${providers.length} providers`);
      return config;
    }

    const systemConfig = await this.prisma.systemConfig.upsert({
      where: { section: 'embedding' },
      update: {
        config,
        version: { increment: 1 },
        updated_by: 'system'
      },
      create: {
        section: 'embedding',
        config,
        version: 1,
        updated_by: 'system'
      }
    });

    console.log(`✅ Created embedding providers configuration with ${providers.length} providers`);
    return systemConfig;
  }

  async createSystemConfig() {
    const config = {
      environment: this.env.ENVIRONMENT,
      debug: this.env.DEBUG,
      logLevel: this.env.LOG_LEVEL,
      apiHost: this.env.API_HOST,
      apiPort: this.env.API_PORT,
      apiTitle: this.env.API_TITLE,
      apiVersion: this.env.API_VERSION,
      maxFileSize: this.env.MAX_FILE_SIZE,
      allowedFileTypes: this.env.ALLOWED_FILE_TYPES.split(','),
      uploadDir: this.env.UPLOAD_DIR,
      rateLimitRequests: this.env.RATE_LIMIT_REQUESTS,
      rateLimitWindow: this.env.RATE_LIMIT_WINDOW,
      corsOrigins: this.env.CORS_ORIGINS.split(','),
      corsMethods: this.env.CORS_METHODS.split(','),
      corsHeaders: this.env.CORS_HEADERS.split(','),
      workers: this.env.WORKERS,
      timeout: this.env.TIMEOUT,
      keepAlive: this.env.KEEP_ALIVE
    };

    if (this.dryRun) {
      console.log('[DRY RUN] Would create system configuration');
      return config;
    }

    const systemConfig = await this.prisma.systemConfig.upsert({
      where: { section: 'system' },
      update: {
        config,
        version: { increment: 1 },
        updated_by: 'system'
      },
      create: {
        section: 'system',
        config,
        version: 1,
        updated_by: 'system'
      }
    });

    console.log('✅ Created system configuration');
    return systemConfig;
  }

  async createLiveKitConfig() {
    const config = {
      enabled: this.env.ENABLE_LIVEKIT,
      apiKey: this.env.LIVEKIT_API_KEY,
      apiSecret: this.env.LIVEKIT_API_SECRET,
      wsUrl: this.env.LIVEKIT_WS_URL,
      roomPrefix: 'aanaab_',
      maxParticipants: 50,
      recordingEnabled: true,
      transcriptionEnabled: true,
      timeout: 300
    };

    if (this.dryRun) {
      console.log('[DRY RUN] Would create LiveKit configuration');
      return config;
    }

    const systemConfig = await this.prisma.systemConfig.upsert({
      where: { section: 'livekit' },
      update: {
        config,
        version: { increment: 1 },
        updated_by: 'system'
      },
      create: {
        section: 'livekit',
        config,
        version: 1,
        updated_by: 'system'
      }
    });

    console.log('✅ Created LiveKit configuration');
    return systemConfig;
  }

  async createRAGConfig() {
    const config = {
      type: 'normal', // or 'langgraph'
      chunkSize: this.env.CHUNK_SIZE,
      chunkOverlap: this.env.CHUNK_OVERLAP,
      maxChunksPerDocument: this.env.MAX_CHUNKS_PER_DOCUMENT,
      vectorStore: {
        type: 'qdrant',
        host: this.env.QDRANT_HOST,
        port: this.env.QDRANT_PORT,
        apiKey: this.env.QDRANT_API_KEY,
        timeout: this.env.QDRANT_TIMEOUT,
        collectionName: this.env.QDRANT_COLLECTION_NAME
      },
      retrievalSettings: {
        topK: 5,
        scoreThreshold: 0.7,
        rerankEnabled: false
      },
      langgraphSettings: {
        enabled: false,
        maxIterations: 10,
        recursionLimit: 25
      }
    };

    if (this.dryRun) {
      console.log('[DRY RUN] Would create RAG configuration');
      return config;
    }

    const systemConfig = await this.prisma.systemConfig.upsert({
      where: { section: 'rag' },
      update: {
        config,
        version: { increment: 1 },
        updated_by: 'system'
      },
      create: {
        section: 'rag',
        config,
        version: 1,
        updated_by: 'system'
      }
    });

    console.log('✅ Created RAG configuration');
    return systemConfig;
  }

  async createSyncConfig() {
    const config = {
      batchSize: this.env.BATCH_DEFAULT_SIZE,
      maxRetries: this.env.BATCH_MAX_RETRIES,
      backoffInitialSeconds: 1.0,
      backoffMaxSeconds: 16.0,
      processingMode: this.env.PROCESSING_MODE_DEFAULT,
      allowRuntimeConfigUpdates: true,
      lmsBaseUrl: this.env.LMS_BASE_URL,
      lmsApiKey: this.env.LMS_API_KEY,
      lmsDbConfig: {
        host: 'localhost',
        port: 5432,
        name: 'aanaab_lms_development',
        user: 'postgres',
        password: '',
        sslMode: 'disable',
        readonly: false
      },
      aiDbConfig: {
        host: this.env.AI_DB_HOST,
        port: this.env.AI_DB_PORT,
        name: this.env.AI_DB_NAME,
        user: this.env.AI_DB_USER,
        password: '***', // Don't store actual password
        sslMode: 'disable'
      }
    };

    if (this.dryRun) {
      console.log('[DRY RUN] Would create sync configuration');
      return config;
    }

    const systemConfig = await this.prisma.systemConfig.upsert({
      where: { section: 'sync' },
      update: {
        config,
        version: { increment: 1 },
        updated_by: 'system'
      },
      create: {
        section: 'sync',
        config,
        version: 1,
        updated_by: 'system'
      }
    });

    console.log('✅ Created sync configuration');
    return systemConfig;
  }

  async createDatabaseConfig() {
    const config = {
      aiDbConfig: {
        host: this.env.AI_DB_HOST,
        port: this.env.AI_DB_PORT,
        name: this.env.AI_DB_NAME,
        user: this.env.AI_DB_USER,
        password: '***', // Don't store actual password
        sslMode: 'disable'
      },
      lmsDbConfig: {
        host: 'localhost',
        port: 5432,
        name: 'aanaab_lms_development',
        user: 'postgres',
        password: '',
        sslMode: 'disable',
        readonly: false
      },
      redisConfig: {
        host: this.env.REDIS_HOST,
        port: this.env.REDIS_PORT,
        password: this.env.REDIS_PASSWORD,
        db: this.env.REDIS_DB,
        url: `redis://${this.env.REDIS_HOST}:${this.env.REDIS_PORT}/${this.env.REDIS_DB}`
      }
    };

    if (this.dryRun) {
      console.log('[DRY RUN] Would create database configuration');
      return config;
    }

    const systemConfig = await this.prisma.systemConfig.upsert({
      where: { section: 'database' },
      update: {
        config,
        version: { increment: 1 },
        updated_by: 'system'
      },
      create: {
        section: 'database',
        config,
        version: 1,
        updated_by: 'system'
      }
    });

    console.log('✅ Created database configuration');
    return systemConfig;
  }

  async createSecurityConfig() {
    const config = {
      jwtSecretKey: this.env.JWT_SECRET_KEY,
      apiRateLimit: this.env.API_RATE_LIMIT,
      railsApiKey: this.env.RAILS_API_KEY,
      keycloakConfig: {
        serverUrl: this.env.KEYCLOAK_SERVER_URL,
        realm: this.env.KEYCLOAK_REALM_ID,
        clientId: this.env.KEYCLOAK_CLIENT_ID,
        verifySignature: this.env.KEYCLOAK_VERIFY_SIGNATURE
      },
      corsConfig: {
        origins: this.env.CORS_ORIGINS.split(','),
        methods: this.env.CORS_METHODS.split(','),
        headers: this.env.CORS_HEADERS.split(',')
      },
      rateLimiting: {
        requests: this.env.RATE_LIMIT_REQUESTS,
        window: this.env.RATE_LIMIT_WINDOW
      }
    };

    if (this.dryRun) {
      console.log('[DRY RUN] Would create security configuration');
      return config;
    }

    const systemConfig = await this.prisma.systemConfig.upsert({
      where: { section: 'security' },
      update: {
        config,
        version: { increment: 1 },
        updated_by: 'system'
      },
      create: {
        section: 'security',
        config,
        version: 1,
        updated_by: 'system'
      }
    });

    console.log('✅ Created security configuration');
    return systemConfig;
  }

  async resetConfigurations() {
    console.log('⚠️  WARNING: This will delete all existing configurations!');

    if (this.dryRun) {
      console.log('[DRY RUN] Would reset all configurations');
      return;
    }

    await this.prisma.configHistory.deleteMany();
    await this.prisma.systemConfig.deleteMany();
    await this.prisma.adminUser.deleteMany({
      where: {
        email: { not: 'admin@aanaab.ai' }
      }
    });

    console.log('🗑️  Reset all configurations');
  }

  async seedAll() {
    console.log('🌱 Starting admin panel database seeding...');
    console.log(`Environment: ${this.env.ENVIRONMENT}`);
    console.log(`Dry run: ${this.dryRun}`);
    console.log('-'.repeat(50));

    try {
      if (this.reset) {
        await this.resetConfigurations();
      }

      // Create configurations
      await this.createAdminUser();
      await this.createSystemConfig();
      await this.createLLMProvidersConfig();
      await this.createEmbeddingProvidersConfig();
      await this.createLiveKitConfig();
      await this.createRAGConfig();
      await this.createSyncConfig();
      await this.createDatabaseConfig();
      await this.createSecurityConfig();

      console.log('-'.repeat(50));
      console.log('🎉 Admin panel seeding completed successfully!');
      console.log('\n📋 Summary:');
      console.log('   • Admin user created: admin@aanaab.ai');
      console.log('   • Default password: admin123!@#');
      console.log('   • System configurations created');
      console.log('   • LLM providers with fallback support');
      console.log('   • Embedding providers configured');
      console.log('   • LiveKit, RAG, Sync, Database, and Security configs');
      console.log('\n🔐 Next steps:');
      console.log('   1. Change the default admin password');
      console.log('   2. Update API keys with your actual values');
      console.log('   3. Configure provider priorities as needed');
      console.log('   4. Test the admin panel at http://localhost:3001');

    } catch (error) {
      console.error(`❌ Error during seeding: ${error.message}`);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options = {
    reset: args.includes('--reset'),
    dryRun: args.includes('--dry-run')
  };

  const seeder = new AdminPanelSeeder(options);

  try {
    await seeder.seedAll();
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = AdminPanelSeeder;
