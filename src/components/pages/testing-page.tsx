"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Download,
  Settings,
  Globe,
  Server,
  MessageSquare,
  Brain,
  BarChart3,
  FileText,
  AlertCircle
} from "lucide-react";

interface TestResult {
  id: string;
  testType: 'chat' | 'langgraph';
  query: string;
  courseId: string;
  courseName?: string;
  success: boolean;
  executionTime: number;
  response: string;
  error?: string;
  tokensInput?: number;
  tokensOutput?: number;
  costEstimate?: number;
  sourcesCount?: number;
  toolsUsed?: string[];
  confidenceScore?: number;
  timestamp: string;
}

interface TestConfig {
  bearerToken: string;
  baseUrl: string;
  modelProvider: string;
  temperature: number;
  maxTokens: number;
  courseIds: string[];
}

const DEFAULT_CONFIG: TestConfig = {
  bearerToken: "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICItUU1pSGRBSEJaRGRiTTZISDlmZ2VLUkFxRzRRVjU4cnFCV2VnNUtJSUdRIn0.eyJleHAiOjE3NTk3NTMzNjEsImlhdCI6MTc1OTc1MjQ2MSwiYXV0aF90aW1lIjoxNzU5NzUyNDYwLCJqdGkiOiI4YjVlZjNiZS03MTBiLTQ3ZTEtOWI0My1mMGQ5MjdlNzcxNWQiLCJpc3MiOiJodHRwczovL2FjY291bnRzLXRlc3RpbmcuYWFuYWFiLm5ldC9yZWFsbXMvbWFzdGVyIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6IjdkNmFkMTE4LTY5NmYtNDVjOC05MDhkLWViMGRmZjg1MDMyMyIsInR5cCI6IkJlYXJlciIsImF6cCI6ImFhbmFhYi1uZXh0Iiwibm9uY2UiOiIyYmU5YzNjMC1iZTFlLTRjMDQtODEwZC1iZTMxZWE5MmQzNmEiLCJzZXNzaW9uX3N0YXRlIjoiMmUzMTZhOGMtZWFjOC00ODUxLWE1ZjItZDQ2ZTMwNzExMTlkIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwOi8vbG9jYWxob3N0OjMzMDAiLCJodHRwczovL2FwcC10ZXN0aW5nLmFhbmFhYi5uZXQiLCJodHRwczovL3Rlc3RpbmcuYWFuYWFiLm5ldCIsImh0dHA6Ly9mcm9udGVuZC5hYW5hYWIubG9jYWxob3N0IiwiaHR0cDovL2xvY2FsaG9zdDozMDAxIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJkZWZhdWx0LXJvbGVzLW1hc3RlciIsIm9mZmxpbmVfYWNjZXNzIiwidW1hX2F1dGhvcml6YXRpb24iXX0sInJlc291cmNlX2FjY2VzcyI6eyJhY2NvdW50Ijp7InJvbGVzIjpbIm1hbmFnZS1hY2NvdW50IiwibWFuYWdlLWFjY291bnQtbGlua3MiLCJ2aWV3LXByb2ZpbGUiXX19LCJzY29wZSI6Im9wZW5pZCBwaG9uZSBwcm9maWxlIGVtYWlsIiwic2lkIjoiMmUzMTZhOGMtZWFjOC00ODUxLWE1ZjItZDQ2ZTMwNzExMTlkIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInByZWZlcnJlZF91c2VybmFtZSI6Im1haG1vdWQiLCJnaXZlbl9uYW1lIjoiIiwiZmFtaWx5X25hbWUiOiIiLCJlbWFpbCI6Im1haG1vdWRAZGVzaWducGVlci5jb20ifQ.E0xwjJLHGd8CyUYhixgHlEZJHpQ1yewPsY6sZbxlY_t4HY7aPD_qenfqTeuxbdyNSWk5y4cwudkx4eiHorcZJA-4As_3WlKBMYgnxlRjurLnOFF_A_2oJ9g0On0Zjf1pBUErZmlG5fr-5dU0gXhILzXD9r4YwVE0p3sKzENRU1OLXbcyQtTJ5dMqzX3pJfInaO6z9euiHLJ84Jl7gL53NDL_ICglBBSJY1hE90VfXz7MT8nViPkmll4cBTTrbu6CxdIFsvX7vb2OsS6dwrIJDYC3oxosNdvZMlfIhu2MvIRB0owE0ET62aME_iLuiYmD7j_j00hM6w6cJPi_JfMQLg",
  baseUrl: "http://localhost:8000",
  modelProvider: "openai",
  temperature: 0.7,
  maxTokens: 1000,
  courseIds: ["89", "deep_learning_advanced", "ml_fundamentals_101", "data_science_analytics", "nlp_processing"]
};

