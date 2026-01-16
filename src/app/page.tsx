"use client";

import "@livekit/components-styles";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  BarVisualizer,
  ControlBar,
  VideoTrack,
  useTracks,
  useDataChannel,
  useRoomContext,
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

// --- INTERFACE: Feedback Data Structure ---
interface FeedbackData {
  score: number;
  feedback_text: string;
  buckets: {
    [key: string]: { score: number; comment: string };
  };
}

// --- COMPONENT: The Feedback Report Card ---
function FeedbackCard({ data }: { data: FeedbackData }) {
  return (
    <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-200 p-8 animate-in fade-in zoom-in duration-500">
      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Performance Report</h2>
          <p className="text-slate-500">AI Interviewer Assessment</p>
        </div>
        <div className="bg-blue-600 text-white rounded-2xl p-4 flex flex-col items-center min-w-[100px]">
          <span className="text-4xl font-bold">{data.score}/10</span>
          <span className="text-xs font-medium uppercase tracking-wider opacity-80">Overall</span>
        </div>
      </div>

      <p className="text-slate-600 mb-8 leading-relaxed text-lg">
        {data.feedback_text}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data.buckets).map(([key, bucket]) => (
          <div key={key} className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-slate-700">{key}</h3>
              <span className={`px-2 py-1 rounded text-xs font-bold ${
                bucket.score >= 8 ? 'bg-green-100 text-green-700' : 
                bucket.score >= 6 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
              }`}>
                {bucket.score}/10
              </span>
            </div>
            <p className="text-sm text-slate-500">{bucket.comment}</p>
          </div>
        ))}
      </div>
      
      <button 
        onClick={() => window.location.reload()} 
        className="mt-8 w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all"
      >
        Start New Case
      </button>
    </div>
  );
}

// --- SUB-COMPONENT: The Interview Timer ---
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

// --- SUB-COMPONENT: The Interview Stage ---
function InterviewStage({ caseLabel }: { caseLabel: string }) {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
  const localTrack = tracks.find((t) => t.participant.isLocal);

// --- DEBUG LISTENER (Replaces the block above) ---
  useDataChannel((payload) => {
    try {
      const text = new TextDecoder().decode(payload.payload);
      console.log("🚀 RECEIVED DATA FROM PYTHON:", text); // <--- THIS LOG IS WHAT WE NEED

      const data = JSON.parse(text);

      if (data.type === "STATUS") {
        console.log("✅ STATUS RECEIVED: Generating...");
        setIsGenerating(true);
      } else if (data.score) {
        console.log("✅ REPORT CARD RECEIVED:", data);
        setIsGenerating(false);
        setFeedback(data);
      }
    } catch (error) {
      console.error("❌ FAILED TO PARSE DATA:", error);
    }
  });

  // VIEW 1: SHOW FEEDBACK CARD (If feedback exists)
  if (feedback) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 w-full">
        <FeedbackCard data={feedback} />
      </div>
    );
  }

  // VIEW 2: SHOW LOADING (If Brian is thinking)
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Brian is analyzing your performance...</p>
      </div>
    );
  }

  // VIEW 3: STANDARD INTERVIEW ROOM (Default)
  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg">
      <InterviewTimer />
      
      <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center tracking-tight">
        Ace Case Interview Room
      </h1>
      <p className="text-slate-500 mb-12 text-center font-medium">
        {caseLabel}
      </p>
      
      {/* Central Circular Interface */}
      <div className="relative flex items-center justify-center h-64 w-64 mx-auto mb-12 bg-slate-100 rounded-full border border-slate-200 shadow-xl overflow-hidden ring-8 ring-white">
        
        {localTrack && (
          <div className="absolute inset-0 w-full h-full">
            <VideoTrack trackRef={localTrack as any} />
          </div>
        )}

        <div className="relative z-10 w-full px-4">
          <BarVisualizer />
        </div>
      </div>

      {/* Control Area */}
      <div className="flex flex-col items-center gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-2">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide text-center">
            It may take 5-10 seconds for the interviewer to load. Please do not turn on your mic until after the interviewer is finished introducing the case.
          </p>
        </div>
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
        body: JSON.stringify({ caseId }), 
      });
      const data = await response.json();
      setToken(data.token);
    } catch (e) {
      console.error("Token fetch failed:", e);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Welcome to Ace Case!</h1>
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

  return (
    <LiveKitRoom
      video={false}
      audio={false}
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