"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { EmbeddingProvider } from "@/types/config";
import { Plus, Trash2 } from "lucide-react";

interface EmbeddingConfigPanelProps {
  config?: EmbeddingProvider[];
  onUpdate: (config: EmbeddingProvider[]) => void;
}

export function EmbeddingConfigPanel({ config = [], onUpdate }: EmbeddingConfigPanelProps) {
  const [providers, setProviders] = useState<EmbeddingProvider[]>(config);

  const addProvider = () => {
    const newProvider: EmbeddingProvider = {
      id: `embedding_${Date.now()}`,
      name: "",
      enabled: false,
      model: "",
      dimensions: 1536,
    };
    setProviders([...providers, newProvider]);
  };

  const removeProvider = (id: string) => {
    setProviders(providers.filter(p => p.id !== id));
  };

  const updateProvider = (id: string, field: keyof EmbeddingProvider, value: any) => {
    setProviders(providers.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(providers);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Embedding Providers Configuration</CardTitle>
          <CardDescription>
            Configure embedding model providers for vector operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {providers.map((provider, index) => (
              <Card key={provider.id} className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium">
                    Provider {index + 1}
                  </h3>
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
                      placeholder="e.g., OpenAI Embeddings, Sentence Transformers"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`model-${provider.id}`}>Model</Label>
                    <Input
                      id={`model-${provider.id}`}
                      value={provider.model}
                      onChange={(e) => updateProvider(provider.id, "model", e.target.value)}
                      placeholder="e.g., text-embedding-ada-002"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`dimensions-${provider.id}`}>Dimensions</Label>
                    <Input
                      id={`dimensions-${provider.id}`}
                      type="number"
                      value={provider.dimensions || 1536}
                      onChange={(e) => updateProvider(provider.id, "dimensions", parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                  <Switch
                    id={`enabled-${provider.id}`}
                    checked={provider.enabled}
                    onCheckedChange={(checked) => updateProvider(provider.id, "enabled", checked)}
                  />
                  <Label htmlFor={`enabled-${provider.id}`}>Enable Provider</Label>
                </div>
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
