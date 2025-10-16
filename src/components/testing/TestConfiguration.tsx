"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Settings } from "lucide-react";

// Server configuration options
const SERVER_OPTIONS = [
  {
    id: "localhost",
    name: "Local Development",
    baseUrl: "http://localhost:8000",
    description: "Local development server"
  },
  {
    id: "online_testing",
    name: "Online Testing Server",
    baseUrl: "https://ai-testing.aanaab.net",
    description: "Online testing platform"
  },
  {
    id: "production",
    name: "Production Server",
    baseUrl: "https://ai.aanaab.net",
    description: "Production environment"
  },
  {
    id: "custom",
    name: "Custom Server",
    baseUrl: "",
    description: "Enter custom server URL"
  }
];

export interface TestConfig {
  bearerToken: string;
  baseUrl: string;
  serverType: string;
  modelProvider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  courseIds: string[];
}

interface TestConfigurationProps {
  config: TestConfig;
  onConfigChange: (config: TestConfig) => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

const getDefaultModelForProvider = (provider: string) => {
  switch (provider) {
    case "openai": return "gpt-4o-mini";
    case "gemini": return "gemini-1.5-flash";
    case "anthropic": return "claude-3-haiku-20240307";
    default: return "gpt-4o-mini";
  }
};

const getModelsForProvider = (provider: string) => {
  switch (provider) {
    case "openai":
      return [
        { value: "gpt-4o", label: "GPT-4o" },
        { value: "gpt-4o-mini", label: "GPT-4o Mini" },
        { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
        { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" }
      ];
    case "gemini":
      return [
        { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
        { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
        { value: "gemini-pro", label: "Gemini Pro" }
      ];
    case "anthropic":
      return [
        { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
        { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet" },
        { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku" }
      ];
    default:
      return [];
  }
};

const getModelHint = (provider: string, model: string) => {
  const hints: Record<string, Record<string, string>> = {
    openai: {
      "gpt-4o": "Most capable model, best for complex tasks",
      "gpt-4o-mini": "Fast and cost-effective, good for most tasks",
      "gpt-4-turbo": "Balanced performance and speed",
      "gpt-3.5-turbo": "Fast and economical for simple tasks"
    },
    gemini: {
      "gemini-1.5-pro": "Most capable Gemini model",
      "gemini-1.5-flash": "Fast and efficient",
      "gemini-pro": "Standard Gemini model"
    },
    anthropic: {
      "claude-3-opus-20240229": "Most capable Claude model",
      "claude-3-sonnet-20240229": "Balanced performance",
      "claude-3-haiku-20240307": "Fast and cost-effective"
    }
  };
  return hints[provider]?.[model] || "";
};

export function TestConfiguration({ config, onConfigChange, isVisible, onToggleVisibility }: TestConfigurationProps) {
  const updateConfig = (updates: Partial<TestConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  if (!isVisible) {
    return (
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={onToggleVisibility}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Show Configuration
        </Button>
      </div>
    );
  }

  return (
    <Card className="bg-white border border-gray-200">
      <CardHeader>
        <CardTitle className="text-gray-900">Test Configuration</CardTitle>
        <CardDescription className="text-gray-600">
          Configure API endpoints, authentication, and test parameters for testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Server Configuration Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Testing Mode</h4>
              <p className="text-sm text-blue-700 mt-1">
                Using real testing token with configured API endpoint. The system will make live API calls to the selected backend.
                Set a valid token to test against real API endpoints.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="serverType">Server Type</Label>
            <Select
              value={config.serverType}
              onValueChange={(value) => {
                const selectedServer = SERVER_OPTIONS.find(s => s.id === value);
                updateConfig({
                  serverType: value,
                  baseUrl: selectedServer?.baseUrl || config.baseUrl
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVER_OPTIONS.map((server) => (
                  <SelectItem key={server.id} value={server.id}>
                    <div>
                      <div className="font-medium">{server.name}</div>
                      <div className="text-xs text-gray-500">{server.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Select a predefined server or choose custom
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input
              id="baseUrl"
              value={config.baseUrl}
              onChange={(e) => updateConfig({ baseUrl: e.target.value })}
              placeholder="http://localhost:8000"
              disabled={config.serverType !== 'custom'}
              className="bg-white border-gray-300"
            />
            <p className="text-xs text-gray-500">
              {config.serverType === 'custom' ? 'Enter custom server URL' : 'Automatically set based on server type'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="modelProvider">Model Provider</Label>
            <Select
              value={config.modelProvider}
              onValueChange={(value) => {
                const defaultModel = getDefaultModelForProvider(value);
                updateConfig({
                  modelProvider: value,
                  model: defaultModel
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
                <SelectItem value="anthropic">Anthropic Claude</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select
              value={config.model}
              onValueChange={(value) => updateConfig({ model: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getModelsForProvider(config.modelProvider).map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {config.model && (
              <p className="text-xs text-gray-500">
                {getModelHint(config.modelProvider, config.model)}
              </p>
            )}
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
              onChange={(e) => updateConfig({ temperature: parseFloat(e.target.value) })}
              className="bg-white border-gray-300"
            />
            <p className="text-xs text-gray-500">
              Controls randomness (0.0 = deterministic, 2.0 = very random)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxTokens">Max Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              min="1"
              max="4096"
              value={config.maxTokens}
              onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) })}
              className="bg-white border-gray-300"
            />
            <p className="text-xs text-gray-500">
              Maximum number of tokens to generate
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bearerToken">Bearer Token</Label>
          <Textarea
            id="bearerToken"
            value={config.bearerToken}
            onChange={(e) => updateConfig({ bearerToken: e.target.value })}
            rows={3}
            placeholder="Enter your bearer token here"
            className="bg-white border-gray-300"
          />
          <p className="text-xs text-gray-500">
            Using real testing token by default. Replace with your own token if needed.
          </p>
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onToggleVisibility}>
            Hide Configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
