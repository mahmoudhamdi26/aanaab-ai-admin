"use client";

import { useState } from "react";
import { ChevronDown, Activity, Settings, Database, Shield, Cpu, Zap, RefreshCw, FileText, TestTube, BarChart3, MessageSquare, Mic, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface NavigationMenuProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  userName?: string;
  userEmail?: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'main' | 'dropdown';
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: Activity,
    type: 'main'
  },
  {
    id: "status",
    label: "Status",
    icon: BarChart3,
    type: 'main'
  },
  {
    id: "logging",
    label: "Logging",
    icon: FileText,
    type: 'main'
  },
  {
    id: "testing",
    label: "Testing",
    icon: TestTube,
    type: 'main'
  },
  {
    id: "chat",
    label: "Chat",
    icon: MessageSquare,
    type: 'main'
  },
  {
    id: "voice-chat",
    label: "Voice Chat",
    icon: Mic,
    type: 'main'
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    type: 'dropdown',
    children: [
      { id: "system", label: "System", icon: Settings, type: 'main' },
      { id: "llm", label: "LLM", icon: Cpu, type: 'main' },
      { id: "embedding", label: "Embedding", icon: Zap, type: 'main' },
      { id: "livekit", label: "LiveKit", icon: Activity, type: 'main' },
      { id: "rag", label: "RAG", icon: Database, type: 'main' },
      { id: "sync", label: "Sync", icon: RefreshCw, type: 'main' },
      { id: "security", label: "Security", icon: Shield, type: 'main' }
    ]
  }
];

export function NavigationMenu({ activeTab, onTabChange, onSignOut, userName, userEmail }: NavigationMenuProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const handleItemClick = (item: MenuItem) => {
    if (item.type === 'dropdown') {
      setOpenDropdown(openDropdown === item.id ? null : item.id);
    } else {
      onTabChange(item.id);
      setOpenDropdown(null);
    }
  };

  const isActive = (itemId: string) => {
    if (itemId === activeTab) return true;
    return false;
  };

  const isSettingsActive = () => {
    const dropdownItem = menuItems.find(item => item.id === 'settings');
    return dropdownItem?.children?.some(child => child.id === activeTab) || false;
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm shadow-lg border border-[#e5e7eb] rounded-xl p-4 relative z-50">
      {/* Main Navigation Items - Single Row */}
      <div className="flex items-center justify-between gap-2">
        {/* Navigation Items */}
        <div className="flex items-center gap-2 flex-1">
          {menuItems.map((item) => (
            <div key={item.id} className="relative">
              <Button
                variant="ghost"
                onClick={() => handleItemClick(item)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 h-auto transition-all duration-200 rounded-lg font-medium min-h-[48px] justify-start",
                  (item.type === 'dropdown' && item.id === 'settings' && isSettingsActive()) ||
                    (item.type === 'dropdown' && openDropdown === item.id) ||
                    (item.type !== 'dropdown' && isActive(item.id))
                    ? "bg-[#4A2C8C] text-white hover:bg-[#3a1f6b]"
                    : "text-[#6b7280] hover:text-[#4A2C8C] hover:bg-[#f8f9fa]"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{item.label}</span>
                {item.type === 'dropdown' && (
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 ml-1 transition-transform duration-200",
                      openDropdown === item.id && "rotate-180"
                    )}
                  />
                )}
              </Button>

              {/* Dropdown Menu with High Z-Index */}
              {item.type === 'dropdown' && openDropdown === item.id && (
                <div className="absolute top-full left-0 mt-2 z-[99999]">
                  <Card className="shadow-2xl border-0 min-w-[200px] bg-white">
                    <CardContent className="p-2">
                      <div className="space-y-1">
                        {item.children?.map((child) => (
                          <Button
                            key={child.id}
                            variant="ghost"
                            onClick={() => handleItemClick(child)}
                            className={cn(
                              "w-full flex items-center gap-2 px-3 py-2 h-auto text-sm transition-all duration-200 rounded-md justify-start",
                              isActive(child.id)
                                ? "bg-[#4A2C8C] text-white hover:bg-[#3a1f6b]"
                                : "text-[#6b7280] hover:text-[#4A2C8C] hover:bg-[#f8f9fa]"
                            )}
                          >
                            <child.icon className="h-4 w-4" />
                            {child.label}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Info and Sign Out */}
        <div className="flex items-center gap-4">
          <div className="hidden md:block text-sm text-right">
            <p className="font-medium text-[#1a1a1a]">
              {userName || userEmail}
            </p>
            <p className="text-xs text-[#6b7280]">Administrator</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onSignOut}
            className="border-[#7B61E0] text-[#7B61E0] hover:bg-[#7B61E0] hover:text-white transition-all duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
