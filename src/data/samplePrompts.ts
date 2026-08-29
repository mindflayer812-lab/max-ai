export interface QuickPrompt {
  id: string;
  category: "Everyday" | "Hinglish & Hindi" | "Coding & Tech" | "Device Action" | "Reasoning";
  label: string;
  prompt: string;
  language: "hinglish" | "english" | "hindi";
  mode: "general" | "code" | "reasoning" | "creative";
  iconName: string;
}

export const QUICK_PROMPTS: QuickPrompt[] = [
  {
    id: "hinglish-daily",
    category: "Hinglish & Hindi",
    label: "Kal ka schedule & reminder",
    prompt: "MAX, mujhe kal subah 9 baje important team meeting ka reminder lagana hai aur ek quick motivational quote bhi chahiye.",
    language: "hinglish",
    mode: "general",
    iconName: "Clock",
  },
  {
    id: "hinglish-tech",
    category: "Hinglish & Hindi",
    label: "React vs Kotlin Compose samjhao",
    prompt: "Jetpack Compose aur React Native ke beech main differences simple Hinglish mein explain karo with real-life examples.",
    language: "hinglish",
    mode: "code",
    iconName: "Code",
  },
  {
    id: "hindi-explain",
    category: "Hinglish & Hindi",
    label: "आर्टिफिशियल इंटेलिजेंस क्या है?",
    prompt: "कृत्रिम बुद्धिमत्ता (AI) और मशीन लर्निंग कैसे काम करते हैं? सरल हिंदी में समझाइए।",
    language: "hindi",
    mode: "general",
    iconName: "Globe",
  },
  {
    id: "device-alarm",
    category: "Device Action",
    label: "Set 6:30 AM Gym Alarm",
    prompt: "Set an alarm for tomorrow morning at 6:30 AM with label 'Gym Workout'.",
    language: "english",
    mode: "general",
    iconName: "Bell",
  },
  {
    id: "device-battery",
    category: "Device Action",
    label: "Run Battery & System Diagnostics",
    prompt: "Check my phone's battery health, background RAM usage, and optimize background services.",
    language: "english",
    mode: "general",
    iconName: "BatteryCharging",
  },
  {
    id: "device-wifi",
    category: "Device Action",
    label: "Toggle Wi-Fi & Hotspot",
    prompt: "Turn on Wi-Fi and verify network security protocols.",
    language: "english",
    mode: "general",
    iconName: "Wifi",
  },
  {
    id: "code-kotlin",
    category: "Coding & Tech",
    label: "Write Kotlin Coroutine Flow",
    prompt: "Write a production-ready Kotlin Jetpack Compose ViewModel using StateFlow, Coroutines, and Repository pattern for fetching user data.",
    language: "english",
    mode: "code",
    iconName: "Terminal",
  },
  {
    id: "reason-deep",
    category: "Reasoning",
    label: "Hybrid Edge vs Cloud AI Tradeoffs",
    prompt: "Analyze the trade-offs between On-Device AI (Gemini Nano / NPU) vs Cloud AI (Gemini 3.7 Flash) in terms of latency, privacy, battery life, and model accuracy.",
    language: "english",
    mode: "reasoning",
    iconName: "BrainCircuit",
  },
  {
    id: "creative-story",
    category: "Everyday",
    label: "Futuristic Cyberpunk Story",
    prompt: "Write a short, thrilling micro-story about an AI assistant named MAX who helped an indie developer save a smart metropolis from a cyber glitch.",
    language: "english",
    mode: "creative",
    iconName: "Sparkles",
  },
];
