"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SystemConfigPanel } from "@/components/config-panels/system-config";
import { LLMConfigPanel } from "@/components/config-panels/llm-config";
import { EmbeddingConfigPanel } from "@/components/config-panels/embedding-config";
import { LiveKitConfigPanel } from "@/components/config-panels/livekit-config";
import { RAGConfigPanel } from "@/components/config-panels/rag-config";
import { SyncConfigPanel } from "@/components/config-panels/sync-config";
import { SecurityConfigPanel } from "@/components/config-panels/security-config";
import { SyncJobsPanel } from "@/components/sync-jobs-panel";
import { NavigationMenu } from "@/components/navigation-menu";
import { StatusPage } from "@/components/pages/status-page";
import { LoggingPage } from "@/components/pages/logging-page";
import TestingPage from "@/components/pages/testing-page";
import ChatPage from "@/components/pages/chat-page";
import { Activity, LogOut } from "lucide-react";
import { AdminConfig } from "@/types/config";
import { Logo } from "@/components/ui/logo";

export function AdminDashboard() {
  const { data: session } = useSession();
  const [config, setConfig] = useState<Partial<AdminConfig>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/config");
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error("Failed to fetch config:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (section: keyof AdminConfig, data: unknown) => {
    try {
      const response = await fetch("/api/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ section, data }),
      });

      if (response.ok) {
        setConfig(prev => ({ ...prev, [section]: data }));
      }
    } catch (error) {
      console.error("Failed to update config:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f9fa] to-[#e5e7eb]">
        <div className="flex flex-col items-center space-y-4">
          <Logo size="lg" />
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#7B61E0] border-t-transparent"></div>
          <p className="text-[#6b7280] text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e5e7eb]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-[#e5e7eb] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <Logo size="lg" />
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-[#4A2C8C]">
                  Admin Panel
                </h1>
                <p className="text-sm text-[#6b7280] -mt-1">Aanaab AI Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-[#1a1a1a]">
                  {session?.user?.name || session?.user?.email}
                </p>
                <p className="text-xs text-[#6b7280]">Administrator</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => signOut()}
                className="border-[#7B61E0] text-[#7B61E0] hover:bg-[#7B61E0] hover:text-white transition-all duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Navigation Menu */}
          <NavigationMenu
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSignOut={() => signOut()}
            userName={session?.user?.name}
            userEmail={session?.user?.email}
          />

          {/* Page Content */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-[#4A2C8C] to-[#7B61E0] rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Welcome to Aanaab AI</h2>
                    <p className="text-white/90 text-lg">Manage your AI infrastructure with confidence</p>
                  </div>
                  <div className="hidden md:block">
                    <Logo size="lg" className="opacity-20" />
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-[#1a1a1a]">System Status</CardTitle>
                      <div className="w-3 h-3 bg-[#32C896] rounded-full animate-pulse"></div>
                    </div>
                    <CardDescription className="text-[#6b7280]">Current system health</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#32C896] mb-1">Healthy</div>
                    <p className="text-sm text-[#6b7280]">All services running smoothly</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-[#1a1a1a]">Active Sync Jobs</CardTitle>
                      <Activity className="h-4 w-4 text-[#7B61E0]" />
                    </div>
                    <CardDescription className="text-[#6b7280]">Current synchronization status</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#7B61E0] mb-1">0</div>
                    <p className="text-sm text-[#6b7280]">No active synchronization jobs</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-semibold text-[#1a1a1a]">Configuration</CardTitle>
                      <Activity className="h-4 w-4 text-[#4A2C8C]" />
                    </div>
                    <CardDescription className="text-[#6b7280]">Settings management</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-[#4A2C8C] mb-1">
                      {Object.keys(config).length}
                    </div>
                    <p className="text-sm text-[#6b7280]">Configured sections</p>
                  </CardContent>
                </Card>
              </div>

              <SyncJobsPanel />
            </div>
          )}

          {activeTab === "status" && <StatusPage />}
          {activeTab === "logging" && <LoggingPage />}
          {activeTab === "testing" && <TestingPage />}
          {activeTab === "chat" && <ChatPage />}

          {/* Settings Pages */}
          {activeTab === "system" && (
            <SystemConfigPanel
              config={config.system}
              onUpdate={(data) => updateConfig("system", data)}
            />
          )}

          {activeTab === "llm" && (
            <LLMConfigPanel
              config={config.llmProviders}
              onUpdate={(data) => updateConfig("llmProviders", data)}
            />
          )}

          {activeTab === "embedding" && (
            <EmbeddingConfigPanel
              config={config.embeddingProviders}
              onUpdate={(data) => updateConfig("embeddingProviders", data)}
            />
          )}

          {activeTab === "livekit" && (
            <LiveKitConfigPanel
              config={config.livekit}
              onUpdate={(data) => updateConfig("livekit", data)}
            />
          )}

          {activeTab === "rag" && (
            <RAGConfigPanel
              config={config.ragSystems}
              onUpdate={(data) => updateConfig("ragSystems", data)}
            />
          )}

          {activeTab === "sync" && (
            <SyncConfigPanel
              config={config.syncProcess}
              onUpdate={(data) => updateConfig("syncProcess", data)}
            />
          )}

          {activeTab === "security" && (
            <SecurityConfigPanel
              config={config.security}
              onUpdate={(data) => updateConfig("security", data)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
