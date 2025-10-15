"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Server, Database, Cpu, Zap, Activity, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export function StatusPage() {
  // Mock data for demonstration
  const systemMetrics = {
    uptime: "15 days, 3 hours",
    cpuUsage: 45,
    memoryUsage: 68,
    diskUsage: 32,
    networkLatency: 12
  };

  const services = [
    { name: "API Server", status: "healthy", uptime: "99.9%", responseTime: "45ms" },
    { name: "Database", status: "healthy", uptime: "99.8%", responseTime: "12ms" },
    { name: "Redis Cache", status: "healthy", uptime: "99.9%", responseTime: "2ms" },
    { name: "LLM Service", status: "degraded", uptime: "98.5%", responseTime: "1.2s" },
    { name: "Embedding Service", status: "healthy", uptime: "99.7%", responseTime: "180ms" },
    { name: "LiveKit", status: "healthy", uptime: "99.9%", responseTime: "25ms" }
  ];

  const recentAlerts = [
    { id: 1, type: "warning", message: "LLM service response time increased", timestamp: "2 minutes ago" },
    { id: 2, type: "info", message: "Database backup completed successfully", timestamp: "1 hour ago" },
    { id: 3, type: "success", message: "System health check passed", timestamp: "3 hours ago" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "down":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "degraded":
        return "bg-yellow-100 text-yellow-800";
      case "down":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#4A2C8C] to-[#7B61E0] rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <BarChart3 className="h-8 w-8" />
              System Status
            </h2>
            <p className="text-white/90 text-lg">Real-time monitoring and health metrics</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">99.7%</div>
            <div className="text-white/80">Overall Uptime</div>
          </div>
        </div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#1a1a1a]">CPU Usage</CardTitle>
              <Cpu className="h-5 w-5 text-[#7B61E0]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#7B61E0] mb-2">{systemMetrics.cpuUsage}%</div>
            <Progress value={systemMetrics.cpuUsage} className="h-2" />
            <p className="text-sm text-[#6b7280] mt-2">Current load</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#1a1a1a]">Memory Usage</CardTitle>
              <Server className="h-5 w-5 text-[#4A2C8C]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#4A2C8C] mb-2">{systemMetrics.memoryUsage}%</div>
            <Progress value={systemMetrics.memoryUsage} className="h-2" />
            <p className="text-sm text-[#6b7280] mt-2">RAM utilization</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#1a1a1a]">Disk Usage</CardTitle>
              <Database className="h-5 w-5 text-[#32C896]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#32C896] mb-2">{systemMetrics.diskUsage}%</div>
            <Progress value={systemMetrics.diskUsage} className="h-2" />
            <p className="text-sm text-[#6b7280] mt-2">Storage capacity</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-[#1a1a1a]">Network</CardTitle>
              <Activity className="h-5 w-5 text-[#F59E0B]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-[#F59E0B] mb-2">{systemMetrics.networkLatency}ms</div>
            <p className="text-sm text-[#6b7280]">Average latency</p>
          </CardContent>
        </Card>
      </div>

      {/* Services Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#1a1a1a] flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#7B61E0]" />
              Services Status
            </CardTitle>
            <CardDescription>Real-time status of all system services</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <div className="font-medium text-[#1a1a1a]">{service.name}</div>
                    <div className="text-sm text-[#6b7280]">Uptime: {service.uptime}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                  <div className="text-sm text-[#6b7280] mt-1">
                    {service.responseTime}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#1a1a1a] flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[#F59E0B]" />
              Recent Alerts
            </CardTitle>
            <CardDescription>Latest system notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="mt-1">
                  {alert.type === "warning" && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                  {alert.type === "info" && <Activity className="h-4 w-4 text-blue-500" />}
                  {alert.type === "success" && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[#1a1a1a]">{alert.message}</div>
                  <div className="text-sm text-[#6b7280]">{alert.timestamp}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* System Uptime */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#1a1a1a] flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#7B61E0]" />
            System Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#7B61E0]">{systemMetrics.uptime}</div>
              <div className="text-sm text-[#6b7280]">System Uptime</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#4A2C8C]">v2.1.4</div>
              <div className="text-sm text-[#6b7280]">Current Version</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-[#32C896]">24/7</div>
              <div className="text-sm text-[#6b7280]">Monitoring</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
