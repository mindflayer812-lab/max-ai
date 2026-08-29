import React, { useState } from "react";
import { DeviceState, DeviceAction, Language } from "../types";
import {
  Smartphone,
  Wifi,
  WifiOff,
  Bluetooth,
  Flashlight,
  BatteryCharging,
  Battery,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Send,
  Zap,
  Trash2,
  Plus,
  RefreshCw,
  Cpu,
  Power,
  Volume2,
} from "lucide-react";

interface DeviceSimulatorProps {
  deviceState: DeviceState;
  setDeviceState: React.Dispatch<React.SetStateAction<DeviceState>>;
  language: Language;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({
  deviceState,
  setDeviceState,
  language,
}) => {
  const [commandInput, setCommandInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastAction, setLastAction] = useState<DeviceAction | null>(null);
  const [newAlarmTime, setNewAlarmTime] = useState("07:30 AM");
  const [newAlarmLabel, setNewAlarmLabel] = useState("Morning Routine");
  const [newReminderTitle, setNewReminderTitle] = useState("");

  const toggleWifi = () => {
    if (!deviceState.permissions["android.permission.CHANGE_WIFI_STATE"]) {
      alert("Permission android.permission.CHANGE_WIFI_STATE is required. Please grant it in Permission Manager.");
      return;
    }
    setDeviceState((prev) => ({ ...prev, wifiEnabled: !prev.wifiEnabled }));
  };

  const toggleBluetooth = () => {
    if (!deviceState.permissions["android.permission.BLUETOOTH_CONNECT"]) {
      alert("Permission android.permission.BLUETOOTH_CONNECT is required. Please grant it in Permission Manager.");
      return;
    }
    setDeviceState((prev) => ({ ...prev, bluetoothEnabled: !prev.bluetoothEnabled }));
  };

  const toggleFlashlight = () => {
    if (!deviceState.permissions["android.permission.CAMERA"]) {
      alert("Permission android.permission.CAMERA is required to control flashlight hardware.");
      return;
    }
    setDeviceState((prev) => ({ ...prev, flashlightOn: !prev.flashlightOn }));
  };

  const optimizeMemory = () => {
    setDeviceState((prev) => ({
      ...prev,
      memoryUsageMb: Math.max(1200, prev.memoryUsageMb - 680),
    }));
  };

  const togglePermission = (permKey: string) => {
    setDeviceState((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permKey]: !prev.permissions[permKey],
      },
    }));
  };

  const handleAddAlarm = () => {
    if (!newAlarmTime) return;
    const newAlarm = {
      id: "alm-" + Date.now(),
      time: newAlarmTime,
      label: newAlarmLabel || "Alarm",
      enabled: true,
    };
    setDeviceState((prev) => ({ ...prev, alarms: [newAlarm, ...prev.alarms] }));
    setNewAlarmLabel("");
  };

  const handleDeleteAlarm = (id: string) => {
    setDeviceState((prev) => ({
      ...prev,
      alarms: prev.alarms.filter((a) => a.id !== id),
    }));
  };

  const handleToggleAlarm = (id: string) => {
    setDeviceState((prev) => ({
      ...prev,
      alarms: prev.alarms.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    }));
  };

  const handleAddReminder = () => {
    if (!newReminderTitle.trim()) return;
    const newRem = {
      id: "rem-" + Date.now(),
      title: newReminderTitle.trim(),
      time: "Today at " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      completed: false,
    };
    setDeviceState((prev) => ({ ...prev, reminders: [newRem, ...prev.reminders] }));
    setNewReminderTitle("");
  };

  const handleToggleReminder = (id: string) => {
    setDeviceState((prev) => ({
      ...prev,
      reminders: prev.reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)),
    }));
  };

  const handleDeleteReminder = (id: string) => {
    setDeviceState((prev) => ({
      ...prev,
      reminders: prev.reminders.filter((r) => r.id !== id),
    }));
  };

  const handleExecuteNaturalCommand = async (cmd?: string) => {
    const textToExecute = cmd || commandInput;
    if (!textToExecute.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      const res = await fetch("/api/device-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userCommand: textToExecute,
          currentDeviceState: deviceState,
        }),
      });

      const data = await res.json();
      const action: DeviceAction = {
        id: "act-" + Date.now(),
        actionType: data.actionType || "CREATE_REMINDER",
        actionName: data.actionName || "Action",
        status: data.status || "ready_for_permission",
        requiredPermissions: data.requiredPermissions || [],
        details: data.details || {},
        confirmationText: data.confirmationText || "Action prepared.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setLastAction(action);

      // Check if all permissions granted
      const missingPerm = action.requiredPermissions.find((p) => !deviceState.permissions[p]);

      if (!missingPerm) {
        // Execute state change immediately
        if (action.actionType === "SET_ALARM") {
          const time = action.details.time || "08:00 AM";
          const label = action.details.label || "MAX Scheduled Alarm";
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
          optimizeMemory();
        } else if (action.actionType === "CREATE_REMINDER") {
          const title = action.details.title || textToExecute;
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
      }

      setCommandInput("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Android Device Actions & Permission Console
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Test MAX's intelligent on-device hardware execution, runtime permission handling, alarms, reminders, and system diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-quick-optimize"
            onClick={optimizeMemory}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition-all"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Optimize RAM ({deviceState.memoryUsageMb} MB)</span>
          </button>
        </div>
      </div>

      {/* Natural Language Command Bar */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-xl">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Command MAX via Natural Language</span>
          <span className="text-cyan-400 font-semibold lowercase">Supported in Hinglish, English, Hindi</span>
        </label>

        <div className="flex items-center gap-2">
          <input
            id="device-command-input"
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleExecuteNaturalCommand()}
            placeholder='Try: "Set 6:30 AM Gym Alarm", "Turn on flashlight", "Check battery health", "Mera Wi-Fi toggle karo"...'
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          />
          <button
            id="btn-run-device-command"
            onClick={() => handleExecuteNaturalCommand()}
            disabled={!commandInput.trim() || isProcessing}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-40 flex items-center gap-2 transition-all"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Execute</span>
          </button>
        </div>

        {/* Quick Command Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
          <span className="text-slate-500 font-medium text-[11px]">Quick Tests:</span>
          {[
            "Set alarm for 6:00 AM",
            "Toggle Flashlight on",
            "Check battery status",
            "Remind me to call Rohit at 4 PM",
            "Turn off Wi-Fi",
          ].map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => handleExecuteNaturalCommand(cmd)}
              className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] transition-all"
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Last Action Feedback */}
        {lastAction && (
          <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase">{lastAction.actionName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold">
                  {lastAction.status}
                </span>
              </div>
              <p className="text-xs text-slate-300">{lastAction.confirmationText}</p>
            </div>
            <span className="text-[10px] text-slate-500 whitespace-nowrap">{lastAction.timestamp}</span>
          </div>
        )}
      </div>

      {/* Main Grid: Device HUD + Alarms/Reminders + Permissions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Quick Toggles & Phone Status (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Hardware Toggles Card */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Hardware & Radio States
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {/* Wi-Fi Toggle */}
              <button
                id="btn-toggle-wifi"
                onClick={toggleWifi}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  deviceState.wifiEnabled
                    ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-md shadow-cyan-500/10"
                    : "bg-slate-950 border-slate-800 text-slate-500"
                }`}
              >
                {deviceState.wifiEnabled ? <Wifi className="w-6 h-6 text-cyan-400" /> : <WifiOff className="w-6 h-6" />}
                <span className="text-xs font-bold">{deviceState.wifiEnabled ? "Wi-Fi ON" : "Wi-Fi OFF"}</span>
              </button>

              {/* Bluetooth Toggle */}
              <button
                id="btn-toggle-bluetooth"
                onClick={toggleBluetooth}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  deviceState.bluetoothEnabled
                    ? "bg-indigo-500/15 border-indigo-500/40 text-indigo-300 shadow-md shadow-indigo-500/10"
                    : "bg-slate-950 border-slate-800 text-slate-500"
                }`}
              >
                <Bluetooth className={`w-6 h-6 ${deviceState.bluetoothEnabled ? "text-indigo-400" : ""}`} />
                <span className="text-xs font-bold">{deviceState.bluetoothEnabled ? "BT Active" : "BT OFF"}</span>
              </button>

              {/* Flashlight Toggle */}
              <button
                id="btn-toggle-flashlight"
                onClick={toggleFlashlight}
                className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                  deviceState.flashlightOn
                    ? "bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-md shadow-amber-500/20"
                    : "bg-slate-950 border-slate-800 text-slate-500"
                }`}
              >
                <Flashlight className={`w-6 h-6 ${deviceState.flashlightOn ? "text-amber-400 animate-pulse" : ""}`} />
                <span className="text-xs font-bold">{deviceState.flashlightOn ? "Torch ON" : "Torch OFF"}</span>
              </button>
            </div>

            {/* Battery & Health HUD */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <BatteryCharging className="w-4 h-4 text-emerald-400" />
                  Battery Diagnostic
                </span>
                <span className="font-bold text-emerald-400">{deviceState.batteryLevel}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${deviceState.batteryLevel}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Health: {deviceState.batteryHealth}</span>
                <span>~9.5h Left</span>
              </div>
            </div>
          </div>

          {/* Runtime Permission Gates */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Android Runtime Permissions
              </h3>
              <span className="text-[10px] text-slate-500">Security Gate</span>
            </div>

            <p className="text-xs text-slate-400">
              Toggle runtime permissions to test how MAX handles permission requests and user security guards.
            </p>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {Object.entries(deviceState.permissions).map(([perm, granted]) => (
                <div
                  key={perm}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    {granted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
                    )}
                    <span className="font-mono text-[11px] text-slate-300 truncate">{perm}</span>
                  </div>

                  <button
                    onClick={() => togglePermission(perm)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                      granted
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {granted ? "GRANTED" : "DENIED"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Alarms & Reminders Manager (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Alarms */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Active Alarms</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 font-semibold">
                  {deviceState.alarms.length}
                </span>
              </div>
            </div>

            {/* Quick Add Alarm Input */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
              <input
                type="text"
                value={newAlarmTime}
                onChange={(e) => setNewAlarmTime(e.target.value)}
                placeholder="07:30 AM"
                className="w-24 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <input
                type="text"
                value={newAlarmLabel}
                onChange={(e) => setNewAlarmLabel(e.target.value)}
                placeholder="Alarm Label (e.g. Gym)"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                id="btn-add-alarm"
                onClick={handleAddAlarm}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Alarm List */}
            <div className="space-y-2">
              {deviceState.alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="font-mono text-sm font-bold text-white">{alarm.time}</span>
                      <p className="text-xs text-slate-400">{alarm.label}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleAlarm(alarm.id)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-all ${
                        alarm.enabled ? "bg-cyan-500" : "bg-slate-800"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          alarm.enabled ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>

                    <button
                      onClick={() => handleDeleteAlarm(alarm.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Reminders & Calendar */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Smart Reminders & Schedule</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold">
                  {deviceState.reminders.length}
                </span>
              </div>
            </div>

            {/* Quick Add Reminder */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
              <input
                type="text"
                value={newReminderTitle}
                onChange={(e) => setNewReminderTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddReminder()}
                placeholder="Add quick reminder..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                id="btn-add-reminder"
                onClick={handleAddReminder}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>

            {/* Reminder Items */}
            <div className="space-y-2">
              {deviceState.reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={rem.completed}
                      onChange={() => handleToggleReminder(rem.id)}
                      className="w-4 h-4 accent-indigo-500 rounded"
                    />
                    <div>
                      <span className={`text-xs sm:text-sm font-medium ${rem.completed ? "line-through text-slate-500" : "text-slate-200"}`}>
                        {rem.title}
                      </span>
                      <p className="text-[11px] text-slate-500">{rem.time}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteReminder(rem.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