const TEST_SCENARIOS = [
  // Educational Games Course (Course 89)
  {
    id: "course_overview",
    category: "COURSE_OVERVIEW",
    query: "What is this course about? Can you give me an overview of the main topics covered?",
    complexity: "low",
    courseId: "89",
    courseName: "Educational Games"
  },
  {
    id: "content_understanding",
    category: "CONTENT_UNDERSTANDING",
    query: "What are the different types of educational games mentioned in this course?",
    complexity: "medium",
    courseId: "89",
    courseName: "Educational Games"
  },
  {
    id: "practical_application",
    category: "PRACTICAL_APPLICATION",
    query: "How can teachers use games to enhance social and cognitive skills in children?",
    complexity: "medium",
    courseId: "89",
    courseName: "Educational Games"
  },
  {
    id: "detailed_analysis",
    category: "DETAILED_ANALYSIS",
    query: "What is the importance of reinforcement in educational games, both positive and negative?",
    complexity: "high",
    courseId: "89",
    courseName: "Educational Games"
  },
  {
    id: "design_principles",
    category: "DESIGN_PRINCIPLES",
    query: "How should educational games be designed according to children's developmental stages?",
    complexity: "high",
    courseId: "89",
    courseName: "Educational Games"
  },
  {
    id: "implementation",
    category: "IMPLEMENTATION",
    query: "What strategies should be applied in classrooms to achieve positive educational outcomes with games?",
    complexity: "high",
    courseId: "89",
    courseName: "Educational Games"
  },
  {
    id: "specific_content",
    category: "SPECIFIC_CONTENT",
    query: "Can you explain the different categories of games mentioned in the course content?",
    complexity: "medium",
    courseId: "89",
    courseName: "Educational Games"
  },
  {
    id: "practical_examples",
    category: "PRACTICAL_EXAMPLES",
    query: "What are some examples of how games can be used as effective educational tools?",
    complexity: "medium",
    courseId: "89",
    courseName: "Educational Games"
  },
  {
    id: "deep_dive",
    category: "DEEP_DIVE",
    query: "How do educational games contribute to enhancing learning and maintaining student engagement and creativity?",
    complexity: "high",
    courseId: "89",
    courseName: "Educational Games"
  },
  {
    id: "comparison",
    category: "COMPARISON",
    query: "What are the differences between symbolic, social, creative, and linguistic games mentioned in the course?",
    complexity: "high",
    courseId: "89",
    courseName: "Educational Games"
  },

  // Deep Learning Advanced Course
  {
    id: "dl_neural_networks",
    category: "NEURAL_NETWORKS",
    query: "Explain the mathematical foundations of backpropagation in deep neural networks and how it enables learning in multi-layer architectures.",
    complexity: "high",
    courseId: "deep_learning_advanced",
    courseName: "Deep Learning Advanced"
  },
  {
    id: "dl_optimization",
    category: "OPTIMIZATION",
    query: "Compare and contrast different optimization algorithms like Adam, RMSprop, and SGD with momentum. When would you use each?",
    complexity: "high",
    courseId: "deep_learning_advanced",
    courseName: "Deep Learning Advanced"
  },
  {
    id: "dl_architectures",
    category: "ARCHITECTURES",
    query: "What are the key differences between CNN, RNN, and Transformer architectures? Provide specific use cases for each.",
    complexity: "high",
    courseId: "deep_learning_advanced",
    courseName: "Deep Learning Advanced"
  },
  {
    id: "dl_regularization",
    category: "REGULARIZATION",
    query: "Explain dropout, batch normalization, and L1/L2 regularization. How do they prevent overfitting?",
    complexity: "medium",
    courseId: "deep_learning_advanced",
    courseName: "Deep Learning Advanced"
  },
  {
    id: "dl_attention",
    category: "ATTENTION_MECHANISMS",
    query: "How do attention mechanisms work in neural networks? Explain self-attention and its role in Transformers.",
    complexity: "high",
    courseId: "deep_learning_advanced",
    courseName: "Deep Learning Advanced"
  },

  // ML Fundamentals Course
  {
    id: "ml_supervised_learning",
    category: "SUPERVISED_LEARNING",
    query: "What is the difference between classification and regression? Provide examples of algorithms for each.",
    complexity: "low",
    courseId: "ml_fundamentals_101",
    courseName: "ML Fundamentals"
  },
  {
    id: "ml_unsupervised_learning",
    category: "UNSUPERVISED_LEARNING",
    query: "Explain clustering algorithms like K-means and hierarchical clustering. When would you use each?",
    complexity: "medium",
    courseId: "ml_fundamentals_101",
    courseName: "ML Fundamentals"
  },
  {
    id: "ml_evaluation",
    category: "MODEL_EVALUATION",
    query: "What are precision, recall, and F1-score? How do you choose the right evaluation metric?",
    complexity: "medium",
    courseId: "ml_fundamentals_101",
    courseName: "ML Fundamentals"
  },
  {
    id: "ml_bias_variance",
    category: "BIAS_VARIANCE",
    query: "Explain the bias-variance tradeoff in machine learning. How does it affect model performance?",
    complexity: "medium",
    courseId: "ml_fundamentals_101",
    courseName: "ML Fundamentals"
  },
  {
    id: "ml_feature_engineering",
    category: "FEATURE_ENGINEERING",
    query: "What is feature engineering and why is it important? Provide examples of common techniques.",
    complexity: "medium",
    courseId: "ml_fundamentals_101",
    courseName: "ML Fundamentals"
  },

  // Data Science Analytics Course
  {
    id: "ds_exploratory_analysis",
    category: "EXPLORATORY_ANALYSIS",
    query: "What is exploratory data analysis (EDA) and what are the key steps involved?",
    complexity: "low",
    courseId: "data_science_analytics",
    courseName: "Data Science Analytics"
  },
  {
    id: "ds_statistical_tests",
    category: "STATISTICAL_TESTS",
    query: "When would you use t-tests vs ANOVA vs chi-square tests? Explain the assumptions for each.",
    complexity: "high",
    courseId: "data_science_analytics",
    courseName: "Data Science Analytics"
  },
  {
    id: "ds_data_visualization",
    category: "DATA_VISUALIZATION",
    query: "What are the best practices for data visualization? How do you choose the right chart type?",
    complexity: "medium",
    courseId: "data_science_analytics",
    courseName: "Data Science Analytics"
  },
  {
    id: "ds_time_series",
    category: "TIME_SERIES",
    query: "Explain time series analysis techniques and how to handle seasonality and trends.",
    complexity: "high",
    courseId: "data_science_analytics",
    courseName: "Data Science Analytics"
  },
  {
    id: "ds_ab_testing",
    category: "A_B_TESTING",
    query: "How do you design and analyze A/B tests? What statistical considerations are important?",
    complexity: "high",
    courseId: "data_science_analytics",
    courseName: "Data Science Analytics"
  },

  // NLP Processing Course
  {
    id: "nlp_text_preprocessing",
    category: "TEXT_PREPROCESSING",
    query: "What are the essential steps in text preprocessing for NLP? Explain tokenization, stemming, and lemmatization.",
    complexity: "medium",
    courseId: "nlp_processing",
    courseName: "NLP Processing"
  },
  {
    id: "nlp_word_embeddings",
    category: "WORD_EMBEDDINGS",
    query: "Compare Word2Vec, GloVe, and FastText embeddings. What are their strengths and weaknesses?",
    complexity: "high",
    courseId: "nlp_processing",
    courseName: "NLP Processing"
  },
  {
    id: "nlp_sentiment_analysis",
    category: "SENTIMENT_ANALYSIS",
    query: "How do you approach sentiment analysis? What are the challenges with sarcasm and context?",
    complexity: "medium",
    courseId: "nlp_processing",
    courseName: "NLP Processing"
  },
  {
    id: "nlp_language_models",
    category: "LANGUAGE_MODELS",
    query: "Explain the evolution from RNNs to LSTMs to Transformers in language modeling.",
    complexity: "high",
    courseId: "nlp_processing",
    courseName: "NLP Processing"
  },
  {
    id: "nlp_evaluation_metrics",
    category: "NLP_EVALUATION",
    query: "What are BLEU, ROUGE, and METEOR scores? When would you use each for evaluating NLP models?",
    complexity: "high",
    courseId: "nlp_processing",
    courseName: "NLP Processing"
  }
];

