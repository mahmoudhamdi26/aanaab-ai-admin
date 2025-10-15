"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SecurityConfig } from "@/types/config";

interface SecurityConfigPanelProps {
  config?: SecurityConfig;
  onUpdate: (config: SecurityConfig) => void;
}

export function SecurityConfigPanel({ config, onUpdate }: SecurityConfigPanelProps) {
  const [formData, setFormData] = useState<SecurityConfig>({
    jwtSecretKey: "",
    apiRateLimit: 100,
    railsApiKey: "",
    keycloakServerUrl: "http://localhost:8080",
    keycloakRealm: "aanaab",
    keycloakClientId: "aanaab-ai",
    keycloakVerifySignature: true,
    corsOrigins: ["http://localhost:3000", "http://localhost:8080"],
    corsMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    corsHeaders: ["*"],
    ...config,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (field: keyof SecurityConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: "corsOrigins" | "corsMethods" | "corsHeaders", value: string) => {
    const arrayValue = value.split(",").map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, [field]: arrayValue }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Security Configuration</CardTitle>
          <CardDescription>
            Configure security settings, authentication, and CORS policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Authentication</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jwtSecretKey">JWT Secret Key</Label>
                  <Input
                    id="jwtSecretKey"
                    type="password"
                    value={formData.jwtSecretKey}
                    onChange={(e) => handleChange("jwtSecretKey", e.target.value)}
                    placeholder="Enter JWT secret key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="railsApiKey">Rails API Key</Label>
                  <Input
                    id="railsApiKey"
                    type="password"
                    value={formData.railsApiKey}
                    onChange={(e) => handleChange("railsApiKey", e.target.value)}
                    placeholder="Enter Rails API key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit">API Rate Limit (requests per minute)</Label>
                  <Input
                    id="apiRateLimit"
                    type="number"
                    value={formData.apiRateLimit}
                    onChange={(e) => handleChange("apiRateLimit", parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Keycloak Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="keycloakServerUrl">Keycloak Server URL</Label>
                  <Input
                    id="keycloakServerUrl"
                    value={formData.keycloakServerUrl}
                    onChange={(e) => handleChange("keycloakServerUrl", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keycloakRealm">Keycloak Realm</Label>
                  <Input
                    id="keycloakRealm"
                    value={formData.keycloakRealm}
                    onChange={(e) => handleChange("keycloakRealm", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keycloakClientId">Keycloak Client ID</Label>
                  <Input
                    id="keycloakClientId"
                    value={formData.keycloakClientId}
                    onChange={(e) => handleChange("keycloakClientId", e.target.value)}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="keycloakVerifySignature"
                    checked={formData.keycloakVerifySignature}
                    onCheckedChange={(checked) => handleChange("keycloakVerifySignature", checked)}
                  />
                  <Label htmlFor="keycloakVerifySignature">Verify Signature</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">CORS Configuration</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="corsOrigins">Allowed Origins (comma-separated)</Label>
                  <Input
                    id="corsOrigins"
                    value={formData.corsOrigins.join(", ")}
                    onChange={(e) => handleArrayChange("corsOrigins", e.target.value)}
                    placeholder="http://localhost:3000, https://example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="corsMethods">Allowed Methods (comma-separated)</Label>
                  <Input
                    id="corsMethods"
                    value={formData.corsMethods.join(", ")}
                    onChange={(e) => handleArrayChange("corsMethods", e.target.value)}
                    placeholder="GET, POST, PUT, DELETE, OPTIONS"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="corsHeaders">Allowed Headers (comma-separated)</Label>
                  <Input
                    id="corsHeaders"
                    value={formData.corsHeaders.join(", ")}
                    onChange={(e) => handleArrayChange("corsHeaders", e.target.value)}
                    placeholder="Content-Type, Authorization, *"
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
