import { DeviceState, VisionPreset, WritingPreset } from "../types";

export const INITIAL_DEVICE_STATE: DeviceState = {
  wifiEnabled: true,
  bluetoothEnabled: true,
  flashlightOn: false,
  batteryLevel: 87,
  isCharging: false,
  batteryHealth: "Excellent (98% capacity)",
  memoryUsageMb: 2450,
  alarms: [
    { id: "alm-1", time: "06:30 AM", label: "Morning Fitness", enabled: true },
    { id: "alm-2", time: "08:15 AM", label: "Standup Sync", enabled: true },
  ],
  reminders: [
    { id: "rem-1", title: "Review Nexivo AI Architecture Specs", time: "Today at 4:00 PM", completed: false },
    { id: "rem-2", title: "Deploy Gemini 3.7 Flash Model Endpoint", time: "Tomorrow at 11:00 AM", completed: true },
  ],
  permissions: {
    "android.permission.SET_ALARM": true,
    "android.permission.READ_CALENDAR": true,
    "android.permission.WRITE_CALENDAR": true,
    "android.permission.CHANGE_WIFI_STATE": true,
    "android.permission.BLUETOOTH_CONNECT": true,
    "android.permission.CAMERA": true,
    "android.permission.BATTERY_STATS": true,
    "android.permission.SEND_SMS": false,
  },
};

export const VISION_PRESETS: VisionPreset[] = [
  {
    id: "vis-circuit",
    title: "AI Neural Microchip Diagram",
    category: "Diagram & Code",
    description: "Analyze microchip hardware architecture and identify components.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80",
    suggestedPrompt: "Break down the architecture of this electronic circuit, highlight key components (processor, traces, power lines), and explain their function.",
  },
  {
    id: "vis-doc",
    title: "Architectural Blueprint / Notes",
    category: "OCR & Document",
    description: "Extract handwritten engineering notes and technical parameters.",
    imageUrl: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&w=1000&q=80",
    suggestedPrompt: "Perform OCR text extraction on these handwritten notes and organize them into neat bullet points with action items.",
  },
  {
    id: "vis-city",
    title: "Smart Metropolis Infrastructure",
    category: "Object & Scene",
    description: "Multimodal scene understanding & urban traffic object detection.",
    imageUrl: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1000&q=80",
    suggestedPrompt: "Identify traffic patterns, architectural landmarks, urban density, and potential smart city IoT sensor placement areas.",
  },
  {
    id: "vis-art",
    title: "Futuristic Cybernetic Concept",
    category: "Art & Design",
    description: "Inspect visual aesthetics, color harmony, and futuristic design motifs.",
    imageUrl: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1000&q=80",
    suggestedPrompt: "Analyze the industrial design, lighting hierarchy, aesthetic vibe, and UI ergonomics of this device workspace.",
  },
];

export const WRITING_PRESETS: WritingPreset[] = [
  {
    id: "wr-sum",
    title: "Executive Summarizer",
    icon: "FileText",
    task: "summarize",
    description: "Condense long reports or technical documents into clear bullet points and key takeaways.",
    sampleInput: "Gemini 3.7 Flash is Google's high-efficiency frontier model designed to power real-time conversational agents, high-throughput code synthesis, and low-latency multimodal reasoning. By combining on-device optimization with cloud scalability, developers can achieve sub-100ms response times for everyday interactions while reserving deep computational steps for complex architectural reasoning.",
  },
  {
    id: "wr-hinglish",
    title: "Charismatic Hinglish Adapter",
    icon: "Languages",
    task: "hinglish-convert",
    description: "Transform formal English or Hindi into modern, conversational, charismatic Hinglish for social and casual team chat.",
    sampleInput: "Hey team, please make sure that all the pull requests are reviewed by 5 PM today so that we can proceed with the production deployment without any unexpected issues.",
  },
  {
    id: "wr-proof",
    title: "Grammar & Precision Polish",
    icon: "CheckCircle",
    task: "proofread",
    description: "Eliminate typos, enhance phrasing, improve readability, and review linguistic flow.",
    sampleInput: "The system are processing the request very slow because memory leak in background worker service which need to be fixed immediate before launching app to user.",
  },
  {
    id: "wr-email",
    title: "Client & Stakeholder Email",
    icon: "Mail",
    task: "email-draft",
    description: "Turn raw thoughts or meeting notes into a polished, persuasive, and professional email.",
    sampleInput: "Project Nexivo AI completed successfully ahead of deadline. MAX assistant is ready with Hindi, English, and Hinglish capabilities. Device actions and multimodal vision tests all passing. Asking client for review session on Thursday 3 PM.",
  },
];
