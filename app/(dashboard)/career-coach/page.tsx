"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  Compass,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  Zap,
  Mic,
  MicOff,
  RotateCcw,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { CareerCoachMessage } from "@/types";

const PROMPT_SUGGESTIONS = [
  "How do I bridge the gap from Mid-Level to Staff Engineer?",
  "What high-yield portfolio project should I build for Google Cloud?",
  "How do I answer 'Tell me about a time you handled a severe outage' using STAR?",
  "How do I improve my system design answers regarding caching & sharding?",
  "What certifications give the highest salary ROI for a Full Stack / Cloud Engineer?",
];

// Helper to render formatted Markdown in chat messages
function FormattedMessageContent({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  // If content is pure JSON, parse and display cleanly
  let text = content;
  if (text.trim().startsWith("{") && text.trim().endsWith("}")) {
    try {
      const parsed = JSON.parse(text);
      text = Object.entries(parsed)
        .map(([key, val]) => `**${key.toUpperCase()}**: ${Array.isArray(val) ? val.join(", ") : typeof val === "object" ? JSON.stringify(val) : val}`)
        .join("\n\n");
    } catch {
      // keep original
    }
  }

  // Parse lines into styled segments
  const lines = text.split("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    toast.success("Advice copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-100 relative group">
      <button
        onClick={handleCopy}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md bg-slate-800 text-slate-400 hover:text-white"
        title="Copy response"
      >
        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
      </button>

      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1.5" />;

        // Level 3 Heading
        if (trimmed.startsWith("### ")) {
          return (
            <h3 key={idx} className="text-sm sm:text-base font-bold text-indigo-300 pt-2 pb-1 border-b border-indigo-500/20 flex items-center gap-1.5">
              {trimmed.replace("### ", "")}
            </h3>
          );
        }

        // Level 2 Heading
        if (trimmed.startsWith("## ")) {
          return (
            <h2 key={idx} className="text-base font-bold text-white pt-2 pb-1 border-b border-white/[0.08]">
              {trimmed.replace("## ", "")}
            </h2>
          );
        }

        // Bullet Point
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const bulletText = trimmed.replace(/^[-*]\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5">
              <span className="text-indigo-400 mt-1 font-bold">•</span>
              <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(bulletText) }} />
            </div>
          );
        }

        // Numbered List (1. 2. 3.)
        if (/^\d+\.\s+/.test(trimmed)) {
          const num = trimmed.match(/^\d+/)?.[0] || "1";
          const itemText = trimmed.replace(/^\d+\.\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2 pl-1.5 my-1">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600/30 text-indigo-300 text-[10px] font-bold shrink-0 mt-0.5">
                {num}
              </span>
              <span className="flex-1" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(itemText) }} />
            </div>
          );
        }

        return (
          <p key={idx} dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
        );
      })}
    </div>
  );
}

// Inline Markdown bolding and backtick formatter
function formatInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono text-[11px]">$1</code>');
}

