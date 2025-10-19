"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Upload,
  FileText,
  Calendar,
  Clock,
  DollarSign,
  Zap,
  CheckCircle,
  XCircle,
  BarChart3,
  Bot,
  Brain,
  TrendingUp,
  FileIcon,
  X,
  Download,
  Eye,
  AlertCircle
} from "lucide-react";

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

interface TestMetadata {
  exportDate: string;
  testingDate: string;
  totalTests?: number;
  successCount?: number;
  errorCount?: number;
  avgExecutionTime?: number;
  totalCost?: number;
  totalTokens?: number;
  config?: any;
  scenarios?: any[];
  results?: TestResult[];
}

interface TestData {
  metadata: TestMetadata;
  results: TestResult[];
}

interface TabData {
  id: string;
  name: string;
  data: TestData;
  file: File;
}

const getSourceDisplayName = (source: any) => {
  if (typeof source === 'string') {
    return source;
  }
  if (source && typeof source === 'object') {
    const sourceObj = source.source || source;
    return sourceObj?.id || sourceObj?.title || sourceObj?.name || 'Unknown source';
  }
  return source?.id || 'Unknown source';
};

const ResultCard = ({ result }: { result: TestResult }) => {
  const getStatusIcon = () => {
    switch (result.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`transition-all duration-200 ${result.status === 'completed' ? 'bg-white border-green-200' :
      result.status === 'error' ? 'bg-red-50 border-red-200' :
        result.status === 'running' ? 'bg-blue-50 border-blue-200' :
          'bg-gray-50 border-gray-200'
      }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {result.endpoint === 'langgraph' ? (
              <Brain className="h-4 w-4 text-purple-500" />
            ) : (
              <Bot className="h-4 w-4 text-blue-500" />
            )}
            <CardTitle className="text-sm font-medium">
              {result.endpoint === 'langgraph' ? 'LangGraph' : 'Unified'} Chat
            </CardTitle>
          </div>
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            <Badge variant="outline" className="text-xs">
              {result.status}
            </Badge>
          </div>
        </div>
        <div className="text-xs text-gray-500">
          {new Date(result.timestamp).toLocaleString()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Session ID */}
        {result.sessionId && (
          <div>
            <p className="text-xs font-medium text-gray-700 mb-1">Session ID:</p>
            <p className="text-xs font-mono text-gray-500 bg-gray-100 p-2 rounded">
              {result.sessionId}
            </p>
          </div>
        )}

        {/* Response Content */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-700">Response:</p>
          {result.status === 'completed' && result.response ? (
            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg max-h-40 overflow-y-auto whitespace-pre-wrap">
              {result.response}
            </div>
          ) : result.status === 'error' && result.error ? (
            <div className="text-sm text-red-700 bg-red-50 p-3 rounded-lg">
              <strong>Error:</strong> {result.error}
            </div>
          ) : (
            <div className="text-sm text-gray-500 italic">
              {result.status === 'running' ? 'Processing...' : 'Waiting to start...'}
            </div>
          )}
        </div>

        {/* Detailed Stats */}
        <div className="space-y-3">
          {/* Main Stats Row */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-medium text-gray-700">Tokens:</span>
              <div className="text-gray-600">
                {result.tokensInput || 0} → {result.tokensOutput || 0}
                {result.tokensInput && result.tokensOutput && (
                  <div className="text-gray-500">({(result.tokensInput + result.tokensOutput)} total)</div>
                )}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Cost:</span>
              <div className="text-gray-600">
                ${result.costEstimate ? result.costEstimate.toFixed(6) : '0.000000'}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Sources:</span>
              <div className="text-gray-600">{result.sourcesCount || 0}</div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Confidence:</span>
              <div className="text-gray-600">
                {result.confidenceScore ? (result.confidenceScore * 100).toFixed(1) : '0.0'}%
              </div>
            </div>
          </div>

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">
                Sources ({result.sources.length}):
              </p>
              <div className="space-y-1">
                {result.sources.slice(0, 3).map((source: any, idx) => (
                  <div key={idx} className="text-xs bg-blue-50 border border-blue-200 p-2 rounded">
                    <div className="font-medium text-blue-800">{getSourceDisplayName(source)}</div>
                    {source.score && (
                      <div className="text-blue-600">Score: {source.score.toFixed(3)}</div>
                    )}
                  </div>
                ))}
                {result.sources.length > 3 && (
                  <div className="text-xs text-gray-500">
                    ... and {result.sources.length - 3} more sources
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tools Used */}
          {result.toolsUsed && result.toolsUsed.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-2">
                Tools Used ({result.toolsUsed.length}):
              </p>
              <div className="flex flex-wrap gap-1">
                {result.toolsUsed.map((tool: string, idx) => {
                  const safeTool = typeof tool === 'string' ? tool : `Tool ${idx + 1}`;
                  return (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {safeTool}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Confidence Score Visual */}
          {result.confidenceScore && (
            <div>
              <p className="text-xs font-medium text-gray-700 mb-1">Confidence Score:</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${result.confidenceScore * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">
                  {(result.confidenceScore * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-2 text-xs">
          {result.executionTime && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {result.executionTime.toFixed(2)}s
            </Badge>
          )}
          {result.tokensInput && result.tokensOutput && (
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {(result.tokensInput + result.tokensOutput)} tokens
            </Badge>
          )}
          {result.costEstimate && (
            <Badge variant="outline" className="flex items-center gap-1">
              <DollarSign className="h-3 w-3" />
              ${result.costEstimate.toFixed(4)}
            </Badge>
          )}
          {result.sources && result.sources.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {result.sources.length} sources
            </Badge>
          )}
          {result.toolsUsed && result.toolsUsed.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              {result.toolsUsed.length} tools
            </Badge>
          )}
          {result.confidenceScore && (
            <Badge variant="outline" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              {(result.confidenceScore * 100).toFixed(1)}%
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MetadataCard = ({ metadata, results }: { metadata: TestMetadata; results: TestResult[] }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(1)}s`;
  };

  const getSuccessRate = () => {
    const total = metadata.totalTests || 0;
    const success = metadata.successCount || 0;
    return total > 0 ? (success / total) * 100 : 0;
  };

  const getAvgTokensPerTest = () => {
    const totalTokens = metadata.totalTokens || 0;
    const totalTests = metadata.totalTests || 0;
    return totalTests > 0 ? Math.round(totalTokens / totalTests) : 0;
  };

  const getAvgCostPerTest = () => {
    const totalCost = metadata.totalCost || 0;
    const totalTests = metadata.totalTests || 0;
    return totalTests > 0 ? totalCost / totalTests : 0;
  };

  // Calculate endpoint-specific stats
  const getEndpointStats = (endpoint: 'unified' | 'langgraph') => {
    const endpointResults = results.filter(r => r.endpoint === endpoint);
    const total = endpointResults.length;
    const success = endpointResults.filter(r => r.success).length;
    const avgTime = total > 0 ? endpointResults.reduce((sum, r) => sum + r.executionTime, 0) / total : 0;
    const totalCost = endpointResults.reduce((sum, r) => sum + (r.costEstimate || 0), 0);
    const totalTokens = endpointResults.reduce((sum, r) => sum + (r.tokensInput || 0) + (r.tokensOutput || 0), 0);

    return {
      total,
      success,
      successRate: total > 0 ? (success / total) * 100 : 0,
      avgTime,
      totalCost,
      totalTokens,
      avgCost: total > 0 ? totalCost / total : 0,
      avgTokens: total > 0 ? Math.round(totalTokens / total) : 0
    };
  };

  const unifiedStats = getEndpointStats('unified');
  const langgraphStats = getEndpointStats('langgraph');

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-blue-900">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Test Summary</h3>
            <p className="text-xs text-blue-700">
              {formatDate(metadata.testingDate)} • {metadata.totalTests || 0} tests
            </p>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-100 text-center">
            <div className="text-lg font-bold text-blue-900">{metadata.totalTests || 0}</div>
            <div className="text-xs text-blue-700">Total Tests</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-green-100 text-center">
            <div className="text-lg font-bold text-green-600">{getSuccessRate().toFixed(1)}%</div>
            <div className="text-xs text-green-700">Success Rate</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-purple-100 text-center">
            <div className="text-lg font-bold text-purple-600">{formatDuration(metadata.avgExecutionTime || 0)}</div>
            <div className="text-xs text-purple-700">Avg Time</div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-orange-100 text-center">
            <div className="text-lg font-bold text-orange-600">${(metadata.totalCost || 0).toFixed(4)}</div>
            <div className="text-xs text-orange-700">Total Cost</div>
          </div>
        </div>

        {/* Endpoint Comparison */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-4 border border-blue-100">
          <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Endpoint Performance Comparison
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Unified Chat Stats */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">Unified Chat (RAG)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="font-semibold text-blue-900">{unifiedStats.total}</div>
                  <div className="text-blue-700">Tests</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="font-semibold text-green-600">{unifiedStats.successRate.toFixed(1)}%</div>
                  <div className="text-green-700">Success</div>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="font-semibold text-purple-600">{formatDuration(unifiedStats.avgTime)}</div>
                  <div className="text-purple-700">Avg Time</div>
                </div>
                <div className="bg-orange-50 p-2 rounded">
                  <div className="font-semibold text-orange-600">${unifiedStats.avgCost.toFixed(6)}</div>
                  <div className="text-orange-700">Avg Cost</div>
                </div>
              </div>
              <div className="text-xs text-blue-600">
                {unifiedStats.totalTokens.toLocaleString()} tokens • {unifiedStats.avgTokens} avg/test
              </div>
            </div>

            {/* LangGraph Stats */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-900">LangGraph Chat</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-purple-50 p-2 rounded">
                  <div className="font-semibold text-purple-900">{langgraphStats.total}</div>
                  <div className="text-purple-700">Tests</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="font-semibold text-green-600">{langgraphStats.successRate.toFixed(1)}%</div>
                  <div className="text-green-700">Success</div>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="font-semibold text-purple-600">{formatDuration(langgraphStats.avgTime)}</div>
                  <div className="text-purple-700">Avg Time</div>
                </div>
                <div className="bg-orange-50 p-2 rounded">
                  <div className="font-semibold text-orange-600">${langgraphStats.avgCost.toFixed(6)}</div>
                  <div className="text-orange-700">Avg Cost</div>
                </div>
              </div>
              <div className="text-xs text-purple-600">
                {langgraphStats.totalTokens.toLocaleString()} tokens • {langgraphStats.avgTokens} avg/test
              </div>
            </div>
          </div>
        </div>

        {/* Success Rate Visualization */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-blue-800 font-medium">Overall Success Rate</span>
            <span className="font-semibold text-blue-900">{getSuccessRate().toFixed(1)}%</span>
          </div>
          <div className="relative">
            <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${getSuccessRate()}%` }}
              />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-medium text-white drop-shadow-sm">
                {getSuccessRate().toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="bg-white/40 backdrop-blur-sm rounded-lg p-2 border border-blue-100">
          <div className="flex items-center justify-between text-xs text-blue-700">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {metadata.successCount || 0} passed
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="h-3 w-3 text-red-500" />
                {metadata.errorCount || 0} failed
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3 text-blue-500" />
                {(metadata.totalTokens || 0).toLocaleString()} tokens
              </span>
            </div>
            <div className="text-blue-600">
              {formatDate(metadata.exportDate)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ResultsPreviewPage() {
  const [tabs, setTabs] = useState<TabData[]>([]);
  const [activeTab, setActiveTab] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      try {
        const content = await file.text();
        const data: TestData = JSON.parse(content);

        const tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const tabName = file.name.replace('.json', '');

        const newTab: TabData = {
          id: tabId,
          name: tabName,
          data,
          file
        };

        setTabs(prev => [...prev, newTab]);
        setActiveTab(tabId);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert(`Error parsing file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const closeTab = (tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      if (activeTab === tabId && newTabs.length > 0) {
        setActiveTab(newTabs[newTabs.length - 1].id);
      } else if (newTabs.length === 0) {
        setActiveTab("");
      }
      return newTabs;
    });
  };

  const downloadTab = (tab: TabData) => {
    const dataStr = JSON.stringify(tab.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = tab.file.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Group results by question for the current active tab
  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const groupedResults = activeTabData ? activeTabData.data.results.reduce((acc, result) => {
    const key = `${result.query}-${result.courseId}`;
    if (!acc[key]) {
      acc[key] = {
        query: result.query,
        courseId: result.courseId,
        courseName: result.courseName,
        category: result.category,
        complexity: result.complexity,
        results: []
      };
    }
    acc[key].results.push(result);
    return acc;
  }, {} as Record<string, {
    query: string;
    courseId: string;
    courseName: string;
    category: string;
    complexity: 'low' | 'medium' | 'high';
    results: TestResult[];
  }>) : {};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Test Results Preview</h1>
            <p className="text-gray-600 mt-2">
              Upload and compare multiple test result files
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Results
            </Button>
          </div>
        </div>

        {tabs.length === 0 ? (
          /* Empty State */
          <Card className="text-center py-12">
            <CardContent>
              <FileIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Loaded</h3>
              <p className="text-gray-600 mb-6">
                Upload test result JSON files to start comparing results
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Choose Files
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Tabs Interface */
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-2 justify-between group relative"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{tab.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadTab(tab);
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded hover:bg-gray-200 cursor-pointer"
                      title="Download file"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          downloadTab(tab);
                        }
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.id);
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded hover:bg-gray-200 cursor-pointer"
                      title="Close tab"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          closeTab(tab.id);
                        }
                      }}
                    >
                      <X className="h-3 w-3" />
                    </div>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="space-y-6">
                {/* Metadata Summary */}
                <MetadataCard metadata={tab.data.metadata} results={tab.data.results} />

                {/* Results Grid */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Test Results Grid</h3>
                      <p className="text-sm text-gray-600">
                        {Object.keys(groupedResults).length} questions tested across both endpoints
                      </p>
                    </div>
                  </div>

                  {/* Results Grid */}
                  <div className="space-y-6">
                    {Object.entries(groupedResults).map(([key, group]) => (
                      <div key={key} className="space-y-3">
                        {/* Question Header */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-2">{group.query}</h4>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span>{group.courseName}</span>
                                <span>•</span>
                                <span>{group.category}</span>
                                <Badge className={`text-xs ${group.complexity === 'low' ? 'bg-green-100 text-green-800' :
                                  group.complexity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                  {group.complexity}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {group.results.length} endpoint{group.results.length > 1 ? 's' : ''}
                            </div>
                          </div>
                        </div>

                        {/* Results Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {group.results.map((result) => (
                            <ResultCard key={`${result.id}-${result.endpoint}`} result={result} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </div>
  );
}
