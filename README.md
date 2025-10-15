# Aanaab AI Admin Panel

A Next.js admin panel for managing the Aanaab AI Microservice configuration.

## Features

- **System Configuration**: Environment settings, API configuration, logging
- **LLM Providers**: Configure multiple providers with priority and fallback support
- **Embedding Providers**: Manage embedding models for vector operations
- **LiveKit Integration**: Real-time communication settings
- **RAG Systems**: Configure normal and LangGraph RAG systems
- **Sync Process**: Manage content synchronization settings
- **Database Configuration**: AI and LMS database connections
- **Security Settings**: Authentication, CORS, and API security
- **Sync Jobs Monitoring**: Real-time sync job status and management

### LLM Provider Fallback System

The admin panel includes a robust fallback system for LLM providers:

- **Priority-based Selection**: Providers are ordered by priority (1 = primary, 2+ = fallback)
- **Automatic Failover**: If the primary provider fails, the system automatically tries fallback providers
- **Configurable Timeouts**: Set custom timeout values for each provider
- **Retry Logic**: Configure retry attempts before falling back to the next provider
- **Real-time Validation**: Validate provider configurations before saving
- **Status Monitoring**: Visual indicators for provider status and fallback availability

#### Example Configuration:
```
Primary Provider (Priority 1): OpenAI GPT-4
Fallback 1 (Priority 2): OpenAI GPT-3.5-turbo  
Fallback 2 (Priority 3): Google Gemini Pro
```

### Database Seeding

The admin panel includes a comprehensive seeding system that automatically populates the database with sensible default configurations:

#### Available Scripts:
- `npm run seed` - Seed the database with default configurations
- `npm run seed:dry-run` - Preview what would be created without making changes
- `npm run seed:reset` - Reset all configurations (WARNING: Deletes existing data)
- `npm run test:seed` - Verify seeded data integrity

#### What Gets Seeded:
- **Admin User**: `admin@aanaab.ai` with password `admin123!@#`
- **LLM Providers**: OpenAI GPT-4 (primary) and GPT-3.5-turbo (fallback)
- **Embedding Providers**: OpenAI embeddings with batch processing
- **System Config**: Environment, API, file upload, and performance settings
- **LiveKit Config**: Real-time communication settings
- **RAG Config**: Vector store and retrieval settings
- **Sync Config**: Batch processing and database connection settings
- **Database Config**: AI and LMS database configurations
- **Security Config**: JWT, CORS, and authentication settings

#### Environment Variables:
The seeding script reads from environment variables to create configurations that match your current setup. Key variables include:
- `OPENAI_API_KEY`, `GEMINI_API_KEY` - API keys for providers
- `QDRANT_HOST`, `QDRANT_PORT` - Vector database settings
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET` - Real-time communication
- `AI_DB_HOST`, `AI_DB_PORT` - Database connection settings

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (shared with main AI service)
- Main Aanaab AI service running

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-key
DATABASE_URL="postgresql://ai_service:password@localhost:5433/aanaab_ai"
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-ai-service-api-key
```

3. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

4. Seed the database with default configurations:
```bash
# Set the DATABASE_URL environment variable
export DATABASE_URL="postgresql://ai_service:ai_secure_password_123@localhost:5433/aanaab_ai"

# Run the seeding script
npm run seed

# Or test what would be created first
npm run seed:dry-run

# Or reset existing configurations (WARNING: Deletes data)
npm run seed:reset
```

5. Verify the seeded data:
```bash
npm run test:seed
```

6. Start the development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:3001`.

## Configuration

The admin panel reads configuration from the main AI service and allows you to:

1. **View Current Settings**: All configuration sections display current values
2. **Update Settings**: Modify configuration through the UI
3. **Validate Changes**: Built-in validation for configuration updates
4. **Monitor Sync Jobs**: Track synchronization progress and status
5. **Audit Trail**: All changes are logged with timestamps and user information

## Database Schema

The admin panel uses its own database tables:

- `admin_users`: Admin user accounts
- `system_configs`: Configuration storage by section
- `config_history`: Change history and versioning
- `sync_jobs`: Sync job tracking
- `audit_logs`: Activity logging

## Security

- NextAuth.js for authentication
- Role-based access control
- Secure password hashing with bcrypt
- API key protection
- CORS configuration

## Development

### Project Structure

```
admin/
├── src/
│   ├── app/                 # Next.js app router
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   └── config-panels/  # Configuration panels
│   ├── lib/                # Utilities and configurations
│   ├── types/              # TypeScript type definitions
│   └── hooks/              # Custom React hooks
├── prisma/                 # Database schema
└── public/                 # Static assets
```

### Adding New Configuration Sections

1. Add types to `src/types/config.ts`
2. Create a configuration panel component
3. Add the panel to the main dashboard
4. Update the API routes as needed

## Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

3. Set up environment variables in your production environment

## Integration with Main Service

The admin panel integrates with the main Aanaab AI service by:

1. **Reading Configuration**: Fetches current settings from the main service
2. **Updating Configuration**: Sends configuration updates to the main service
3. **Monitoring Sync Jobs**: Displays sync job status from the main service
4. **Audit Logging**: Logs all configuration changes

## Support

For issues and questions, please refer to the main Aanaab AI project documentation.