"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RAGSystem } from "@/types/config";

interface RAGConfigPanelProps {
  config?: RAGSystem[];
  onUpdate: (config: RAGSystem[]) => void;
}

export function RAGConfigPanel({ config = [], onUpdate }: RAGConfigPanelProps) {
  const [systems, setSystems] = useState<RAGSystem[]>(config.length > 0 ? config : [
    {
      id: "normal",
      name: "Normal RAG",
      enabled: true,
      config: {
        chunkSize: 512,
        chunkOverlap: 50,
        maxChunksPerDocument: 1000,
        qualityReviewThreshold: 0.70,
        highPriorityThreshold: 0.50,
        autoEnhanceThreshold: 0.90,
      },
    },
    {
      id: "langgraph",
      name: "LangGraph RAG",
      enabled: false,
      config: {
        chunkSize: 512,
        chunkOverlap: 50,
        maxChunksPerDocument: 1000,
        qualityReviewThreshold: 0.70,
        highPriorityThreshold: 0.50,
        autoEnhanceThreshold: 0.90,
      },
    },
  ]);

  const updateSystem = (id: string, field: keyof RAGSystem, value: any) => {
    setSystems(systems.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const updateSystemConfig = (id: string, field: keyof RAGSystem["config"], value: any) => {
    setSystems(systems.map(s =>
      s.id === id ? {
        ...s,
        config: { ...s.config, [field]: value }
      } : s
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(systems);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>RAG Systems Configuration</CardTitle>
          <CardDescription>
            Configure Retrieval-Augmented Generation systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {systems.map((system) => (
              <Card key={system.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">{system.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`enabled-${system.id}`}
                      checked={system.enabled}
                      onCheckedChange={(checked) => updateSystem(system.id, "enabled", checked)}
                    />
                    <Label htmlFor={`enabled-${system.id}`}>Enable</Label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`chunkSize-${system.id}`}>Chunk Size</Label>
                    <Input
                      id={`chunkSize-${system.id}`}
                      type="number"
                      value={system.config.chunkSize}
                      onChange={(e) => updateSystemConfig(system.id, "chunkSize", parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`chunkOverlap-${system.id}`}>Chunk Overlap</Label>
                    <Input
                      id={`chunkOverlap-${system.id}`}
                      type="number"
                      value={system.config.chunkOverlap}
                      onChange={(e) => updateSystemConfig(system.id, "chunkOverlap", parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`maxChunks-${system.id}`}>Max Chunks per Document</Label>
                    <Input
                      id={`maxChunks-${system.id}`}
                      type="number"
                      value={system.config.maxChunksPerDocument}
                      onChange={(e) => updateSystemConfig(system.id, "maxChunksPerDocument", parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`qualityThreshold-${system.id}`}>Quality Review Threshold</Label>
                    <Input
                      id={`qualityThreshold-${system.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={system.config.qualityReviewThreshold}
                      onChange={(e) => updateSystemConfig(system.id, "qualityReviewThreshold", parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`priorityThreshold-${system.id}`}>High Priority Threshold</Label>
                    <Input
                      id={`priorityThreshold-${system.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={system.config.highPriorityThreshold}
                      onChange={(e) => updateSystemConfig(system.id, "highPriorityThreshold", parseFloat(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`enhanceThreshold-${system.id}`}>Auto Enhance Threshold</Label>
                    <Input
                      id={`enhanceThreshold-${system.id}`}
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={system.config.autoEnhanceThreshold}
                      onChange={(e) => updateSystemConfig(system.id, "autoEnhanceThreshold", parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </Card>
            ))}

            <Button type="submit">Save Configuration</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
