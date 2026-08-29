import React, { useState } from "react";
import { VisionPreset, Language } from "../types";
import { VISION_PRESETS } from "../data/deviceState";
import {
  Eye,
  Upload,
  Sparkles,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  FileText,
  Layers,
  Cpu,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";

interface VisionStudioProps {
  language: Language;
}

export const VisionStudio: React.FC<VisionStudioProps> = ({ language }) => {
  const [selectedPreset, setSelectedPreset] = useState<VisionPreset>(VISION_PRESETS[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(VISION_PRESETS[0].suggestedPrompt);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeImage = customImage || selectedPreset.imageUrl;

  const handleSelectPreset = (preset: VisionPreset) => {
    setSelectedPreset(preset);
    setCustomImage(null);
    setPrompt(preset.suggestedPrompt);
    setResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomImage(event.target.result as string);
          setPrompt("Analyze this image, extract text/OCR, detect objects, and explain the context in detail.");
          setResult(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!activeImage || isAnalyzing) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      let imageBase64 = "";
      if (customImage) {
        imageBase64 = customImage;
      } else {
        // If preset, convert image URL to base64 or pass prompt
        try {
          const response = await fetch(activeImage);
          const blob = await response.blob();
          const reader = new FileReader();
          imageBase64 = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch {
          imageBase64 = "";
        }
      }

      const res = await fetch("/api/multimodal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          imageBase64,
          language,
        }),
      });

      const data = await res.json();
      setResult(data.text || "Analysis complete.");
    } catch (err) {
      console.error(err);
      setResult("Vision analysis encountered an error. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Eye className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              MAX Multimodal Vision & OCR Intelligence
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Analyze complex architectural diagrams, handwritten notes, OCR text, circuit schematics, and urban IoT scenes with Gemini 3.7 Flash.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 cursor-pointer transition-all">
            <Upload className="w-4 h-4" />
            <span>Upload Custom Image</span>
            <input
              id="vision-upload-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Preset Selector Chips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {VISION_PRESETS.map((preset) => {
          const isSelected = !customImage && selectedPreset.id === preset.id;
          return (
            <button
              key={preset.id}
              id={`preset-${preset.id}`}
              onClick={() => handleSelectPreset(preset)}
              className={`text-left p-3.5 rounded-xl border transition-all flex flex-col gap-2.5 relative overflow-hidden ${
                isSelected
                  ? "bg-slate-800/90 border-cyan-500/60 ring-2 ring-cyan-500/30 shadow-lg shadow-cyan-500/10"
                  : "bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-300"
              }`}
            >
              <div className="h-28 w-full rounded-lg overflow-hidden relative">
                <img
                  src={preset.imageUrl}
                  alt={preset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm text-[10px] font-semibold text-cyan-300 border border-slate-800">
                  {preset.category}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm tracking-tight">{preset.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{preset.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Inspection Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Image View & Prompt */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-cyan-400" />
                Input Image Preview
              </span>
              {customImage && (
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-semibold text-[10px]">
                  Custom Uploaded
                </span>
              )}
            </div>

            <div className="h-64 sm:h-72 w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800/80 relative">
              <img
                src={activeImage}
                alt="Active Vision Input"
                className="max-h-full max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Prompt Editor */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Vision Prompt / Instructions</span>
                <span className="text-[10px] text-cyan-400">Gemini 3.7 Flash Multimodal</span>
              </label>
              <textarea
                id="vision-prompt-input"
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                placeholder="Enter vision reasoning question..."
              />
            </div>

            <button
              id="btn-run-vision"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing Image with MAX...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute Multimodal Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Analysis Output */}
        <div className="lg:col-span-7">
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-5 shadow-xl h-full flex flex-col min-h-[400px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">MAX Visual Reasoning Output</h3>
              </div>

              {result && (
                <button
                  id="btn-copy-vision-output"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy Output"}</span>
                </button>
              )}
            </div>

            <div className="flex-1 mt-4">
              {isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 animate-pulse">
                    <Eye className="w-6 h-6 animate-bounce" />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">
                    Inspecting high-resolution multimodal features...
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm text-center">
                    Gemini 3.7 Flash is analyzing objects, handwriting, OCR tokens, and technical context.
                  </p>
                </div>
              ) : result ? (
                <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans overflow-y-auto max-h-[480px]">
                  {result}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-16 gap-3 text-slate-500">
                  <FileText className="w-10 h-10 stroke-1 text-slate-600" />
                  <p className="text-sm">Click "Execute Multimodal Analysis" to inspect the image.</p>
                  <p className="text-xs text-slate-600">Supports OCR, schematics, scene understanding, and handwritten notes.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
