import React, { useState } from "react";
import { WritingPreset, Language } from "../types";
import { WRITING_PRESETS } from "../data/deviceState";
import {
  PenTool,
  FileText,
  Languages,
  CheckCircle2,
  Mail,
  Sparkles,
  Copy,
  Check,
  Download,
  RefreshCw,
  ArrowRight,
  Sliders,
} from "lucide-react";

interface WritingStudioProps {
  language: Language;
}

export const WritingStudio: React.FC<WritingStudioProps> = ({ language }) => {
  const [selectedTask, setSelectedTask] = useState<
    "summarize" | "proofread" | "hinglish-convert" | "email-draft"
  >("summarize");
  const [inputText, setInputText] = useState(WRITING_PRESETS[0].sampleInput);
  const [tone, setTone] = useState<"concise" | "professional" | "casual" | "charismatic">("concise");
  const [targetLang, setTargetLang] = useState<string>("hinglish");
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputResult, setOutputResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectPreset = (preset: WritingPreset) => {
    setSelectedTask(preset.task);
    setInputText(preset.sampleInput);
    setOutputResult(null);
  };

  const handleExecute = async () => {
    if (!inputText.trim() || isProcessing) return;
    setIsProcessing(true);
    setOutputResult(null);

    try {
      const res = await fetch("/api/summarize-write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText,
          task: selectedTask,
          tone,
          targetLanguage: targetLang,
        }),
      });

      const data = await res.json();
      setOutputResult(data.result || "Generation completed.");
    } catch (err) {
      console.error(err);
      setOutputResult("Writing assistance encountered an error. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (outputResult) {
      navigator.clipboard.writeText(outputResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!outputResult) return;
    const blob = new Blob([outputResult], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nexivo_writing_${selectedTask}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800/80 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <PenTool className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              MAX Writing, Summarization & Hinglish Studio
            </h2>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Supercharge your communication with intelligent text synthesis, charismatic Hinglish adaptation, grammar perfection, and email drafting.
          </p>
        </div>
      </div>

      {/* Preset Tasks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {WRITING_PRESETS.map((preset) => {
          const isSelected = selectedTask === preset.task;
          return (
            <button
              key={preset.id}
              id={`writing-preset-${preset.id}`}
              onClick={() => handleSelectPreset(preset)}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${
                isSelected
                  ? "bg-slate-800/90 border-purple-500/60 ring-2 ring-purple-500/30 shadow-lg shadow-purple-500/10"
                  : "bg-slate-900/60 hover:bg-slate-800/60 border-slate-800 text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                  {preset.task}
                </span>
                {isSelected && <Sparkles className="w-4 h-4 text-purple-400" />}
              </div>
              <h4 className="font-bold text-white text-sm">{preset.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-2">{preset.description}</p>
            </button>
          );
        })}
      </div>

      {/* Settings & Controls */}
      <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        {/* Tone Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-purple-400" />
            Tone:
          </span>
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {(["concise", "professional", "casual", "charismatic"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-all ${
                  tone === t
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Target Language Output */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 text-cyan-400" />
            Target Style:
          </span>
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {["hinglish", "english", "hindi"].map((l) => (
              <button
                key={l}
                onClick={() => setTargetLang(l)}
                className={`px-2.5 py-1 rounded text-xs font-medium capitalize transition-all ${
                  targetLang === l
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Two-Column Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Input Text Editor */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col h-full min-h-[420px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Source Text / Prompt Notes</span>
              <span>{inputText.length} characters • {inputText.split(/\s+/).filter(Boolean).length} words</span>
            </div>

            <textarea
              id="writing-input-textarea"
              rows={12}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste raw notes, draft text, document content, or Hinglish sentences here..."
              className="flex-1 mt-3 w-full bg-slate-950 border border-slate-800 focus:border-purple-500/60 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 resize-none font-sans leading-relaxed"
            />

            <button
              id="btn-execute-writing"
              onClick={handleExecute}
              disabled={!inputText.trim() || isProcessing}
              className="mt-3 w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing with MAX Writing Engine...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Transform with MAX</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Polished Result Output */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 shadow-xl flex flex-col h-full min-h-[420px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-purple-400" />
                Refined Output
              </span>

              {outputResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 mt-3">
              {isProcessing ? (
                <div className="h-full flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 animate-pulse">
                    <Sparkles className="w-6 h-6 animate-spin" />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">MAX is synthesizing content...</p>
                  <p className="text-xs text-slate-500">Adapting style, tone, and grammar with Gemini 3.7 Flash</p>
                </div>
              ) : outputResult ? (
                <div className="h-full bg-slate-950/80 rounded-xl p-4 border border-slate-800 text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans overflow-y-auto max-h-[460px]">
                  {outputResult}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
                  <FileText className="w-10 h-10 stroke-1 text-slate-600" />
                  <p className="text-sm">Click "Transform with MAX" to generate polished output.</p>
                  <p className="text-xs text-slate-600">Supports summarization, email drafts, proofreading & Hinglish translation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
