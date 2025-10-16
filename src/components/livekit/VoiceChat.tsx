"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Room, RoomEvent, RemoteParticipant, LocalParticipant, Track, AudioTrack } from 'livekit-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceChatProps {
  token: string;
  roomName: string;
  userName: string;
  wsUrl: string;
  onDisconnect: () => void;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  processingTime?: number;
}

export default function VoiceChat({ token, roomName, userName, wsUrl, onDisconnect }: VoiceChatProps) {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const localAudioRef = useRef<HTMLAudioElement>(null);
  const remoteAudioRef = useRef<HTMLAudioElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');

        if (transcript.trim()) {
          processVoiceMessage(transcript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Speech recognition error');
      };
    }
  }, []);

  // Connect to LiveKit room
  const connectToRoom = useCallback(async () => {
    if (!token || !wsUrl) {
      setError('Missing token or WebSocket URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newRoom = new Room({
        adaptiveStream: true,
        dynacast: true,
        publishDefaults: {
          audioPreset: {
            maxBitrate: 16000,
            priority: 'high',
          },
        },
      });

      // Set up event listeners
      newRoom.on(RoomEvent.Connected, () => {
        console.log('Connected to room');
        setIsConnected(true);
        toast.success('Connected to voice chat!');

        // Add welcome message
        setMessages([{
          id: '1',
          text: `Welcome to voice chat, ${userName}! You can now speak to the AI assistant.`,
          isUser: false,
          timestamp: new Date(),
        }]);
      });

      newRoom.on(RoomEvent.Disconnected, (reason) => {
        console.log('Disconnected from room:', reason);
        setIsConnected(false);
        setIsListening(false);
        toast.info('Disconnected from voice chat');
      });

      newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log('Track subscribed:', track.kind);

        if (track.kind === Track.Kind.Audio) {
          const audioElement = track.attach();
          if (participant.isLocal) {
            if (localAudioRef.current) {
              localAudioRef.current.srcObject = audioElement.srcObject;
            }
          } else {
            if (remoteAudioRef.current) {
              remoteAudioRef.current.srcObject = audioElement.srcObject;
            }
          }
        }
      });

      newRoom.on(RoomEvent.TrackUnsubscribed, (track) => {
        track.detach();
      });

      // Connect to room
      await newRoom.connect(wsUrl, token);
      setRoom(newRoom);

      // Enable microphone
      await newRoom.localParticipant.enableCameraAndMicrophone();

    } catch (err) {
      console.error('Failed to connect to room:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect');
      toast.error('Failed to connect to voice chat');
    } finally {
      setIsLoading(false);
    }
  }, [token, wsUrl, userName]);

  // Disconnect from room
  const disconnect = useCallback(async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
    }
    setIsConnected(false);
    setIsListening(false);
    onDisconnect();
  }, [room, onDisconnect]);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    if (!room) return;

    try {
      if (isMuted) {
        await room.localParticipant.setMicrophoneEnabled(true);
        setIsMuted(false);
        toast.info('Microphone unmuted');
      } else {
        await room.localParticipant.setMicrophoneEnabled(false);
        setIsMuted(true);
        toast.info('Microphone muted');
      }
    } catch (err) {
      console.error('Failed to toggle mute:', err);
      toast.error('Failed to toggle microphone');
    }
  }, [room, isMuted]);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      toast.info('Stopped listening');
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('Started listening');
    }
  }, [isListening]);

  // Process voice message
  const processVoiceMessage = useCallback(async (message: string) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Send to your API for processing
      const response = await fetch('/api/livekit/voice-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_name: roomName,
          user_id: 'current-user', // You might want to get this from auth
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process voice message');
      }

      const result = await response.json();

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: result.response,
        isUser: false,
        timestamp: new Date(),
        processingTime: result.processing_time_ms,
      };
      setMessages(prev => [...prev, aiMessage]);

      // Use Web Speech API for text-to-speech
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(result.response);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        speechSynthesis.speak(utterance);
      }

    } catch (err) {
      console.error('Voice message processing error:', err);
      toast.error('Failed to process voice message');
    }
  }, [roomName]);

  // Connect on mount
  useEffect(() => {
    connectToRoom();

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [connectToRoom]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Connecting to voice chat...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-red-600">Connection Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={connectToRoom} className="w-full">
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chat Messages */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Voice Chat - {roomName}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
              >
                <PhoneOff className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto space-y-4 mb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                      }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                      {message.processingTime && (
                        <span className="ml-2">
                          ({message.processingTime.toFixed(0)}ms)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voice Controls */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Voice Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={toggleMute}
              variant={isMuted ? "destructive" : "default"}
              className="w-full"
              disabled={!isConnected}
            >
              {isMuted ? (
                <>
                  <MicOff className="h-4 w-4 mr-2" />
                  Unmute
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  Mute
                </>
              )}
            </Button>

            <Button
              onClick={toggleListening}
              variant={isListening ? "default" : "outline"}
              className="w-full"
              disabled={!isConnected}
            >
              {isListening ? (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Listening...
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4 mr-2" />
                  Start Listening
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Room Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Room:</span> {roomName}
              </div>
              <div>
                <span className="font-medium">User:</span> {userName}
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span className={`ml-2 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hidden audio elements */}
      <audio ref={localAudioRef} autoPlay muted />
      <audio ref={remoteAudioRef} autoPlay />
    </div>
  );
}
