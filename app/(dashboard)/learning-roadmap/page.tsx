"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Map,
  Loader2,
  BookOpen,
  Target,
  ExternalLink,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { LearningRoadmap } from "@/types";

const weekColors = [
  "from-blue-500 to-cyan-500",
  "from-violet-500 to-purple-500",
  "from-emerald-500 to-teal-500",
  "from-orange-500 to-amber-500",
];

export default function LearningRoadmapPage() {
  const { getIdToken } = useAuth();
  const [roadmap, setRoadmap] = useState<LearningRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchRoadmap = async () => {
    try {
      const token = await getIdToken();
      if (!token) return;
      const res = await fetch("/api/roadmap/generate", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setRoadmap(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch roadmap:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [getIdToken]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const token = await getIdToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = null;
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || `Roadmap generation error (${res.status})`);
      }

      setRoadmap(data.data);
      toast.success("Your personalized roadmap is ready! 🗺️");
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Failed to generate roadmap. Please try again.";
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Learning Roadmap</h1>
          <p className="text-muted-foreground">
            Your personalized 30-day improvement plan based on your resume and
            interview performance.
          </p>
        </div>
        <Button
          variant="gradient"
          onClick={handleGenerate}
          disabled={generating}
          className="shrink-0"
        >
          {generating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
          ) : (
            <><RefreshCw className="h-4 w-4" /> {roadmap ? "Regenerate" : "Generate"}</>
          )}
        </Button>
      </div>

      {!roadmap && !generating ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <Map className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No roadmap yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Generate a personalized learning plan based on your resume analysis
            and interview performance.
          </p>
          <Button variant="gradient" onClick={handleGenerate} disabled={generating}>
            <Sparkles className="h-4 w-4" />
            Generate My Roadmap
          </Button>
        </motion.div>
      ) : generating ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center">
            <Sparkles className="h-7 w-7 text-white animate-pulse" />
          </div>
          <div className="text-center">
            <h2 className="text-lg font-semibold mb-1">Crafting Your Roadmap</h2>
            <p className="text-muted-foreground text-sm">
              Gemini AI is analyzing your gaps and creating a personalized plan...
            </p>
          </div>
        </div>
      ) : roadmap ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header card */}
          <Card className="overflow-hidden">
            <div className="gradient-primary p-6 text-white">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Map className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">{roadmap.title}</h2>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {roadmap.description}
                  </p>
                  <div className="flex gap-3 mt-3">
                    <Badge className="bg-white/20 text-white border-white/30">
                      <Calendar className="h-3 w-3 mr-1" />
                      {roadmap.totalDays} Days
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30">
                      4 Weeks
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30">
                      {roadmap.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Week cards */}
          <div className="space-y-4">
            {roadmap.weeks.map((week, i) => (
              <motion.div
                key={week.week}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="overflow-hidden hover:border-primary/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-xl bg-gradient-to-br ${weekColors[i % 4]} flex items-center justify-center shrink-0`}
                      >
                        <span className="text-white font-bold text-sm">
                          W{week.week}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          Week {week.week}: {week.title}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          Days {(week.week - 1) * 7 + 1}–{week.week * 7}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Topics */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" /> Topics to Cover
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {week.topics.map((topic) => (
                          <Badge key={topic} variant="secondary">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Goals */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                        <Target className="h-3.5 w-3.5" /> Weekly Goals
                      </p>
                      <ul className="space-y-1.5">
                        {week.goals.map((goal) => (
                          <li
                            key={goal}
                            className="flex items-start gap-2 text-xs text-muted-foreground"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Resources */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                        <ExternalLink className="h-3.5 w-3.5" /> Recommended Resources
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {week.resources.map((resource) => (
                          <span
                            key={resource}
                            className="inline-flex items-center gap-1 text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {resource}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}
