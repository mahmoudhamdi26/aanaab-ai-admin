"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SystemConfig } from "@/types/config";

interface SystemConfigPanelProps {
  config?: SystemConfig;
  onUpdate: (config: SystemConfig) => void;
}

export function SystemConfigPanel({ config, onUpdate }: SystemConfigPanelProps) {
  const [formData, setFormData] = useState<SystemConfig>({
    environment: "development",
    debug: true,
    logLevel: "INFO",
    apiHost: "0.0.0.0",
    apiPort: 8000,
    apiSecretKey: "",
    apiTitle: "Aanaab AI Microservice",
    apiVersion: "0.1.0",
    ...config,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (field: keyof SystemConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
          <CardDescription>
            Configure basic system settings and environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="environment">Environment</Label>
                <select
                  id="environment"
                  value={formData.environment}
                  onChange={(e) => handleChange("environment", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="development">Development</option>
                  <option value="production">Production</option>
                  <option value="testing">Testing</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logLevel">Log Level</Label>
                <select
                  id="logLevel"
                  value={formData.logLevel}
                  onChange={(e) => handleChange("logLevel", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="DEBUG">DEBUG</option>
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="ERROR">ERROR</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiHost">API Host</Label>
                <Input
                  id="apiHost"
                  value={formData.apiHost}
                  onChange={(e) => handleChange("apiHost", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiPort">API Port</Label>
                <Input
                  id="apiPort"
                  type="number"
                  value={formData.apiPort}
                  onChange={(e) => handleChange("apiPort", parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiTitle">API Title</Label>
                <Input
                  id="apiTitle"
                  value={formData.apiTitle}
                  onChange={(e) => handleChange("apiTitle", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiVersion">API Version</Label>
                <Input
                  id="apiVersion"
                  value={formData.apiVersion}
                  onChange={(e) => handleChange("apiVersion", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiSecretKey">API Secret Key</Label>
              <Input
                id="apiSecretKey"
                type="password"
                value={formData.apiSecretKey}
                onChange={(e) => handleChange("apiSecretKey", e.target.value)}
                placeholder="Enter API secret key"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="debug"
                checked={formData.debug}
                onCheckedChange={(checked) => handleChange("debug", checked)}
              />
              <Label htmlFor="debug">Enable Debug Mode</Label>
            </div>

            <Button type="submit">Save Configuration</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
