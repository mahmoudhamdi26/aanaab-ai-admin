/**
 * Configuration types for the Aanaab AI Admin Panel
 * Based on the existing project configuration structure
 */

export interface LLMProvider {
  id: string;
  name: string;
  enabled: boolean;
  priority: number; // Lower number = higher priority (1 = primary, 2 = fallback, etc.)
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
  timeout: number; // Request timeout in seconds
  retryAttempts: number; // Number of retry attempts before falling back
  fallbackEnabled: boolean; // Whether to use this as fallback
}

export interface EmbeddingProvider {
  id: string;
  name: string;
  enabled: boolean;
  model: string;
  dimensions?: number;
}

export interface LiveKitConfig {
  enabled: boolean;
  apiKey: string;
  apiSecret: string;
  wsUrl: string;
  rtcPort: number;
  portRangeStart: number;
  portRangeEnd: number;
  useExternalIp: boolean;
  autoCreateRooms: boolean;
  turnEnabled: boolean;
}

export interface RAGSystem {
  id: 'normal' | 'langgraph';
  name: string;
  enabled: boolean;
  config: {
    chunkSize: number;
    chunkOverlap: number;
    maxChunksPerDocument: number;
    qualityReviewThreshold: number;
    highPriorityThreshold: number;
    autoEnhanceThreshold: number;
  };
}

export interface SyncProcessConfig {
  batchSize: number;
  maxConcurrent: number;
  maxConcurrentLessons: number;
  checkpointInterval: number;
  retryAttempts: number;
  retryDelay: number;
  enableRAGProcessing: boolean;
  syncTypes: {
    full: boolean;
    incremental: boolean;
    courseSpecific: boolean;
    phased: boolean;
  };
  contentTypes: {
    courses: boolean;
    lessons: boolean;
    quizzes: boolean;
    assignments: boolean;
    discussions: boolean;
    attachments: boolean;
    videos: boolean;
  };
}

export interface DatabaseConfig {
  aiDbHost: string;
  aiDbPort: number;
  aiDbName: string;
  aiDbUser: string;
  aiDbPassword: string;
  aiDbSslMode: string;
  lmsBaseUrl: string;
  lmsApiKey?: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
  url?: string;
}

export interface QdrantConfig {
  host: string;
  port: number;
  url?: string;
  apiKey?: string;
  timeout: number;
  collectionName: string;
}

export interface STTProvider {
  id: 'openai_whisper' | 'google_stt';
  name: string;
  enabled: boolean;
  config: {
    cacheTtl: number;
    languageCode?: string;
    altLanguages?: string;
    location?: string;
    model?: string;
    noLogging?: boolean;
    recognizer?: string;
  };
}

export interface SecurityConfig {
  jwtSecretKey: string;
  apiRateLimit: number;
  railsApiKey: string;
  keycloakServerUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
  keycloakVerifySignature: boolean;
  corsOrigins: string[];
  corsMethods: string[];
  corsHeaders: string[];
}

export interface FileUploadConfig {
  maxFileSize: number; // MB
  allowedFileTypes: string[];
  uploadDir: string;
}

export interface ChatConfig {
  memoryRecentMessages: number;
  memorySummaryThreshold: number;
  memorySummaryEnabled: boolean;
  memoryMaxTokens: number;
  conversationCacheTtl: number;
  defaultTemperature: number;
  defaultModelProvider: string;
}

export interface LangGraphConfig {
  enableLLMToolSelection: boolean;
  maxToolsPerQuery: number;
  toolTimeoutSeconds: number;
  enableToolStreaming: boolean;
  debugToolDecisions: boolean;
  workflowCacheTtl: number;
  maxConversationHistory: number;
  enableStatePersistence: boolean;
  toolSelectionModel: string;
  toolSelectionTemperature: number;
  toolSelectionMaxTokens: number;
  responseModel: string;
  responseTemperature: number;
  responseMaxTokens: number;
  enableToolValidation: boolean;
  toolExecutionRetries: number;
  toolExecutionDelay: number;
  enableExecutionMetrics: boolean;
  enableToolUsageAnalytics: boolean;
  metricsRetentionDays: number;
  allowedTools?: string[];
  restrictedTools: string[];
  requireAuthentication: boolean;
  enableToolCaching: boolean;
  toolCacheTtl: number;
  maxConcurrentTools: number;
  enableGracefulDegradation: boolean;
  fallbackResponseEnabled: boolean;
  errorRetryAttempts: number;
}

export interface SystemConfig {
  environment: 'development' | 'production' | 'testing';
  debug: boolean;
  logLevel: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
  apiHost: string;
  apiPort: number;
  apiSecretKey: string;
  apiTitle: string;
  apiVersion: string;
}

export interface AdminConfig {
  system: SystemConfig;
  llmProviders: LLMProvider[];
  embeddingProviders: EmbeddingProvider[];
  livekit: LiveKitConfig;
  ragSystems: RAGSystem[];
  syncProcess: SyncProcessConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  qdrant: QdrantConfig;
  sttProviders: STTProvider[];
  security: SecurityConfig;
  fileUpload: FileUploadConfig;
  chat: ChatConfig;
  langgraph: LangGraphConfig;
}

export interface ConfigUpdateRequest {
  section: keyof AdminConfig;
  data: Partial<AdminConfig[keyof AdminConfig]>;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
