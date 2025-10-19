"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  RotateCcw,
  Settings,
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Brain,
  FileText,
  Download,
  Eye,
  AlertCircle,
  User,
  Shield
} from "lucide-react";

// Import modular components
import { QuestionUpload, Question } from "@/components/testing/QuestionUpload";
import { TestConfiguration, TestConfig } from "@/components/testing/TestConfiguration";
import { TestStatusOverview } from "@/components/testing/TestStatusOverview";
import { BatchTesting, TestScenario } from "@/components/testing/BatchTesting";
import { GridResults } from "@/components/testing/GridResults";

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

  return source?.id || 'Unknown source';
};

interface TestResult {
  id: string;
  testType: 'chat' | 'langgraph';
  endpoint: 'unified' | 'langgraph';
  query: string;
  courseId: string;
  courseName: string;
  category: string;
  complexity: 'low' | 'medium' | 'high';
  success: boolean;
  executionTime: number;
  response: string;
  error?: string;
  tokensInput: number;
  tokensOutput: number;
  costEstimate: number;
  sourcesCount: number;
  sources?: any[];
  toolsUsed?: string[];
  confidenceScore?: number;
  timestamp: string;
  sessionId?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

// Default test scenarios - diverse courses for localhost testing
const DEFAULT_TEST_SCENARIOS: TestScenario[] = [
  // التعلم باللعب (Course ID: 89)
  {
    id: "1",
    query: "ما هو هذا المساق؟ هل يمكنك إعطائي نظرة عامة على المواضيع الرئيسية المغطاة؟",
    courseId: "89",
    courseName: "التعلم باللعب",
    category: "COURSE_OVERVIEW",
    complexity: "low"
  },
  {
    id: "2",
    query: "ما هي أنواع الألعاب التعليمية المختلفة المذكورة في هذا المساق؟",
    courseId: "89",
    courseName: "التعلم باللعب",
    category: "CONTENT_UNDERSTANDING",
    complexity: "medium"
  },
  {
    id: "3",
    query: "كيف يمكن للمعلمين استخدام الألعاب لتعزيز المهارات الاجتماعية والمعرفية لدى الأطفال؟",
    courseId: "89",
    courseName: "التعلم باللعب",
    category: "PRACTICAL_APPLICATION",
    complexity: "medium"
  },
  {
    id: "4",
    query: "ما أهمية التعزيز في الألعاب التعليمية، سواء كان إيجابياً أم سلبياً؟",
    courseId: "89",
    courseName: "التعلم باللعب",
    category: "DETAILED_ANALYSIS",
    complexity: "high"
  },
  {
    id: "5",
    query: "كيف يجب تصميم الألعاب التعليمية وفقاً للمراحل التنموية للأطفال؟",
    courseId: "89",
    courseName: "التعلم باللعب",
    category: "DESIGN_PRINCIPLES",
    complexity: "high"
  },

  // طرق التدريس الحديثة (Course ID: 62)
  {
    id: "6",
    query: "ما هي طرق التدريس الحديثة المذكورة في هذا المساق؟",
    courseId: "62",
    courseName: "طرق التدريس الحديثة",
    category: "COURSE_OVERVIEW",
    complexity: "low"
  },
  {
    id: "7",
    query: "كيف يمكن تطبيق التعلم النشط في الفصل الدراسي؟",
    courseId: "62",
    courseName: "طرق التدريس الحديثة",
    category: "PRACTICAL_APPLICATION",
    complexity: "medium"
  },

  // إعداد الأدوات التعليمية (Course ID: 61)
  {
    id: "8",
    query: "ما هي الأدوات التعليمية الأساسية التي يجب على المعلم إعدادها؟",
    courseId: "61",
    courseName: "إعداد الأدوات التعليمية",
    category: "COURSE_OVERVIEW",
    complexity: "low"
  },
  {
    id: "9",
    query: "كيف يمكن تصميم أدوات تعليمية تفاعلية باستخدام التكنولوجيا؟",
    courseId: "61",
    courseName: "إعداد الأدوات التعليمية",
    category: "PRACTICAL_APPLICATION",
    complexity: "high"
  },

  // عقلية النمو (Course ID: 64)
  {
    id: "10",
    query: "ما هي عقلية النمو وكيف تختلف عن العقلية الثابتة؟",
    courseId: "64",
    courseName: "عقلية النمو",
    category: "COURSE_OVERVIEW",
    complexity: "low"
  },
  {
    id: "11",
    query: "كيف يمكن للمعلمين تطوير عقلية النمو لدى الطلاب؟",
    courseId: "64",
    courseName: "عقلية النمو",
    category: "PRACTICAL_APPLICATION",
    complexity: "medium"
  },

  // Machine Learning Fundamentals (Course ID: ml_fundamentals_101)
  {
    id: "12",
    query: "What are the mathematical foundations of backpropagation in neural networks?",
    courseId: "ml_fundamentals_101",
    courseName: "Machine Learning Fundamentals",
    category: "TECHNICAL_DEEP_DIVE",
    complexity: "high"
  },
  {
    id: "13",
    query: "Can you explain the difference between supervised and unsupervised learning?",
    courseId: "ml_fundamentals_101",
    courseName: "Machine Learning Fundamentals",
    category: "CONCEPTUAL_UNDERSTANDING",
    complexity: "medium"
  },
  {
    id: "14",
    query: "What is the bias-variance tradeoff and how does it affect model performance?",
    courseId: "ml_fundamentals_101",
    courseName: "Machine Learning Fundamentals",
    category: "THEORETICAL_CONCEPTS",
    complexity: "high"
  },

  // Deep Learning Advanced (Course ID: deep_learning_advanced)
  {
    id: "15",
    query: "How does the transformer architecture work and what makes it effective?",
    courseId: "deep_learning_advanced",
    courseName: "Deep Learning Advanced",
    category: "ADVANCED_TOPICS",
    complexity: "high"
  },
  {
    id: "16",
    query: "What are the key components of attention mechanisms in deep learning?",
    courseId: "deep_learning_advanced",
    courseName: "Deep Learning Advanced",
    category: "TECHNICAL_DETAILS",
    complexity: "high"
  },

  // Data Science Analytics (Course ID: data_science_analytics)
  {
    id: "17",
    query: "How would you design a recommendation system for an e-commerce platform?",
    courseId: "data_science_analytics",
    courseName: "Data Science Analytics",
    category: "PROBLEM_SOLVING",
    complexity: "high"
  },
  {
    id: "18",
    query: "What preprocessing steps are essential for text data in NLP projects?",
    courseId: "data_science_analytics",
    courseName: "Data Science Analytics",
    category: "PRACTICAL_IMPLEMENTATION",
    complexity: "medium"
  },

  // NLP Processing (Course ID: nlp_processing)
  {
    id: "19",
    query: "How would you build a fraud detection system using machine learning?",
    courseId: "nlp_processing",
    courseName: "NLP Processing",
    category: "REAL_WORLD_APPLICATION",
    complexity: "high"
  },
  {
    id: "20",
    query: "What are the main challenges in natural language understanding?",
    courseId: "nlp_processing",
    courseName: "NLP Processing",
    category: "CONCEPTUAL_UNDERSTANDING",
    complexity: "medium"
  }
];

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

const DEFAULT_CONFIG: TestConfig = {
  bearerToken: "", // Will be populated from session
  baseUrl: "http://localhost:8000",
  serverType: "localhost",
  modelProvider: "openai",
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 1000,
  courseIds: ["89", "deep_learning_advanced", "ml_fundamentals_101", "data_science_analytics", "nlp_processing"]
};

export default function TestingPage() {
  const { data: session, status } = useSession();
  const [config, setConfig] = useState<TestConfig>(DEFAULT_CONFIG);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all");
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [sessionIds, setSessionIds] = useState<Record<string, string>>({});
  const sessionIdsRef = useRef<Record<string, string>>({});
  const [useContinueChat, setUseContinueChat] = useState(true);
  const [useCustomQuestions, setUseCustomQuestions] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [showQuestionUpload, setShowQuestionUpload] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

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

  // Get current scenarios (custom or default)
  const currentScenarios = useCustomQuestions && customQuestions.length > 0
    ? customQuestions.map(q => ({
      id: q.id,
      query: q.query,
      courseId: q.courseId,
      courseName: q.courseName,
      category: q.category,
      complexity: q.complexity
    }))
    : DEFAULT_TEST_SCENARIOS;

  // Generate session ID based on toggle setting and test type
  const getSessionIdForCourse = (courseId: string, testType: 'chat' | 'langgraph') => {
    const sessionKey = `${testType}_${courseId}`;

    if (useContinueChat) {
      // Use same session ID per course AND per test type for conversation continuity
      if (!sessionIdsRef.current[sessionKey]) {
        const newSessionId = crypto.randomUUID();
        sessionIdsRef.current[sessionKey] = newSessionId;
        setSessionIds(prev => ({ ...prev, [sessionKey]: newSessionId }));
        return newSessionId;
      }
      return sessionIdsRef.current[sessionKey];
    } else {
      // Generate new session ID for each test (isolated tests)
      return crypto.randomUUID();
    }
  };

  const runSingleTest = async (query: string, courseId: string, testType: 'chat' | 'langgraph'): Promise<TestResult> => {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const sessionId = getSessionIdForCourse(courseId, testType);

    // Debug log to verify session ID consistency
    console.log(`[${testType}] Course: ${courseId}, Session ID: ${sessionId}, Continue Chat: ${useContinueChat}`);

    try {
      const response = await fetch(`${config.baseUrl}/api/v1/${testType === 'chat' ? 'chat' : 'langgraph/chat'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.bearerToken}`
        },
        body: JSON.stringify(testType === 'chat' ? {
          message: query, // For unified chat interface
          question: query, // For legacy chat interface (backward compatibility)
          course_id: courseId,
          session_id: sessionId,
          model_provider: config.modelProvider,
          temperature: config.temperature,
          max_tokens: config.maxTokens
        } : {
          message: query,
          course_id: courseId,
          session_id: sessionId,
          user_id: "test_user"
        })
      });

      const data = await response.json();
      const executionTime = (Date.now() - startTime) / 1000;

      // Debug log to verify resource data
      console.log(`[${testType}] Resource data:`, {
        tokens_input: data.tokens_input,
        tokens_output: data.tokens_output,
        cost_estimate: data.cost_estimate,
        sources: data.sources?.length || 0,
        tools_used: data.tools_used
      });

      return {
        id: `${testType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        testType,
        endpoint: testType === 'chat' ? 'unified' : 'langgraph',
        query,
        courseId,
        courseName: currentScenarios.find(s => s.courseId === courseId)?.courseName || courseId,
        category: currentScenarios.find(s => s.courseId === courseId)?.category || 'CUSTOM',
        complexity: currentScenarios.find(s => s.courseId === courseId)?.complexity || 'medium',
        success: response.ok && (testType === 'chat' ? (data.status === 'success' || data.response) : data.success),
        executionTime,
        response: data.response || data.message || 'No response received',
        error: data.error || (response.ok ? undefined : `HTTP ${response.status}`),
        tokensInput: data.tokens_input || 0,
        tokensOutput: data.tokens_output || 0,
        costEstimate: data.cost_estimate || 0,
        sourcesCount: data.sources?.length || 0,
        sources: data.sources,
        toolsUsed: data.tools_used || data.quality_indicators?.tools_used || [],
        confidenceScore: data.confidence_score || 0,
        timestamp,
        sessionId: sessionId,
        status: 'completed'
      };
    } catch (error) {
      return {
        id: `${testType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        testType,
        endpoint: testType === 'chat' ? 'unified' : 'langgraph',
        query,
        courseId,
        courseName: currentScenarios.find(s => s.courseId === courseId)?.courseName || courseId,
        category: currentScenarios.find(s => s.courseId === courseId)?.category || 'CUSTOM',
        complexity: currentScenarios.find(s => s.courseId === courseId)?.complexity || 'medium',
        success: false,
        executionTime: (Date.now() - startTime) / 1000,
        response: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        tokensInput: 0,
        tokensOutput: 0,
        costEstimate: 0,
        sourcesCount: 0,
        timestamp,
        sessionId: sessionId,
        status: 'error'
      };
    }
  };

