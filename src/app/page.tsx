"use client";

import "@livekit/components-styles";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  BarVisualizer,
  ControlBar,
  VideoTrack,
  useTracks,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";

// --- CONFIGURATION: The Available Cases ---
const INDUSTRIES = [
  { name: "Sports", caseId: "phighting_phillies", label: "Phighting Phillies Due Diligence" },
  { name: "Education", caseId: "kellogg_india", label: "Kellogg India Expansion" },
  { name: "Retail", caseId: "pharmacy_supermarket", label: "Supermarket Pharmacy Investment" },
  { name: "CPG", caseId: "rotisserie_ranch", label: "Rotisserie Ranch Growth Strategy" },
  { name: "Arts", caseId: "art_museum", label: "NYC Art Museum Turnaround" },
];

// --- SUB-COMPONENT: The Interview Timer (Unchanged) ---
function InterviewTimer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute top-8 right-8 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-md z-10">
      <span className="text-xs text-slate-400 mr-2 uppercase font-bold tracking-tighter">
        Case Duration:
      </span>
      <span className="text-slate-900 font-mono text-lg font-bold">
        {formatTime(seconds)}
      </span>
    </div>
  );
}

// --- SUB-COMPONENT: The Interview Stage (Updated to accept dynamic title) ---
function InterviewStage({ caseLabel }: { caseLabel: string }) {
  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
  const localTrack = tracks.find((t) => t.participant.isLocal);

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg">
      <InterviewTimer />
      
      <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center tracking-tight">
        AItimate Interview Presented by HJ
      </h1>
      {/* This is now dynamic based on selection */}
      <p className="text-slate-500 mb-12 text-center font-medium">
        {caseLabel}
      </p>
      
      {/* Central Circular Interface (Light Mode) */}
      <div className="relative flex items-center justify-center h-64 w-64 mx-auto mb-12 bg-slate-100 rounded-full border border-slate-200 shadow-xl overflow-hidden ring-8 ring-white">
        
        {/* Camera Feed as Background */}
        {localTrack && (
          <div className="absolute inset-0 w-full h-full">
            <VideoTrack trackRef={localTrack} />
          </div>
        )}

        {/* Visualizer Overlay (Layered on top of video) */}
        <div className="relative z-10 w-full px-4">
          <BarVisualizer />
        </div>
      </div>

      {/* Control Area */}
      <div className="flex flex-col items-center gap-4">
        <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-lg">
          <ControlBar variation="minimal" />
        </div>
        <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black">
          Live Session Active
        </p>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function InterviewPage() {
  const [token, setToken] = useState("");
  const [selectedCaseLabel, setSelectedCaseLabel] = useState("");

  const onSelectIndustry = async (caseId: string, label: string) => {
    setSelectedCaseLabel(label);
    try {
      const response = await fetch("/api/token", {
        method: "POST",
        body: JSON.stringify({ caseId }), // Sending the selection to backend
      });
      const data = await response.json();
      setToken(data.token);
    } catch (e) {
      console.error("Token fetch failed:", e);
    }
  };

  // 1. If no token, show the Selection Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">AItimate Interview Presented by HJ</h1>
        <p className="text-slate-500 mb-12 font-medium">Choose an industry to begin your mock interview</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
          {INDUSTRIES.map((ind) => (
            <button
              key={ind.caseId}
              onClick={() => onSelectIndustry(ind.caseId, ind.label)}
              className="group p-8 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-blue-500 hover:shadow-md transition-all text-left"
            >
              <p className="text-blue-500 text-xs font-bold uppercase mb-2 tracking-widest group-hover:text-blue-600">
                {ind.name}
              </p>
              <h3 className="text-xl font-semibold text-slate-900">{ind.label}</h3>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 2. If token exists, show the Room (Exact UI as before)
  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="light"
      className="fixed inset-0 bg-slate-50 flex flex-col items-center justify-center p-4 overflow-hidden"
    >
      <InterviewStage caseLabel={selectedCaseLabel} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}