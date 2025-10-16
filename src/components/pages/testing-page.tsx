"use client";

import React, { useState, useEffect, useRef } from "react";
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
  AlertCircle
} from "lucide-react";

// Import modular components
import { QuestionUpload, Question } from "@/components/testing/QuestionUpload";
import { TestConfiguration, TestConfig } from "@/components/testing/TestConfiguration";
import { TestStatusOverview } from "@/components/testing/TestStatusOverview";
import { BatchTesting, TestScenario } from "@/components/testing/BatchTesting";

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
  query: string;
  courseId: string;
  courseName: string;
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
}

// Default test scenarios - diverse courses for localhost testing
const DEFAULT_TEST_SCENARIOS: TestScenario[] = [
  // Educational Games Course (Course ID: 89)
  {
    id: "1",
    query: "What is this course about? Can you give me an overview of the main topics covered?",
    courseId: "89",
    courseName: "Educational Games Course",
    category: "COURSE_OVERVIEW",
    complexity: "low"
  },
  {
    id: "2",
    query: "What are the different types of educational games mentioned in this course?",
    courseId: "89",
    courseName: "Educational Games Course",
    category: "CONTENT_UNDERSTANDING",
    complexity: "medium"
  },
  {
    id: "3",
    query: "How can teachers use games to enhance social and cognitive skills in children?",
    courseId: "89",
    courseName: "Educational Games Course",
    category: "PRACTICAL_APPLICATION",
    complexity: "medium"
  },
  {
    id: "4",
    query: "What is the importance of reinforcement in educational games, both positive and negative?",
    courseId: "89",
    courseName: "Educational Games Course",
    category: "DETAILED_ANALYSIS",
    complexity: "high"
  },
  {
    id: "5",
    query: "How should educational games be designed according to children's developmental stages?",
    courseId: "89",
    courseName: "Educational Games Course",
    category: "DESIGN_PRINCIPLES",
    complexity: "high"
  },

  // Machine Learning Fundamentals (Course ID: ml_fundamentals_101)
  {
    id: "6",
    query: "What are the mathematical foundations of backpropagation in neural networks?",
    courseId: "ml_fundamentals_101",
    courseName: "Machine Learning Fundamentals",
    category: "TECHNICAL_DEEP_DIVE",
    complexity: "high"
  },
  {
    id: "7",
    query: "Can you explain the difference between supervised and unsupervised learning?",
    courseId: "ml_fundamentals_101",
    courseName: "Machine Learning Fundamentals",
    category: "CONCEPTUAL_UNDERSTANDING",
    complexity: "medium"
  },
  {
    id: "8",
    query: "What is the bias-variance tradeoff and how does it affect model performance?",
    courseId: "ml_fundamentals_101",
    courseName: "Machine Learning Fundamentals",
    category: "THEORETICAL_CONCEPTS",
    complexity: "high"
  },

  // Deep Learning Advanced (Course ID: deep_learning_advanced)
  {
    id: "9",
    query: "How does the transformer architecture work and what makes it effective?",
    courseId: "deep_learning_advanced",
    courseName: "Deep Learning Advanced",
    category: "ADVANCED_TOPICS",
    complexity: "high"
  },
  {
    id: "10",
    query: "What are the key components of attention mechanisms in deep learning?",
    courseId: "deep_learning_advanced",
    courseName: "Deep Learning Advanced",
    category: "TECHNICAL_DETAILS",
    complexity: "high"
  },

  // Data Science Analytics (Course ID: data_science_analytics)
  {
    id: "11",
    query: "How would you design a recommendation system for an e-commerce platform?",
    courseId: "data_science_analytics",
    courseName: "Data Science Analytics",
    category: "PROBLEM_SOLVING",
    complexity: "high"
  },
  {
    id: "12",
    query: "What preprocessing steps are essential for text data in NLP projects?",
    courseId: "data_science_analytics",
    courseName: "Data Science Analytics",
    category: "PRACTICAL_IMPLEMENTATION",
    complexity: "medium"
  },

  // NLP Processing (Course ID: nlp_processing)
  {
    id: "13",
    query: "How would you build a fraud detection system using machine learning?",
    courseId: "nlp_processing",
    courseName: "NLP Processing",
    category: "REAL_WORLD_APPLICATION",
    complexity: "high"
  },
  {
    id: "14",
    query: "What are the main challenges in natural language understanding?",
    courseId: "nlp_processing",
    courseName: "NLP Processing",
    category: "CONCEPTUAL_UNDERSTANDING",
    complexity: "medium"
  }
];

