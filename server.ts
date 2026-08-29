import express from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy Google GenAI initialization with User-Agent header
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// 1. Health check & System state
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    appName: "Nexivo AI",
    assistant: "MAX",
    hasApiKey: !!process.env.GEMINI_API_KEY,
    model: "gemini-3.7-flash",
    timestamp: new Date().toISOString(),
  });
});

// Helper for MAX system instruction based on language & mode
function buildMaxSystemInstruction(language: string = "hinglish", mode: string = "general"): string {
  let langGuidance = "";
  if (language === "hindi") {
    langGuidance = "Respond primarily in clear, natural Hindi (Devanagari script), keeping technical terms accessible.";
  } else if (language === "hinglish") {
    langGuidance = "Respond in natural, fluent Hinglish (Roman script mix of Hindi and English, e.g., 'Haan bilkul! Main abhi aapka kaam kar deta hoon. Here are the details...'). This is very popular and conversational.";
  } else {
    langGuidance = "Respond in clear, articulate, modern English.";
  }

  let modeGuidance = "";
  if (mode === "code") {
    modeGuidance = "You are in Developer & Code mode. Write clean, idiomatic code with syntax highlighting, concise technical explanations, best practices, and edge-case handling.";
  } else if (mode === "reasoning") {
    modeGuidance = "You are in Deep Reasoning mode. Provide structured, step-by-step analytical reasoning, pros & cons, and clear final takeaways.";
  } else if (mode === "creative") {
    modeGuidance = "You are in Creative Writer mode. Use engaging storytelling, vivid metaphors, and dynamic phrasing.";
  } else {
    modeGuidance = "You are in General Fast Assistant mode. Provide rapid, practical, and highly useful answers.";
  }

  return `You are MAX, the futuristic, highly intelligent, friendly, and ultra-fast AI assistant powering Nexivo AI.
Personality traits:
- Quick, sharp, polite, knowledgeable, and slightly futuristic.
- Seamlessly adapt tone to the user.
- If the user asks about device commands (e.g., set alarm, toggle flashlight, check battery, send WhatsApp/SMS, take notes, calendar, wifi), acknowledge the action crisply and include an action code block if relevant: [DEVICE_ACTION: {"type": "ACTION_NAME", "summary": "..."}].

Language instruction:
${langGuidance}

Task mode:
${modeGuidance}`;
}

// 2. MAX Chatbot & Live Intelligence
app.post("/api/chat", async (req, res) => {
  const { messages, language = "hinglish", mode = "general", temperature = 0.7 } = req.body;
  try {
    const ai = getGenAI();
    const systemInstruction = buildMaxSystemInstruction(language, mode);

    if (!ai) {
      // Smart simulated assistant response with Hinglish/Hindi support
      const lastMsg = messages?.[messages.length - 1]?.content || "Hello";
      let mockReply = "";
      if (language === "hinglish") {
        mockReply = `**MAX here!** 👋\n\nAapka request mil gaya: "${lastMsg}".\n\nAbhi main local offline engine mein run ho raha hoon. Gemini 3.7 Flash ki full supercharged capabilities ke liye, aap Settings > Secrets mein apni **GEMINI_API_KEY** attach kar sakte hain! Main coding, Hindi/Hinglish reasoning, device commands, aur visual analysis ke liye fully ready hoon! 🚀`;
      } else if (language === "hindi") {
        mockReply = `**नमस्ते! मैं हूँ MAX (Nexivo AI)** 👋\n\nमैंने आपका संदेश प्राप्त कर लिया है: "${lastMsg}"।\n\nअभी मैं लोकल सिमुलेशन मोड में हूँ। पूर्ण गति और बुद्धिमत्ता के लिए सेटिंग्स में अपनी GEMINI_API_KEY जोड़ें। मैं आपकी सहायता के लिए सदैव तत्पर हूँ!`;
      } else {
        mockReply = `**MAX is online!** ⚡\n\nReceived your message: "${lastMsg}".\n\nRunning in local offline fallback engine. To unlock live cloud Gemini 3.7 Flash intelligence, attach your API key in Settings > Secrets. I can assist you with code, reasoning, multimodal analysis, and device tasks!`;
      }

      return res.json({
        text: mockReply,
        mode: "simulated",
      });
    }

    // Build chat contents
    const contents = (messages || []).map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents,
      config: {
        systemInstruction,
        temperature: Number(temperature) || 0.7,
      },
    });

    res.json({
      text: response.text || "I'm ready. How can I assist you today?",
      mode: "live",
    });
  } catch (error: any) {
    console.error("MAX Chat API error:", error);
    res.status(500).json({ error: error.message || "Failed to generate MAX chat response" });
  }
});