  const runBatchTests = async () => {
    if (selectedScenarios.length === 0) return;

    setIsRunning(true);
    setBatchProgress({ current: 0, total: selectedScenarios.length * 2 }); // 2 tests per scenario (chat + langgraph)

    const results: TestResult[] = [];
    const resultMap = new Map<string, TestResult>();

    // Create initial pending results for both endpoints
    for (const scenarioId of selectedScenarios) {
      const scenario = currentScenarios.find(s => s.id === scenarioId);
      if (!scenario) continue;

      const timestamp = Date.now();

      // Create pending results for both endpoints
      const chatPendingResult: TestResult = {
        id: `chat_${scenarioId}_${timestamp}`,
        testType: 'chat',
        endpoint: 'unified',
        query: scenario.query,
        courseId: scenario.courseId,
        courseName: scenario.courseName,
        category: scenario.category,
        complexity: scenario.complexity,
        success: false,
        executionTime: 0,
        response: '',
        tokensInput: 0,
        tokensOutput: 0,
        costEstimate: 0,
        sourcesCount: 0,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      const langgraphPendingResult: TestResult = {
        id: `langgraph_${scenarioId}_${timestamp}`,
        testType: 'langgraph',
        endpoint: 'langgraph',
        query: scenario.query,
        courseId: scenario.courseId,
        courseName: scenario.courseName,
        category: scenario.category,
        complexity: scenario.complexity,
        success: false,
        executionTime: 0,
        response: '',
        tokensInput: 0,
        tokensOutput: 0,
        costEstimate: 0,
        sourcesCount: 0,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      results.push(chatPendingResult, langgraphPendingResult);
      resultMap.set(`chat_${scenarioId}`, chatPendingResult);
      resultMap.set(`langgraph_${scenarioId}`, langgraphPendingResult);
    }

    // Add pending results to show placeholders
    setTestResults(prev => [...prev, ...results]);

    // Run tests in parallel for each scenario
    const testPromises: Promise<void>[] = [];

    for (const scenarioId of selectedScenarios) {
      const scenario = currentScenarios.find(s => s.id === scenarioId);
      if (!scenario) continue;

      // Create parallel promises for both endpoints
      const chatPromise = runSingleTest(scenario.query, scenario.courseId, 'chat')
        .then(chatResult => {
          // Update the corresponding result
          setTestResults(prev => prev.map(r =>
            r.id.startsWith(`chat_${scenarioId}_`)
              ? { ...chatResult, endpoint: 'unified', category: scenario.category, complexity: scenario.complexity, status: 'completed' }
              : r
          ));
          setBatchProgress(prev => ({ ...prev, current: prev.current + 1 }));
        })
        .catch(error => {
          // Update with error
          setTestResults(prev => prev.map(r =>
            r.id.startsWith(`chat_${scenarioId}_`)
              ? { ...r, error: error.message, status: 'error' }
              : r
          ));
          setBatchProgress(prev => ({ ...prev, current: prev.current + 1 }));
        });

      const langgraphPromise = runSingleTest(scenario.query, scenario.courseId, 'langgraph')
        .then(langgraphResult => {
          // Update the corresponding result
          setTestResults(prev => prev.map(r =>
            r.id.startsWith(`langgraph_${scenarioId}_`)
              ? { ...langgraphResult, endpoint: 'langgraph', category: scenario.category, complexity: scenario.complexity, status: 'completed' }
              : r
          ));
          setBatchProgress(prev => ({ ...prev, current: prev.current + 1 }));
        })
        .catch(error => {
          // Update with error
          setTestResults(prev => prev.map(r =>
            r.id.startsWith(`langgraph_${scenarioId}_`)
              ? { ...r, error: error.message, status: 'error' }
              : r
          ));
          setBatchProgress(prev => ({ ...prev, current: prev.current + 1 }));
        });

      testPromises.push(chatPromise, langgraphPromise);
    }

    // Wait for all tests to complete
    await Promise.all(testPromises);

    setIsRunning(false);
    setBatchProgress({ current: 0, total: 0 });
  };

  const clearResults = () => {
    setTestResults([]);
    setSelectedScenarios([]);
    setBatchProgress({ current: 0, total: 0 });
    setSessionIds({}); // Reset session IDs when clearing results
    sessionIdsRef.current = {}; // Reset ref as well
    setUseContinueChat(true); // Reset to default behavior
  };

  const resetAll = () => {
    clearResults();
    setCustomQuestions([]);
    setUseCustomQuestions(false);
    setShowQuestionUpload(false);
    setShowPreview(false);
    setPreviewData(null);
  };

  const handleQuestionsChange = (questions: Question[]) => {
    setCustomQuestions(questions);
    if (questions.length > 0) {
      setUseCustomQuestions(true);
      // Reset course filter to show all when new questions are uploaded
      setSelectedCourseFilter("all");
    }
  };

  const generatePreview = () => {
    if (testResults.length === 0) return;

    const chatResults = testResults.filter(r => r.testType === 'chat');
    const langgraphResults = testResults.filter(r => r.testType === 'langgraph');

    const preview = {
      summary: {
        totalTests: testResults.length,
        successRate: successCount / totalCount * 100,
        avgExecutionTime: avgExecutionTime,
        totalCost: testResults.reduce((sum, r) => sum + r.costEstimate, 0)
      },
      performance: {
        chat: {
          successRate: chatResults.length > 0 ? (chatResults.filter(r => r.success).length / chatResults.length) * 100 : 0,
          avgTime: chatResults.length > 0 ? chatResults.reduce((sum, r) => sum + r.executionTime, 0) / chatResults.length : 0,
          totalCost: chatResults.reduce((sum, r) => sum + r.costEstimate, 0)
        },
        langgraph: {
          successRate: langgraphResults.length > 0 ? (langgraphResults.filter(r => r.success).length / langgraphResults.length) * 100 : 0,
          avgTime: langgraphResults.length > 0 ? langgraphResults.reduce((sum, r) => sum + r.executionTime, 0) / langgraphResults.length : 0,
          totalCost: langgraphResults.reduce((sum, r) => sum + r.costEstimate, 0)
        }
      },
      results: testResults,
      groupedResults: testResults.reduce((acc, result) => {
        const queryKey = result.query;
        if (!acc[queryKey]) {
          acc[queryKey] = {
            query: result.query,
            courseId: result.courseId,
            courseName: result.courseName,
            chat: null,
            langgraph: null,
            sessionIds: {
              chat: null,
              langgraph: null
            }
          };
        }
        acc[queryKey][result.testType] = {
          id: result.id,
          testType: result.testType,
          success: result.success,
          executionTime: result.executionTime,
          response: result.response,
          error: result.error,
          tokensInput: result.tokensInput,
          tokensOutput: result.tokensOutput,
          costEstimate: result.costEstimate,
          sourcesCount: result.sourcesCount,
          sources: result.sources,
          toolsUsed: result.toolsUsed,
          confidenceScore: result.confidenceScore,
          timestamp: result.timestamp
        };
        // Store session ID for this test type
        acc[queryKey].sessionIds[result.testType] = result.sessionId;
        return acc;
      }, {} as Record<string, any>)
    };

    setPreviewData(preview);
    setShowPreview(true);
  };

  const exportResults = () => {
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        testingDate: new Date().toISOString(),
        totalTests: testResults.length,
        successCount: testResults.filter(r => r.success).length,
        errorCount: testResults.filter(r => !r.success).length,
        avgExecutionTime: testResults.length > 0
          ? testResults.reduce((sum, r) => sum + r.executionTime, 0) / testResults.length
          : 0,
        totalCost: testResults.reduce((sum, r) => sum + (r.costEstimate || 0), 0),
        totalTokens: testResults.reduce((sum, r) => sum + (r.tokensInput || 0) + (r.tokensOutput || 0), 0),
        config: config,
        scenarios: selectedScenarios.map(id => currentScenarios.find(s => s.id === id)).filter(Boolean),
        results: testResults
      },
      results: testResults
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai_test_results_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const successCount = testResults.filter(r => r.success).length;
  const totalCount = testResults.length;
  const avgExecutionTime = testResults.length > 0
    ? testResults.reduce((sum, r) => sum + r.executionTime, 0) / testResults.length
    : 0;

  // Show loading state while session is being loaded
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show error if no session
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600">Please sign in to access the testing platform.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Testing Platform</h1>
          <p className="text-gray-600 mt-2">
            Test and compare Chat vs LangGraph systems with custom or predefined questions
          </p>
          {config.bearerToken && (
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <User className="h-3 w-3 mr-1" />
                {config.serverType === "localhost" ? session?.user?.email : "mahmoud@designpeer.com"}
                ({config.serverType === "localhost" ? session?.user?.role : "admin"})
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                JWT Token Generated
              </Badge>
              <Badge variant="outline" className="text-xs">
                🌐 {config.serverType} server
              </Badge>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowConfig(!showConfig)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {showConfig ? 'Hide Config' : 'Show Config'}
          </Button>
          <Button
            variant={useContinueChat ? "default" : "outline"}
            size="sm"
            onClick={() => setUseContinueChat(!useContinueChat)}
            disabled={isRunning}
            title={useContinueChat
              ? "Continue Chat enabled - same session per course and test type for conversation continuity"
              : "Isolated tests - new session for each test"
            }
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            {useContinueChat ? 'Continue Chat' : 'Isolated Tests'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearResults}
            disabled={isRunning}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetAll}
            disabled={isRunning}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
        </div>
      </div>

      {/* Test Status Overview - Dashboard Cards at Top */}
      <TestStatusOverview
        totalCount={totalCount}
        successCount={successCount}
        avgExecutionTime={avgExecutionTime}
      />

      {/* Test Configuration - Toggleable */}
      {showConfig && (
        <TestConfiguration
          config={config}
          onConfigChange={setConfig}
          isVisible={showConfig}
          onToggleVisibility={() => setShowConfig(!showConfig)}
        />
      )}

      {/* Authentication Status - Simplified */}
      {config.bearerToken && (
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
      )}

      {/* Batch Testing with integrated question upload and results actions */}
      <BatchTesting
        scenarios={currentScenarios}
        selectedScenarios={selectedScenarios}
        onSelectedScenariosChange={setSelectedScenarios}
        selectedCourseFilter={selectedCourseFilter}
        onCourseFilterChange={setSelectedCourseFilter}
        isRunning={isRunning}
        batchProgress={batchProgress}
        onRunBatch={runBatchTests}
        onClearResults={clearResults}
        showQuestionUpload={showQuestionUpload}
        onToggleQuestionUpload={() => setShowQuestionUpload(!showQuestionUpload)}
        testResults={testResults}
        onGeneratePreview={generatePreview}
        onExportResults={exportResults}
        customQuestions={customQuestions}
        useCustomQuestions={useCustomQuestions}
        onToggleQuestionSource={() => setUseCustomQuestions(!useCustomQuestions)}
        onQuestionsChange={handleQuestionsChange}
      />

      {/* Grid Results View */}
      {testResults.length > 0 && (
        <GridResults
          results={testResults}
          isRunning={isRunning}
          onExportResults={exportResults}
        />
      )}

      {/* Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">Test Results Preview</h2>
              <Button variant="outline" onClick={() => setShowPreview(false)}>
                Close
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{previewData.summary.totalTests}</div>
                    <div className="text-sm text-gray-600">Total Tests</div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{previewData.summary.successRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{previewData.summary.avgExecutionTime.toFixed(2)}s</div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </CardContent>
                </Card>
                <Card className="bg-white border border-gray-200">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">${previewData.summary.totalCost.toFixed(4)}</div>
                    <div className="text-sm text-gray-600">Total Cost</div>
                  </CardContent>
                </Card>
              </div>

              {/* System Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-white border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-600">
                      <MessageSquare className="h-5 w-5" />
                      Chat System Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium">{previewData.performance.chat.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Time:</span>
                      <span className="font-medium">{previewData.performance.chat.avgTime.toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <span className="font-medium">${previewData.performance.chat.totalCost.toFixed(4)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-purple-600">
                      <Brain className="h-5 w-5" />
                      LangGraph System Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium">{previewData.performance.langgraph.successRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Time:</span>
                      <span className="font-medium">{previewData.performance.langgraph.avgTime.toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <span className="font-medium">${previewData.performance.langgraph.totalCost.toFixed(4)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side-by-Side Comparison Results */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <BarChart3 className="h-5 w-5" />
                    Chat vs LangGraph Comparison
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Side-by-side comparison of responses for each query
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.values(previewData.groupedResults).map((group: any, index: number) => (
                      <div key={index} className="border rounded-lg p-6">
                        {/* Query Header */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">{group.query}</h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div>Course: {group.courseName} ({group.courseId})</div>
                            <div className="flex gap-4">
                              {group.sessionIds.chat && (
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="h-3 w-3 text-blue-500" />
                                  <span className="font-mono text-xs">Chat: {group.sessionIds.chat.substring(0, 8)}...</span>
                                </div>
                              )}
                              {group.sessionIds.langgraph && (
                                <div className="flex items-center gap-1">
                                  <Brain className="h-3 w-3 text-purple-500" />
                                  <span className="font-mono text-xs">LangGraph: {group.sessionIds.langgraph.substring(0, 8)}...</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Side-by-side Results */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Chat Results */}
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <MessageSquare className="h-4 w-4 text-blue-500" />
                              <span className="font-medium text-blue-600">Chat System</span>
                              {group.chat && (
                                <Badge className={group.chat.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                  {group.chat.success ? 'Success' : 'Failed'}
                                </Badge>
                              )}
                            </div>
                            {group.chat ? (
                              <div className="space-y-3">
                                <div className="text-sm text-gray-600">
                                  <strong>Time:</strong> {group.chat.executionTime.toFixed(2)}s
                                </div>

                                {/* Main Stats Row */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Tokens:</strong> {group.chat.tokensInput || 0} → {group.chat.tokensOutput || 0}
                                    {group.chat.tokensInput && group.chat.tokensOutput && (
                                      <span className="text-gray-500"> ({(group.chat.tokensInput + group.chat.tokensOutput)} total)</span>
                                    )}
                                  </div>
                                  <div>
                                    <strong>Cost:</strong> ${group.chat.costEstimate ? group.chat.costEstimate.toFixed(6) : '0.000000'}
                                  </div>
                                  <div>
                                    <strong>Sources:</strong> {group.chat.sourcesCount || 0}
                                  </div>
                                  <div>
                                    <strong>Confidence:</strong> {group.chat.confidenceScore ? (group.chat.confidenceScore * 100).toFixed(1) : '0.0'}%
                                  </div>
                                </div>

                                {/* Labels Row */}
                                <div className="flex flex-wrap gap-2">
                                  {group.chat.sources && group.chat.sources.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      <span className="text-xs font-medium text-gray-600">Sources:</span>
                                      {group.chat.sources.slice(0, 2).map((source: any, index: number) => {
                                        const displayName = getSourceDisplayName(source);
                                        return (
                                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                            {displayName}
                                          </span>
                                        );
                                      })}
                                      {group.chat.sources.length > 2 && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                          +{group.chat.sources.length - 2} more
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {group.chat.toolsUsed && group.chat.toolsUsed.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      <span className="text-xs font-medium text-gray-600">Tools:</span>
                                      {group.chat.toolsUsed.map((tool: string, index: number) => {
                                        // Ensure we only render strings, not objects
                                        const safeTool = typeof tool === 'string' ? tool : `Tool ${index + 1}`;
                                        return (
                                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                            {safeTool}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                                  {group.chat.response}
                                </div>
                                {group.chat.error && (
                                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                    Error: {group.chat.error}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">No chat result available</div>
                            )}
                          </div>

                          {/* LangGraph Results */}
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Brain className="h-4 w-4 text-purple-500" />
                              <span className="font-medium text-purple-600">LangGraph System</span>
                              {group.langgraph && (
                                <Badge className={group.langgraph.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                  {group.langgraph.success ? 'Success' : 'Failed'}
                                </Badge>
                              )}
                            </div>
                            {group.langgraph ? (
                              <div className="space-y-3">
                                <div className="text-sm text-gray-600">
                                  <strong>Time:</strong> {group.langgraph.executionTime.toFixed(2)}s
                                </div>

                                {/* Main Stats Row */}
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Tokens:</strong> {group.langgraph.tokensInput || 0} → {group.langgraph.tokensOutput || 0}
                                    {group.langgraph.tokensInput && group.langgraph.tokensOutput && (
                                      <span className="text-gray-500"> ({(group.langgraph.tokensInput + group.langgraph.tokensOutput)} total)</span>
                                    )}
                                  </div>
                                  <div>
                                    <strong>Cost:</strong> ${group.langgraph.costEstimate ? group.langgraph.costEstimate.toFixed(6) : '0.000000'}
                                  </div>
                                  <div>
                                    <strong>Sources:</strong> {group.langgraph.sourcesCount || 0}
                                  </div>
                                  <div>
                                    <strong>Confidence:</strong> {group.langgraph.confidenceScore ? (group.langgraph.confidenceScore * 100).toFixed(1) : '0.0'}%
                                  </div>
                                </div>

                                {/* Labels Row */}
                                <div className="flex flex-wrap gap-2">
                                  {group.langgraph.sources && group.langgraph.sources.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      <span className="text-xs font-medium text-gray-600">Sources:</span>
                                      {group.langgraph.sources.slice(0, 2).map((source: any, index: number) => {
                                        const displayName = getSourceDisplayName(source);
                                        return (
                                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                            {displayName}
                                          </span>
                                        );
                                      })}
                                      {group.langgraph.sources.length > 2 && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                          +{group.langgraph.sources.length - 2} more
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {group.langgraph.toolsUsed && group.langgraph.toolsUsed.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      <span className="text-xs font-medium text-gray-600">Tools:</span>
                                      {group.langgraph.toolsUsed.map((tool: string, index: number) => {
                                        // Ensure we only render strings, not objects
                                        const safeTool = typeof tool === 'string' ? tool : `Tool ${index + 1}`;
                                        return (
                                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                            {safeTool}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                                  {group.langgraph.response}
                                </div>
                                {group.langgraph.error && (
                                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                    Error: {group.langgraph.error}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-500">No LangGraph result available</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}