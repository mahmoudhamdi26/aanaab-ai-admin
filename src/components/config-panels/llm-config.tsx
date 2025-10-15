"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { LLMProvider } from "@/types/config";
import { Plus, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import { LLMProviderManager } from "@/lib/llm-provider-manager";

interface LLMConfigPanelProps {
  config?: LLMProvider[];
  onUpdate: (config: LLMProvider[]) => void;
}

export function LLMConfigPanel({ config = [], onUpdate }: LLMConfigPanelProps) {
  const [providers, setProviders] = useState<LLMProvider[]>(config);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const addProvider = () => {
    const newProvider: LLMProvider = {
      id: `provider_${Date.now()}`,
      name: "",
      enabled: false,
      priority: providers.length + 1,
      apiKey: "",
      model: "",
      maxTokens: 4096,
      temperature: 0.7,
      timeout: 30,
      retryAttempts: 2,
      fallbackEnabled: true,
    };
    setProviders([...providers, newProvider]);
  };

  const removeProvider = (id: string) => {
    setProviders(providers.filter(p => p.id !== id));
  };

  const updateProvider = (id: string, field: keyof LLMProvider, value: any) => {
    setProviders(providers.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const sortProvidersByPriority = () => {
    setProviders([...providers].sort((a, b) => a.priority - b.priority));
  };

  const validateProviders = () => {
    const manager = new LLMProviderManager(providers);
    const errors: Record<string, string[]> = {};

    providers.forEach(provider => {
      const providerErrors = manager.validateProvider(provider);
      if (providerErrors.length > 0) {
        errors[provider.id] = providerErrors;
      }
    });

    const duplicatePriorities = manager.getDuplicatePriorities();
    if (duplicatePriorities.length > 0) {
      providers.forEach(provider => {
        if (duplicatePriorities.includes(provider.priority)) {
          if (!errors[provider.id]) errors[provider.id] = [];
          errors[provider.id].push(`Priority ${provider.priority} is used by multiple providers`);
        }
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateProviders()) {
      onUpdate(providers);
    } else {
      console.error('Validation failed:', validationErrors);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>LLM Providers Configuration</CardTitle>
              <CardDescription>
                Configure multiple providers with priority and fallback support
              </CardDescription>
            </div>
            <Button type="button" onClick={sortProvidersByPriority} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sort by Priority
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Provider Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total:</span>
                <span className="ml-2 font-medium">{providers.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Enabled:</span>
                <span className="ml-2 font-medium text-green-600">
                  {providers.filter(p => p.enabled).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Fallback:</span>
                <span className="ml-2 font-medium text-blue-600">
                  {providers.filter(p => p.enabled && p.fallbackEnabled).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Primary:</span>
                <span className="ml-2 font-medium">
                  {providers.find(p => p.enabled)?.name || 'None'}
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {providers.map((provider, index) => (
              <Card key={provider.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium">
                      {provider.name || `Provider ${index + 1}`}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant={provider.enabled ? "default" : "secondary"}>
                        Priority {provider.priority}
                      </Badge>
                      {provider.fallbackEnabled && (
                        <Badge variant="outline">Fallback</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeProvider(provider.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${provider.id}`}>Provider Name</Label>
                    <Input
                      id={`name-${provider.id}`}
                      value={provider.name}
                      onChange={(e) => updateProvider(provider.id, "name", e.target.value)}
                      placeholder="e.g., OpenAI, Gemini"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`priority-${provider.id}`}>Priority (1 = Primary)</Label>
                    <Input
                      id={`priority-${provider.id}`}
                      type="number"
                      min="1"
                      value={provider.priority}
                      onChange={(e) => updateProvider(provider.id, "priority", parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`model-${provider.id}`}>Model</Label>
                    <Input
                      id={`model-${provider.id}`}
                      value={provider.model}
                      onChange={(e) => updateProvider(provider.id, "model", e.target.value)}
                      placeholder="e.g., gpt-4, gemini-pro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`apiKey-${provider.id}`}>API Key</Label>
                    <Input
                      id={`apiKey-${provider.id}`}
                      type="password"
                      value={provider.apiKey}
                      onChange={(e) => updateProvider(provider.id, "apiKey", e.target.value)}
                      placeholder="Enter API key"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`maxTokens-${provider.id}`}>Max Tokens</Label>
                    <Input
                      id={`maxTokens-${provider.id}`}
                      type="number"
                      value={provider.maxTokens}
                      onChange={(e) => updateProvider(provider.id, "maxTokens", parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`temperature-${provider.id}`}>Temperature</Label>
                    <Input
                      id={`temperature-${provider.id}`}
                      type="number"
                      step="0.1"
                      min="0"
                      max="2"
                      value={provider.temperature}
                      onChange={(e) => updateProvider(provider.id, "temperature", parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`timeout-${provider.id}`}>Timeout (seconds)</Label>
                    <Input
                      id={`timeout-${provider.id}`}
                      type="number"
                      min="5"
                      max="300"
                      value={provider.timeout}
                      onChange={(e) => updateProvider(provider.id, "timeout", parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`retryAttempts-${provider.id}`}>Retry Attempts</Label>
                    <Input
                      id={`retryAttempts-${provider.id}`}
                      type="number"
                      min="0"
                      max="5"
                      value={provider.retryAttempts}
                      onChange={(e) => updateProvider(provider.id, "retryAttempts", parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`enabled-${provider.id}`}
                      checked={provider.enabled}
                      onCheckedChange={(checked) => updateProvider(provider.id, "enabled", checked)}
                    />
                    <Label htmlFor={`enabled-${provider.id}`}>Enable Provider</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`fallback-${provider.id}`}
                      checked={provider.fallbackEnabled}
                      onCheckedChange={(checked) => updateProvider(provider.id, "fallbackEnabled", checked)}
                    />
                    <Label htmlFor={`fallback-${provider.id}`}>Enable as Fallback</Label>
                  </div>
                </div>

                {validationErrors[provider.id] && validationErrors[provider.id].length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex items-start">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 mr-2" />
                      <div className="text-sm text-red-700">
                        <div className="font-medium mb-1">Configuration Errors:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {validationErrors[provider.id].map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

              </Card>
            ))}

            <Button type="button" onClick={addProvider} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>

            <Button type="submit">Save Configuration</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
