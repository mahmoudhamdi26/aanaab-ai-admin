"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { LiveKitConfig } from "@/types/config";

interface LiveKitConfigPanelProps {
  config?: LiveKitConfig;
  onUpdate: (config: LiveKitConfig) => void;
}

export function LiveKitConfigPanel({ config, onUpdate }: LiveKitConfigPanelProps) {
  const [formData, setFormData] = useState<LiveKitConfig>({
    enabled: false,
    apiKey: "",
    apiSecret: "",
    wsUrl: "ws://localhost:7880",
    rtcPort: 7881,
    portRangeStart: 50000,
    portRangeEnd: 60000,
    useExternalIp: false,
    autoCreateRooms: true,
    turnEnabled: false,
    ...config,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
  };

  const handleChange = (field: keyof LiveKitConfig, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>LiveKit Configuration</CardTitle>
          <CardDescription>
            Configure real-time communication settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="enabled"
                checked={formData.enabled}
                onCheckedChange={(checked) => handleChange("enabled", checked)}
              />
              <Label htmlFor="enabled">Enable LiveKit</Label>
            </div>

            {formData.enabled && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    <Input
                      id="apiKey"
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => handleChange("apiKey", e.target.value)}
                      placeholder="Enter LiveKit API key"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiSecret">API Secret</Label>
                    <Input
                      id="apiSecret"
                      type="password"
                      value={formData.apiSecret}
                      onChange={(e) => handleChange("apiSecret", e.target.value)}
                      placeholder="Enter LiveKit API secret"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wsUrl">WebSocket URL</Label>
                    <Input
                      id="wsUrl"
                      value={formData.wsUrl}
                      onChange={(e) => handleChange("wsUrl", e.target.value)}
                      placeholder="ws://localhost:7880"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rtcPort">RTC Port</Label>
                    <Input
                      id="rtcPort"
                      type="number"
                      value={formData.rtcPort}
                      onChange={(e) => handleChange("rtcPort", parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portRangeStart">Port Range Start</Label>
                    <Input
                      id="portRangeStart"
                      type="number"
                      value={formData.portRangeStart}
                      onChange={(e) => handleChange("portRangeStart", parseInt(e.target.value))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portRangeEnd">Port Range End</Label>
                    <Input
                      id="portRangeEnd"
                      type="number"
                      value={formData.portRangeEnd}
                      onChange={(e) => handleChange("portRangeEnd", parseInt(e.target.value))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="useExternalIp"
                      checked={formData.useExternalIp}
                      onCheckedChange={(checked) => handleChange("useExternalIp", checked)}
                    />
                    <Label htmlFor="useExternalIp">Use External IP</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoCreateRooms"
                      checked={formData.autoCreateRooms}
                      onCheckedChange={(checked) => handleChange("autoCreateRooms", checked)}
                    />
                    <Label htmlFor="autoCreateRooms">Auto Create Rooms</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="turnEnabled"
                      checked={formData.turnEnabled}
                      onCheckedChange={(checked) => handleChange("turnEnabled", checked)}
                    />
                    <Label htmlFor="turnEnabled">Enable TURN Server</Label>
                  </div>
                </div>
              </>
            )}

            <Button type="submit">Save Configuration</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