const DEFAULT_CONFIG: TestConfig = {
  bearerToken: "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICItUU1pSGRBSEJaRGRiTTZISDlmZ2VLUkFxRzRRVjU4cnFCV2VnNUtJSUdRIn0.eyJleHAiOjE3NTk3NTMzNjEsImlhdCI6MTc1OTc1MjQ2MSwiYXV0aF90aW1lIjoxNzU5NzUyNDYwLCJqdGkiOiI4YjVlZjNiZS03MTBiLTQ3ZTEtOWI0My1mMGQ5MjdlNzcxNWQiLCJpc3MiOiJodHRwczovL2FjY291bnRzLXRlc3RpbmcuYWFuYWFiLm5ldC9yZWFsbXMvbWFzdGVyIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjdkNmFkMTE4LTY5NmYtNDVjOC05MDhkLWViMGRmZjg1MDMyMyIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFhbmFhYi1uZXh0Iiwibm9uY2UiOiIyYmU5YzNjMC1iZTFlLTRjMDQtODEwZC1iZTMxZWE5MmQzNmEiLCJzZXNzaW9uX3N0YXRlIjoiMmUzMTZhOGMtZWFjOC00ODUxLWE1ZjItZDQ2ZTMwNzExMTlkIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMzMDAiLCJodHRwczovL2FwcC10ZXN0aW5nLmFhbmFhYi5uZXQiLCJodHRwczovL3Rlc3RpbmcuYWFuYWFiLm5ldCIsImh0dHA6Ly9mcm9udGVuZC5hYW5hYWIubG9jYWxob3N0IiwiaHR0cDovL2xvY2FsaG9zdDozMDAxIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW1hc3RlciIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwaG9uZSBwcm9maWxlIGVtYWlsIiwic2lkIjoiMmUzMTZhOGMtZWFjOC00ODUxLWE1ZjItZDQ2ZTMwNzExMTlkIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6Im1haG1vdWQiLCJnaXZlbl9uYW1lIjoiIiwiZmFtaWx5X25hbWUiOiIiLCJlbWFpbCI6Im1haG1vdWRAZGVzaWducGVlci5jb20ifQ.E0xwjJLHGd8CyUYhixgHlEZJHpQ1yewPsY6sZbxlY_t4HY7aPD_qenfqTeuxbdyNSWk5y4cwudkx4eiHorcZJA-4As_3WlKBMYgnxlRjurLnOFF_A_2oJ9g0On0Zjf1pBUErZmlG5fr-5dU0gXhILzXD9r4YwVE0p3sKzENRU1OLXbcyQtTJ5dMqzX3pJfInaO6z9euiHLJ84Jl7gL53NDL_ICglBBSJY1hE90VfXz7MT8nViPkmll4cBTTrbu6CxdIFsvX7vb2OsS6dwrIJDYC3oxosNdvZMlfIhu2MvIRB0owE0ET62aME_iLuiYmD7j_j00hM6w6cJPi_JfMQLg",
  baseUrl: "http://localhost:8000",
  serverType: "localhost",
  modelProvider: "openai",
  model: "gpt-4o-mini",
  temperature: 0.7,
  maxTokens: 1000,
  courseIds: ["89", "deep_learning_advanced", "ml_fundamentals_101", "data_science_analytics", "nlp_processing"]
};

