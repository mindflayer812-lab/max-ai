import React, { useState, useEffect } from "react";
import { AppView, Language, AssistantMode, DeviceState, DeviceAction } from "./types";
import { INITIAL_DEVICE_STATE } from "./data/deviceState";
import { Header } from "./components/Header";
import { MaxChat } from "./components/MaxChat";
import { VisionStudio } from "./components/VisionStudio";
import { DeviceSimulator } from "./components/DeviceSimulator";
import { WritingStudio } from "./components/WritingStudio";
import { HybridBenchmark } from "./components/HybridBenchmark";
import { CatalogExplorer } from "./components/catalog/CatalogExplorer";
import { Sparkles, Shield, Cpu, Terminal, Zap } from "lucide-react";

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>("chat");
  const [language, setLanguage] = useState<Language>("hinglish");
  const [assistantMode, setAssistantMode] = useState<AssistantMode>("general");
  const [hasApiKey, setHasApiKey] = useState(true);

  // Device state with local persistence
  const [deviceState, setDeviceState] = useState<DeviceState>(() => {
    try {
      const saved = localStorage.getItem("nexivo_device_state");
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_DEVICE_STATE;
  });

  // Check health on mount
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setHasApiKey(!!data.hasApiKey))
      .catch(() => setHasApiKey(false));
  }, []);

  // Save device state
  useEffect(() => {
    try {
      localStorage.setItem("nexivo_device_state", JSON.stringify(deviceState));
    } catch (e) {
      console.error(e);
    }
  }, [deviceState]);

  // Execute Device Action triggered from Chat
  const handleExecuteDeviceAction = (action: DeviceAction) => {
    // Check permission
    const missingPerm = action.requiredPermissions.find((p) => !deviceState.permissions[p]);
    if (missingPerm) {
      // Auto prompt user to grant permission in simulator
      if (
        window.confirm(
          `MAX requests permission [${missingPerm}] to execute "${action.actionName}". Would you like to grant this permission?`
        )
      ) {
        setDeviceState((prev) => ({
          ...prev,
          permissions: {
            ...prev.permissions,
            [missingPerm]: true,
          },
        }));
      } else {
        return;
      }
    }

    // Perform state modifications
    if (action.actionType === "SET_ALARM") {
      const time = action.details.time || "07:00 AM";
      const label = action.details.label || "Alarm set by MAX";
      setDeviceState((prev) => ({
        ...prev,
        alarms: [{ id: "alm-" + Date.now(), time, label, enabled: true }, ...prev.alarms],
      }));
    } else if (action.actionType === "TOGGLE_FLASHLIGHT") {
      setDeviceState((prev) => ({ ...prev, flashlightOn: !prev.flashlightOn }));
    } else if (action.actionType === "TOGGLE_WIFI") {
      setDeviceState((prev) => ({ ...prev, wifiEnabled: !prev.wifiEnabled }));
    } else if (action.actionType === "TOGGLE_BLUETOOTH") {
      setDeviceState((prev) => ({ ...prev, bluetoothEnabled: !prev.bluetoothEnabled }));
    } else if (action.actionType === "OPTIMIZE_MEMORY") {
      setDeviceState((prev) => ({
        ...prev,
        memoryUsageMb: Math.max(1200, prev.memoryUsageMb - 650),
      }));
    } else if (action.actionType === "CREATE_REMINDER") {
      const title = action.details.title || "Smart Reminder";
      setDeviceState((prev) => ({
        ...prev,
        reminders: [
          {
            id: "rem-" + Date.now(),
            title,
            time: action.details.time || "Today at 5:00 PM",
            completed: false,
          },
          ...prev.reminders,
        ],
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black font-sans relative overflow-x-hidden">
      {/* Subtle Background Glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Header */}
      <Header
        activeView={currentView}
        onViewChange={setCurrentView}
        language={language}
        onLanguageChange={setLanguage}
        assistantMode={assistantMode}
        onAssistantModeChange={setAssistantMode}
        hasApiKey={hasApiKey}
      />

      {/* Active View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {currentView === "chat" && (
          <MaxChat
            language={language}
            onLanguageChange={setLanguage}
            assistantMode={assistantMode}
            onAssistantModeChange={setAssistantMode}
            deviceState={deviceState}
            onExecuteDeviceAction={handleExecuteDeviceAction}
          />
        )}

        {currentView === "vision" && <VisionStudio language={language} />}

        {currentView === "device" && (
          <DeviceSimulator
            deviceState={deviceState}
            setDeviceState={setDeviceState}
            language={language}
          />
        )}

        {currentView === "writing" && <WritingStudio language={language} />}

        {currentView === "benchmark" && <HybridBenchmark />}

        {currentView === "catalog" && <CatalogExplorer />}
      </main>

      {/* Futuristic Status Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 backdrop-blur-md py-4 px-4 sm:px-8 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="font-semibold text-slate-300">Nexivo AI • MAX Assistant Engine</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 font-mono">v2.4.0 (Gemini 3.7 Flash)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              Runtime Permission Guard
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Hybrid Edge & Cloud
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Hinglish Multilingual
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
