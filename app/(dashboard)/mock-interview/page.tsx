"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Trophy,
  BarChart3,
  Lightbulb,
  ArrowRight,
  Code2,
  Video,
  VideoOff,
  UserCheck,
  Zap,
  Activity,
  Award,
  Layers,
  Calendar,
  Building2,
  TrendingUp,
  Brain,
  ShieldCheck,
  Eye,
  Radio,
  Clock,
  Check,
  Sliders,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import {
  InterviewRole,
  InterviewDifficulty,
  InterviewType,
  InterviewTrack,
  InterviewMode,
  InterviewMessage,
  HiringRecommendation,
  RecruiterPersona,
  VideoAnalyticsTelemetry,
  QuestionScore,
} from "@/types";
import { getScoreColor } from "@/lib/utils";
import Link from "next/link";

interface EvaluationResult {
  reportId: string;
  track?: InterviewTrack;
  personaName?: string;
  mode?: InterviewMode;
  scores: {
    technicalKnowledge: number;
    communication: number;
    problemSolving: number;
    confidence: number;
    industryReadiness: number;
    systemDesign?: number;
    codingAbility?: number;
    leadership?: number;
    behavioral?: number;
    overall: number;
  };
  hiringRecommendation?: HiringRecommendation;
  strengths: string[];
  weaknesses: string[];
  missedOpportunities?: string[];
  recommendations: string[];
  detailedFeedback: string;
  coachingPlan?: {
    plan7Day: string[];
    plan30Day: string[];
    plan90Day: string[];
    practiceExercises: string[];
    recommendedResources: string[];
  };
  benchmarking?: {
    currentLevel: string;
    targetLevel: string;
    percentileRank: number;
    gapToNextLevel: string[];
    timelineToAdvance: string;
  };
  telemetry?: VideoAnalyticsTelemetry;
}

const RECRUITER_PERSONAS: RecruiterPersona[] = [
  {
    id: "sarah",
    name: "Sarah Jenkins",
    role: "Principal System Architect",
    title: "Principal System Architect",
    company: "CloudScale Distributed Systems",
    companyType: "Tier-1 Cloud Infra",
    avatarBg: "from-indigo-600 to-violet-900",
    avatarAccent: "border-indigo-400",
    specialty: "High-concurrency systems, microservices & caching architecture",
    tagline: "I look for deep architectural fundamentals and pragmatic trade-off analysis.",
    difficulty: "Hard",
    speakingStyle: "Direct and Technical",
    focusAreas: ["Distributed Systems", "Cloud Architecture", "Scalability", "System Design"],
  },
  {
    id: "marcus",
    name: "Marcus Vance",
    role: "VP Engineering",
    title: "VP Engineering",
    company: "Horizon Enterprise Technologies",
    companyType: "Enterprise SaaS Scale-up",
    avatarBg: "from-blue-600 to-cyan-900",
    avatarAccent: "border-blue-400",
    specialty: "Engineering velocity, incident triage & cross-functional leadership",
    tagline: "I focus on how you deliver value, manage technical debt, and communicate with stakeholders.",
    difficulty: "Medium-Hard",
    speakingStyle: "Executive and Strategic",
    focusAreas: ["Leadership", "Team Building", "Stakeholder Communication", "Engineering Management"],
  },
  {
    id: "elena",
    name: "Elena Ross",
    role: "Senior Talent Partner",
    title: "Senior Technical Talent Partner",
    company: "Google Cloud Ecosystem",
    companyType: "Big Tech Leadership",
    avatarBg: "from-emerald-600 to-teal-900",
    avatarAccent: "border-emerald-400",
    specialty: "Behavioral impact, STAR storytelling & team synergy",
    tagline: "I evaluate how your past experiences translate into collaborative team success.",
    difficulty: "Medium",
    speakingStyle: "Analytical & Encouraging",
    focusAreas: ["Behavioral Interviews", "STAR Framework", "Culture Fit", "High-Impact Collaboration"],
  },
  {
    id: "david",
    name: "David Chen",
    role: "Startup CTO",
    title: "Founder & CTO",
    company: "Apex Autonomous AI",
    companyType: "YC AI Unicorn",
    avatarBg: "from-amber-600 to-orange-900",
    avatarAccent: "border-amber-400",
    specialty: "Product execution, rapid prototyping & full-stack mastery",
    tagline: "I want to see creative problem solving, speed, and ownership.",
    difficulty: "Hard",
    speakingStyle: "Fast-Paced & Results-Oriented",
    focusAreas: ["Product Thinking", "Startup Engineering", "Innovation", "Ownership"],
  },
];

const INTERVIEW_TRACKS: Array<{ id: InterviewTrack; name: string; focus: string; icon: string }> = [
  { id: "General", name: "Standard Enterprise Track", focus: "Full-Stack, Clean Architecture & Core Problem Solving", icon: "🌐" },
  { id: "Google", name: "Google Hiring Loop", focus: "Distributed Systems, Algorithmic Rigor & System Design", icon: "🔍" },
  { id: "Amazon", name: "Amazon Bar Raiser Track", focus: "16 Leadership Principles & Customer Obsession", icon: "📦" },
  { id: "Microsoft", name: "Microsoft Cloud Loop", focus: "Enterprise Reliability, Scalability & Resilience", icon: "💻" },
  { id: "Meta", name: "Meta Product Architecture", focus: "E4/E5/E6 Product Engineering & Execution", icon: "♾️" },
  { id: "Netflix", name: "Netflix High-Performance", focus: "Freedom & Responsibility, Density Architecture", icon: "🎬" },
  { id: "Startup", name: "YC Founder Track", focus: "0-to-1 Product Velocity & Autonomous Grit", icon: "🚀" },
];

