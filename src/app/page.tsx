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
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";

// --- CONFIGURATION ---
const INDUSTRIES = [
  { name: "Sports", caseId: "phighting_phillies", label: "Phighting Phillies Due Diligence", source: "Wharton 2017 Casebook" },
  { name: "Education", caseId: "kellogg_india", label: "Kellogg India Expansion", source: "Kellogg 2016 Casebook" },
  { name: "Retail", caseId: "pharmacy_supermarket", label: "Supermarket Pharmacy Investment", source: "Sloan 2011 Casebook" },
  { name: "CPG", caseId: "rotisserie_ranch", label: "Rotisserie Ranch Growth Strategy", source: "Kellogg 2016 Casebook" },
  { name: "Arts", caseId: "art_museum", label: "NYC Art Museum Turnaround", source: "Sloan 2011 Casebook" },
  { name: "Healthcare", caseId: "health_coaches", label: "Health Coaches Disease Management", source: "Kellogg 2016 Casebook" },
];

// --- INTERFACES ---
interface FeedbackData {
  score: number;
  feedback_text: string;
  buckets: { [key: string]: { score: number; comment: string } };
}

// --- COMPONENT: Feedback Report Card ---
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
      <p className="text-slate-600 mb-8 leading-relaxed text-lg">{data.feedback_text}</p>
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

// --- COMPONENT: Interview Timer ---
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
      <span className="text-xs text-slate-400 mr-2 uppercase font-bold tracking-tighter">Case Duration:</span>
      <span className="text-slate-900 font-mono text-lg font-bold">{formatTime(seconds)}</span>
    </div>
  );
}

// --- COMPONENT: Graph Display Overlay (Updated for multiple graphs) ---
function GraphOverlay({ 
  graphs,
  currentIndex,
  onMinimize,
  onNavigate
}: { 
  graphs: Array<{ image_url: string; display_prompt: string }>;
  currentIndex: number;
  onMinimize: () => void;
  onNavigate: (index: number) => void;
}) {
  const currentGraph = graphs[currentIndex];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="font-bold text-slate-900">
              Case Exhibit {currentIndex + 1}{graphs.length > 1 ? ` of ${graphs.length}` : ''}
            </h3>
            <p className="text-sm text-slate-500">{currentGraph.display_prompt}</p>
          </div>
          <button 
            onClick={onMinimize}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg"
            title="Minimize"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
        
        <div className="p-6 bg-white overflow-y-auto flex-grow">
          <img 
            src={currentGraph.image_url} 
            alt={`Case exhibit ${currentIndex + 1}`}
            className="w-full h-auto rounded-lg border border-slate-200 shadow-sm"
          />
        </div>
        
        {/* Navigation tabs for multiple exhibits */}
        {graphs.length > 1 && (
          <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex gap-2 justify-center flex-shrink-0">
            {graphs.map((_, index) => (
              <button
                key={index}
                onClick={() => onNavigate(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  index === currentIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                Exhibit {index + 1}
              </button>
            ))}
          </div>
        )}
        
        <div className="bg-blue-50 border-t border-blue-100 px-6 py-3 flex-shrink-0">
          <p className="text-sm text-blue-700 text-center font-medium">
            Describe what you observe in this exhibit to your interviewer
          </p>
        </div>
      </div>
    </div>
  );
}

// --- COMPONENT: Minimized Graph Button ---
function MinimizedGraphButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-8 bg-blue-600 text-white px-4 py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 z-40 animate-in slide-in-from-right duration-300 hover:scale-105"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <span className="font-medium">View Exhibits</span>
    </button>
  );
}

// --- COMPONENT: Interview Stage ---
function InterviewStage({ caseLabel }: { caseLabel: string }) {
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Updated: Now stores an ARRAY of all shown graphs
  const [shownGraphs, setShownGraphs] = useState<Array<{ image_url: string; display_prompt: string }>>([]);
  const [isGraphExpanded, setIsGraphExpanded] = useState(true);
  const [currentGraphIndex, setCurrentGraphIndex] = useState(0);

  const tracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
  const localTrack = tracks.find((t) => t.participant.isLocal);

  useDataChannel((payload) => {
    try {
      const text = new TextDecoder().decode(payload.payload);
      console.log("🚀 RECEIVED DATA FROM PYTHON:", text);
      const data = JSON.parse(text);

      if (data.type === "STATUS") {
        console.log("✅ STATUS RECEIVED: Generating...");
        setIsGenerating(true);
      } else if (data.type === "SHOW_GRAPH") {
        console.log("📊 GRAPH RECEIVED:", data);
        
        // Add new graph to the array (avoid duplicates)
        setShownGraphs(prev => {
          const exists = prev.some(g => g.image_url === data.image_url);
          if (exists) {
            // If already shown, just navigate to it
            const existingIndex = prev.findIndex(g => g.image_url === data.image_url);
            setCurrentGraphIndex(existingIndex);
            return prev;
          }
          // Add new graph and set it as current
          const newGraphs = [...prev, { image_url: data.image_url, display_prompt: data.display_prompt }];
          setCurrentGraphIndex(newGraphs.length - 1);
          return newGraphs;
        });
        
        setIsGraphExpanded(true);
      } else if (data.type === "HIDE_GRAPH") {
        setIsGraphExpanded(false);
      } else if (data.score) {
        console.log("✅ REPORT CARD RECEIVED:", data);
        setIsGenerating(false);
        setFeedback(data);
      }
    } catch (error) {
      console.error("❌ FAILED TO PARSE DATA:", error);
    }
  });

  if (feedback) {
    return (
      <div className="flex flex-col items-center justify-start min-h-screen p-4 w-full overflow-y-auto">
        <FeedbackCard data={feedback} />
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Brian is analyzing your performance...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg">
      <InterviewTimer />
      
      {/* Updated: Show overlay with all graphs and navigation */}
      {shownGraphs.length > 0 && isGraphExpanded && (
        <GraphOverlay 
          graphs={shownGraphs}
          currentIndex={currentGraphIndex}
          onMinimize={() => setIsGraphExpanded(false)}
          onNavigate={(index) => setCurrentGraphIndex(index)}
        />
      )}
      
      {/* Updated: Show button when graphs exist but are minimized */}
      {shownGraphs.length > 0 && !isGraphExpanded && (
        <MinimizedGraphButton onClick={() => setIsGraphExpanded(true)} />
      )}
      
      <h1 className="text-3xl font-bold text-slate-900 mb-2 text-center tracking-tight">
        Ace Case Interview Room
      </h1>
      <p className="text-slate-500 mb-12 text-center font-medium">{caseLabel}</p>
      
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

      <div className="flex flex-col items-center gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-2">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide text-center">
            It may take 5-10 seconds for the interviewer to load at the beginning of the case.
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

// --- MAIN PAGE ---
export default function InterviewPage() {
  const [token, setToken] = useState("");
  const [selectedCaseLabel, setSelectedCaseLabel] = useState("");

  const onSelectIndustry = async (caseId: string, label: string) => {
    setSelectedCaseLabel(label);
    try {
      const response = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      });
      const data = await response.json();
      
      // DEBUG: Decode and log the token payload
      try {
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        console.log("🎫 TOKEN PAYLOAD:", payload);
        console.log("📋 METADATA IN TOKEN:", payload.metadata);
      } catch (decodeError) {
        console.error("❌ Failed to decode token:", decodeError);
      }
      
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
              <p className="text-xs text-slate-400 mt-2">{ind.source}</p>
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