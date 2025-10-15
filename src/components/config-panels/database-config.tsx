"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatabaseConfig } from "@/types/config";

interface DatabaseConfigPanelProps {
  config?: DatabaseConfig;
  onUpdate: (config: DatabaseConfig) => void;
}

export function DatabaseConfigPanel({ config, onUpdate }: DatabaseConfigPanelProps) {
  const [formData, setFormData] = useState<DatabaseConfig>({
    aiDbHost: "localhost",
    aiDbPort: 5433,
    aiDbName: "aanaab_ai",
    aiDbUser: "ai_service",
    aiDbPassword: "",
    aiDbSslMode: "disable",
    lmsBaseUrl: "http://localhost:3000",
    lmsApiKey: "",
    ...config,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (field: keyof DatabaseConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Configuration</CardTitle>
          <CardDescription>
            Configure database connections for AI service and LMS integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">AI Database</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aiDbHost">Host</Label>
                  <Input
                    id="aiDbHost"
                    value={formData.aiDbHost}
                    onChange={(e) => handleChange("aiDbHost", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiDbPort">Port</Label>
                  <Input
                    id="aiDbPort"
                    type="number"
                    value={formData.aiDbPort}
                    onChange={(e) => handleChange("aiDbPort", parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiDbName">Database Name</Label>
                  <Input
                    id="aiDbName"
                    value={formData.aiDbName}
                    onChange={(e) => handleChange("aiDbName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiDbUser">Username</Label>
                  <Input
                    id="aiDbUser"
                    value={formData.aiDbUser}
                    onChange={(e) => handleChange("aiDbUser", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiDbPassword">Password</Label>
                  <Input
                    id="aiDbPassword"
                    type="password"
                    value={formData.aiDbPassword}
                    onChange={(e) => handleChange("aiDbPassword", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiDbSslMode">SSL Mode</Label>
                  <select
                    id="aiDbSslMode"
                    value={formData.aiDbSslMode}
                    onChange={(e) => handleChange("aiDbSslMode", e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="disable">Disable</option>
                    <option value="require">Require</option>
                    <option value="verify-ca">Verify CA</option>
                    <option value="verify-full">Verify Full</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">LMS Integration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lmsBaseUrl">LMS Base URL</Label>
                  <Input
                    id="lmsBaseUrl"
                    value={formData.lmsBaseUrl}
                    onChange={(e) => handleChange("lmsBaseUrl", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lmsApiKey">LMS API Key (Optional)</Label>
                  <Input
                    id="lmsApiKey"
                    type="password"
                    value={formData.lmsApiKey || ""}
                    onChange={(e) => handleChange("lmsApiKey", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button type="submit">Save Configuration</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