export default function TestingPage() {
  const [config, setConfig] = useState<TestConfig>(DEFAULT_CONFIG);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<string>("");
  const [customQuery, setCustomQuery] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("89");
  const [showConfig, setShowConfig] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>("all");

  // Get unique courses for filtering
  const availableCourses = Array.from(new Set(TEST_SCENARIOS.map(s => s.courseId))).map(courseId => {
    const scenario = TEST_SCENARIOS.find(s => s.courseId === courseId);
    return { id: courseId, name: scenario?.courseName || courseId };
  });

  // Get filtered scenarios based on course filter
  const getFilteredScenarios = () => {
    if (selectedCourseFilter === "all") {
      return TEST_SCENARIOS;
    }
    return TEST_SCENARIOS.filter(scenario => scenario.courseId === selectedCourseFilter);
  };

  const runSingleTest = async (query: string, courseId: string, testType: 'chat' | 'langgraph', courseName?: string) => {
    const testId = `${testType}_${Date.now()}`;
    const startTime = Date.now();

    try {
      const response = await fetch('/api/test-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.bearerToken}`
        },
        body: JSON.stringify({
          query,
          courseId,
          testType,
          baseUrl: config.baseUrl,
          modelProvider: config.modelProvider,
          temperature: config.temperature,
          maxTokens: config.maxTokens
        })
      });

      const data = await response.json();
      const executionTime = (Date.now() - startTime) / 1000;

      const result: TestResult = {
        id: testId,
        testType,
        query,
        courseId,
        courseName,
        success: data.success || false,
        executionTime,
        response: data.response || "",
        error: data.error,
        tokensInput: data.tokensInput || 0,
        tokensOutput: data.tokensOutput || 0,
        costEstimate: data.costEstimate || 0,
        sourcesCount: data.sourcesCount || 0,
        toolsUsed: data.toolsUsed || [],
        confidenceScore: data.confidenceScore || 0,
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [result, ...prev]);
      return result;
    } catch (error) {
      const result: TestResult = {
        id: testId,
        testType,
        query,
        courseId,
        courseName,
        success: false,
        executionTime: (Date.now() - startTime) / 1000,
        response: "",
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };

      setTestResults(prev => [result, ...prev]);
      return result;
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setBatchProgress({ current: 0, total: TEST_SCENARIOS.length * 2 });

    for (let i = 0; i < TEST_SCENARIOS.length; i++) {
      const scenario = TEST_SCENARIOS[i];

      // Test Chat system
      setBatchProgress({ current: i * 2 + 1, total: TEST_SCENARIOS.length * 2 });
      await runSingleTest(scenario.query, selectedCourseId, 'chat', scenario.courseName);

      // Test LangGraph system (placeholder)
      setBatchProgress({ current: i * 2 + 2, total: TEST_SCENARIOS.length * 2 });
      await runSingleTest(scenario.query, selectedCourseId, 'langgraph', scenario.courseName);

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
    setBatchProgress({ current: 0, total: 0 });
  };

  const runBatchTests = async () => {
    if (selectedScenarios.length === 0) return;

    setIsRunning(true);
    setTestResults([]);
    setBatchProgress({ current: 0, total: selectedScenarios.length * 2 });

    for (let i = 0; i < selectedScenarios.length; i++) {
      const scenarioId = selectedScenarios[i];
      const scenario = TEST_SCENARIOS.find(s => s.id === scenarioId);
      if (!scenario) continue;

      // Test Chat system
      setBatchProgress({ current: i * 2 + 1, total: selectedScenarios.length * 2 });
      await runSingleTest(scenario.query, selectedCourseId, 'chat', scenario.courseName);

      // Test LangGraph system (placeholder)
      setBatchProgress({ current: i * 2 + 2, total: selectedScenarios.length * 2 });
      await runSingleTest(scenario.query, selectedCourseId, 'langgraph', scenario.courseName);

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
    setBatchProgress({ current: 0, total: 0 });
  };

  const generatePreview = () => {
    const chatResults = testResults.filter(r => r.testType === 'chat');
    const langgraphResults = testResults.filter(r => r.testType === 'langgraph');

    const preview = {
      summary: {
        totalTests: testResults.length,
        chatTests: chatResults.length,
        langgraphTests: langgraphResults.length,
        successRate: totalCount > 0 ? (successCount / totalCount) * 100 : 0,
        avgExecutionTime: avgExecutionTime,
        totalCost: testResults.reduce((sum, r) => sum + (r.costEstimate || 0), 0),
        totalTokens: testResults.reduce((sum, r) => sum + (r.tokensInput || 0) + (r.tokensOutput || 0), 0)
      },
      performance: {
        chat: {
          successRate: chatResults.length > 0 ? (chatResults.filter(r => r.success).length / chatResults.length) * 100 : 0,
          avgTime: chatResults.length > 0 ? chatResults.reduce((sum, r) => sum + r.executionTime, 0) / chatResults.length : 0,
          totalCost: chatResults.reduce((sum, r) => sum + (r.costEstimate || 0), 0),
          totalTokens: chatResults.reduce((sum, r) => sum + (r.tokensInput || 0) + (r.tokensOutput || 0), 0)
        },
        langgraph: {
          successRate: langgraphResults.length > 0 ? (langgraphResults.filter(r => r.success).length / langgraphResults.length) * 100 : 0,
          avgTime: langgraphResults.length > 0 ? langgraphResults.reduce((sum, r) => sum + r.executionTime, 0) / langgraphResults.length : 0,
          totalCost: langgraphResults.reduce((sum, r) => sum + (r.costEstimate || 0), 0),
          totalTokens: langgraphResults.reduce((sum, r) => sum + (r.tokensInput || 0) + (r.tokensOutput || 0), 0)
        }
      },
      results: testResults.map(result => ({
        id: result.id,
        testType: result.testType,
        query: result.query,
        success: result.success,
        executionTime: result.executionTime,
        response: result.response.substring(0, 200) + (result.response.length > 200 ? '...' : ''),
        error: result.error,
        tokensInput: result.tokensInput,
        tokensOutput: result.tokensOutput,
        costEstimate: result.costEstimate,
        timestamp: result.timestamp
      }))
    };

    setPreviewData(preview);
    setShowPreview(true);
  };

  const runCustomTest = async () => {
    if (!customQuery.trim()) return;

    setIsRunning(true);

    // Test both systems
    const selectedCourse = availableCourses.find(c => c.id === selectedCourseId);
    await runSingleTest(customQuery, selectedCourseId, 'chat', selectedCourse?.name);
    await runSingleTest(customQuery, selectedCourseId, 'langgraph', selectedCourse?.name);

    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const exportResults = () => {
    const dataStr = JSON.stringify(testResults, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `test_results_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const successCount = testResults.filter(r => r.success).length;
  const totalCount = testResults.length;
  const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0;

  const chatResults = testResults.filter(r => r.testType === 'chat');
  const langgraphResults = testResults.filter(r => r.testType === 'langgraph');

  const avgExecutionTime = testResults.length > 0
    ? testResults.reduce((sum, r) => sum + r.executionTime, 0) / testResults.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chat Endpoints Testing</h1>
          <p className="text-gray-600 mt-2">
            Test and compare Chat vs LangGraph systems using real API endpoints
          </p>
        </div>
        <div className="flex gap-2">
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
            onClick={clearResults}
            disabled={isRunning}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button
            size="sm"
            onClick={runAllTests}
            disabled={isRunning}
          >
            {isRunning ? (
              <Pause className="h-4 w-4 mr-2" />
            ) : (
              <Play className="h-4 w-4 mr-2" />
            )}
            {isRunning ? 'Running...' : 'Run All Tests'}
          </Button>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>
              Configure API endpoints, authentication, and test parameters for local testing
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Local Testing Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Local Testing Mode</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Using real testing token with localhost API (http://localhost:8000). The system will make live API calls to the local backend.
                    Set a valid token to test against real API endpoints.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input
                  id="baseUrl"
                  value={config.baseUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="http://localhost:8000"
                />
                <p className="text-xs text-gray-500">
                  Default: localhost:8000 for local development
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="courseId">Course ID</Label>
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {config.courseIds.map(id => (
                      <SelectItem key={id} value={id}>{id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Select a course ID for testing
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelProvider">Model Provider</Label>
                <Select
                  value={config.modelProvider}
                  onValueChange={(value) => setConfig(prev => ({ ...prev, modelProvider: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                  </SelectContent>
                </Select>
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
                <p className="text-xs text-gray-500">
                  Controls randomness (0.0 = deterministic, 2.0 = very random)
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bearerToken">Bearer Token</Label>
              <Textarea
                id="bearerToken"
                value={config.bearerToken}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConfig(prev => ({ ...prev, bearerToken: e.target.value }))}
                rows={3}
                placeholder="Enter your bearer token here"
              />
              <p className="text-xs text-gray-500">
                Using real testing token by default. Replace with your own token if needed.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{successRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-blue-600">{avgExecutionTime.toFixed(2)}s</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed Tests</p>
                <p className="text-2xl font-bold text-red-600">{totalCount - successCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Testing */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Testing</CardTitle>
          <CardDescription>
            Select multiple test scenarios to run in batch. Filter by course to focus on specific subjects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Course Filter */}
          <div className="space-y-2">
            <Label>Filter by Course</Label>
            <Select value={selectedCourseFilter} onValueChange={setSelectedCourseFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses ({TEST_SCENARIOS.length})</SelectItem>
                {availableCourses.map(course => {
                  const count = TEST_SCENARIOS.filter(s => s.courseId === course.id).length;
                  return (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} ({count})
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Select Test Scenarios</Label>
              <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
                {getFilteredScenarios().map((scenario) => (
                  <div key={scenario.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={scenario.id}
                      checked={selectedScenarios.includes(scenario.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedScenarios(prev => [...prev, scenario.id]);
                        } else {
                          setSelectedScenarios(prev => prev.filter(id => id !== scenario.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={scenario.id} className="text-sm flex-1 cursor-pointer">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium">{scenario.category}</div>
                        <Badge
                          variant="secondary"
                          className="text-xs bg-blue-100 text-blue-800"
                        >
                          {scenario.courseName}
                        </Badge>
                      </div>
                      <div className="text-gray-500 text-xs">
                        {scenario.query.substring(0, 80)}...
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={
                            scenario.complexity === 'high' ? 'text-red-600 border-red-200' :
                              scenario.complexity === 'medium' ? 'text-yellow-600 border-yellow-200' :
                                'text-green-600 border-green-200'
                          }
                        >
                          {scenario.complexity}
                        </Badge>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Batch Progress</Label>
                {isRunning && batchProgress.total > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{batchProgress.current}/{batchProgress.total}</span>
                    </div>
                    <Progress
                      value={(batchProgress.current / batchProgress.total) * 100}
                      className="h-2"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={runBatchTests}
                  disabled={isRunning || selectedScenarios.length === 0}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Run Selected Tests ({selectedScenarios.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedScenarios(getFilteredScenarios().map(s => s.id))}
                  disabled={isRunning}
                >
                  Select All ({getFilteredScenarios().length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedScenarios([])}
                  disabled={isRunning}
                >
                  Clear All
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Test */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Test</CardTitle>
          <CardDescription>
            Run a custom test with your own query
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customQuery">Test Query</Label>
            <Textarea
              id="customQuery"
              value={customQuery}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCustomQuery(e.target.value)}
              placeholder="Enter your test query here..."
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={runCustomTest}
              disabled={isRunning || !customQuery.trim()}
            >
              <Play className="h-4 w-4 mr-2" />
              Run Custom Test
            </Button>
            <Button
              variant="outline"
              onClick={generatePreview}
              disabled={testResults.length === 0}
            >
              <FileText className="h-4 w-4 mr-2" />
              Generate Preview
            </Button>
            <Button
              variant="outline"
              onClick={exportResults}
              disabled={testResults.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Detailed results from all test executions
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
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium capitalize">{result.testType} Test</p>
                          {result.courseName && (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-blue-100 text-blue-800"
                            >
                              {result.courseName}
                            </Badge>
                          )}
                        </div>
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

                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Query:</p>
                      <p className="text-sm text-gray-600">{result.query}</p>
                    </div>

                    {result.success ? (
                      <div>
                        <p className="text-sm font-medium text-gray-700">Response:</p>
                        <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {result.response.length > 200
                            ? `${result.response.substring(0, 200)}...`
                            : result.response
                          }
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-red-700">Error:</p>
                        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {result.error}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Tokens In:</span> {result.tokensInput || 0}
                      </div>
                      <div>
                        <span className="font-medium">Tokens Out:</span> {result.tokensOutput || 0}
                      </div>
                      <div>
                        <span className="font-medium">Cost:</span> ${(result.costEstimate || 0).toFixed(4)}
                      </div>
                      <div>
                        <span className="font-medium">Sources:</span> {result.sourcesCount || 0}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Comparison */}
      {chatResults.length > 0 && langgraphResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>System Comparison</CardTitle>
            <CardDescription>
              Performance comparison between Chat and LangGraph systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-blue-600 mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat System
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-medium">
                      {((chatResults.filter(r => r.success).length / chatResults.length) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response Time:</span>
                    <span className="font-medium">
                      {(chatResults.reduce((sum, r) => sum + r.executionTime, 0) / chatResults.length).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Tokens:</span>
                    <span className="font-medium">
                      {chatResults.reduce((sum, r) => sum + (r.tokensInput || 0) + (r.tokensOutput || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Cost:</span>
                    <span className="font-medium">
                      ${chatResults.reduce((sum, r) => sum + (r.costEstimate || 0), 0).toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-purple-600 mb-3 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  LangGraph System
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Success Rate:</span>
                    <span className="font-medium">
                      {((langgraphResults.filter(r => r.success).length / langgraphResults.length) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Response Time:</span>
                    <span className="font-medium">
                      {(langgraphResults.reduce((sum, r) => sum + r.executionTime, 0) / langgraphResults.length).toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Tokens:</span>
                    <span className="font-medium">
                      {langgraphResults.reduce((sum, r) => sum + (r.tokensInput || 0) + (r.tokensOutput || 0), 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Cost:</span>
                    <span className="font-medium">
                      ${langgraphResults.reduce((sum, r) => sum + (r.costEstimate || 0), 0).toFixed(4)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Result Preview Modal */}
      {showPreview && previewData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Test Results Preview</h2>
              <Button
                variant="outline"
                onClick={() => setShowPreview(false)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{previewData.summary.totalTests}</div>
                    <div className="text-sm text-gray-600">Total Tests</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{previewData.summary.successRate.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{previewData.summary.avgExecutionTime.toFixed(2)}s</div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-orange-600">${previewData.summary.totalCost.toFixed(4)}</div>
                    <div className="text-sm text-gray-600">Total Cost</div>
                  </CardContent>
                </Card>
              </div>

              {/* System Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
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
                      <span>Avg Response Time:</span>
                      <span className="font-medium">{previewData.performance.chat.avgTime.toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tokens:</span>
                      <span className="font-medium">{previewData.performance.chat.totalTokens}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <span className="font-medium">${previewData.performance.chat.totalCost.toFixed(4)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
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
                      <span>Avg Response Time:</span>
                      <span className="font-medium">{previewData.performance.langgraph.avgTime.toFixed(2)}s</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tokens:</span>
                      <span className="font-medium">{previewData.performance.langgraph.totalTokens}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Cost:</span>
                      <span className="font-medium">${previewData.performance.langgraph.totalCost.toFixed(4)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {previewData.results.map((result: any, index: number) => (
                      <div key={result.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {result.testType === 'chat' ? (
                              <MessageSquare className="h-5 w-5 text-blue-500" />
                            ) : (
                              <Brain className="h-5 w-5 text-purple-500" />
                            )}
                            <div>
                              <p className="font-medium capitalize">{result.testType} Test #{index + 1}</p>
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

                        <div className="space-y-2">
                          <div>
                            <p className="text-sm font-medium text-gray-700">Query:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                              {result.query}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-700">Response:</p>
                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                              {result.response}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Tokens In:</span> {result.tokensInput || 0}
                            </div>
                            <div>
                              <span className="font-medium">Tokens Out:</span> {result.tokensOutput || 0}
                            </div>
                            <div>
                              <span className="font-medium">Cost:</span> ${(result.costEstimate || 0).toFixed(4)}
                            </div>
                            <div>
                              <span className="font-medium">Error:</span> {result.error || 'None'}
                            </div>
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