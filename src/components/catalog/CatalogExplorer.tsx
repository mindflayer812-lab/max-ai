import React, { useState } from "react";
import { CatalogSample, SampleCategory } from "../../types";
import { CATALOG_SAMPLES } from "../../data/catalogSamples";
import {
  Sparkles,
  Cpu,
  Eye,
  MessageSquare,
  FileText,
  Video,
  CheckSquare,
  Layers,
  ArrowUpRight,
  ExternalLink,
  Code2,
} from "lucide-react";
import { SampleRunnerModal } from "./SampleRunnerModal";

export const CatalogExplorer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<SampleCategory>("all");
  const [activeSample, setActiveSample] = useState<CatalogSample | null>(null);

  const filteredSamples = CATALOG_SAMPLES.filter((s) => {
    if (selectedCategory === "all") return true;
    return s.category === selectedCategory;
  });

  const getSampleIcon = (name: string) => {
    switch (name) {
      case "Cpu":
        return Cpu;
      case "Eye":
        return Eye;
      case "MessageSquare":
        return MessageSquare;
      case "FileText":
        return FileText;
      case "Video":
        return Video;
      case "CheckSquare":
        return CheckSquare;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Google Android AI Sample Catalog</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Android Generative AI <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
              Interactive Web Showcase
            </span>
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed">
            Explore the complete suite of Google Android AI samples unlocked by Gemini & ML Kit. Run live models, inspect architectures, and test multimodal capabilities directly in your browser.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Available Samples</h2>
          <p className="text-xs text-slate-400">Click on any sample to launch an interactive live testbench</p>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
          {[
            { id: "all", label: "All Samples" },
            { id: "hybrid", label: "Hybrid Inference" },
            { id: "multimodal", label: "Multimodal Vision" },
            { id: "text", label: "Text & Chat" },
            { id: "video", label: "Video Metadata" },
            { id: "audio", label: "Audio & Tasks" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as SampleCategory)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white shadow-sm font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Samples Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSamples.map((sample) => {
          const Icon = getSampleIcon(sample.iconName);
          return (
            <div
              key={sample.id}
              onClick={() => setActiveSample(sample)}
              className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Card Banner */}
              <div className="h-44 relative overflow-hidden">
                <img
                  src={sample.image}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/30 to-black/40" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/80 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
                    {sample.architecture}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-white">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/90 backdrop-blur-sm flex items-center justify-center text-white shadow">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm drop-shadow">{sample.title}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {sample.shortDescription}
                </p>

                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  {/* Badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {sample.badges.map((b, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 font-mono">/samples/{sample.id}</span>
                    <span className="flex items-center gap-1 font-semibold text-indigo-400 group-hover:translate-x-1 transition-transform">
                      <span>Launch Interactive Demo</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Runner Modal */}
      <SampleRunnerModal
        sample={activeSample}
        onClose={() => setActiveSample(null)}
      />
    </div>
  );
};
