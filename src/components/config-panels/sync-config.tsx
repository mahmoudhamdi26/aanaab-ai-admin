"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SyncProcessConfig } from "@/types/config";

interface SyncConfigPanelProps {
  config?: SyncProcessConfig;
  onUpdate: (config: SyncProcessConfig) => void;
}

export function SyncConfigPanel({ config, onUpdate }: SyncConfigPanelProps) {
  const [formData, setFormData] = useState<SyncProcessConfig>({
    batchSize: 100,
    maxConcurrent: 5,
    maxConcurrentLessons: 10,
    checkpointInterval: 50,
    retryAttempts: 3,
    retryDelay: 1.0,
    enableRAGProcessing: true,
    syncTypes: {
      full: true,
      incremental: true,
      courseSpecific: true,
      phased: true,
    },
    contentTypes: {
      courses: true,
      lessons: true,
      quizzes: true,
      assignments: true,
      discussions: true,
      attachments: true,
      videos: true,
    },
    ...config,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (field: keyof SyncProcessConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSyncTypeChange = (type: keyof SyncProcessConfig["syncTypes"], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      syncTypes: { ...prev.syncTypes, [type]: value }
    }));
  };

  const handleContentTypeChange = (type: keyof SyncProcessConfig["contentTypes"], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: { ...prev.contentTypes, [type]: value }
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sync Process Configuration</CardTitle>
          <CardDescription>
            Configure synchronization process settings and content types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="batchSize">Batch Size</Label>
                <Input
                  id="batchSize"
                  type="number"
                  value={formData.batchSize}
                  onChange={(e) => handleChange("batchSize", parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxConcurrent">Max Concurrent Operations</Label>
                <Input
                  id="maxConcurrent"
                  type="number"
                  value={formData.maxConcurrent}
                  onChange={(e) => handleChange("maxConcurrent", parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxConcurrentLessons">Max Concurrent Lessons</Label>
                <Input
                  id="maxConcurrentLessons"
                  type="number"
                  value={formData.maxConcurrentLessons}
                  onChange={(e) => handleChange("maxConcurrentLessons", parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="checkpointInterval">Checkpoint Interval</Label>
                <Input
                  id="checkpointInterval"
                  type="number"
                  value={formData.checkpointInterval}
                  onChange={(e) => handleChange("checkpointInterval", parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retryAttempts">Retry Attempts</Label>
                <Input
                  id="retryAttempts"
                  type="number"
                  value={formData.retryAttempts}
                  onChange={(e) => handleChange("retryAttempts", parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="retryDelay">Retry Delay (seconds)</Label>
                <Input
                  id="retryDelay"
                  type="number"
                  step="0.1"
                  value={formData.retryDelay}
                  onChange={(e) => handleChange("retryDelay", parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="enableRAGProcessing"
                  checked={formData.enableRAGProcessing}
                  onCheckedChange={(checked) => handleChange("enableRAGProcessing", checked)}
                />
                <Label htmlFor="enableRAGProcessing">Enable RAG Processing</Label>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sync Types</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(formData.syncTypes).map(([type, enabled]) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Switch
                      id={`syncType-${type}`}
                      checked={enabled}
                      onCheckedChange={(checked) => handleSyncTypeChange(type as keyof SyncProcessConfig["syncTypes"], checked)}
                    />
                    <Label htmlFor={`syncType-${type}`}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Content Types</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(formData.contentTypes).map(([type, enabled]) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Switch
                      id={`contentType-${type}`}
                      checked={enabled}
                      onCheckedChange={(checked) => handleContentTypeChange(type as keyof SyncProcessConfig["contentTypes"], checked)}
                    />
                    <Label htmlFor={`contentType-${type}`}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit">Save Configuration</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