export default function TestingPage() {
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
        query,
        courseId,
        courseName: currentScenarios.find(s => s.courseId === courseId)?.courseName || courseId,
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
        sessionId: sessionId
      };
    } catch (error) {
      return {
        id: `${testType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        testType,
        query,
        courseId,
        courseName: currentScenarios.find(s => s.courseId === courseId)?.courseName || courseId,
        success: false,
        executionTime: (Date.now() - startTime) / 1000,
        response: '',
        error: error instanceof Error ? error.message : 'Unknown error',
        tokensInput: 0,
        tokensOutput: 0,
        costEstimate: 0,
        sourcesCount: 0,
        timestamp,
        sessionId: sessionId
      };
    }
  };

  const runBatchTests = async () => {
    if (selectedScenarios.length === 0) return;

    setIsRunning(true);
    setBatchProgress({ current: 0, total: selectedScenarios.length * 2 }); // 2 tests per scenario (chat + langgraph)

    const results: TestResult[] = [];

    for (const scenarioId of selectedScenarios) {
      const scenario = currentScenarios.find(s => s.id === scenarioId);
      if (!scenario) continue;

      // Run Chat test
      const chatResult = await runSingleTest(scenario.query, scenario.courseId, 'chat');
      results.push(chatResult);
      setBatchProgress(prev => ({ ...prev, current: prev.current + 1 }));

      // Run LangGraph test
      const langgraphResult = await runSingleTest(scenario.query, scenario.courseId, 'langgraph');
      results.push(langgraphResult);
      setBatchProgress(prev => ({ ...prev, current: prev.current + 1 }));
    }

    setTestResults(prev => [...prev, ...results]);
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
        totalTests: testResults.length,
        config: config
      },
      results: testResults
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai_test_results_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Calculate statistics
  const successCount = testResults.filter(r => r.success).length;
  const totalCount = testResults.length;
  const avgExecutionTime = testResults.length > 0
    ? testResults.reduce((sum, r) => sum + r.executionTime, 0) / testResults.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Testing Platform</h1>
          <p className="text-gray-600 mt-2">
            Test and compare Chat vs LangGraph systems with custom or predefined questions
          </p>
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

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <BarChart3 className="h-5 w-5" />
              Test Results
            </CardTitle>
            <CardDescription className="text-gray-600">
              Detailed test execution results
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {testResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {result.testType === 'chat' ? (
                        <MessageSquare className="h-5 w-5 text-blue-500" />
                      ) : (
                        <Brain className="h-5 w-5 text-purple-500" />
                      )}
                      <div>
                        <p className="font-medium capitalize">{result.testType} Test</p>
                        <p className="text-sm text-gray-600">
                          {new Date(result.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {result.success ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <XCircle className="h-3 w-3 mr-1" />
                        )}
                        {result.success ? 'Passed' : 'Failed'}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {result.executionTime.toFixed(2)}s
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Query:</p>
                      <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        {result.query}
                      </p>
                    </div>

                    {result.sessionId && (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Session ID:</p>
                        <p className="text-xs font-mono text-gray-500 bg-gray-100 p-2 rounded">
                          {result.sessionId}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium text-gray-700">Response:</p>
                      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {result.response}
                      </div>
                    </div>

                    {result.error && (
                      <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}

                    <div className="space-y-3">
                      {/* Main Stats Row */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Tokens:</span> {result.tokensInput || 0} → {result.tokensOutput || 0}
                          {result.tokensInput && result.tokensOutput && (
                            <span className="text-gray-500 ml-1">({(result.tokensInput + result.tokensOutput)} total)</span>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">Cost:</span> ${result.costEstimate ? result.costEstimate.toFixed(6) : '0.000000'}
                        </div>
                        <div>
                          <span className="font-medium">Sources:</span> {result.sourcesCount || 0}
                        </div>
                        <div>
                          <span className="font-medium">Confidence:</span> {result.confidenceScore ? (result.confidenceScore * 100).toFixed(1) : '0.0'}%
                        </div>
                      </div>

                      {/* Labels Row */}
                      <div className="flex flex-wrap gap-2">
                        {result.sources && result.sources.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs font-medium text-gray-600">Sources:</span>
                            {result.sources.slice(0, 3).map((source: any, index: number) => {
                              const displayName = getSourceDisplayName(source);
                              return (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                                  {displayName}
                                </span>
                              );
                            })}
                            {result.sources.length > 3 && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                                +{result.sources.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        {result.toolsUsed && result.toolsUsed.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            <span className="text-xs font-medium text-gray-600">Tools:</span>
                            {result.toolsUsed.map((tool: string, index: number) => {
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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