"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bot,
  Brain,
  Clock,
  DollarSign,
  FileText,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  TrendingUp,
  Users
} from "lucide-react";

interface TestResult {
  id: string;
  query: string;
  courseId: string;
  courseName: string;
  category: string;
  complexity: 'low' | 'medium' | 'high';
  endpoint: 'unified' | 'langgraph';
  response?: string;
  error?: string;
  processingTime?: string;
  tokens?: number;
  cost?: number;
  sources?: any[];
  toolsUsed?: string[];
  confidence?: number;
  timestamp: string;
  status: 'pending' | 'running' | 'completed' | 'error';
}

interface GridResultsProps {
  results: TestResult[];
  isRunning: boolean;
  onExportResults: () => void;
}

const LoadingPlaceholder = ({ query, endpoint }: { query: string; endpoint: 'unified' | 'langgraph' }) => (
  <Card className="bg-gray-50 border-gray-200 animate-pulse">
    <CardHeader className="pb-3">
      <div className="flex items-center gap-2">
        {endpoint === 'langgraph' ? (
          <Brain className="h-4 w-4 text-purple-500" />
        ) : (
          <Bot className="h-4 w-4 text-blue-500" />
        )}
        <CardTitle className="text-sm font-medium">
          {endpoint === 'langgraph' ? 'LangGraph' : 'Unified'} Chat
        </CardTitle>
        <Badge variant="outline" className="text-xs">
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          Processing
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="flex gap-2">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    </CardContent>
  </Card>
);

const ResultCard = ({ result }: { result: TestResult }) => {
  const getStatusIcon = () => {
    switch (result.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
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

export function GridResults({ results, isRunning, onExportResults }: GridResultsProps) {
  // Group results by question
  const groupedResults = results.reduce((acc, result) => {
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
  }>);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Test Results Grid</h3>
          <p className="text-sm text-gray-600">
            {Object.keys(groupedResults).length} questions tested across both endpoints
          </p>
        </div>
        <Button onClick={onExportResults} variant="outline" size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Export Results
        </Button>
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
                    <Badge className={`text-xs ${getComplexityColor(group.complexity)}`}>
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

              {/* Show placeholders for missing endpoints */}
              {group.results.length < 2 && (
                <>
                  {!group.results.some(r => r.endpoint === 'unified') && (
                    <LoadingPlaceholder query={group.query} endpoint="unified" />
                  )}
                  {!group.results.some(r => r.endpoint === 'langgraph') && (
                    <LoadingPlaceholder query={group.query} endpoint="langgraph" />
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      {results.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-900">
                  {results.filter(r => r.status === 'completed').length}
                </div>
                <div className="text-blue-700">Completed</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-900">
                  {results.filter(r => r.status === 'running').length}
                </div>
                <div className="text-blue-700">Running</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-900">
                  {results.filter(r => r.status === 'error').length}
                </div>
                <div className="text-blue-700">Errors</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-blue-900">
                  ${results.reduce((sum, r) => sum + (r.cost || 0), 0).toFixed(4)}
                </div>
                <div className="text-blue-700">Total Cost</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