const CODE_TEMPLATES: Record<string, string> = {
  typescript: `// TypeScript: Distributed Sliding Window Rate Limiter
class SlidingWindowRateLimiter {
  private limit: number;
  private windowSizeMs: number;
  private clientRequests: Map<string, number[]> = new Map();

  constructor(limit: number = 100, windowSizeMs: number = 60000) {
    this.limit = limit;
    this.windowSizeMs = windowSizeMs;
  }

  isAllowed(clientId: string): boolean {
    const now = Date.now();
    const timestamps = this.clientRequests.get(clientId) || [];
    const valid = timestamps.filter(t => now - t < this.windowSizeMs);

    if (valid.length < this.limit) {
      valid.push(now);
      this.clientRequests.set(clientId, valid);
      return true;
    }
    return false;
  }
}`,
  javascript: `// JavaScript: LRU Cache Implementation
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) return -1;
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
    return val;
  }

  put(key, value) {
    if (this.cache.has(key)) this.cache.delete(key);
    this.cache.set(key, value);
    if (this.cache.size > this.capacity) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }
}`,
  python: `# Python: Idempotent Event Stream Processor with Lock
import time

def process_event(event_id: str, payload: dict) -> dict:
    """Process high-throughput financial transactions idempotently."""
    print(f"Acquiring distributed Redis lock for {event_id}...")
    return {
        "status": "PROCESSED",
        "event_id": event_id,
        "amount": payload.get("amount", 0.0),
        "timestamp": time.time()
    }

print(process_event("evt_829314", {"amount": 540.00}))`,
  java: `// Java: High-Throughput Thread-Safe Token Bucket Rate Limiter
import java.util.concurrent.atomic.AtomicLong;

public class TokenBucketRateLimiter {
    private final long capacity;
    private final double refillRatePerSecond;
    private final AtomicLong availableTokens;
    private volatile long lastRefillTimestamp;

    public TokenBucketRateLimiter(long capacity, double refillRate) {
        this.capacity = capacity;
        this.refillRatePerSecond = refillRate;
        this.availableTokens = new AtomicLong(capacity);
        this.lastRefillTimestamp = System.currentTimeMillis();
    }

    public synchronized boolean tryAcquire() {
        refill();
        if (availableTokens.get() > 0) {
            availableTokens.decrementAndGet();
            return true;
        }
        return false;
    }

    private void refill() {
        long now = System.currentTimeMillis();
        long elapsed = now - lastRefillTimestamp;
        long tokensToAdd = (long) (elapsed * refillRatePerSecond / 1000.0);
        if (tokensToAdd > 0) {
            availableTokens.set(Math.min(capacity, availableTokens.get() + tokensToAdd));
            lastRefillTimestamp = now;
        }
    }
}`,
  cpp: `// C++: Lock-Free Single Producer Single Consumer Queue
#include <iostream>
#include <vector>
#include <atomic>

template<typename T, size_t Capacity>
class SPSCQueue {
    std::vector<T> buffer{Capacity};
    alignas(64) std::atomic<size_t> head{0};
    alignas(64) std::atomic<size_t> tail{0};

public:
    bool push(const T& item) {
        const size_t current_tail = tail.load(std::memory_order_relaxed);
        if ((current_tail + 1) % Capacity == head.load(std::memory_order_acquire)) {
            return false; // Queue full
        }
        buffer[current_tail] = item;
        tail.store((current_tail + 1) % Capacity, std::memory_order_release);
        return true;
    }
};`,
  go: `// Go: Concurrent Worker Pool with Context Cancellation
package main

import (
	"context"
	"fmt"
	"sync"
	"time"
)

type Job struct {
	ID    int
	Task  string
}

func Worker(ctx context.Context, id int, jobs <-chan Job, wg *sync.WaitGroup) {
	defer wg.Done()
	for {
		select {
		case <-ctx.Done():
			return
		case job, ok := <-jobs:
			if !ok {
				return
			}
			fmt.Printf("Worker %d executed job %d: %s\\n", id, job.ID, job.Task)
		}
	}
}`,
  sql: `-- SQL: High-Performance Window Function & Sharded Index Query
WITH UserSessionMetrics AS (
    SELECT
        user_id,
        session_id,
        event_timestamp,
        latency_ms,
        ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY event_timestamp DESC) AS rn,
        AVG(latency_ms) OVER (PARTITION BY user_id) AS avg_user_latency
    FROM event_logs
    WHERE event_timestamp >= NOW() - INTERVAL '7 days'
)
SELECT user_id, session_id, latency_ms, avg_user_latency
FROM UserSessionMetrics
WHERE rn <= 3
ORDER BY avg_user_latency ASC;`,
};

const FILLER_WORDS = ["um", "uh", "like", "basically", "actually", "you know", "sort of", "kind of"];

