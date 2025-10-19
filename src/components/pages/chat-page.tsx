"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useSession } from "next-auth/react";
import {
  Send,
  Settings,
  RotateCcw,
  MessageSquare,
  Brain,
  User,
  Bot,
  Download,
  Trash2,
  XCircle,
  Loader2,
  History,
  Users,
  Shield,
  CheckCircle
} from "lucide-react";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tokens?: number;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  processingTime?: string;
  sources?: any[];
  toolsUsed?: string[];
  confidence?: number;
  error?: string;
}

interface ChatConfig {
  endpoint: 'unified' | 'langgraph';
  baseUrl: string;
  bearerToken: string;
  courseId: string;
  sessionId: string;
  modelProvider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  mode: string;
  transport: string;
  includeSources: boolean;
  includeMetadata: boolean;
  formatMarkdown: boolean;
  language: string;
  serverType: 'localhost' | 'online' | 'production';
}

interface ChatSession {
  id: string;
  name: string;
  courseId: string;
  courseName: string;
  createdAt: string;
  lastActivity: string;
  messageCount: number;
}

const DEFAULT_CONFIG: ChatConfig = {
  endpoint: 'unified',
  baseUrl: "http://localhost:8000",
  bearerToken: "", // Will be populated from session
  courseId: "89",
  sessionId: "550e8400-e29b-41d4-a716-446655440000",
  modelProvider: "auto",
  model: "auto",
  temperature: 0.7,
  maxTokens: 1000,
  mode: "context_aware",
  transport: "http",
  includeSources: true,
  includeMetadata: false,
  formatMarkdown: true,
  language: "auto",
  serverType: "localhost"
};

const COURSE_OPTIONS = [
  { id: "89", name: "التعلم باللعب" },
  { id: "62", name: "طرق التدريس الحديثة" },
  { id: "61", name: "إعداد الأدوات التعليمية" },
  { id: "64", name: "عقلية النمو" },
  { id: "deep_learning_advanced", name: "Deep Learning Advanced" },
  { id: "ml_fundamentals_101", name: "ML Fundamentals" },
  { id: "data_science_analytics", name: "Data Science Analytics" },
  { id: "nlp_processing", name: "NLP Processing" }
];

// Model configurations with hints for best use cases
const MODEL_CONFIGS = {
  openai: [
    {
      id: "gpt-4o",
      name: "GPT-4o",
      hint: "Best overall - reasoning, analysis, code",
      description: "Most capable model for complex reasoning, analysis, and code generation. Best for educational content and detailed explanations."
    },
    {
      id: "gpt-4o-mini",
      name: "GPT-4o Mini",
      hint: "Fast & efficient - quick responses",
      description: "Faster and more cost-effective than GPT-4o. Great for quick responses and general chat interactions."
    },
    {
      id: "gpt-4-turbo",
      name: "GPT-4 Turbo",
      hint: "High capacity - long documents",
      description: "Large context window, excellent for processing long documents and complex course materials."
    },
    {
      id: "gpt-3.5-turbo",
      name: "GPT-3.5 Turbo",
      hint: "Fast & affordable - basic tasks",
      description: "Fast and cost-effective for basic educational questions and simple explanations."
    }
  ],
  gemini: [
    {
      id: "gemini-1.5-pro",
      name: "Gemini 1.5 Pro",
      hint: "Advanced reasoning - complex topics",
      description: "Google's most advanced model with excellent reasoning capabilities. Great for complex educational topics and multilingual content."
    },
    {
      id: "gemini-1.5-flash",
      name: "Gemini 1.5 Flash",
      hint: "Fast responses - quick learning",
      description: "Faster and more efficient than Pro. Perfect for quick educational interactions and real-time learning."
    },
    {
      id: "gemini-pro",
      name: "Gemini Pro",
      hint: "Balanced performance - general use",
      description: "Well-balanced model for general educational content and multilingual support."
    }
  ],
  auto: [
    {
      id: "auto",
      name: "Auto Select",
      hint: "System chooses best model",
      description: "The system automatically selects the most appropriate model based on your query and available resources."
    }
  ]
};

// Helper functions for model management
const getModelsForProvider = (provider: string) => {
  return MODEL_CONFIGS[provider as keyof typeof MODEL_CONFIGS] || MODEL_CONFIGS.auto;
};