// 3. Multimodal Image, Document & Code Understanding
app.post("/api/multimodal", async (req, res) => {
  const { prompt, imageBase64, mimeType = "image/jpeg", language = "english" } = req.body;
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.json({
        text: `[MAX Vision Engine - Offline Mode]: Image received successfully. Analysis for prompt: "${prompt || "Analyze visual elements"}". In live mode with GEMINI_API_KEY, MAX inspects high-resolution visual features, detects objects, translates text, extracts OCR, and provides structured explanations.`,
      });
    }

    const systemInstruction = `You are MAX, the multimodal visual analyst of Nexivo AI. Inspect the provided image in detail. Provide clear, structured, well-formatted observations, OCR text if present, object breakdowns, or solutions to visual queries. Reply in ${language}.`;

    const parts: any[] = [
      { text: prompt || "Provide a detailed visual breakdown of this image, identify key objects, text, and context." },
    ];

    if (imageBase64) {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");
      parts.push({
        inlineData: {
          mimeType,
          data: cleanBase64,
        },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: { parts },
      config: {
        systemInstruction,
      },
    });

    res.json({ text: response.text || "No response generated." });
  } catch (error: any) {
    console.error("Multimodal error:", error);
    res.status(500).json({ error: error.message || "Multimodal vision analysis failed" });
  }
});

// 4. Device Actions & Permissions Simulator
app.post("/api/device-action", async (req, res) => {
  const { userCommand, currentDeviceState } = req.body;
  try {
    const ai = getGenAI();
    if (!ai) {
      // Rule-based fallback for simulated actions
      const cmd = (userCommand || "").toLowerCase();
      if (cmd.includes("alarm") || cmd.includes("wake")) {
        return res.json({
          actionType: "SET_ALARM",
          actionName: "Set Alarm",
          status: "ready_for_permission",
          requiredPermissions: ["android.permission.SET_ALARM"],
          details: { time: "07:00 AM", label: "Morning Wakeup" },
          confirmationText: "I've drafted an alarm for 7:00 AM. Please grant alarm permission to arm it.",
        });
      } else if (cmd.includes("wifi") || cmd.includes("wi-fi")) {
        return res.json({
          actionType: "TOGGLE_WIFI",
          actionName: "Toggle Wi-Fi",
          status: "ready_for_permission",
          requiredPermissions: ["android.permission.CHANGE_WIFI_STATE"],
          details: { newState: true },
          confirmationText: "Requesting permission to toggle Wi-Fi connectivity.",
        });
      } else if (cmd.includes("battery") || cmd.includes("power")) {
        return res.json({
          actionType: "CHECK_BATTERY",
          actionName: "Battery Diagnostic & Optimization",
          status: "executed",
          requiredPermissions: ["android.permission.BATTERY_STATS"],
          details: { level: 84, isCharging: false, estimatedHoursLeft: 9.5, health: "Good" },
          confirmationText: "Battery is at 84% (Good health). Estimated ~9.5 hours remaining. Background apps optimized.",
        });
      } else if (cmd.includes("flashlight") || cmd.includes("torch")) {
        return res.json({
          actionType: "TOGGLE_FLASHLIGHT",
          actionName: "Toggle Flashlight",
          status: "ready_for_permission",
          requiredPermissions: ["android.permission.CAMERA"],
          details: { newState: true },
          confirmationText: "Torch ready to switch state upon camera hardware permission approval.",
        });
      } else {
        return res.json({
          actionType: "CREATE_REMINDER",
          actionName: "Create Smart Reminder",
          status: "ready_for_permission",
          requiredPermissions: ["android.permission.READ_CALENDAR", "android.permission.WRITE_CALENDAR"],
          details: { title: userCommand, time: "Today at 5:00 PM" },
          confirmationText: `Scheduled reminder: "${userCommand}" for 5:00 PM today.`,
        });
      }
    }

    const prompt = `You are the Android Device Action Parser for MAX in Nexivo AI.
The user wants to execute: "${userCommand}".
Current device context: ${JSON.stringify(currentDeviceState || {})}.

Map this request to a concrete Android device action. Return a JSON object with:
- actionType: one of ["SET_ALARM", "CREATE_REMINDER", "TOGGLE_WIFI", "TOGGLE_BLUETOOTH", "TOGGLE_FLASHLIGHT", "CHECK_BATTERY", "SEND_MESSAGE", "OPTIMIZE_MEMORY", "OPEN_APP", "SYSTEM_DIAGNOSTICS"]
- actionName: friendly title of action
- status: "ready_for_permission" or "executed"
- requiredPermissions: array of Android permission strings (e.g. ["android.permission.SET_ALARM", "android.permission.CAMERA"])
- details: key-value object of parameters (e.g. time, label, targetApp, recipient, text)
- confirmationText: friendly confirmation message from MAX explaining what was prepared/performed (in Hinglish if input is Hinglish, otherwise English).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let data;
    try {
      data = JSON.parse(response.text || "{}");
    } catch {
      data = {
        actionType: "CREATE_REMINDER",
        actionName: "Smart Action",
        status: "ready_for_permission",
        requiredPermissions: ["android.permission.INTERNET"],
        details: { command: userCommand },
        confirmationText: `Command received: "${userCommand}". Ready to execute.`,
      };
    }

    res.json(data);
  } catch (error: any) {
    console.error("Device action error:", error);
    res.status(500).json({ error: error.message || "Failed to process device action" });
  }
});

// 5. Writing, Summarization & Hinglish Conversational Polisher
app.post("/api/summarize-write", async (req, res) => {
  const { text, task = "summarize", tone = "concise", targetLanguage = "hinglish" } = req.body;
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.json({
        result: `[MAX Writing Suite - Simulated Output for ${task}]:\n\n• Key Point 1: Core message synthesized efficiently.\n• Key Point 2: Preserved factual integrity with ${tone} tone.\n• Key Point 3: Adjusted style for ${targetLanguage} audience.`,
      });
    }

    let instruction = "";
    if (task === "summarize") {
      instruction = `Summarize the input text into a high-impact bulleted summary followed by a 1-sentence bottom line. Tone: ${tone}. Language: ${targetLanguage}.`;
    } else if (task === "proofread") {
      instruction = `Proofread the text, fix grammar, spelling, and phrasing. Return the polished version followed by a concise list of corrections made. Tone: ${tone}.`;
    } else if (task === "hinglish-convert") {
      instruction = `Convert and adapt the text into natural, modern, charismatic Hinglish (Roman script mix of Hindi and English) suitable for Indian tech users and social messaging.`;
    } else if (task === "email-draft") {
      instruction = `Draft a professional yet approachable email based on the following notes. Tone: ${tone}. Include a compelling Subject Line and clean signoff.`;
    } else {
      instruction = `Rewrite the text with a ${tone} tone and style for ${targetLanguage} format.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: `${instruction}\n\nInput Text:\n${text}`,
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Summarize/Rewrite error:", error);
    res.status(500).json({ error: error.message || "Writing operation failed" });
  }
});