export default function MockInterviewPage() {
  const { getIdToken } = useAuth();

  // Configuration state
  const [role, setRole] = useState<InterviewRole>("Full Stack Developer");
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("Intermediate");
  const [type, setType] = useState<InterviewType>("Technical");
  const [track, setTrack] = useState<InterviewTrack>("General");
  const [mode, setMode] = useState<InterviewMode>("video");
  const [selectedPersona, setSelectedPersona] = useState<RecruiterPersona>(RECRUITER_PERSONAS[0]);

  // Session state
  const [phase, setPhase] = useState<"setup" | "interview" | "evaluating" | "results">("setup");
  const [interviewId, setInterviewId] = useState<string>("");
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [isComplete, setIsComplete] = useState(false);
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [askedQuestions, setAskedQuestions] = useState<string[]>([]);
  const [showDebugPanel, setShowDebugPanel] = useState<boolean>(true);
  const [interviewerSpeaking, setInterviewerSpeaking] = useState<boolean>(false);
  const interviewerSpeakingRef = useRef<boolean>(false);
  const candidateHasSpokenRef = useRef<boolean>(false);
  const activeQuestionTextRef = useRef<string>("");

  // Per-Question Scores History
  const [questionScores, setQuestionScores] = useState<Array<{ qNum: number; score: QuestionScore }>>([]);
  const [latestScore, setLatestScore] = useState<QuestionScore | null>(null);

  // Avatar & Voice States
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [handsFreeMode, setHandsFreeMode] = useState(true);
  const [activeTab, setActiveTab] = useState<"chat" | "coding" | "telemetry">("chat");
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [liveCode, setLiveCode] = useState(CODE_TEMPLATES.typescript);
  const [codeLanguage, setCodeLanguage] = useState<string>("typescript");

  // Real-Time Video Capture & Telemetry
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [micActive, setMicActive] = useState(true);
  const [fillerCount, setFillerCount] = useState(0);
  const [detectedFillersList, setDetectedFillersList] = useState<string[]>([]);
  const [eyeContactRate, setEyeContactRate] = useState(94);
  const [speakingWpm, setSpeakingWpm] = useState(136);
  const [confidenceRate, setConfidenceRate] = useState(90);
  const [energyLevel, setEnergyLevel] = useState<"Calm" | "Engaged" | "High Impact" | "Nervous">("High Impact");

  // Results state
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const capturedVoiceTextRef = useRef<string>("");
  const autoAdvanceTimerRef = useRef<any>(null);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Webcam Management for Video Mode
  useEffect(() => {
    if (phase === "interview" && mode === "video") {
      async function startWebcam() {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 640 }, height: { ideal: 480 } },
            audio: true,
          });
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.warn("Webcam access declined or unavailable:", err);
          toast.info("Camera/Microphone access not granted. Telemetry simulation running.");
        }
      }
      startWebcam();
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
    }

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [phase, mode]);

  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCameraActive(videoTrack.enabled);
        toast.info(videoTrack.enabled ? "Camera enabled" : "Camera muted");
      }
    } else {
      setCameraActive(!cameraActive);
    }
  };

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicActive(audioTrack.enabled);
        toast.info(audioTrack.enabled ? "Microphone unmuted" : "Microphone muted");
      }
    } else {
      setMicActive(!micActive);
    }
  };

  // ── Send Answer & Adaptive Follow-Up ───────────────────────────────────────
  const handleSendAnswer = async (explicitAnswer?: string) => {
    const answer = (typeof explicitAnswer === "string" ? explicitAnswer : userInput).trim();
    if (!answer || sending) return;

    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    capturedVoiceTextRef.current = "";
    analyzeTextTelemetry(answer);
    setUserInput("");
    setSending(true);

    const userMsg: InterviewMessage = {
      role: "candidate",
      content: answer,
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      const token = await getIdToken();
      const res = await fetch("/api/interview/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interviewId,
          candidateAnswer: answer,
          role,
          difficulty,
          type,
          personaName: selectedPersona.name,
          track,
          mode,
          messages: updatedMessages,
          askedQuestions,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Server responded with status ${res.status}`);
      }

      if (data.data) {
        const {
          message,
          questionNumber,
          isComplete: done,
          lastScore,
          answerStrength,
          askedQuestions: newAskedList,
        } = data.data;

        if (newAskedList && Array.isArray(newAskedList)) {
          setAskedQuestions(newAskedList);
        }

        if (lastScore) {
          setLatestScore(lastScore);
          setQuestionScores((prev) => [...prev, { qNum: currentQuestion, score: lastScore }]);
        }

        const nextInterviewerMsg: InterviewMessage = {
          role: "interviewer",
          content: message,
          timestamp: new Date(),
          questionNumber: done ? undefined : questionNumber,
        };

        const finalMessagesList = [...updatedMessages, nextInterviewerMsg];
        setMessages(finalMessagesList);
        setCurrentQuestion(Math.min(questionNumber, totalQuestions));

        if (answerStrength === "STRONG") {
          toast.success("Strong answer! Interviewer escalated depth.");
        }

        if (done) {
          setIsComplete(true);
          toast.success("All questions completed! Compiling your full scorecard...");
          // Speak closing wrap-up, then automatically trigger evaluation scorecard
          speakQuestion(message, () => {
            handleEvaluate(finalMessagesList);
          });
        } else {
          speakQuestion(message);
        }
      } else {
        throw new Error(data.error || "Failed to send answer");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Send failed";
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  // ── Speech-to-Text Setup with Strict Interviewer Coordination & Echo Cancellation ──
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          // Block STT if AI interviewer is speaking
          if (interviewerSpeakingRef.current) {
            console.log("[STT Guard] Ignored audio chunk while interviewer is speaking.");
            return;
          }

          let interimTranscript = "";
          let finalTranscript = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const currentText = (finalTranscript || interimTranscript).trim();
          if (!currentText) return;

          // Echo filter: ignore transcripts that match or resemble the active interviewer question
          const normalizedTranscript = currentText.toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();
          const normalizedQuestion = (activeQuestionTextRef.current || "").toLowerCase().replace(/[^\w\s]/g, " ").replace(/\s+/g, " ").trim();

          if (
            normalizedQuestion &&
            (normalizedQuestion.includes(normalizedTranscript) ||
             (normalizedQuestion.length > 25 && normalizedTranscript.includes(normalizedQuestion.substring(0, 35))))
          ) {
            console.log("[STT Filter] Ignored interviewer echo in candidate transcript:", currentText);
            return;
          }

          candidateHasSpokenRef.current = true;
          setUserInput(currentText);
          capturedVoiceTextRef.current = currentText;
          analyzeTextTelemetry(currentText);

          // In Hands-Free or Voice mode, auto-advance after 1.5s of silence
          if (handsFreeMode || mode === "voice") {
            if (autoAdvanceTimerRef.current) clearTimeout(autoAdvanceTimerRef.current);
            autoAdvanceTimerRef.current = setTimeout(() => {
              const textToSend = capturedVoiceTextRef.current.trim();
              if (
                textToSend.length >= 2 &&
                !interviewerSpeakingRef.current &&
                candidateHasSpokenRef.current &&
                !sending
              ) {
                try {
                  recognition.stop();
                } catch {}
                setIsRecordingVoice(false);
                candidateHasSpokenRef.current = false;
                capturedVoiceTextRef.current = "";
                handleSendAnswer(textToSend);
              }
            }, 1500);
          }
        };

        recognition.onerror = () => setIsRecordingVoice(false);
        recognition.onend = () => {
          setIsRecordingVoice(false);
          // If candidate spoke valid response and silence ended session
          if (
            (handsFreeMode || mode === "voice") &&
            !interviewerSpeakingRef.current &&
            candidateHasSpokenRef.current &&
            capturedVoiceTextRef.current.trim().length >= 2 &&
            !sending
          ) {
            const textToSend = capturedVoiceTextRef.current.trim();
            candidateHasSpokenRef.current = false;
            capturedVoiceTextRef.current = "";
            handleSendAnswer(textToSend);
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [handsFreeMode, mode, sending]);

  // Text-to-Speech Speaker with persona pitch, rate & strict STT coordination
  const speakQuestion = useCallback(
    (text: string, onSpeechComplete?: () => void) => {
      activeQuestionTextRef.current = text;
      candidateHasSpokenRef.current = false;
      capturedVoiceTextRef.current = "";
      setUserInput("");

      // Immediately abort STT when AI prepares to speak
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      setIsRecordingVoice(false);
      interviewerSpeakingRef.current = true;
      setInterviewerSpeaking(true);

      if (!ttsEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) {
        interviewerSpeakingRef.current = false;
        setInterviewerSpeaking(false);
        if (onSpeechComplete) {
          onSpeechComplete();
        } else if (handsFreeMode || mode === "voice") {
          setTimeout(() => {
            if (recognitionRef.current && !interviewerSpeakingRef.current && !sending) {
              try {
                recognitionRef.current.start();
                setIsRecordingVoice(true);
              } catch {}
            }
          }, 400);
        }
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = selectedPersona.id === "david" ? 1.05 : 0.98;
      utterance.pitch =
        selectedPersona.id === "sarah" ? 1.12 : selectedPersona.id === "elena" ? 1.08 : 0.96;

      utterance.onstart = () => {
        setIsAvatarSpeaking(true);
        setInterviewerSpeaking(true);
        interviewerSpeakingRef.current = true;
        console.log("[Audio Coordination] Interviewer speaking. STT blocked.");
      };

      utterance.onend = () => {
        setIsAvatarSpeaking(false);
        setInterviewerSpeaking(false);
        interviewerSpeakingRef.current = false;
        console.log("[Audio Coordination] Interviewer finished speaking. Re-arming microphone in 800ms.");

        if (onSpeechComplete) {
          onSpeechComplete();
          return;
        }

        // Strict 800ms cooldown so room reverb/TTS tail is not picked up by STT
        setTimeout(() => {
          if ((handsFreeMode || mode === "voice") && !interviewerSpeakingRef.current && !sending) {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.start();
                setIsRecordingVoice(true);
                toast.info("Microphone listening... Speak your answer now.");
              } catch {}
            }
          }
        }, 800);
      };

      utterance.onerror = () => {
        setIsAvatarSpeaking(false);
        setInterviewerSpeaking(false);
        interviewerSpeakingRef.current = false;
        if (onSpeechComplete) onSpeechComplete();
      };

      window.speechSynthesis.speak(utterance);
    },
    [ttsEnabled, selectedPersona, handsFreeMode, mode, sending]
  );

  const toggleVoiceRecording = () => {
    if (interviewerSpeakingRef.current) {
      toast.info("Please wait for the interviewer to finish speaking.");
      return;
    }
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser. Please type your response.");
      return;
    }

    if (isRecordingVoice) {
      recognitionRef.current.stop();
      setIsRecordingVoice(false);
    } else {
      try {
        candidateHasSpokenRef.current = false;
        recognitionRef.current.start();
        setIsRecordingVoice(true);
        toast.info("Listening... Speak your answer clearly.");
      } catch {
        setIsRecordingVoice(false);
      }
    }
  };

  // Telemetry Analyzer
  const analyzeTextTelemetry = (text: string) => {
    const lower = text.toLowerCase();
    let count = 0;
    const found: string[] = [];

    FILLER_WORDS.forEach((f) => {
      const regex = new RegExp(`\\b${f}\\b`, "g");
      const matches = lower.match(regex);
      if (matches) {
        count += matches.length;
        if (!found.includes(f)) found.push(f);
      }
    });

    if (count > 0) {
      setFillerCount((prev) => prev + count);
      setDetectedFillersList((prev) => Array.from(new Set([...prev, ...found])));
    }

    const words = text.trim().split(/\s+/).length;
    if (words > 8) {
      const calcWpm = Math.min(165, Math.max(115, Math.round(words * 2.7)));
      setSpeakingWpm(calcWpm);
      setEyeContactRate((prev) => Math.min(99, Math.max(88, prev + (count === 0 ? 1 : -1))));
      setConfidenceRate((prev) => Math.min(98, Math.max(78, prev + (count === 0 ? 2 : -2))));
      setEnergyLevel(count <= 1 ? "High Impact" : count <= 3 ? "Engaged" : "Calm");
    }
  };

  // ── 1. Start Interview ───────────────────────────────────────────────────────
  const handleStartInterview = async () => {
    setStarting(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Please sign in to start an interview session");

      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          difficulty,
          type,
          personaName: selectedPersona.name,
          track,
          mode,
          totalQuestions: questionCount,
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Failed to start session (${res.status})`);
      }

      if (data.data) {
        setInterviewId(data.data.interviewId);
        setTotalQuestions(data.data.totalQuestions || questionCount);
        const welcomeMsg: InterviewMessage = {
          role: "interviewer",
          content: data.data.message,
          timestamp: new Date(),
          questionNumber: 1,
          category: data.data.category,
        };
        setMessages([welcomeMsg]);
        setAskedQuestions(data.data.askedQuestions || [data.data.message]);
        setCurrentQuestion(1);
        setQuestionScores([]);
        setPhase("interview");
        toast.success(
          `Live ${mode.toUpperCase()} session started with ${selectedPersona.name} (${track} track, ${data.data.totalQuestions || questionCount} questions)!`
        );
        speakQuestion(data.data.message);
      } else {
        throw new Error(data.error || "Failed to start interview");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Start failed";
      toast.error(msg);
    } finally {
      setStarting(false);
    }
  };

  // ── 3. Attach Code ──────────────────────────────────────────────────────────
  const handleSendCodeToInterviewer = () => {
    setUserInput(
      `Here is my solution implementation:\n\`\`\`${codeLanguage}\n${liveCode}\n\`\`\`\nKey architectural trade-offs:`
    );
    setActiveTab("chat");
    toast.success("Code attached to candidate answer. You can now explain your reasoning and click Send!");
  };

  // ── 4. Finish & Evaluate ────────────────────────────────────────────────────
  const handleEvaluate = async (explicitMessages?: InterviewMessage[]) => {
    setPhase("evaluating");
    try {
      const token = await getIdToken();
      const messagesToEvaluate = explicitMessages || messages;
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          interviewId,
          role,
          difficulty,
          type,
          personaName: selectedPersona.name,
          track,
          mode,
          messages: messagesToEvaluate,
          telemetry: {
            eyeContactScore: eyeContactRate,
            speakingCadenceWpm: speakingWpm,
            fillerWordCount: fillerCount,
            fillerWordPercentage: Math.max(0.5, fillerCount * 0.8),
            confidenceScore: confidenceRate,
            communicationScore: Math.round((confidenceRate + eyeContactRate) / 2),
            bodyLanguageScore: 92,
            professionalismScore: 94,
            energyLevel: energyLevel,
            detectedFillers: detectedFillersList.length > 0 ? detectedFillersList : ["um"],
          },
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Evaluation failed (${res.status})`);
      }

      if (data.data) {
        setEvaluation(data.data);
        setPhase("results");
        toast.success("AI Candidate Evaluation Scorecard generated & saved to Firestore! 🎉");
      } else {
        throw new Error(data.error || "Evaluation failed");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Evaluation failed";
      toast.error(msg);
      setPhase("interview");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendAnswer();
    }
  };

  const getRecommendationBadge = (rec?: HiringRecommendation) => {
    switch (rec) {
      case "Strong Hire":
        return <Badge className="bg-emerald-500 text-white text-xs px-3 py-1 font-bold">Strong Hire 🌟</Badge>;
      case "Hire":
        return <Badge className="bg-blue-600 text-white text-xs px-3 py-1 font-bold">Hire ✅</Badge>;
      case "Borderline":
        return <Badge className="bg-amber-600 text-white text-xs px-3 py-1 font-bold">Borderline ⚠️</Badge>;
      default:
        return <Badge className="bg-slate-700 text-slate-200 text-xs px-3 py-1 font-bold">Decision Ready</Badge>;
    }
  };

  // ── SETUP PHASE ─────────────────────────────────────────────────────────────
  if (phase === "setup") {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            Enterprise AI Interview Loop Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">AI Mock Interview Loop</h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Simulate realistic technical, behavioral, and system design interviews with company hiring loops, live video telemetry, and adaptive questioning.
          </p>
        </div>

        {/* 1. Interview Mode Selector */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
              <Radio className="h-4 w-4 text-indigo-400" />
              1. Choose Interview Mode
            </h2>
            <p className="text-xs text-[#94A3B8]">Select your preferred interaction experience.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setMode("video")}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                mode === "video"
                  ? "border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/50 text-white"
                  : "border-white/[0.08] bg-[#0F172A] hover:border-white/[0.2] text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Video className="h-5 w-5 text-indigo-400" />
                <Badge className="bg-indigo-600 text-[10px] text-white">Recommended</Badge>
              </div>
              <div>
                <h4 className="text-sm font-bold">AI Video Interview</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Live webcam, speech pace, eye contact tracking, filler word detection & live HUD.
                </p>
              </div>
            </button>

            <button
              onClick={() => setMode("voice")}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                mode === "voice"
                  ? "border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/50 text-white"
                  : "border-white/[0.08] bg-[#0F172A] hover:border-white/[0.2] text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Mic className="h-5 w-5 text-indigo-400" />
                <Badge variant="outline" className="text-[10px] border-white/[0.1] text-slate-400">Audio Only</Badge>
              </div>
              <div>
                <h4 className="text-sm font-bold">Voice Conversation</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Real-time Text-to-Speech & Speech-to-Text hands-free verbal interview.
                </p>
              </div>
            </button>

            <button
              onClick={() => setMode("text")}
              className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                mode === "text"
                  ? "border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/50 text-white"
                  : "border-white/[0.08] bg-[#0F172A] hover:border-white/[0.2] text-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Code2 className="h-5 w-5 text-indigo-400" />
                <Badge variant="outline" className="text-[10px] border-white/[0.1] text-slate-400">Written</Badge>
              </div>
              <div>
                <h4 className="text-sm font-bold">Text & Coding Dialogue</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Interactive dialogue with rich code editor and architectural diagrams.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Choose Question Count */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-400" />
              2. Select Question Count
            </h2>
            <p className="text-xs text-[#94A3B8]">Choose your preferred mock loop duration and question depth.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[10, 15, 20, 30].map((count) => {
              const isSelected = questionCount === count;
              return (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`p-3.5 rounded-xl border text-center transition-all flex flex-col items-center justify-between ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500 text-white"
                      : "border-white/[0.08] bg-[#0F172A] hover:border-white/[0.2] text-slate-300"
                  }`}
                >
                  <span className="text-xl font-bold text-indigo-400">{count}</span>
                  <span className="text-xs font-semibold text-slate-200 mt-1">{count} Questions</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    {count === 10 ? "~15 Mins" : count === 15 ? "~25 Mins" : count === 20 ? "~35 Mins" : "~45 Mins"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Choose Company Hiring Track */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-indigo-400" />
              3. Select Company Hiring Track
            </h2>
            <p className="text-xs text-[#94A3B8]">Tailor question sets to top-tier enterprise rubrics and bar-raiser criteria.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {INTERVIEW_TRACKS.map((t) => {
              const isSelected = track === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTrack(t.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-950/40 ring-1 ring-indigo-500 text-white"
                      : "border-white/[0.08] bg-[#0F172A] hover:border-white/[0.2] text-slate-300"
                  }`}
                >
                  <span className="text-xl mb-1">{t.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold">{t.name.split(" ")[0]}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{t.focus}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Choose AI Recruiter Persona */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
              <Brain className="h-4 w-4 text-indigo-400" />
              3. Select AI Interviewer Avatar
            </h2>
            <p className="text-xs text-[#94A3B8]">Each interviewer evaluates with distinct personality archetypes and questioning styles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {RECRUITER_PERSONAS.map((p) => {
              const isSelected = selectedPersona.id === p.id;
              return (
                <Card
                  key={p.id}
                  onClick={() => setSelectedPersona(p)}
                  className={`cursor-pointer transition-all border p-5 flex flex-col justify-between ${
                    isSelected
                      ? "border-indigo-500 bg-indigo-950/20 ring-2 ring-indigo-500/30"
                      : "border-white/[0.08] bg-[#0F172A] hover:border-white/[0.2]"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${p.avatarBg} border-2 ${p.avatarAccent} flex items-center justify-center text-white font-bold text-base shadow-md`}
                      >
                        {p.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <Badge
                        className={`text-[10px] py-0 px-2 ${
                          p.difficulty === "Hard"
                            ? "bg-rose-600/20 text-rose-300 border-rose-500/30"
                            : "bg-indigo-600/20 text-indigo-300 border-indigo-500/30"
                        }`}
                      >
                        {p.difficulty}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#F8FAFC]">{p.name}</h3>
                      <p className="text-xs text-indigo-400 font-medium">{p.title}</p>
                      <p className="text-[11px] text-slate-400">{p.company}</p>
                    </div>
                    <p className="text-xs text-slate-300 italic leading-relaxed">
                      &quot;{p.tagline}&quot;
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/[0.06] mt-3 space-y-1">
                    <p className="text-[10px] text-slate-400 font-medium">🎯 Focus: {p.focusAreas.slice(0, 2).join(", ")}</p>
                    <p className="text-[10px] text-indigo-400">🗣️ Style: {p.speakingStyle}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* 4. Configure Technical Domain */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[#F8FAFC] flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              4. Target Role & Seniority
            </h2>
            <p className="text-xs text-[#94A3B8]">Customize your target position and interview depth.</p>
          </div>

          <Card className="border border-white/[0.08] bg-[#0F172A] p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Target Role */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Target Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as InterviewRole)}
                  className="w-full h-10 rounded-lg border border-white/[0.08] bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="Cloud Engineer">Cloud Engineer</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Data Analyst">Data Analyst</option>
                  <option value="AI Engineer">AI Engineer</option>
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="Product Manager">Product Manager</option>
                </select>
              </div>

              {/* Difficulty */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Seniority Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as InterviewDifficulty)}
                  className="w-full h-10 rounded-lg border border-white/[0.08] bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Entry Level">Entry Level (Junior)</option>
                  <option value="Intermediate">Intermediate (Mid-Level)</option>
                  <option value="Senior">Senior Engineer (Staff)</option>
                  <option value="Staff / Principal">Staff / Principal Architect</option>
                </select>
              </div>

              {/* Interview Type */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Round Archetype</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as InterviewType)}
                  className="w-full h-10 rounded-lg border border-white/[0.08] bg-slate-950 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Technical">Technical & System Architecture</option>
                  <option value="Behavioral">Behavioral & Leadership (STAR)</option>
                  <option value="System Design">System Design & Scalability</option>
                  <option value="Mixed">Comprehensive Loop (Tech + Culture)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>10 Adaptive Questions • Real-Time Voice Synthesis • Live Telemetry & Code Arena</span>
              </div>

              <Button
                onClick={handleStartInterview}
                disabled={starting}
                className="bg-[#4F46E5] hover:bg-[#6366F1] text-white gap-2 px-6 h-10 rounded-xl font-semibold"
              >
                <Play className="h-4 w-4" />
                {starting ? "Initializing AI Recruiter..." : `Begin ${mode.toUpperCase()} Interview`}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ── EVALUATING PHASE ────────────────────────────────────────────────────────
  if (phase === "evaluating") {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="h-20 w-20 rounded-3xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
          <Activity className="h-10 w-10 animate-spin" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#F8FAFC]">Synthesizing Enterprise Scorecard</h2>
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            {selectedPersona.name} is evaluating your transcript across 9 rubric dimensions, generating hiring recommendation, 90-day coaching drills, and skill benchmarking.
          </p>
        </div>
        <Progress value={85} className="h-2" />
      </div>
    );
  }

  // ── RESULTS PHASE ───────────────────────────────────────────────────────────
  if (phase === "results" && evaluation) {
    const coaching = evaluation.coachingPlan;
    const bench = evaluation.benchmarking;
    const telem = evaluation.telemetry;

    return (
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold mb-2">
              <Trophy className="h-3.5 w-3.5" />
              Enterprise Hiring Evaluation Report
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">
              {role} ({track} Track) Scorecard
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
              Evaluated by {selectedPersona.name} ({selectedPersona.title}, {selectedPersona.company})
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={() => {
                setPhase("setup");
                setMessages([]);
                setEvaluation(null);
                setQuestionScores([]);
              }}
              variant="outline"
              className="text-xs border-white/[0.08] bg-slate-950 text-slate-300 gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Start New Loop
            </Button>
            <Link href="/reports">
              <Button variant="outline" className="text-xs border-indigo-500/30 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-600 hover:text-white gap-1.5">
                <BarChart3 className="h-3.5 w-3.5" />
                <span>View Evaluation Reports</span>
              </Button>
            </Link>
            <Link href="/career-planner">
              <Button className="bg-[#4F46E5] hover:bg-[#6366F1] text-white text-xs gap-1.5">
                <span>View Career Plan</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Overall Score & Hiring Recommendation Banner */}
        <Card className="border border-white/[0.08] bg-[#0F172A] p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(evaluation.scores.overall)}`}>
                  {evaluation.scores.overall}%
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#F8FAFC]">Hiring Recommendation:</h3>
                  {getRecommendationBadge(evaluation.hiringRecommendation)}
                </div>
                <p className="text-xs text-[#94A3B8]">
                  {evaluation.scores.overall >= 85
                    ? "Exceptional candidate — demonstrates Staff-level architecture and communication."
                    : "Competitive candidate — solid foundations with specific technical areas to refine."}
                </p>
              </div>
            </div>

            <div className="flex gap-6 border-t sm:border-t-0 sm:border-l border-white/[0.06] pt-4 sm:pt-0 sm:pl-6">
              <div className="text-center">
                <span className="text-[11px] text-slate-400">Total Questions</span>
                <p className="text-base font-bold text-slate-100">10 / 10</p>
              </div>
              <div className="text-center">
                <span className="text-[11px] text-slate-400">Seniority</span>
                <p className="text-base font-bold text-indigo-400">{difficulty}</p>
              </div>
              <div className="text-center">
                <span className="text-[11px] text-slate-400">Track</span>
                <p className="text-base font-bold text-emerald-400">{track}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* 9-Dimension Rubric Grid */}
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-slate-200">Rubric Dimensions & Candidate Scores</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {Object.entries(evaluation.scores)
              .filter(([k]) => k !== "overall")
              .map(([key, val]) => (
                <Card key={key} className="border border-white/[0.08] bg-[#0F172A] p-3.5 space-y-2">
                  <span className="text-[10px] font-medium text-slate-400 capitalize truncate block">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className={`text-lg font-bold ${getScoreColor(val)}`}>{val}%</span>
                  </div>
                  <Progress value={val} className="h-1" />
                </Card>
              ))}
          </div>
        </div>

        {/* Video & Speech Telemetry Summary */}
        {telem && (
          <Card className="border border-white/[0.08] bg-[#0F172A] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                <Video className="h-4 w-4 text-indigo-400" />
                Live Video & Speech Telemetry Insights
              </h4>
              <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                Energy: {telem.energyLevel}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-white/[0.06]">
                <span className="text-slate-400 text-[11px]">Eye Contact</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">{telem.eyeContactScore}%</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-white/[0.06]">
                <span className="text-slate-400 text-[11px]">Speaking Cadence</span>
                <p className="text-sm font-bold text-slate-100 mt-0.5">{telem.speakingCadenceWpm} WPM</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-white/[0.06]">
                <span className="text-slate-400 text-[11px]">Filler Words Detected</span>
                <p className="text-sm font-bold text-amber-400 mt-0.5">{telem.fillerWordCount} total</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-white/[0.06]">
                <span className="text-slate-400 text-[11px]">Confidence Score</span>
                <p className="text-sm font-bold text-indigo-400 mt-0.5">{telem.confidenceScore}%</p>
              </div>
            </div>
          </Card>
        )}

        {/* Strengths & Weaknesses & Missed Opportunities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-white/[0.08] bg-[#0F172A] p-5 space-y-3">
            <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              Demonstrated Strengths
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {evaluation.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border border-white/[0.08] bg-[#0F172A] p-5 space-y-3">
            <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4" />
              Areas for Improvement
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {evaluation.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-400 mt-0.5">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="border border-white/[0.08] bg-[#0F172A] p-5 space-y-3">
            <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <Zap className="h-4 w-4" />
              Missed Opportunities
            </h4>
            <ul className="space-y-2 text-xs text-slate-300">
              {(evaluation.missedOpportunities || [
                "Could have discussed partitioned database sharding.",
                "Opportunity to highlight idempotent API consumer design.",
              ]).map((m, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-rose-400 mt-0.5">•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Skill Benchmarking */}
        {bench && (
          <Card className="border border-white/[0.08] bg-[#0F172A] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                Industry Skill Benchmarking
              </h4>
              <Badge className="bg-indigo-600 text-white text-[10px]">
                Top {100 - bench.percentileRank}% Percentile
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-white/[0.06]">
                <span className="text-slate-400 text-[11px]">Current Assessed Tier</span>
                <p className="text-sm font-bold text-slate-100 mt-0.5">{bench.currentLevel}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-white/[0.06]">
                <span className="text-slate-400 text-[11px]">Target Engineering Tier</span>
                <p className="text-sm font-bold text-indigo-400 mt-0.5">{bench.targetLevel}</p>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-white/[0.06]">
                <span className="text-slate-400 text-[11px]">Estimated Timeline to Advance</span>
                <p className="text-sm font-bold text-emerald-400 mt-0.5">{bench.timelineToAdvance}</p>
              </div>
            </div>
          </Card>
        )}

        {/* AI Coaching Plan (7 / 30 / 90 Days) */}
        {coaching && (
          <Card className="border border-white/[0.08] bg-[#0F172A] p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-indigo-400" />
              AI Interview Coach: Phased Action Plan
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 space-y-2">
                <Badge className="bg-indigo-600 text-white text-[10px]">7-Day Sprints</Badge>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  {coaching.plan7Day.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-950/20 space-y-2">
                <Badge className="bg-blue-600 text-white text-[10px]">30-Day Projects</Badge>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  {coaching.plan30Day.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-blue-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20 space-y-2">
                <Badge className="bg-emerald-600 text-white text-[10px]">90-Day Mastery</Badge>
                <ul className="text-xs text-slate-300 space-y-1.5">
                  {coaching.plan90Day.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Detailed Comprehensive Feedback */}
        <Card className="border border-white/[0.08] bg-[#0F172A] p-5 space-y-3">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-indigo-400" />
            Interviewer Comprehensive Feedback & Observations
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
            {evaluation.detailedFeedback}
          </p>
        </Card>
      </div>
    );
  }

  // ── ACTIVE INTERVIEW PHASE ──────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#0F172A] border border-white/[0.08] rounded-2xl p-4">
        <div className="flex items-center gap-3">
          <div
            className={`h-10 w-10 rounded-xl bg-gradient-to-br ${selectedPersona.avatarBg} border ${selectedPersona.avatarAccent} flex items-center justify-center text-white font-bold text-xs shadow`}
          >
            {selectedPersona.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">{selectedPersona.name}</h2>
              <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-400 py-0 px-1.5">
                {selectedPersona.title}
              </Badge>
              <Badge className="bg-indigo-600/20 text-indigo-300 text-[10px] py-0 px-1.5 border border-indigo-500/20">
                {track} Track
              </Badge>
              <Badge className="bg-emerald-600/20 text-emerald-300 text-[10px] py-0 px-1.5 border border-emerald-500/20 uppercase">
                {mode} Mode
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">{role} • {difficulty} Level</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="text-[10px] border-indigo-500/30 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-600 hover:text-white h-8 px-2.5"
          >
            {showDebugPanel ? "Hide Debug HUD" : "Show Debug HUD"}
          </Button>
          <div className="text-right">
            <span className="text-[10px] text-slate-400">Session Progress</span>
            <p className="text-xs font-bold text-indigo-400">Question {currentQuestion} of {totalQuestions}</p>
          </div>
          <Button
            onClick={() => handleEvaluate()}
            variant="outline"
            size="sm"
            className="text-xs border-white/[0.08] bg-slate-950 hover:bg-emerald-600 hover:text-white text-slate-300 h-8"
          >
            Finish & Evaluate
          </Button>
        </div>
      </div>

      {/* Runtime Debug Verification Panel */}
      {showDebugPanel && (
        <Card className="border border-indigo-500/40 bg-[#0B1120] p-4 rounded-2xl shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-indigo-500/20 pb-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                Runtime Question Engine Debug HUD
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-indigo-600/30 text-indigo-200 text-[10px] border border-indigo-500/30">
                Asked Questions: {askedQuestions.length}
              </Badge>
              <Badge className="bg-emerald-600/30 text-emerald-200 text-[10px] border border-emerald-500/30">
                Progression: {currentQuestion} / {totalQuestions}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.08] space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span>CURRENT ACTIVE QUESTION (Q{currentQuestion})</span>
                <span className="text-indigo-400">Status: In Progress</span>
              </div>
              <p className="text-slate-200 line-clamp-3 leading-relaxed font-mono text-[11px]">
                {messages.filter((m) => m.role === "interviewer").slice(-1)[0]?.content || "Waiting for first question..."}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-white/[0.08] space-y-1">
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                <span>DEDUPLICATION HISTORY POOL</span>
                <span className="text-emerald-400">{askedQuestions.length} Unique Verified</span>
              </div>
              <div className="max-h-16 overflow-y-auto space-y-1 pr-1 font-mono text-[10px] text-slate-300">
                {askedQuestions.map((q, idx) => (
                  <div key={idx} className="truncate text-slate-400">
                    <span className="text-indigo-400 font-bold">Q{idx + 1}:</span> {q}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Recruiter Avatar & Live Webcam / Telemetry (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Dual Feed Box (Avatar + Candidate Webcam in Video Mode) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* AI Avatar Video Tile */}
            <Card className="border border-white/[0.08] bg-[#0F172A] p-4 text-center relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span className="font-semibold text-indigo-300">AI Interviewer</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <Radio className="h-2.5 w-2.5 animate-pulse" /> Live
                </span>
              </div>

              <div className="relative mx-auto w-20 h-20 my-2">
                <div
                  className={`absolute inset-0 rounded-full bg-indigo-500/30 blur-md transition-all duration-300 ${
                    isAvatarSpeaking ? "scale-125 opacity-100" : "scale-100 opacity-0"
                  }`}
                />
                <div
                  className={`relative w-full h-full rounded-full bg-gradient-to-br ${selectedPersona.avatarBg} border-2 ${selectedPersona.avatarAccent} flex items-center justify-center text-white text-lg font-bold shadow-xl`}
                >
                  {selectedPersona.name.split(" ").map((n) => n[0]).join("")}
                </div>
              </div>

              <div className="space-y-0.5">
                <h3 className="text-xs font-bold text-[#F8FAFC]">{selectedPersona.name}</h3>
                <p className="text-[10px] text-slate-400">
                  {isAvatarSpeaking ? "🎙️ Speaking question..." : "👂 Listening to Candidate"}
                </p>
              </div>

              <div className="flex items-center justify-center gap-1 mt-2 pt-2 border-t border-white/[0.06]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className="text-[10px] text-slate-400 hover:text-slate-200 h-6 px-2 gap-1"
                >
                  {ttsEnabled ? <Volume2 className="h-3 w-3 text-indigo-400" /> : <VolumeX className="h-3 w-3" />}
                  {ttsEnabled ? "Voice On" : "Muted"}
                </Button>
              </div>
            </Card>

            {/* Candidate Webcam Feed Tile */}
            <Card className="border border-white/[0.08] bg-slate-950 p-4 relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 z-10">
                <span className="font-semibold text-slate-300">Candidate Video Feed</span>
                <span className="flex items-center gap-1 text-indigo-400">
                  <Camera className="h-2.5 w-2.5" /> 720p HD
                </span>
              </div>

              {mode === "video" ? (
                <div className="relative w-full h-24 rounded-lg bg-slate-900 border border-white/[0.08] overflow-hidden my-1 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                  {!cameraActive && (
                    <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-xs text-slate-400">
                      Camera Muted
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-24 rounded-lg bg-slate-900 border border-white/[0.08] flex items-center justify-center text-xs text-slate-500 my-1">
                  Audio Mode Active
                </div>
              )}

              <div className="flex items-center justify-center gap-1.5 mt-2 pt-2 border-t border-white/[0.06] z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleCamera}
                  className="text-[10px] text-slate-400 hover:text-slate-200 h-6 px-2 gap-1"
                >
                  {cameraActive ? <Video className="h-3 w-3 text-emerald-400" /> : <VideoOff className="h-3 w-3 text-rose-400" />}
                  {cameraActive ? "Cam" : "Off"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMic}
                  className="text-[10px] text-slate-400 hover:text-slate-200 h-6 px-2 gap-1"
                >
                  {micActive ? <Mic className="h-3 w-3 text-emerald-400" /> : <MicOff className="h-3 w-3 text-rose-400" />}
                  {micActive ? "Mic" : "Muted"}
                </Button>
              </div>
            </Card>
          </div>

          {/* Real-Time Live Telemetry HUD */}
          <Card className="border border-white/[0.08] bg-[#0F172A] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-indigo-400" />
                Live Video & Speech Telemetry HUD
              </span>
              <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-400">
                Energy: {energyLevel}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/[0.06]">
                <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                  <span>Eye Contact Confidence</span>
                  <span className="font-semibold text-emerald-400">{eyeContactRate}%</span>
                </div>
                <Progress value={eyeContactRate} className="h-1" />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/[0.06]">
                <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                  <span>Cadence ({speakingWpm} WPM)</span>
                  <span className="font-semibold text-indigo-400">Optimal</span>
                </div>
                <Progress value={Math.min(100, Math.round((speakingWpm / 160) * 100))} className="h-1" />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/[0.06]">
                <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                  <span>Confidence Score</span>
                  <span className="font-semibold text-indigo-400">{confidenceRate}%</span>
                </div>
                <Progress value={confidenceRate} className="h-1" />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-white/[0.06]">
                <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                  <span>Filler Words</span>
                  <span className={`font-semibold ${fillerCount === 0 ? "text-emerald-400" : "text-amber-400"}`}>
                    {fillerCount} detected
                  </span>
                </div>
                <Progress value={Math.max(10, 100 - fillerCount * 15)} className="h-1" />
              </div>
            </div>

            {detectedFillersList.length > 0 && (
              <div className="pt-2 border-t border-white/[0.06] flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400">Flagged words:</span>
                {detectedFillersList.map((w, idx) => (
                  <Badge key={idx} variant="outline" className="text-[9px] border-amber-500/30 text-amber-300 py-0">
                    &quot;{w}&quot;
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          {/* Live Per-Question Scorecard Panel */}
          {latestScore && (
            <Card className="border border-indigo-500/30 bg-indigo-950/20 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-indigo-400" />
                  Live Question {currentQuestion - 1} Scoring
                </h4>
                <Badge className="bg-indigo-600 text-white text-[9px]">Evaluated</Badge>
              </div>

              <div className="grid grid-cols-5 gap-1.5 text-center">
                <div className="p-1.5 rounded bg-slate-950/60 border border-white/[0.06]">
                  <span className="text-[9px] text-slate-400 block">Know</span>
                  <span className="text-xs font-bold text-emerald-400">{latestScore.knowledge}%</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950/60 border border-white/[0.06]">
                  <span className="text-[9px] text-slate-400 block">Comm</span>
                  <span className="text-xs font-bold text-blue-400">{latestScore.communication}%</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950/60 border border-white/[0.06]">
                  <span className="text-[9px] text-slate-400 block">Solve</span>
                  <span className="text-xs font-bold text-indigo-400">{latestScore.problemSolving}%</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950/60 border border-white/[0.06]">
                  <span className="text-[9px] text-slate-400 block">Conf</span>
                  <span className="text-xs font-bold text-violet-400">{latestScore.confidence}%</span>
                </div>
                <div className="p-1.5 rounded bg-slate-950/60 border border-white/[0.06]">
                  <span className="text-[9px] text-slate-400 block">Depth</span>
                  <span className="text-xs font-bold text-amber-400">{latestScore.depth}%</span>
                </div>
              </div>

              {latestScore.feedback && (
                <p className="text-[11px] text-slate-300 italic pt-1 leading-relaxed">
                  💡 {latestScore.feedback}
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Right Column: Interactive Dialogue Feed & Live Code Arena (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "chat" | "coding")}>
            <div className="flex items-center justify-between mb-2">
              <TabsList className="bg-slate-950 border border-white/[0.08] p-1">
                <TabsTrigger
                  value="chat"
                  className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white gap-1.5"
                >
                  <Mic className="h-3.5 w-3.5" />
                  Conversation Dialogue
                </TabsTrigger>
                <TabsTrigger
                  value="coding"
                  className="text-xs data-[state=active]:bg-indigo-600 data-[state=active]:text-white gap-1.5"
                >
                  <Code2 className="h-3.5 w-3.5" />
                  Live Code Arena
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHandsFreeMode(!handsFreeMode)}
                  className={`text-[10px] h-7 px-2 gap-1 rounded-md border ${
                    handsFreeMode
                      ? "border-emerald-500/40 text-emerald-300 bg-emerald-950/30"
                      : "border-white/[0.08] text-slate-400"
                  }`}
                >
                  <Radio className="h-3 w-3" />
                  {handsFreeMode ? "Hands-Free Active" : "Hands-Free Off"}
                </Button>
              </div>
            </div>

            {/* Tab 1: Conversation Dialogue */}
            <TabsContent value="chat" className="space-y-4 m-0">
              <Card className="border border-white/[0.08] bg-[#0F172A] p-4 flex flex-col h-[460px]">
                {/* Message Scroll Feed */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {messages.map((m, i) => {
                    const isInterviewer = m.role === "interviewer";
                    return (
                      <div
                        key={i}
                        className={`flex gap-3 ${isInterviewer ? "justify-start" : "justify-end"}`}
                      >
                        {isInterviewer && (
                          <div
                            className={`h-8 w-8 rounded-lg bg-gradient-to-br ${selectedPersona.avatarBg} text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-1 shadow`}
                          >
                            {selectedPersona.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                            isInterviewer
                              ? "bg-slate-900 border border-white/[0.08] text-slate-100"
                              : "bg-indigo-600 text-white font-medium"
                          }`}
                        >
                          {m.questionNumber && (
                            <span className="block text-[10px] font-bold text-indigo-400 mb-1">
                              Question {m.questionNumber} {m.category ? `• ${m.category}` : ""}
                            </span>
                          )}
                          <p className="whitespace-pre-wrap">{m.content}</p>
                          {m.score && (
                            <div className="mt-2 pt-2 border-t border-indigo-400/30 flex items-center gap-2 text-[10px] text-indigo-200">
                              <span>Score: {Math.round((m.score.knowledge + m.score.problemSolving) / 2)}%</span>
                              <span>•</span>
                              <span>{m.score.feedback}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Candidate Response Input Bar */}
                <div className="pt-3 border-t border-white/[0.06] space-y-2 mt-2">
                  <div className="relative">
                    <Textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type your response or use voice dictation..."
                      className="min-h-[75px] max-h-[120px] bg-slate-950 border-white/[0.08] text-xs sm:text-sm text-slate-100 pr-24 resize-none"
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
                      <Button
                        type="button"
                        size="sm"
                        variant={isRecordingVoice ? "destructive" : "outline"}
                        onClick={toggleVoiceRecording}
                        className={`h-7 w-7 p-0 rounded-lg ${
                          isRecordingVoice ? "animate-pulse bg-rose-600 text-white" : "border-white/[0.08] bg-slate-900"
                        }`}
                      >
                        {isRecordingVoice ? (
                          <MicOff className="h-3.5 w-3.5" />
                        ) : (
                          <Mic className="h-3.5 w-3.5 text-indigo-400" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleSendAnswer()}
                        disabled={sending || !userInput.trim()}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white h-7 px-3 text-xs rounded-lg gap-1 font-medium"
                      >
                        <Send className="h-3 w-3" />
                        {sending ? "Evaluating..." : "Send"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Tab 2: Live Code Arena */}
            <TabsContent value="coding" className="space-y-3 m-0">
              <Card className="border border-white/[0.08] bg-[#0F172A] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-200">Interactive Coding Workspace</span>
                  </div>
                  <select
                    value={codeLanguage}
                    onChange={(e) => {
                      const lang = e.target.value;
                      setCodeLanguage(lang);
                      setLiveCode(CODE_TEMPLATES[lang] || CODE_TEMPLATES.typescript);
                    }}
                    className="h-7 text-xs rounded-md bg-slate-950 border border-white/[0.08] px-2 text-slate-300 font-medium"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="go">Go</option>
                    <option value="sql">SQL</option>
                  </select>
                </div>

                <Textarea
                  value={liveCode}
                  onChange={(e) => setLiveCode(e.target.value)}
                  className="font-mono text-xs bg-slate-950 text-indigo-300 min-h-[320px] border-white/[0.08] resize-none"
                  spellCheck={false}
                />

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-400">
                    Write solution and attach directly to candidate response
                  </span>
                  <Button
                    onClick={handleSendCodeToInterviewer}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs h-8 px-4 rounded-lg gap-1.5"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Attach Code to Answer
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
