"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import VoiceChat from '@/components/livekit/VoiceChat';

interface LiveKitConfig {
  token: string;
  roomName: string;
  userName: string;
  wsUrl: string;
}

export default function VoiceChatPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [livekitConfig, setLivekitConfig] = useState<LiveKitConfig | null>(null);

  // Initialize LiveKit room
  const initializeRoom = async () => {
    if (!roomName.trim() || !userName.trim()) {
      toast.error('Please enter both room name and user name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get LiveKit token from your API
      const response = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_name: roomName,
          user_name: userName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get LiveKit token');
      }

      const config: LiveKitConfig = await response.json();
      setLivekitConfig(config);
      setIsConnected(true);
      toast.success('Connected to voice chat!');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      toast.error('Failed to connect to voice chat');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect from room
  const handleDisconnect = () => {
    setIsConnected(false);
    setLivekitConfig(null);
    toast.info('Disconnected from voice chat');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Voice AI Chat</h1>
          <p className="text-gray-600">Talk to your AI assistant with voice commands</p>
        </div>

        {!isConnected ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Join Voice Chat</CardTitle>
              <CardDescription>
                Enter your details to start a voice conversation with AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="roomName">Room Name</Label>
                <Input
                  id="roomName"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="Enter room name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="userName">Your Name</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1"
                />
              </div>
              <Button
                onClick={initializeRoom}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Connecting...' : 'Join Voice Chat'}
              </Button>
              {error && (
                <div className="text-red-600 text-sm text-center">
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        ) : livekitConfig ? (
          <VoiceChat
            token={livekitConfig.token}
            roomName={livekitConfig.roomName}
            userName={livekitConfig.userName}
            wsUrl={livekitConfig.wsUrl}
            onDisconnect={handleDisconnect}
          />
        ) : null}
      </div>
    </div>
  );
}
