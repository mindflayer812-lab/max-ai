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

export const CATALOG_SAMPLES: CatalogSample[] = [
  {
    id: "gemini-hybrid",
    title: "Hybrid Inference Engine",
    shortDescription: "Seamless low-latency routing between local on-device ML Kit / Nano and Cloud Gemini 3.7 Flash.",
    fullDescription: "A pattern demonstrating a hybrid approach to generative AI assistant architecture: lightweight token tasks are processed on-device (Gemini Nano via ML Kit) with sub-50ms latency, while complex reasoning, deep code generation, and heavy multimodal workloads are seamlessly routed to Cloud Gemini 3.7 Flash.",
    iconName: "Cpu",
    category: "hybrid",
    badges: ["On-Device Nano", "Cloud Gemini 3.7", "Smart Fallback"],
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    architecture: "Hybrid (On-Device + Cloud Fallback)",
    defaultPrompt: "Explain how quantum computing principles differ from classical binary computation.",
    sampleInputs: [
      "Explain how quantum computing principles differ from classical binary computation.",
      "What is the difference between Kotlin StateFlow and LiveData in Jetpack Compose?",
      "Write a concise 2-sentence summary of the theory of relativity.",
      "Design a complete architecture for a high-availability microservices system.",
    ],
    docsUrl: "https://firebase.google.com/docs/ai-logic/get-started",
  },
  {
    id: "gemini-image-chat",
    title: "Nano Banana Image Studio",
    shortDescription: "Conversational image generation and styling with Gemini Flash image models.",
    fullDescription: "A creative AI image generation studio using the Gemini 3.1 Flash Image model (Nano Banana). It enables conversational image generation, prompt expansion, style variations, and multi-turn iterative visual tweaks.",
    iconName: "Image",
    category: "vision",
    badges: ["Nano Banana", "Image Generation", "Conversational Edit"],
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80",
    architecture: "Cloud (Gemini 3.7 Flash)",
    defaultPrompt: "A futuristic AI companion robot interface with glowing cyan holographic dials in a cybernetic lab.",
    sampleInputs: [
      "A futuristic AI companion robot interface with glowing cyan holographic dials in a cybernetic lab.",
      "A cozy solarpunk workstation with glass greenhouse walls, hanging orchids, and soft morning sunlight.",
      "A futuristic retro-wave hovercar gliding through a neon illuminated cyberpunk boulevard at dusk.",
      "A minimalist geometric blueprint celebrating space exploration in deep ultramarine and burnt orange.",
    ],
    docsUrl: "https://deepmind.google/models/gemini-image/pro/",
  },
  {
    id: "gemini-chatbot",
    title: "MAX Persona & Multilingual Chat",
    shortDescription: "Interactive conversational agent with customizable system personas, Hinglish tuning, and code assistance.",
    fullDescription: "An advanced assistant pattern utilizing Gemini 3.7 Flash with dynamic system instructions, Hinglish / Hindi code-switching, developer code synthesis, and multi-turn conversational context memory.",
    iconName: "MessageSquare",
    category: "text",
    badges: ["Hinglish Engine", "Persona Tuning", "Streaming Chat"],
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    architecture: "Cloud (Gemini 3.7 Flash)",
    defaultPrompt: "Explain how Android 15 edge-to-edge UI works and how to handle WindowInsets in Jetpack Compose.",
    sampleInputs: [
      "Explain how Android 15 edge-to-edge UI works and how to handle WindowInsets in Jetpack Compose.",
      "MAX, Hinglish mein explain karo ki Android NPU on-device AI kaise optimize karta hai.",
      "Help me debug an asynchronous race condition in a Kotlin Coroutines Flow pipeline.",
      "Write a complete Jetpack Compose TopAppBar with search filter animations.",
    ],
    docsUrl: "https://firebase.google.com/docs/ai-logic/system-instructions",
  },
  {
    id: "gemini-multimodal",
    title: "Multimodal Vision & Document OCR",
    shortDescription: "Analyze photos, technical schematics, handwritten notes, and documents with Gemini 3.7 Flash.",
    fullDescription: "A multimodal AI pattern leveraging Gemini 3.7 Flash to inspect complex images, identify electronic components, extract handwritten text via OCR, and answer complex visual reasoning questions.",
    iconName: "Eye",
    category: "multimodal",
    badges: ["Vision AI", "Image + Text", "Document OCR"],
    image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=800&q=80",
    architecture: "Cloud (Gemini 3.7 Flash)",
    defaultPrompt: "Inspect this circuit schematic, identify the microcontroller, resistors, and explain the voltage regulation flow.",
    sampleInputs: [
      "Inspect this circuit schematic, identify the microcontroller, resistors, and explain the voltage regulation flow.",
      "Perform OCR text extraction on these handwritten notes and organize them into action items.",
      "What key objects and color palettes are prominent in this composition?",
    ],
    docsUrl: "https://developer.android.com/ai/gemini/developer-api",
  },
  {
    id: "genai-summarization",
    title: "On-Device Summarization",
    shortDescription: "Ultra-fast text summarization and bullet point extraction with ML Kit GenAI.",
    fullDescription: "A sample letting you summarize long documents, technical articles, meeting notes, and system logs with zero server latency using on-device GenAI models and smart fallback.",
    iconName: "FileText",
    category: "text",
    badges: ["Summarization", "On-Device ML Kit", "Key Takeaways"],
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    architecture: "On-Device (ML Kit)",
    defaultPrompt: "Summarize the architectural differences between monolithic and microservices systems, focusing on latency, scalability, and deployment complexity.",
    sampleInputs: [
      "Summarize the architectural differences between monolithic and microservices systems, focusing on latency, scalability, and deployment complexity.",
      "Summarize this 10-page software architecture design document into 5 executive action items.",
    ],
    docsUrl: "https://developers.google.com/ml-kit/genai/summarization/android",
  },
  {
    id: "genai-writing-assistance",
    title: "Writing & Hinglish Tone Adapter",
    shortDescription: "Proofread, restructure, and transform tone (Formal, Casual, Concise, Hinglish).",
    fullDescription: "A writing assistance pattern letting you proofread, polish, and adapt text tone for emails, technical proposals, Slack updates, and charismatic Hinglish chats.",
    iconName: "PenTool",
    category: "text",
    badges: ["Proofreading", "Hinglish Adapter", "Tone Shifter"],
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80",
    architecture: "On-Device (ML Kit)",
    defaultPrompt: "The system are having memory leaks in background coroutine worker which need to be fixed immediate before launching app to production.",
    sampleInputs: [
      "The system are having memory leaks in background coroutine worker which need to be fixed immediate before launching app to production.",
      "Hey team, please review all PRs by 5 PM today so we can proceed with deployment.",
    ],
    docsUrl: "https://developers.google.com/ml-kit/genai/rewriting/android",
  },
  {
    id: "gemini-video-metadata-creation",
    title: "Video Metadata & Chapter Generator",
    shortDescription: "Generate SEO titles, timestamps, hashtags, and social descriptions for tech walkthroughs.",
    fullDescription: "A sample using Gemini Flash to generate automated timestamps, SEO descriptions, hashtag clusters, account tags, chapters, and executive summary links from video concepts and transcripts.",
    iconName: "Video",
    category: "video",
    badges: ["Video Chapters", "SEO Metadata", "Hashtag Clusters"],
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80",
    architecture: "Cloud (Gemini 3.7 Flash)",
    defaultPrompt: "Building Offline-First Android Apps with Jetpack Compose, Room Database, and Gemini Nano ML Kit.",
    sampleInputs: [
      "Building Offline-First Android Apps with Jetpack Compose, Room Database, and Gemini Nano ML Kit.",
      "Comprehensive Guide to Google AI Studio, Gemini 3.7 Flash, and Android Multimodal Development.",
    ],
    docsUrl: "https://firebase.google.com/docs/ai-logic/analyze-video",
  },
  {
    id: "gemini-live-todo",
    title: "Live Voice & Device Action Dispatcher",
    shortDescription: "Voice-driven interactive action engine powered by real-time Gemini intent parsing.",
    fullDescription: "A voice-first assistant dispatcher using Gemini to parse spoken natural language, extract device parameters (alarms, reminders, radio toggles, flashlight), and trigger Android system actions with permission gates.",
    iconName: "CheckSquare",
    category: "audio",
    badges: ["Voice Intent", "Device Dispatch", "Permission Aware"],
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=800&q=80",
    architecture: "Cloud (Gemini 3.7 Flash)",
    defaultPrompt: "Set alarm for 6:30 AM tomorrow, check phone battery health, and remind me to deploy Nexivo AI at 3 PM.",
    sampleInputs: [
      "Set alarm for 6:30 AM tomorrow, check phone battery health, and remind me to deploy Nexivo AI at 3 PM.",
      "Turn off Wi-Fi after midnight and toggle flashlight on.",
    ],
    docsUrl: "https://developer.android.com/ai/gemini/live",
  },
];
