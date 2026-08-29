import React, { useState } from "react";
import { CatalogSample } from "../../types";
import {
  X,
  Sparkles,
  Send,
  Cpu,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  Clock,
  Play,
  RotateCcw,
  Sliders,
  ExternalLink,
  Tag,
  Copy,
  Check,
} from "lucide-react";

interface SampleRunnerModalProps {
  sample: CatalogSample | null;
  onClose: () => void;
}

export const SampleRunnerModal: React.FC<SampleRunnerModalProps> = ({
  sample,
  onClose,
}) => {
  if (!sample) return null;

  const [prompt, setPrompt] = useState(sample.defaultPrompt || "");
  const [output, setOutput] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Specific state for samples
  const [hybridMode, setHybridMode] = useState<"on-device" | "cloud">("on-device");
  const [hybridMetrics, setHybridMetrics] = useState<{ latencyMs: number; routedTo: string } | null>(null);
  const [systemInstruction, setSystemInstruction] = useState("You are an expert AI assistant with a friendly, knowledgeable persona.");
  const [writingTone, setWritingTone] = useState<"concise" | "formal" | "casual" | "poetic">("concise");
  const [videoTopic, setVideoTopic] = useState("Paris Architecture & Culinary Hidden Gems");
  const [videoMetadata, setVideoMetadata] = useState<any>(null);

  const handleRun = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setOutput("");
    setImageUrl("");

    try {
      if (sample.id === "gemini-hybrid") {
        const res = await fetch("/api/hybrid", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, mode: hybridMode }),
        });
        const data = await res.json();
        setOutput(data.result || "Generation finished.");
        setHybridMetrics({ latencyMs: data.latencyMs, routedTo: data.routedTo });
      } else if (sample.id === "gemini-image-chat") {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        if (data.imageUrl) setImageUrl(data.imageUrl);
        setOutput(data.textOutput || data.notice || "Image rendered successfully.");
      } else if (sample.id === "gemini-chatbot" || sample.id === "gemini-live-todo") {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [{ role: "user", content: prompt }],
            systemInstruction,
          }),
        });
        const data = await res.json();
        setOutput(data.text || "No response generated.");
      } else if (sample.id === "gemini-multimodal") {
        const res = await fetch("/api/multimodal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();
        setOutput(data.text || "Multimodal vision analysis complete.");
      } else if (sample.id === "genai-summarization" || sample.id === "genai-writing-assistance") {
        const task = sample.id === "genai-summarization" ? "summarize" : "rewrite";
        const res = await fetch("/api/summarize-write", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: prompt, task, tone: writingTone }),
        });
        const data = await res.json();
        setOutput(data.result || "Operation finished.");
      } else if (sample.id === "gemini-video-metadata-creation") {
        const res = await fetch("/api/video-metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ videoTitle: prompt, videoTopic: prompt }),
        });
        const data = await res.json();
        setVideoMetadata(data.metadata);
        setOutput(data.metadata?.description || "Metadata created.");
      }
    } catch (e: any) {
      setOutput(`Error: ${e.message || "Failed to execute demo"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{sample.title}</h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
                  {sample.architecture}
                </span>
              </div>
              <p className="text-xs text-slate-400">{sample.shortDescription}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Container */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {/* Sample specific toggles / configs */}
          {sample.id === "gemini-hybrid" && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Inference Routing Engine
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setHybridMode("on-device")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    hybridMode === "on-device"
                      ? "bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <span className="text-xs font-bold block">On-Device (ML Kit / Nano)</span>
                  <span className="text-[11px] text-slate-400">Zero network latency, high privacy</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHybridMode("cloud")}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    hybridMode === "cloud"
                      ? "bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500"
                      : "bg-slate-900 border-slate-800 text-slate-400"
                  }`}
                >
                  <span className="text-xs font-bold block">Cloud (Gemini 3.7 Flash)</span>
                  <span className="text-[11px] text-slate-400">Deep multimodal reasoning</span>
                </button>
              </div>
            </div>
          )}

          {sample.id === "gemini-chatbot" && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                System Persona Instructions
              </label>
              <input
                type="text"
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                placeholder="e.g. You are a playful sci-fi AI assistant..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {(sample.id === "genai-writing-assistance" || sample.id === "genai-summarization") && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400">Target Style / Tone:</span>
              {(["concise", "formal", "casual", "poetic"] as const).map((tone) => (
                <button
                  key={tone}
                  type="button"
                  onClick={() => setWritingTone(tone)}
                  className={`px-3 py-1 rounded-lg text-xs capitalize font-medium transition-all ${
                    writingTone === tone
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          )}

          {/* Prompt Presets */}
          {sample.sampleInputs && sample.sampleInputs.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400">Sample Prompts:</span>
              <div className="flex flex-wrap gap-2">
                {sample.sampleInputs.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(preset)}
                    className="text-left px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition-all max-w-full truncate"
                  >
                    "{preset.slice(0, 60)}..."
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Prompt Input Box */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Input Prompt / Text
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt, query, or text to process..."
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Action Trigger */}
          <div className="flex justify-end">
            <button
              onClick={handleRun}
              disabled={isLoading || !prompt.trim()}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isLoading ? "Executing Model Inference..." : "Run Sample"}</span>
            </button>
          </div>

          {/* Output Area */}
          {(output || imageUrl || videoMetadata || hybridMetrics) && (
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Model Output</span>
                  {hybridMetrics && (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                      {hybridMetrics.routedTo} • {hybridMetrics.latencyMs}ms
                    </span>
                  )}
                </div>
                {output && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                )}
              </div>

              {imageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-800 max-h-72">
                  <img src={imageUrl} alt="Generated visual" className="w-full h-full object-cover" />
                </div>
              )}

              {videoMetadata && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                    <h4 className="font-bold text-white text-sm">{videoMetadata.title}</h4>
                    <p className="text-xs text-slate-300 mt-1">{videoMetadata.description}</p>
                  </div>

                  {videoMetadata.chapters && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Automated Chapters:</span>
                      {videoMetadata.chapters.map((ch: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-indigo-300">
                          <span className="font-mono text-amber-400">{ch.time}</span>
                          <span>{ch.title}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {videoMetadata.hashtags && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {videoMetadata.hashtags.map((h: string, i: number) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {output && (
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                  {output}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