export default function CareerCoachPage() {
  const { getIdToken, user } = useAuth();
  const [messages, setMessages] = useState<CareerCoachMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `### 🎯 Welcome to Your 24/7 AI Career Mentor\n\nHello **${user?.displayName?.split(" ")[0] || "there"}**! I am your Senior Technical Career & Leadership Coach.\n\nI analyze your resume audit, mock interview telemetry, and target tier-1 company hiring rubrics to help you achieve senior & staff engineering milestones, negotiate competitive compensation, and master system architecture.\n\n### 🚀 High-Impact Discussion Topics\n1. **Staff Engineering Roadmaps**: Leveling up to high-leverage architectural ownership.\n2. **FAANG System Design**: 10M RPS microservices, sharding, caching, and incident triage.\n3. **STAR Leadership Stories**: Quantifying latency reductions, uptime, and cross-functional delivery.\n4. **Executive Compensation Negotiation**: Counter-offering between tier-1 tech offers.\n\nWhat milestone would you like to tackle today?`,
      timestamp: new Date(),
      suggestedFollowUps: [
        "How do I become a Senior / Staff Engineer?",
        "What skills should I prioritize next?",
        "How do I prepare for FAANG architectural loops?",
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsRecording(false);
        };

        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Speech recognition is not supported in this browser.");
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
        toast.info("Listening... Speak your career question.");
      } catch {
        setIsRecording(false);
      }
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || sending) return;

    const userMsg: CareerCoachMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date(),
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInput("");
    setSending(true);

    try {
      const token = await getIdToken();
      const res = await fetch("/api/career/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: updatedHistory.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Career coach service error (${res.status})`);
      }

      if (data.data) {
        const botMsg: CareerCoachMessage = {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: data.data.reply,
          timestamp: new Date(),
          suggestedFollowUps: data.data.suggestedFollowUps,
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(data.error || "Failed to get advice");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Request failed";
      toast.error(msg);
      // Clean fallback
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-fallback-${Date.now()}`,
          role: "assistant",
          content: `### 🎯 Strategic Mentorship\n\nTo accelerate your advancement toward top-tier tech placement:\n\n### 🚀 High-Impact Action Steps\n1. **Master Distributed Caching**: Build and deploy an idempotent message worker handling distributed caching with Redis and Cloud Run.\n2. **STAR Behavioral Precision**: Frame past experiences around high-stakes delivery, metrics (latency reduced, uptime preserved), and cross-team influence.\n3. **Targeted Mock Loops**: Complete weekly adaptive technical rounds to build fluent articulation of distributed consensus and database sharding.`,
          timestamp: new Date(),
          suggestedFollowUps: [
            "What projects demonstrate Staff-level architecture?",
            "How do I prepare for system design rounds?",
          ],
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-2">
            <Brain className="h-3.5 w-3.5" />
            24/7 AI Career Mentor & Staff Leadership Coach
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#F8FAFC]">AI Career Mentor</h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1">
            Personalized guidance grounded in your resume audit, mock interview telemetry, and target tier-1 company rubrics.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setMessages([
              {
                id: "welcome-reset",
                role: "assistant",
                content: `### 🎯 Chat Session Refreshed\n\nWhat career milestone or interview challenge would you like to tackle next?`,
                timestamp: new Date(),
                suggestedFollowUps: PROMPT_SUGGESTIONS.slice(0, 3),
              },
            ])
          }
          className="border-white/[0.08] bg-slate-950 text-slate-300 text-xs gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Chat
        </Button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-400">Suggested Inquiries:</span>
        <div className="flex flex-wrap gap-2">
          {PROMPT_SUGGESTIONS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] px-3 py-1.5 rounded-xl border border-white/[0.08] bg-[#0F172A] hover:border-indigo-500/50 hover:bg-indigo-950/30 text-slate-300 hover:text-white transition-all text-left"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Interface */}
      <Card className="border border-white/[0.08] bg-[#0F172A] p-4 flex flex-col h-[580px]">
        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {messages.map((m) => {
            const isBot = m.role === "assistant";
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"}`}
              >
                {isBot && (
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-800 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-1 shadow">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isBot
                      ? "bg-slate-900/90 border border-white/[0.08] text-slate-100 space-y-3 shadow-sm"
                      : "bg-indigo-600 text-white font-medium"
                  }`}
                >
                  {isBot ? (
                    <FormattedMessageContent content={m.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  )}

                  {/* Suggested Follow-Ups */}
                  {isBot && m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                    <div className="pt-3 border-t border-white/[0.06] space-y-1.5">
                      <span className="text-[10px] font-semibold text-indigo-400 block">
                        Recommended Next Questions:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.suggestedFollowUps.map((f, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(f)}
                            className="text-[10px] px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/60 transition-colors"
                          >
                            👉 {f}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-white/[0.06] space-y-2 mt-2">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about technical interviews, career progression, system design, or offer negotiation..."
              className="min-h-[75px] max-h-[120px] bg-slate-950 border-white/[0.08] text-xs sm:text-sm text-slate-100 pr-24 resize-none"
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={isRecording ? "destructive" : "outline"}
                onClick={toggleRecording}
                className={`h-7 w-7 p-0 rounded-lg ${
                  isRecording ? "animate-pulse bg-rose-600 text-white" : "border-white/[0.08] bg-slate-900"
                }`}
              >
                {isRecording ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5 text-indigo-400" />}
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleSendMessage()}
                disabled={sending || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white h-7 px-3 text-xs rounded-lg gap-1 font-medium"
              >
                <Send className="h-3 w-3" />
                {sending ? "Thinking..." : "Ask Coach"}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
