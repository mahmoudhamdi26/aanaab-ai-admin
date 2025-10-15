"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Download, Filter, RefreshCw, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";

export function LoggingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedService, setSelectedService] = useState("all");

  // Mock log data
  const logs = [
    {
      id: 1,
      timestamp: "2024-01-15 14:30:25",
      level: "error",
      service: "api-server",
      message: "Database connection failed: timeout after 30s",
      details: "Connection to PostgreSQL database timed out. Retrying in 5 seconds...",
      traceId: "trace-12345"
    },
    {
      id: 2,
      timestamp: "2024-01-15 14:30:20",
      level: "warning",
      service: "llm-service",
      message: "High response time detected",
      details: "LLM API response time exceeded 5 seconds. Current: 7.2s",
      traceId: "trace-12346"
    },
    {
      id: 3,
      timestamp: "2024-01-15 14:30:15",
      level: "info",
      service: "sync-process",
      message: "Sync job completed successfully",
      details: "Processed 150 documents in 2.3 minutes",
      traceId: "trace-12347"
    },
    {
      id: 4,
      timestamp: "2024-01-15 14:30:10",
      level: "debug",
      service: "embedding-service",
      message: "Vector embedding generated",
      details: "Generated 1536-dimensional vector for document ID: doc-789",
      traceId: "trace-12348"
    },
    {
      id: 5,
      timestamp: "2024-01-15 14:30:05",
      level: "error",
      service: "livekit",
      message: "Room creation failed",
      details: "Failed to create LiveKit room: insufficient permissions",
      traceId: "trace-12349"
    },
    {
      id: 6,
      timestamp: "2024-01-15 14:30:00",
      level: "info",
      service: "auth-service",
      message: "User authentication successful",
      details: "User admin@aanaab.ai authenticated via JWT",
      traceId: "trace-12350"
    }
  ];

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      case "debug":
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      case "debug":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "all" || log.level === selectedLevel;
    const matchesService = selectedService === "all" || log.service === selectedService;

    return matchesSearch && matchesLevel && matchesService;
  });

  const logStats = {
    total: logs.length,
    errors: logs.filter(log => log.level === "error").length,
    warnings: logs.filter(log => log.level === "warning").length,
    info: logs.filter(log => log.level === "info").length
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4A2C8C] to-[#7B61E0] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <FileText className="h-8 w-8" />
              System Logs
            </h2>
            <p className="text-white/90 text-lg">Monitor and analyze system activity</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{logStats.total}</div>
            <div className="text-white/80">Total Logs</div>
          </div>
        </div>
      </div>

      {/* Log Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#1a1a1a]">Total Logs</CardTitle>
              <FileText className="h-5 w-5 text-[#7B61E0]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#7B61E0] mb-1">{logStats.total}</div>
            <p className="text-sm text-[#6b7280]">All log entries</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#1a1a1a]">Errors</CardTitle>
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500 mb-1">{logStats.errors}</div>
            <p className="text-sm text-[#6b7280]">Error logs</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#1a1a1a]">Warnings</CardTitle>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500 mb-1">{logStats.warnings}</div>
            <p className="text-sm text-[#6b7280]">Warning logs</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#1a1a1a]">Info</CardTitle>
              <Info className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500 mb-1">{logStats.info}</div>
            <p className="text-sm text-[#6b7280]">Info logs</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#1a1a1a] flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#7B61E0]" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1a1a1a]">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#6b7280]" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1a1a1a]">Log Level</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1a1a1a]">Service</label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="api-server">API Server</SelectItem>
                  <SelectItem value="llm-service">LLM Service</SelectItem>
                  <SelectItem value="sync-process">Sync Process</SelectItem>
                  <SelectItem value="embedding-service">Embedding Service</SelectItem>
                  <SelectItem value="livekit">LiveKit</SelectItem>
                  <SelectItem value="auth-service">Auth Service</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#1a1a1a]">Actions</label>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Entries */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#1a1a1a]">
            Log Entries ({filteredLogs.length})
          </CardTitle>
          <CardDescription>Real-time system logs with filtering and search</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border border-[#e5e7eb] rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getLevelIcon(log.level)}
                    <Badge className={getLevelColor(log.level)}>
                      {log.level.toUpperCase()}
                    </Badge>
                    <span className="text-sm text-[#6b7280]">{log.timestamp}</span>
                    <Badge variant="outline">{log.service}</Badge>
                  </div>
                  <span className="text-xs text-[#6b7280] font-mono">{log.traceId}</span>
                </div>

                <div className="mb-2">
                  <div className="font-medium text-[#1a1a1a] mb-1">{log.message}</div>
                  <div className="text-sm text-[#6b7280]">{log.details}</div>
                </div>
              </div>
            ))}

            {filteredLogs.length === 0 && (
              <div className="text-center py-8 text-[#6b7280]">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No logs found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