const getDefaultModelForProvider = (provider: string) => {
  const models = getModelsForProvider(provider);
  return models[0]?.id || "auto";
};

const getModelHint = (modelId: string) => {
  const allModels = Object.values(MODEL_CONFIGS).flat();
  const model = allModels.find(m => m.id === modelId);
  return model?.description || "Select a model to see its capabilities.";
};

const getSourceDisplayName = (source: any) => {
  if (typeof source === 'string') {
    return source;
  }

  if (source && typeof source === 'object') {
    // Handle the nested source object structure
    const sourceObj = source.source || source;

    if (sourceObj.course_id && sourceObj.lesson_id) {
      return `Course ${sourceObj.course_id} - Lesson ${sourceObj.lesson_id}`;
    } else if (sourceObj.course_id) {
      return `Course ${sourceObj.course_id}`;
    } else if (sourceObj.filename) {
      return sourceObj.filename;
    } else if (sourceObj.source_type) {
      return sourceObj.source_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
    } else if (sourceObj.id) {
      return sourceObj.id;
    }
  }

  return source.id || 'Unknown source';
};

const formatTime = (timeInSeconds: number) => {
  const minutes = Math.floor(timeInSeconds / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Pricing configuration (per 1K tokens)
const PRICING_CONFIG = {
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-1.5-flash': { input: 0.000075, output: 0.0003 },
  'gemini-pro': { input: 0.0005, output: 0.0015 },
  'auto': { input: 0.005, output: 0.015 } // Default to GPT-4o pricing
};

const calculateCost = (model: string, inputTokens: number, outputTokens: number): number => {
  const pricing = PRICING_CONFIG[model as keyof typeof PRICING_CONFIG] || PRICING_CONFIG.auto;
  const inputCost = (inputTokens / 1000) * pricing.input;
  const outputCost = (outputTokens / 1000) * pricing.output;
  return inputCost + outputCost;
};

const getModelFromProvider = (provider: string, model: string): string => {
  if (model === 'auto') {
    return provider === 'openai' ? 'gpt-4o-mini' :
      provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini';
  }
  return model;
};

// Function to generate JWT token for AI service
const generateJWTToken = (user: { id: string; email: string; name?: string | null; role: string }, serverType: string = "localhost") => {
  const now = Math.floor(Date.now() / 1000);

  // Determine issuer and audience based on server type
  const serverConfig = {
    localhost: {
      iss: "http://localhost:8080/realms/aanaab",
      aud: "aanaab-ai"
    },
    online: {
      iss: "https://accounts-testing.aanaab.net/realms/master",
      aud: "aanaab-ai"
    },
    production: {
      iss: "https://accounts.aanaab.net/realms/master",
      aud: "aanaab-ai"
    }
  };

  const config = serverConfig[serverType as keyof typeof serverConfig] || serverConfig.localhost;

  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name || user.email.split('@')[0],
    preferred_username: user.email.split('@')[0],
    email_verified: true,
    iat: now,
    exp: now + (24 * 60 * 60), // 24 hours
    realm_access: {
      roles: [user.role, "user"]
    },
    groups: ["administrators", "users"],
    iss: config.iss,
    aud: config.aud,
    typ: "Bearer",
    azp: "aanaab-ai",
    session_state: "test-session-state",
    acr: "1",
    scope: "openid email profile"
  };

  // For development, we'll use a simple base64 encoding
  // In production, this should use proper JWT signing
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadEncoded = btoa(JSON.stringify(payload));
  const signature = btoa("test-signature");

  return `${header}.${payloadEncoded}.${signature}`;
};

// Improved token estimation (more accurate approximation)
const estimateTokens = (text: string): number => {
  if (!text || text.length === 0) return 0;

  // More accurate estimation based on OpenAI's tokenizer behavior
  // - English text: ~4 characters per token
  // - Code: ~3 characters per token  
  // - Mixed content: ~3.5 characters per token
  // - Arabic text: ~2.5 characters per token

  const hasArabic = /[\u0600-\u06FF]/.test(text);
  const hasCode = /[{}();=<>[\]]/.test(text);

  let charsPerToken = 4; // Default for English

  if (hasArabic && hasCode) {
    charsPerToken = 2.8; // Mixed Arabic and code
  } else if (hasArabic) {
    charsPerToken = 2.5; // Arabic text
  } else if (hasCode) {
    charsPerToken = 3.2; // Code
  }

  return Math.ceil(text.length / charsPerToken);
};

// Extract tokens from various possible API response formats
const extractTokensFromResponse = (data: any, userMessage: string, assistantResponse: string) => {
  // Try different possible field names from the API response
  // Priority: new unified format, then legacy formats
  const inputTokens = data.tokens_input ||
    data.input_tokens ||
    data.prompt_tokens ||
    data.tokens_prompt ||
    data.usage?.prompt_tokens ||
    data.usage?.input_tokens ||
    data.token_usage?.input_tokens ||
    data.token_usage?.prompt_tokens ||
    0;

  const outputTokens = data.tokens_output ||
    data.output_tokens ||
    data.completion_tokens ||
    data.tokens_completion ||
    data.usage?.completion_tokens ||
    data.usage?.output_tokens ||
    data.token_usage?.output_tokens ||
    data.token_usage?.completion_tokens ||
    0;

  const totalTokens = data.tokens_used ||
    data.total_tokens ||
    data.tokens_total ||
    data.usage?.total_tokens ||
    data.token_usage?.total_tokens ||
    (inputTokens + outputTokens) ||
    0;

  // If we have both input and output tokens, use them directly
  if (inputTokens > 0 && outputTokens > 0) {
    return {
      inputTokens,
      outputTokens,
      totalTokens: totalTokens || (inputTokens + outputTokens)
    };
  }

  // If we still don't have token breakdown, estimate it
  if (inputTokens === 0 && outputTokens === 0 && totalTokens > 0) {
    // If we have total tokens but no breakdown, estimate based on content length
    const userTokens = estimateTokens(userMessage);
    const assistantTokens = estimateTokens(assistantResponse);
    const estimatedTotal = userTokens + assistantTokens;

    // Use the actual total if available, otherwise use our estimate
    const actualTotal = totalTokens > 0 ? totalTokens : estimatedTotal;

    // For chat responses, estimate input/output split based on content
    // User message is input, assistant response is output
    const estimatedInput = Math.min(userTokens, actualTotal);
    const estimatedOutput = Math.max(0, actualTotal - estimatedInput);

    return {
      inputTokens: estimatedInput,
      outputTokens: estimatedOutput,
      totalTokens: actualTotal
    };
  }

  // If we have no tokens at all, estimate from content
  if (totalTokens === 0) {
    const userTokens = estimateTokens(userMessage);
    const assistantTokens = estimateTokens(assistantResponse);
    const estimatedTotal = userTokens + assistantTokens;

    return {
      inputTokens: userTokens,
      outputTokens: assistantTokens,
      totalTokens: estimatedTotal
    };
  }

  return {
    inputTokens,
    outputTokens,
    totalTokens
  };
};

const ENDPOINT_CONFIGS = {
  unified: {
    name: "Unified Chat",
    description: "Unified chat interface with RAG and personalization",
    basePath: "/api/v1/chat",
    methods: {
      chat: { path: "/", method: "POST" },
      stream: { path: "/stream", method: "POST" },
      websocket: { path: "/ws", method: "WS" }
    }
  },
  langgraph: {
    name: "LangGraph Chat",
    description: "LangGraph-powered workflows with tool selection",
    basePath: "/api/v1/langgraph",
    methods: {
      chat: { path: "/chat", method: "POST" },
      stream: { path: "/stream", method: "POST" },
      tools: { path: "/tools", method: "GET" }
    }
  }
};

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [config, setConfig] = useState<ChatConfig>(DEFAULT_CONFIG);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Generate JWT token based on server type and session
  useEffect(() => {
    let userToUse = session?.user;

    // For online/testing servers, use mahmoud@designpeer.com
    if (config.serverType === "online" || config.serverType === "production") {
      userToUse = {
        id: "mahmoud-user-001",
        email: "mahmoud@designpeer.com",
        name: "Mahmoud",
        role: "admin"
      };
    }

    if (userToUse) {
      const jwtToken = generateJWTToken(userToUse, config.serverType);
      setConfig(prev => ({
        ...prev,
        bearerToken: jwtToken
      }));
    }
  }, [session, config.serverType]);

  // Update base URL when server type changes
  useEffect(() => {
    const serverUrls = {
      localhost: "http://localhost:8000",
      online: "https://api-testing.aanaab.net",
      production: "https://api.aanaab.net"
    };

    const newBaseUrl = serverUrls[config.serverType];
    if (newBaseUrl && newBaseUrl !== config.baseUrl) {
      setConfig(prev => ({
        ...prev,
        baseUrl: newBaseUrl
      }));
    }
  }, [config.serverType]);

  // Initialize with a default session
  useEffect(() => {
    if (!currentSession && config.sessionId) {
      const defaultSession: ChatSession = {
        id: config.sessionId,
        name: `Chat Session - ${new Date().toLocaleDateString()}`,
        courseId: config.courseId,
        courseName: COURSE_OPTIONS.find(c => c.id === config.courseId)?.name || config.courseId,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        messageCount: 0
      };
      setCurrentSession(defaultSession);
      setSessions([defaultSession]);
    }
  }, [config.sessionId, config.courseId]);

  const generateSessionId = () => {
    // Generate a proper UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const createNewSession = () => {
    const newSessionId = generateSessionId();
    const selectedCourse = COURSE_OPTIONS.find(c => c.id === config.courseId);

    const newSession: ChatSession = {
      id: newSessionId,
      name: `New Chat - ${selectedCourse?.name || config.courseId}`,
      courseId: config.courseId,
      courseName: selectedCourse?.name || config.courseId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messageCount: 0
    };

    setCurrentSession(newSession);
    setSessions(prev => [newSession, ...prev]);
    setMessages([]);
    setConfig(prev => ({ ...prev, sessionId: newSessionId }));
    setError(null);
  };

  const switchSession = (session: ChatSession) => {
    setCurrentSession(session);
    setConfig(prev => ({ ...prev, sessionId: session.id, courseId: session.courseId }));
    setMessages([]);
    setError(null);
    // In a real app, you'd load the session's message history here
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSession?.id === sessionId) {
      if (sessions.length > 1) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        switchSession(remainingSessions[0]);
      } else {
        createNewSession();
      }
    }
  };

  const getApiUrl = (method: string) => {
    const endpointConfig = ENDPOINT_CONFIGS[config.endpoint];
    const methodConfig = endpointConfig.methods[method as keyof typeof endpointConfig.methods];
    return `${config.baseUrl}${endpointConfig.basePath}${methodConfig.path}`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      if (config.transport === 'stream') {
        await sendStreamingMessage(userMessage);
      } else {
        await sendRegularMessage(userMessage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setIsLoading(false);
    }
  };

  const sendRegularMessage = async (userMessage: ChatMessage) => {
    const endpointConfig = ENDPOINT_CONFIGS[config.endpoint];
    const url = getApiUrl('chat');

    let requestBody: any = {
      message: userMessage.content,
      course_id: config.courseId,
      session_id: config.sessionId,
      model_provider: config.modelProvider,
      model: config.model,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      include_sources: config.includeSources,
      include_metadata: config.includeMetadata,
      format_markdown: config.formatMarkdown,
      language: config.language
    };

    // Add endpoint-specific fields
    if (config.endpoint === 'unified') {
      requestBody = {
        ...requestBody,
        mode: config.mode,
        transport: config.transport
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.bearerToken}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Debug: Log the response structure to understand token fields
    console.log('API Response structure:', {
      tokens_used: data.tokens_used,
      tokens_input: data.tokens_input,
      tokens_output: data.tokens_output,
      total_tokens: data.total_tokens,
      input_tokens: data.input_tokens,
      output_tokens: data.output_tokens,
      prompt_tokens: data.prompt_tokens,
      completion_tokens: data.completion_tokens,
      usage: data.usage,
      token_usage: data.token_usage,
      cost_estimate: data.cost_estimate
    });

    // Extract token information with improved logic
    const assistantResponse = data.response || data.message || 'No response received';
    const tokenInfo = extractTokensFromResponse(data, userMessage.content, assistantResponse);

    console.log('Extracted token info:', tokenInfo);

    // Calculate cost based on model
    const actualModel = getModelFromProvider(config.modelProvider, config.model);
    const calculatedCost = calculateCost(actualModel, tokenInfo.inputTokens, tokenInfo.outputTokens);
    const finalCost = data.cost_estimate || calculatedCost;

    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}_assistant`,
      role: 'assistant',
      content: assistantResponse,
      timestamp: new Date().toISOString(),
      tokens: tokenInfo.totalTokens,
      inputTokens: tokenInfo.inputTokens,
      outputTokens: tokenInfo.outputTokens,
      cost: finalCost,
      processingTime: data.processing_time_ms ? `${(data.processing_time_ms / 1000).toFixed(2)}s` : undefined,
      sources: data.sources || [],
      toolsUsed: data.tools_used || [],
      confidence: data.confidence_score
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const sendStreamingMessage = async (userMessage: ChatMessage) => {
    const url = getApiUrl('stream');

    let requestBody: any = {
      message: userMessage.content,
      course_id: config.courseId,
      session_id: config.sessionId,
      model_provider: config.modelProvider,
      model: config.model,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      include_sources: config.includeSources,
      include_metadata: config.includeMetadata,
      format_markdown: config.formatMarkdown,
      language: config.language
    };

    if (config.endpoint === 'unified') {
      requestBody = {
        ...requestBody,
        mode: config.mode,
        transport: 'sse'
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.bearerToken}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    setIsStreaming(true);
    setStreamingContent("");

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('No response body reader available');
    }

    let fullResponse = "";
    let sources: any[] = [];
    let toolsUsed: string[] = [];
    let tokens = 0;
    let cost = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'content' && data.content) {
                fullResponse += data.content;
                setStreamingContent(fullResponse);
              } else if (data.type === 'sources' && data.metadata?.sources) {
                sources = data.metadata.sources;
              } else if (data.type === 'complete' && data.data) {
                toolsUsed = data.data.tools_used || [];
              }
            } catch (e) {
              // Ignore malformed JSON
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    const assistantMessage: ChatMessage = {
      id: `msg_${Date.now()}_assistant`,
      role: 'assistant',
      content: fullResponse,
      timestamp: new Date().toISOString(),
      tokens,
      cost,
      sources,
      toolsUsed
    };

    setMessages(prev => [...prev, assistantMessage]);
    setStreamingContent("");
    setIsStreaming(false);
    setIsLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
    setStreamingContent("");
    setError(null);
  };

  const exportChat = () => {
    const chatData = {
      session: currentSession,
      config,
      messages,
      exportedAt: new Date().toISOString()
    };

    const dataStr = JSON.stringify(chatData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalTokens = messages.reduce((sum: number, msg: ChatMessage) => sum + (msg.tokens || 0), 0);
  const totalInputTokens = messages.reduce((sum: number, msg: ChatMessage) => sum + (msg.inputTokens || 0), 0);
  const totalOutputTokens = messages.reduce((sum: number, msg: ChatMessage) => sum + (msg.outputTokens || 0), 0);
  const totalCost = messages.reduce((sum: number, msg: ChatMessage) => sum + (msg.cost || 0), 0);

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  // Show authentication required if no session
  if (status === "unauthenticated") {
    return (
      <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please sign in to use the chat interface.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {ENDPOINT_CONFIGS[config.endpoint].name}
              </h1>
              <p className="text-sm text-gray-600">
                {ENDPOINT_CONFIGS[config.endpoint].description}
              </p>
            </div>
            <Badge variant="outline" className="ml-2">
              {config.endpoint}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
            >
              <Settings className="h-4 w-4 mr-2" />
              Config
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="h-4 w-4 mr-2" />
              Sessions
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={createNewSession}
            >
              <Users className="h-4 w-4 mr-2" />
              New Session
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearChat}
              disabled={isLoading}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={exportChat}
              disabled={messages.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Sessions */}
        {showHistory && (
          <div className="w-80 bg-white border-r flex flex-col">
            <div className="p-4 border-b">
              <h3 className="font-medium text-gray-900">Chat Sessions</h3>
              <p className="text-sm text-gray-600">Manage your conversations</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${currentSession?.id === session.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'hover:bg-gray-50'
                    }`}
                  onClick={() => switchSession(session)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {session.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {session.courseName}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {session.messageCount} messages
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-medium text-gray-900">Session Info</h3>
            <p className="text-sm text-gray-600">Token usage and timing</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Current Session Info */}
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Session</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Session ID: {config.sessionId.slice(0, 8)}...</div>
                  <div>Course: {config.courseId}</div>
                  <div>Provider: {config.modelProvider}</div>
                  <div>Model: {config.model}</div>
                  <div>Mode: {config.mode}</div>
                </div>
              </div>
            </div>

            {/* Token Usage */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Token Usage</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Total Messages:</span>
                  <span className="font-medium">{messages.length}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Total Tokens:</span>
                  <span className="font-medium">{totalTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Input Tokens:</span>
                  <span className="font-medium">{totalInputTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Output Tokens:</span>
                  <span className="font-medium">{totalOutputTokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Estimated Cost:</span>
                  <span className="font-medium">${totalCost.toFixed(4)}</span>
                </div>
              </div>
            </div>

            {/* Last Message Stats */}
            {messages.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Last Response</h4>
                {(() => {
                  const lastMessage = messages[messages.length - 1];
                  if (lastMessage.role === 'assistant') {
                    const actualModel = getModelFromProvider(config.modelProvider, config.model);
                    const pricing = PRICING_CONFIG[actualModel as keyof typeof PRICING_CONFIG] || PRICING_CONFIG.auto;

                    return (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Tokens:</span>
                          <span className="font-medium">{lastMessage.tokens || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Input Tokens:</span>
                          <span className="font-medium">{lastMessage.inputTokens || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Output Tokens:</span>
                          <span className="font-medium">{lastMessage.outputTokens || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Processing Time:</span>
                          <span className="font-medium">{lastMessage.processingTime || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Confidence:</span>
                          <span className="font-medium">{lastMessage.confidence ? `${(lastMessage.confidence * 100).toFixed(1)}%` : 'N/A'}</span>
                        </div>
                        {lastMessage.sources && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Sources:</span>
                            <span className="font-medium">{lastMessage.sources.length}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-200">
                          <div className="text-gray-500 text-xs mb-1">Cost Breakdown:</div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-500">Input Cost:</span>
                              <span className="text-xs">
                                ${lastMessage.inputTokens ? ((lastMessage.inputTokens / 1000) * pricing.input).toFixed(6) : '0.000000'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Output Cost:</span>
                              <span className="text-xs">
                                ${lastMessage.outputTokens ? ((lastMessage.outputTokens / 1000) * pricing.output).toFixed(6) : '0.000000'}
                              </span>
                            </div>
                            <div className="flex justify-between font-medium">
                              <span className="text-gray-600">Total:</span>
                              <span className="text-xs">${lastMessage.cost ? lastMessage.cost.toFixed(6) : '0.000000'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            {/* Pricing Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Current Pricing</h4>
              {(() => {
                const actualModel = getModelFromProvider(config.modelProvider, config.model);
                const pricing = PRICING_CONFIG[actualModel as keyof typeof PRICING_CONFIG] || PRICING_CONFIG.auto;

                return (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span className="font-medium">{actualModel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Input (per 1K):</span>
                      <span className="font-medium">${pricing.input.toFixed(6)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Output (per 1K):</span>
                      <span className="font-medium">${pricing.output.toFixed(6)}</span>
                    </div>
                    <div className="text-gray-500 text-xs mt-2 p-2 bg-gray-50 rounded">
                      💡 Cost = (Input Tokens ÷ 1000 × ${pricing.input}) + (Output Tokens ÷ 1000 × ${pricing.output})
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* System Status */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">System Status</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Endpoint:</span>
                  <span className="font-medium">{config.endpoint}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transport:</span>
                  <span className="font-medium">{config.transport}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RAG Mode:</span>
                  <span className="font-medium">{config.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sources:</span>
                  <span className="font-medium">{config.includeSources ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Configuration Panel */}
          {showConfig && (
            <div className="bg-white border-b p-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Chat Configuration</CardTitle>
                  <CardDescription>
                    Configure API endpoints, authentication, and chat parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="serverType">Server Type</Label>
                      <Select
                        value={config.serverType}
                        onValueChange={(value: 'localhost' | 'online' | 'production') =>
                          setConfig(prev => ({ ...prev, serverType: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="localhost">Localhost (Development)</SelectItem>
                          <SelectItem value="online">Online (Testing)</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="baseUrl">Base URL</Label>
                      <Input
                        id="baseUrl"
                        value={config.baseUrl}
                        onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                        placeholder="http://localhost:8000"
                      />
                      <p className="text-xs text-gray-500">
                        Auto-updates based on server type selection
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endpoint">Chat Endpoint</Label>
                      <Select
                        value={config.endpoint}
                        onValueChange={(value: 'unified' | 'langgraph') =>
                          setConfig(prev => ({ ...prev, endpoint: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unified">Unified Chat</SelectItem>
                          <SelectItem value="langgraph">LangGraph Chat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="courseId">Course</Label>
                      <Select
                        value={config.courseId}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, courseId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {COURSE_OPTIONS.map(course => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="transport">Transport Method</Label>
                      <Select
                        value={config.transport}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, transport: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="http">HTTP</SelectItem>
                          <SelectItem value="stream">Streaming</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mode">Chat Mode</Label>
                      <Select
                        value={config.mode}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, mode: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="rag">RAG</SelectItem>
                          <SelectItem value="personalized">Personalized</SelectItem>
                          <SelectItem value="context_aware">Context Aware</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="modelProvider">Model Provider</Label>
                      <Select
                        value={config.modelProvider}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, modelProvider: value, model: getDefaultModelForProvider(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">Auto</SelectItem>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="gemini">Gemini</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="model">Model</Label>
                      <Select
                        value={config.model}
                        onValueChange={(value) => setConfig(prev => ({ ...prev, model: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {getModelsForProvider(config.modelProvider).map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{model.name}</span>
                                <span className="text-xs text-gray-500">{model.hint}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-500">
                        {getModelHint(config.model)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="temperature">Temperature</Label>
                      <Input
                        id="temperature"
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={config.temperature}
                        onChange={(e) => setConfig(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxTokens">Max Tokens</Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        min="1"
                        max="4096"
                        value={config.maxTokens}
                        onChange={(e) => setConfig(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bearerToken">JWT Bearer Token</Label>
                    <Textarea
                      id="bearerToken"
                      value={config.bearerToken}
                      onChange={(e) => setConfig(prev => ({ ...prev, bearerToken: e.target.value }))}
                      rows={3}
                      placeholder="JWT token will be auto-generated based on server type"
                    />
                    <p className="text-xs text-gray-500">
                      Auto-generated based on server type and user session. Token updates automatically when you change server type.
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="includeSources"
                        checked={config.includeSources}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeSources: checked }))}
                      />
                      <Label htmlFor="includeSources">Include Sources</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="includeMetadata"
                        checked={config.includeMetadata}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, includeMetadata: checked }))}
                      />
                      <Label htmlFor="includeMetadata">Include Metadata</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="formatMarkdown"
                        checked={config.formatMarkdown}
                        onCheckedChange={(checked) => setConfig(prev => ({ ...prev, formatMarkdown: checked }))}
                      />
                      <Label htmlFor="formatMarkdown">Format Markdown</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Authentication Status - Simplified */}
          {config.bearerToken && (
            <div className="bg-white border-b p-4">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">
                          {config.serverType === "localhost" ? session?.user?.email : "mahmoud@designpeer.com"}
                        </p>
                        <p className="text-sm text-green-700">
                          {config.serverType === "localhost" ? "Session User" : "Testing User"} • {config.serverType} server
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          let userToUse = session?.user;
                          if (config.serverType === "online" || config.serverType === "production") {
                            userToUse = {
                              id: "mahmoud-user-001",
                              email: "mahmoud@designpeer.com",
                              name: "Mahmoud",
                              role: "admin"
                            };
                          }
                          if (userToUse) {
                            const newToken = generateJWTToken(userToUse, config.serverType);
                            setConfig(prev => ({ ...prev, bearerToken: newToken }));
                          }
                        }}
                        className="text-xs"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Regenerate
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (!config.bearerToken) return;

                          try {
                            const response = await fetch(`${config.baseUrl}/api/v1/chat/health`, {
                              headers: {
                                'Authorization': `Bearer ${config.bearerToken}`
                              }
                            });

                            if (response.ok) {
                              alert('✅ Token is valid! API connection successful.');
                            } else {
                              alert(`❌ Token validation failed: ${response.status} ${response.statusText}`);
                            }
                          } catch (error) {
                            alert(`❌ Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                          }
                        }}
                        className="text-xs"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Test
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                  <p className="text-gray-600">
                    Send a message to begin chatting with the AI assistant
                  </p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg px-4 py-3 ${message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200'
                    }`}
                >
                  <div className="flex items-start gap-3">
                    {message.role === 'assistant' && (
                      <div className="flex-shrink-0">
                        {config.endpoint === 'langgraph' ? (
                          <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
                        ) : (
                          <Bot className="h-5 w-5 text-blue-500 mt-0.5" />
                        )}
                      </div>
                    )}
                    {message.role === 'user' && (
                      <div className="flex-shrink-0">
                        <User className="h-5 w-5 text-white mt-0.5" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.role === 'user' ? 'You' : 'Assistant'}
                        </span>
                        <span className="text-xs opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                        {message.error && (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>

                      <div className="text-sm whitespace-pre-wrap">
                        {message.content}
                      </div>

                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-600 mb-2">Referenced Sources ({message.sources.length}):</p>
                          <div className="space-y-2">
                            {message.sources.map((source, idx) => (
                              <div key={idx} className="text-xs bg-gray-50 border border-gray-200 p-3 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="font-medium text-gray-800">{getSourceDisplayName(source)}</div>
                                  <div className="text-gray-500 text-right">
                                    <div>Score: {source.score?.toFixed(3)}</div>
                                    <div className="text-xs">{source.content_type || 'Unknown'}</div>
                                  </div>
                                </div>

                                {source.source && (
                                  <div className="space-y-1 text-gray-600">
                                    {source.source.course_id && (
                                      <div className="flex justify-between">
                                        <span>Course:</span>
                                        <span className="font-medium">{source.source.course_id}</span>
                                      </div>
                                    )}
                                    {source.source.lesson_id && (
                                      <div className="flex justify-between">
                                        <span>Lesson:</span>
                                        <span className="font-medium">{source.source.lesson_id}</span>
                                      </div>
                                    )}
                                    {source.source.source_type && (
                                      <div className="flex justify-between">
                                        <span>Type:</span>
                                        <span className="font-medium">{source.source.source_type.replace(/_/g, ' ')}</span>
                                      </div>
                                    )}
                                    {source.source.filename && (
                                      <div className="flex justify-between">
                                        <span>File:</span>
                                        <span className="font-medium truncate ml-2">{source.source.filename}</span>
                                      </div>
                                    )}
                                    {source.source.chunk_id && (
                                      <div className="flex justify-between">
                                        <span>Chunk:</span>
                                        <span className="font-medium">#{source.source.chunk_id}</span>
                                      </div>
                                    )}
                                    {source.has_timestamps && source.start_time && source.end_time && (
                                      <div className="flex justify-between">
                                        <span>Time:</span>
                                        <span className="font-medium">
                                          {formatTime(source.start_time)} - {formatTime(source.end_time)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {source.id && (
                                  <div className="mt-2 pt-1 border-t border-gray-200">
                                    <div className="text-gray-500 text-xs">
                                      ID: {source.id.slice(0, 8)}...
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.toolsUsed && message.toolsUsed.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs font-medium text-gray-600 mb-1">Tools Used:</p>
                          <div className="flex flex-wrap gap-1">
                            {message.toolsUsed.map((tool, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {tool}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {message.tokens && (
                        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500">
                          Tokens: {message.tokens} | Cost: ${(message.cost || 0).toFixed(4)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Streaming Message */}
            {isStreaming && streamingContent && (
              <div className="flex justify-start">
                <div className="max-w-3xl rounded-lg px-4 py-3 bg-white border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      {config.endpoint === 'langgraph' ? (
                        <Brain className="h-5 w-5 text-purple-500 mt-0.5" />
                      ) : (
                        <Bot className="h-5 w-5 text-blue-500 mt-0.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">Assistant</span>
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </div>
                      <div className="text-sm whitespace-pre-wrap">
                        {streamingContent}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex justify-center">
                <div className="max-w-3xl rounded-lg px-4 py-3 bg-red-50 border border-red-200">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white border-t p-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <Textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message here..."
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="self-end"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Stats */}
            {messages.length > 0 && (
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Messages: {messages.length}</span>
                  <span>Tokens: {totalTokens}</span>
                  <span>Cost: ${totalCost.toFixed(4)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Session: {currentSession?.name || 'Unknown'}</span>
                  <Badge variant="outline" className="text-xs">
                    {config.endpoint}
                  </Badge>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
