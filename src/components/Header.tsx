import React from "react";
import { AppView, Language, AssistantMode } from "../types";
import {
  Sparkles,
  Cpu,
  MessageSquare,
  Eye,
  Smartphone,
  PenTool,
  Activity,
  Layers,
  Globe,
  Code2,
  Brain,
  Wand2,
} from "lucide-react";

interface HeaderProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  assistantMode: AssistantMode;
  onAssistantModeChange: (mode: AssistantMode) => void;
  hasApiKey: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onViewChange,
  language,
  onLanguageChange,
  assistantMode,
  onAssistantModeChange,
  hasApiKey,
}) => {
  const navItems: { id: AppView; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: "chat", label: "MAX Assistant", icon: MessageSquare },
    { id: "vision", label: "Vision & OCR", icon: Eye },
    { id: "device", label: "Device Controls", icon: Smartphone },
    { id: "writing", label: "Writing Studio", icon: PenTool },
    { id: "benchmark", label: "Hybrid Engine", icon: Activity },
    { id: "catalog", label: "AI Catalog", icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3.5">
        {/* Brand & Assistant Status */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 ring-1 ring-white/20">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 border-2 border-slate-900"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-white tracking-tight">
                  Nexivo <span className="text-cyan-400 font-medium">AI</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 rounded-md">
                  MAX Core
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Multimodal • Hinglish • Device Actions
              </p>
            </div>
          </div>

          {/* Quick status on mobile */}
          <div className="flex md:hidden items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                hasApiKey
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-300 border-amber-500/20"
              }`}
            >
              {hasApiKey ? "Gemini Live" : "Local AI"}
            </span>
          </div>
        </div>

        {/* Center Nav Views */}
        <nav className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800/80 shadow-inner overflow-x-auto max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30 font-semibold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Language & Mode Selectors */}
        <div className="hidden lg:flex items-center gap-2.5">
          {/* Language Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            {(["hinglish", "english", "hindi"] as Language[]).map((lang) => (
              <button
                key={lang}
                id={`lang-btn-${lang}`}
                onClick={() => onLanguageChange(lang)}
                className={`px-2 py-1 rounded text-xs font-semibold capitalize transition-all ${
                  language === lang
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {lang === "hinglish" ? "Hinglish" : lang === "english" ? "EN" : "हिंदी"}
              </button>
            ))}
          </div>

          {/* Mode Selector */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              id="mode-btn-general"
              onClick={() => onAssistantModeChange("general")}
              title="Fast Assistant"
              className={`p-1.5 rounded transition-all ${
                assistantMode === "general"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Wand2 className="w-3.5 h-3.5" />
            </button>
            <button
              id="mode-btn-code"
              onClick={() => onAssistantModeChange("code")}
              title="Code Assistant"
              className={`p-1.5 rounded transition-all ${
                assistantMode === "code"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
            </button>
            <button
              id="mode-btn-reasoning"
              onClick={() => onAssistantModeChange("reasoning")}
              title="Deep Reasoning"
              className={`p-1.5 rounded transition-all ${
                assistantMode === "reasoning"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Backend Status */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              hasApiKey
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-300 border-amber-500/20"
            }`}
            title={
              hasApiKey
                ? "Connected to Google Gemini 3.7 Flash"
                : "Offline simulation engine active. Add GEMINI_API_KEY in Secrets for live Cloud AI."
            }
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{hasApiKey ? "Gemini 3.7 Flash" : "Local AI"}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