// 6. Hybrid Latency & Inference Benchmark (On-Device Nano vs Cloud Gemini 3.7 Flash)
app.post("/api/hybrid", async (req, res) => {
  const { prompt, mode = "hybrid" } = req.body;
  try {
    const ai = getGenAI();
    const startTime = Date.now();

    if (!ai) {
      const isNano = mode === "on-device";
      return res.json({
        result: isNano
          ? `[Simulated On-Device Gemini Nano]: Processed "${prompt.slice(0, 40)}..." in ultra-low latency local memory cache.`
          : `[Simulated Cloud Gemini 3.7 Flash]: Deep reasoning executed with multi-step reasoning tokens for: "${prompt.slice(0, 40)}...".`,
        latencyMs: isNano ? 35 : 210,
        tokensGenerated: isNano ? 48 : 280,
        routedTo: isNano ? "On-Device Gemini Nano (Local NPU/ML Kit)" : "Cloud Gemini 3.7 Flash",
        memoryFootprint: isNano ? "128 MB RAM" : "0 MB (Cloud Offloaded)",
      });
    }

    if (mode === "on-device") {
      // Simulate fast on-device lightweight execution
      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: `Provide a quick, concise answer in maximum 2 sentences: ${prompt}`,
        config: {
          temperature: 0.2,
        },
      });
      const latencyMs = Date.now() - startTime;
      return res.json({
        result: response.text,
        latencyMs,
        tokensGenerated: 42,
        routedTo: "On-Device Gemini Nano (Simulated Local NPU)",
        memoryFootprint: "142 MB RAM",
      });
    }

    // Cloud Deep Reasoning
    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are MAX running on Cloud Gemini 3.7 Flash. Provide a thorough, structured, and deep explanation with bullet points and key takeaways.",
        temperature: 0.7,
      },
    });
    const latencyMs = Date.now() - startTime;
    return res.json({
      result: response.text,
      latencyMs,
      tokensGenerated: 310,
      routedTo: "Cloud Gemini 3.7 Flash",
      memoryFootprint: "0 MB (Cloud Offloaded)",
    });
  } catch (error: any) {
    console.error("Hybrid API error:", error);
    res.status(500).json({ error: error.message || "Hybrid generation failed" });
  }
});

// 7. Image Generation (Nano Banana Lite)
app.post("/api/generate-image", async (req, res) => {
  const { prompt, aspectRatio = "1:1" } = req.body;
  try {
    const ai = getGenAI();
    if (!ai) {
      return res.json({
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
        prompt,
        notice: "Demo cybernetic visual served. Connect GEMINI_API_KEY in Settings > Secrets for live image generation.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-image",
      contents: {
        parts: [{ text: `${prompt}, futuristic neon sleek aesthetic, high resolution, 8k render` }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    let imageUrl = "";
    let textOutput = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
        } else if (part.text) {
          textOutput += part.text;
        }
      }
    }

    if (!imageUrl) {
      return res.json({
        textOutput,
        imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80",
        notice: "Fallback visual rendered.",
      });
    }

    res.json({ imageUrl, textOutput });
  } catch (error: any) {
    console.error("Image generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate image" });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Nexivo AI (MAX) server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
