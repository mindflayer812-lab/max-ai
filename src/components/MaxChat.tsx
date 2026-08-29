import React, { useState, useEffect, useRef } from "react";
import { ChatMessage, Language, AssistantMode, DeviceAction, DeviceState } from "../types";
import { QUICK_PROMPTS } from "../data/samplePrompts";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Terminal,
  ShieldCheck,
  Download,
  Trash2,
  Wand2,
  Brain,
  Code2,
  Globe,
} from "lucide-react";

interface MaxChatProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  assistantMode: AssistantMode;
  onAssistantModeChange: (mode: AssistantMode) => void;
  deviceState: DeviceState;
  onExecuteDeviceAction: (action: DeviceAction) => void;
}

export const MaxChat: React.FC<MaxChatProps> = ({
  language,
  onLanguageChange,
  assistantMode,
  onAssistantModeChange,
  deviceState,
  onExecuteDeviceAction,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("nexivo_chat_messages");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "msg-welcome",
        role: "assistant",
        content: `**Namaste & Welcome! I am MAX**, your futuristic AI intelligence assistant in Nexivo AI. 🚀\n\nI can assist you with:\n- **Conversations & Reasoning** in natural **Hinglish, English, or Hindi**\n- **Device Actions & System Tasks** (e.g. "Set 6:30 AM alarm", "Check battery health", "Toggle flashlight")\n- **Code Synthesis & Architecture** in Jetpack Compose, Kotlin, TypeScript, Python, etc.\n- **Deep Analysis & Summarization**\n\nHow can I help you today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language: "hinglish",
        mode: "general",
      },
    ];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Persist messages
  useEffect(() => {
    try {
      localStorage.setItem("nexivo_chat_messages", JSON.stringify(messages));
    } catch (e) {
      console.error(e);
    }
  }, [messages]);

  // Setup Speech Recognition if available in browser
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === "hindi" ? "hi-IN" : language === "hinglish" ? "hi-IN" : "en-US";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Fallback simulated voice input
      setIsListening(true);
      setTimeout(() => {
        setInput(
          language === "hinglish"
            ? "MAX, mera system diagnostic check karo aur battery optimize karo"
            : language === "hindi"
            ? "MAX, कृपया मेरे फोन का बैटरी स्टेटस बताएं"
            : "MAX, check my system diagnostics and schedule a standup reminder for 10 AM"
        );
        setIsListening(false);
      }, 1800);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
        setIsListening(false);
      }
    }
  };

  // Text-To-Speech reader
  const handleSpeak = (id: string, text: string) => {
    if (!("speechSynthesis" in window)) return;

    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown symbols for cleaner speech
    const cleanText = text.replace(/[*#`_\[\]]/g, "").replace(/\[DEVICE_ACTION:.*?\]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.lang = language === "hindi" ? "hi-IN" : "en-US";

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to reset the conversation history?")) {
      const resetMsg: ChatMessage = {
        id: "msg-welcome-" + Date.now(),
        role: "assistant",
        content: `**MAX is refreshed and ready.** How can I assist you now?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language,
        mode: assistantMode,
      };
      setMessages([resetMsg]);
    }
  };

  const handleDownloadTranscript = () => {
    const transcript = messages
      .map((m) => `[${m.timestamp}] ${m.role.toUpperCase()} (${m.mode || "general"}): \n${m.content}\n`)
      .join("\n----------------------------------------\n\n");
    const blob = new Blob([transcript], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexivo_max_chat_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      language,
      mode: assistantMode,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      // Check if this looks like a device command first
      const lower = textToSend.toLowerCase();
      const isDeviceCommand =
        lower.includes("alarm") ||
        lower.includes("reminder") ||
        lower.includes("wifi") ||
        lower.includes("bluetooth") ||
        lower.includes("flashlight") ||
        lower.includes("battery") ||
        lower.includes("torch") ||
        lower.includes("optimize");

      let detectedDeviceAction: DeviceAction | undefined = undefined;

      if (isDeviceCommand) {
        try {
          const actionRes = await fetch("/api/device-action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userCommand: textToSend,
              currentDeviceState: deviceState,
            }),
          });
          const actionData = await actionRes.json();
          if (actionData.actionType) {
            detectedDeviceAction = {
              id: "action-" + Date.now(),
              actionType: actionData.actionType,
              actionName: actionData.actionName || "Device Action",
              status: actionData.status || "ready_for_permission",
              requiredPermissions: actionData.requiredPermissions || [],
              details: actionData.details || {},
              confirmationText: actionData.confirmationText || "Action prepared.",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            };
          }
        } catch (e) {
          console.error("Device action check error:", e);
        }
      }

      // Send to Chat endpoint
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
          language,
          mode: assistantMode,
        }),
      });

      const data = await chatRes.json();
      let responseText = data.text || "I have received your request and processed it.";

      // If device action was detected, prepend or append context
      if (detectedDeviceAction && !responseText.includes(detectedDeviceAction.actionName)) {
        responseText = `${detectedDeviceAction.confirmationText}\n\n${responseText}`;
      }

      const assistantMessage: ChatMessage = {
        id: "asst-" + Date.now(),
        role: "assistant",
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language,
        mode: assistantMode,
        deviceAction: detectedDeviceAction,
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: "err-" + Date.now(),
        role: "assistant",
        content: `⚠️ Sorry, I encountered an issue connecting to the AI model. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        language,
        mode: assistantMode,
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Render markdown helper
  const renderFormattedContent = (content: string) => {
    // Check for code blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith("```") && part.endsWith("```")) {
        const lines = part.slice(3, -3).trim().split("\n");
        const lang = lines[0].trim();
        const code = lines.slice(1).join("\n");
        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 font-mono text-xs shadow-lg">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400">
                <Terminal className="w-3.5 h-3.5" />
                {lang || "code"}
              </span>
              <button
                onClick={() => handleCopy(`code-${index}`, code)}
                className="flex items-center gap-1 text-[10px] hover:text-white px-2 py-0.5 rounded bg-slate-800"
              >
                {copiedId === `code-${index}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedId === `code-${index}` ? "Copied" : "Copy Code"}</span>
              </button>
            </div>
            <pre className="p-3.5 overflow-x-auto text-slate-200 leading-relaxed">
              <code>{code || lang}</code>
            </pre>
          </div>
        );
      }

      // Regular markdown paragraphs
      const lines = part.split("\n");
      return (
        <div key={index} className="space-y-2">
          {lines.map((line, lIdx) => {
            if (!line.trim()) return <div key={lIdx} className="h-1" />;

            // Bullet points
            if (line.startsWith("- ") || line.startsWith("* ") || line.startsWith("• ")) {
              const text = line.replace(/^[-*•]\s+/, "");
              return (
                <div key={lIdx} className="flex items-start gap-2 text-sm leading-relaxed pl-1">
                  <span className="text-cyan-400 mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                  <span>{renderBoldAndLinks(text)}</span>
                </div>
              );
            }

            // Headers
            if (line.startsWith("### ")) {
              return <h4 key={lIdx} className="font-bold text-slate-100 text-base mt-2">{line.replace("### ", "")}</h4>;
            }
            if (line.startsWith("## ")) {
              return <h3 key={lIdx} className="font-bold text-cyan-300 text-lg mt-2">{line.replace("## ", "")}</h3>;
            }
            if (line.startsWith("# ")) {
              return <h2 key={lIdx} className="font-extrabold text-white text-xl mt-3">{line.replace("# ", "")}</h2>;
            }

            return <p key={lIdx} className="text-sm leading-relaxed">{renderBoldAndLinks(line)}</p>;
          })}
        </div>
      );
    });
  };

  const renderBoldAndLinks = (text: string) => {
    const boldParts = text.split(/(\*\*.*?\*\*)/g);
    return boldParts.map((bPart, idx) => {
      if (bPart.startsWith("**") && bPart.endsWith("**")) {
        return <strong key={idx} className="font-bold text-white text-slate-100">{bPart.slice(2, -2)}</strong>;
      }
      return bPart;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[600px] bg-slate-900/60 backdrop-blur-md rounded-2xl border border-slate-800/80 shadow-2xl overflow-hidden">
      {/* Chat Subheader / Controls */}
      <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold text-white tracking-wide uppercase">MAX Assistant Active</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 capitalize font-medium">{language}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 text-xs">
            {assistantMode === "code" ? (
              <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            ) : assistantMode === "reasoning" ? (
              <Brain className="w-3.5 h-3.5 text-purple-400" />
            ) : (
              <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span className="text-slate-300 capitalize font-medium">{assistantMode} Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Language Toggle */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
            <button
              id="chat-lang-hinglish"
              onClick={() => onLanguageChange("hinglish")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                language === "hinglish" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400"
              }`}
            >
              Hinglish
            </button>
            <button
              id="chat-lang-english"
              onClick={() => onLanguageChange("english")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                language === "english" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400"
              }`}
            >
              EN
            </button>
            <button
              id="chat-lang-hindi"
              onClick={() => onLanguageChange("hindi")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all ${
                language === "hindi" ? "bg-cyan-500/20 text-cyan-300 font-bold" : "text-slate-400"
              }`}
            >
              हिंदी
            </button>
          </div>

          <button
            id="btn-download-transcript"
            onClick={handleDownloadTranscript}
            title="Download Transcript"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all border border-transparent hover:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            id="btn-clear-chat"
            onClick={handleClearChat}
            title="Clear Chat History"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => {
          const isAssistant = msg.role === "assistant";
          const isSpeaking = speakingMessageId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${isAssistant ? "justify-start" : "justify-end flex-row-reverse"}`}
            >
              {/* Avatar */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                  isAssistant
                    ? "bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white ring-1 ring-cyan-400/30"
                    : "bg-slate-700 text-slate-200"
                }`}
              >
                {isAssistant ? <Sparkles className="w-4 h-4" /> : <span className="text-xs font-bold">YOU</span>}
              </div>

              {/* Bubble */}
              <div className={`max-w-2xl group flex flex-col ${isAssistant ? "items-start" : "items-end"}`}>
                <div
                  className={`relative px-4 py-3.5 rounded-2xl shadow-md text-slate-100 ${
                    isAssistant
                      ? "bg-slate-800/90 border border-slate-700/80 rounded-tl-sm text-slate-200"
                      : "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-sm"
                  }`}
                >
                  {/* Content */}
                  <div className="space-y-1">{renderFormattedContent(msg.content)}</div>

                  {/* Attached Device Action Card */}
                  {msg.deviceAction && (
                    <div className="mt-3.5 p-3 rounded-xl bg-slate-950/80 border border-cyan-500/30 shadow-inner flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Smartphone className="w-4 h-4 text-cyan-400" />
                          <span className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
                            {msg.deviceAction.actionName}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                          {msg.deviceAction.status === "executed" ? "Executed" : "Permission Required"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">
                        {msg.deviceAction.confirmationText}
                      </p>

                      {msg.deviceAction.status !== "executed" && (
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            id={`btn-exec-action-${msg.deviceAction.id}`}
                            onClick={() => onExecuteDeviceAction(msg.deviceAction!)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-xs font-semibold shadow hover:brightness-110 transition-all"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Allow & Execute</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer metadata & actions */}
                <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-slate-500">
                  <span>{msg.timestamp}</span>
                  {isAssistant && (
                    <>
                      <span>•</span>
                      <button
                        id={`btn-copy-${msg.id}`}
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="hover:text-slate-300 flex items-center gap-1 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>

                      <span>•</span>
                      <button
                        id={`btn-speak-${msg.id}`}
                        onClick={() => handleSpeak(msg.id, msg.content)}
                        className={`flex items-center gap-1 transition-colors ${
                          isSpeaking ? "text-cyan-400 font-semibold" : "hover:text-slate-300"
                        }`}
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3 h-3 animate-pulse text-cyan-400" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Read Aloud</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/80 border border-slate-700/80 px-4 py-3.5 rounded-2xl rounded-tl-sm shadow-md flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce [animation-delay:0.4s]"></span>
              <span className="text-xs text-slate-400 ml-1 font-medium">MAX is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800/60 overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
          Suggestions:
        </span>
        {QUICK_PROMPTS.slice(0, 5).map((qp) => (
          <button
            key={qp.id}
            id={`qp-${qp.id}`}
            onClick={() => {
              onLanguageChange(qp.language);
              onAssistantModeChange(qp.mode);
              handleSend(qp.prompt);
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white whitespace-nowrap transition-all shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-3.5 sm:p-4 bg-slate-950 border-t border-slate-800/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 sm:gap-3"
        >
          {/* Voice Input Button */}
          <button
            type="button"
            id="btn-voice-input"
            onClick={toggleListening}
            className={`p-3 rounded-xl border transition-all flex items-center justify-center flex-shrink-0 ${
              isListening
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 ring-2 ring-rose-500/30 animate-pulse"
                : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800"
            }`}
            title={isListening ? "Listening... Click to stop" : "Voice input"}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <div className="relative flex-1">
            <input
              id="chat-input-field"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                language === "hinglish"
                  ? "Ask MAX anything in Hinglish, English ya Hindi..."
                  : language === "hindi"
                  ? "MAX से हिंदी या हिंग्लिश में कुछ भी पूछें..."
                  : "Ask MAX anything, generate code, or trigger device actions..."
              }
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500/60 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            id="btn-send-message"
            disabled={!input.trim() || isLoading}
            className="p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-cyan-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
