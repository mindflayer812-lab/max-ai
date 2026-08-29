export type AppView = "chat" | "vision" | "device" | "writing" | "benchmark" | "catalog";

export type Language = "hinglish" | "english" | "hindi";

export type AssistantMode = "general" | "code" | "reasoning" | "creative";

export type SampleCategory = "all" | "multimodal" | "vision" | "text" | "hybrid" | "audio" | "video";

export interface CatalogSample {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  category: SampleCategory;
  badges: string[];
  image: string;
  architecture: "On-Device (ML Kit)" | "Cloud (Gemini 3.7 Flash)" | "Hybrid (On-Device + Cloud Fallback)";
  defaultPrompt?: string;
  sampleInputs?: string[];
  docsUrl?: string;
}

export interface DeviceActionDetails {
  time?: string;
  label?: string;
  newState?: boolean;
  level?: number;
  isCharging?: boolean;
  health?: string;
  estimatedHoursLeft?: number;
  recipient?: string;
  message?: string;
  targetApp?: string;
  command?: string;
  [key: string]: any;
}

export interface DeviceAction {
  id: string;
  actionType:
    | "SET_ALARM"
    | "CREATE_REMINDER"
    | "TOGGLE_WIFI"
    | "TOGGLE_BLUETOOTH"
    | "TOGGLE_FLASHLIGHT"
    | "CHECK_BATTERY"
    | "SEND_MESSAGE"
    | "OPTIMIZE_MEMORY"
    | "OPEN_APP"
    | "SYSTEM_DIAGNOSTICS";
  actionName: string;
  status: "ready_for_permission" | "executed" | "denied";
  requiredPermissions: string[];
  details: DeviceActionDetails;
  confirmationText: string;
  timestamp: string;
}

export interface DeviceState {
  wifiEnabled: boolean;
  bluetoothEnabled: boolean;
  flashlightOn: boolean;
  batteryLevel: number;
  isCharging: boolean;
  batteryHealth: string;
  memoryUsageMb: number;
  alarms: { id: string; time: string; label: string; enabled: boolean }[];
  reminders: { id: string; title: string; time: string; completed: boolean }[];
  permissions: Record<string, boolean>;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  language?: Language;
  mode?: AssistantMode;
  imageUrl?: string;
  deviceAction?: DeviceAction;
  isAudioPlaying?: boolean;
}

export interface VisionPreset {
  id: string;
  title: string;
  category: "OCR & Document" | "Object & Scene" | "Diagram & Code" | "Medical & Health" | "Art & Design";
  description: string;
  imageUrl: string;
  suggestedPrompt: string;
}

export interface WritingPreset {
  id: string;
  title: string;
  icon: string;
  task: "summarize" | "proofread" | "hinglish-convert" | "email-draft";
  description: string;
  sampleInput: string;
}

export interface BenchmarkMetrics {
  prompt: string;
  mode: "comparison" | "on-device" | "cloud";
  nanoLatency: number;
  cloudLatency: number;
  nanoOutput: string;
  cloudOutput: string;
  nanoTokens: number;
  cloudTokens: number;
}
