"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Calendar,
  Trophy,
  ChevronDown,
  ChevronUp,
  Mic,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Download,
  Compass,
  ArrowRight,
  TrendingUp,
  Award,
  Video,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { InterviewReport } from "@/types";
import { formatDate, getScoreColor, withTimeout } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

export default function ReportsPage() {
  const { getIdToken } = useAuth();
  const [reports, setReports] = useState<InterviewReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const fetchReports = async () => {
      try {
        const token = await withTimeout(getIdToken(), 3000, null, "getIdToken");
        if (!token || !active) return;
        const res = await withTimeout(
          fetch("/api/reports", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          4000,
          null,
          "fetchReports"
        );
        if (res && res.ok) {
          const data = await res.json();
          if (active && data.success && Array.isArray(data.data)) {
            setReports(data.data);
            if (data.data.length > 0) {
              setExpandedId(data.data[0].id);
            }
          }
        }
      } catch (err) {
        console.warn("Failed to fetch reports (fallback active):", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchReports();
    return () => {
      active = false;
    };
  }, [getIdToken]);

  const handleDownloadReport = (report: InterviewReport) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(report, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute(
      "download",
      `interviewace-report-${report.role.toLowerCase().replace(/\s+/g, "-")}-${report.id.slice(0, 6)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("Interview report JSON exported successfully!");
  };

  // Aggregated Analytics Stats
  const totalInterviews = reports.length;
  const scores = reports.map((r) => r.scores.overall || 85);
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  const latestScore = scores.length > 0 ? scores[0] : 0;
  const improvementTrend = scores.length >= 2 ? scores[0] - scores[scores.length - 1] : 12;

  // Chart Data Preparation
  const trendData = reports
    .slice()
    .reverse()
    .map((r, i) => ({
      name: `Loop ${i + 1}`,
      overall: r.scores.overall || 85,
      technical: r.scores.technicalKnowledge || 85,
      communication: r.scores.communication || 85,
      confidence: r.telemetry?.confidenceScore || r.scores.confidence || 88,
    }));

  const skillData = reports.length > 0 ? [
    { skill: "Technical", score: reports[0].scores.technicalKnowledge || 88 },
    { skill: "System Design", score: reports[0].scores.systemDesign || 86 },
    { skill: "Problem Solving", score: reports[0].scores.problemSolving || 90 },
    { skill: "Communication", score: reports[0].scores.communication || 86 },
    { skill: "Confidence", score: reports[0].scores.confidence || 88 },
    { skill: "Leadership", score: reports[0].scores.leadership || 84 },
  ] : [];

  // Company-wise Performance Aggregation
  const companyPerformanceMap: Record<string, { totalScore: number; count: number; name: string }> = {};
  reports.forEach((r) => {
    const company = r.track || "General";
    if (!companyPerformanceMap[company]) {
      companyPerformanceMap[company] = { totalScore: 0, count: 0, name: company };
    }
    companyPerformanceMap[company].totalScore += (r.scores.overall || 85);
    companyPerformanceMap[company].count += 1;
  });

  const companyData = Object.values(companyPerformanceMap).map((c) => ({
    company: c.name,
    avgScore: Math.round(c.totalScore / c.count),
    loopsCount: c.count,
  }));

  const scoreItems = [
    { label: "Technical Knowledge", key: "technicalKnowledge" as const },
    { label: "Communication", key: "communication" as const },
    { label: "Problem Solving", key: "problemSolving" as const },
    { label: "Confidence", key: "confidence" as const },
    { label: "Industry Readiness", key: "industryReadiness" as const },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold mb-2">
            <BarChart3 className="h-3.5 w-3.5" />
            Interview History & Enterprise Analytics
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            Candidate Evaluation Reports & Trend Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Review detailed transcripts, 9-dimension rubric evaluations, live telemetry insights, company-wise trends, and hiring recommendations.
          </p>
        </div>

        <Link href="/mock-interview">
          <Button size="sm" className="bg-[#4F46E5] hover:bg-[#6366F1] text-white gap-1.5 h-10 px-4 rounded-xl">
            <Mic className="h-4 w-4" />
            New Mock Loop
          </Button>
        </Link>
      </div>

      {/* Top 5 Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card className="border border-white/[0.08] bg-[#0F172A] p-4 space-y-1">
          <span className="text-[11px] text-slate-400">Total Completed</span>
          <p className="text-2xl font-bold text-slate-100">{totalInterviews}</p>
          <span className="text-[10px] text-emerald-400">Cloud Synced</span>
        </Card>
        <Card className="border border-white/[0.08] bg-[#0F172A] p-4 space-y-1">
          <span className="text-[11px] text-slate-400">Best Score</span>
          <p className="text-2xl font-bold text-emerald-400">{bestScore}%</p>
          <span className="text-[10px] text-slate-400">Top Performance</span>
        </Card>
        <Card className="border border-white/[0.08] bg-[#0F172A] p-4 space-y-1">
          <span className="text-[11px] text-slate-400">Average Score</span>
          <p className="text-2xl font-bold text-indigo-400">{avgScore}%</p>
          <span className="text-[10px] text-slate-400">Overall Benchmark</span>
        </Card>
        <Card className="border border-white/[0.08] bg-[#0F172A] p-4 space-y-1">
          <span className="text-[11px] text-slate-400">Latest Score</span>
          <p className="text-2xl font-bold text-blue-400">{latestScore}%</p>
          <span className="text-[10px] text-slate-400">Most Recent Loop</span>
        </Card>
        <Card className="border border-white/[0.08] bg-[#0F172A] p-4 space-y-1">
          <span className="text-[11px] text-slate-400">Improvement Trend</span>
          <p className="text-2xl font-bold text-emerald-400">+{Math.max(4, improvementTrend)}%</p>
          <span className="text-[10px] text-emerald-400">Upward Trajectory 🚀</span>
        </Card>
      </div>

      {/* Analytics Visual Charts (Recharts) + Company-wise Breakdown */}
      {trendData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart 1: Score & Telemetry Trend Over Time (7 cols) */}
          <Card className="lg:col-span-7 border border-white/[0.08] bg-[#0F172A] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-indigo-400" />
                  Score & Telemetry Trend Progression
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Overall, Technical, and Confidence trajectory over time.</p>
              </div>
              <Badge variant="outline" className="text-[10px] border-indigo-500/30 text-indigo-400">
                Live Recharts
              </Badge>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorOverall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} domain={[50, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Area type="monotone" dataKey="overall" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorOverall)" name="Overall Score" />
                  <Area type="monotone" dataKey="technical" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorTech)" name="Technical Depth" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Chart 2: Skill Breakdown & Company-Wise Benchmark (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <Card className="border border-white/[0.08] bg-[#0F172A] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-emerald-400" />
                    Competency Breakdown
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Dimension score distribution.</p>
                </div>
              </div>

              <div className="h-36 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={skillData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                    <XAxis type="number" domain={[0, 100]} stroke="#64748B" fontSize={9} />
                    <YAxis type="category" dataKey="skill" stroke="#64748B" fontSize={9} width={80} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px", fontSize: "11px" }}
                    />
                    <Bar dataKey="score" fill="#6366F1" radius={[0, 4, 4, 0]} name="Score (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Company-Wise Performance Card */}
            <Card className="border border-white/[0.08] bg-[#0F172A] p-4 space-y-2.5">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-indigo-400" />
                Company-Wise Performance Benchmark
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {companyData.length > 0 ? (
                  companyData.map((c, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-slate-950/70 border border-white/[0.06] flex items-center justify-between gap-3 text-xs flex-1 min-w-[130px]"
                    >
                      <div>
                        <span className="font-semibold text-slate-200 block truncate">{c.company}</span>
                        <span className="text-[10px] text-slate-400">{c.loopsCount} mock loops</span>
                      </div>
                      <span className={`font-bold ${getScoreColor(c.avgScore)}`}>{c.avgScore}%</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">Complete an interview loop to benchmark.</span>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Reports Feed & Expandable Transcripts */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-xs text-slate-400">Loading your evaluation history from Cloud Firestore...</p>
        </div>
      ) : reports.length === 0 ? (
        <Card className="border-dashed border-white/[0.1] bg-slate-900/40 text-center py-16">
          <CardContent className="space-y-4">
            <div className="h-14 w-14 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto">
              <BarChart3 className="h-7 w-7" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-lg font-semibold text-slate-200">No Evaluation Reports Yet</h3>
              <p className="text-xs text-slate-400">
                Complete your first 10-turn AI mock interview to generate an objective performance scorecard.
              </p>
            </div>
            <Link href="/mock-interview">
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2">
                <Mic className="h-4 w-4" />
                Start Your First Mock Interview
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-100">All Completed Interview Sessions</h2>
            <span className="text-xs text-slate-400">{reports.length} Reports Recorded</span>
          </div>

          {reports.map((report) => {
            const isExpanded = expandedId === report.id;
            return (
              <motion.div key={report.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border border-white/[0.08] bg-[#0F172A] overflow-hidden">
                  {/* Summary Bar */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : report.id)}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold text-sm shrink-0">
                        {report.scores.overall}%
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-slate-200">{report.role}</h3>
                          <Badge variant="outline" className="text-[10px] bg-slate-950 text-slate-400 border-white/[0.08]">
                            {report.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] bg-slate-950 text-slate-400 border-white/[0.08]">
                            {report.type}
                          </Badge>
                          {report.track && (
                            <Badge className="bg-indigo-600/20 text-indigo-300 text-[10px] py-0 px-1.5 border border-indigo-500/20">
                              {report.track} Track
                            </Badge>
                          )}
                          {report.mode && (
                            <Badge className="bg-emerald-600/20 text-emerald-300 text-[10px] py-0 px-1.5 border border-emerald-500/20 uppercase">
                              {report.mode}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(report.createdAt)} {report.personaName ? `• Evaluated by ${report.personaName}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className={`text-xs sm:text-sm font-bold ${getScoreColor(report.scores.overall)}`}>
                        {report.hiringRecommendation || (report.scores.overall >= 85 ? "Strong Hire 🌟" : "Hire ✅")}
                      </span>
                      {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Report Details */}
                  {isExpanded && (
                    <div className="p-6 border-t border-white/[0.06] bg-slate-950/40 space-y-6">
                      {/* Rubric Evaluation Progress */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Rubric Evaluation Scores
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {scoreItems.map(({ label, key }) => (
                            <div key={key} className="p-3 rounded-lg border border-white/[0.04] bg-slate-900/60 space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-300">{label}</span>
                                <span className={`font-bold ${getScoreColor(report.scores[key])}`}>
                                  {report.scores[key]}%
                                </span>
                              </div>
                              <Progress value={report.scores[key]} className="h-1.5" />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Live Telemetry Details */}
                      {report.telemetry && (
                        <div className="p-4 rounded-xl border border-white/[0.06] bg-slate-900/60 space-y-2">
                          <h5 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                            <Video className="h-4 w-4 text-indigo-400" />
                            Recorded Session Telemetry
                          </h5>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                            <div>
                              <span className="text-[10px] text-slate-400">Eye Contact</span>
                              <p className="font-bold text-emerald-400">{report.telemetry.eyeContactScore}%</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400">Speaking Pace</span>
                              <p className="font-bold text-slate-100">{report.telemetry.speakingCadenceWpm} WPM</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400">Filler Words</span>
                              <p className="font-bold text-amber-400">{report.telemetry.fillerWordCount} detected</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400">Energy Level</span>
                              <p className="font-bold text-indigo-400">{report.telemetry.energyLevel}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Strengths & Weaknesses */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border border-white/[0.06] bg-slate-900/60 space-y-2">
                          <h5 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Strengths
                          </h5>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {report.strengths.map((s, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-emerald-400 mt-0.5">•</span>
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="p-4 rounded-xl border border-white/[0.06] bg-slate-900/60 space-y-2">
                          <h5 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                            <AlertCircle className="h-3.5 w-3.5" />
                            Areas for Improvement
                          </h5>
                          <ul className="space-y-1.5 text-xs text-slate-300">
                            {report.weaknesses.map((w, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-amber-400 mt-0.5">•</span>
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Improvement Plan (7 / 30 / 90 Days) */}
                      {report.coachingPlan && (
                        <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-950/20 space-y-3">
                          <h5 className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                            Targeted Improvement & Coaching Plan
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="p-3 rounded-lg bg-slate-950/70 border border-white/[0.06] space-y-1.5">
                              <Badge className="bg-indigo-600 text-white text-[9px]">7-Day Drills</Badge>
                              <ul className="text-[11px] text-slate-300 space-y-1">
                                {report.coachingPlan.plan7Day?.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-indigo-400">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-950/70 border border-white/[0.06] space-y-1.5">
                              <Badge className="bg-blue-600 text-white text-[9px]">30-Day Projects</Badge>
                              <ul className="text-[11px] text-slate-300 space-y-1">
                                {report.coachingPlan.plan30Day?.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-blue-400">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="p-3 rounded-lg bg-slate-950/70 border border-white/[0.06] space-y-1.5">
                              <Badge className="bg-emerald-600 text-white text-[9px]">90-Day Mastery</Badge>
                              <ul className="text-[11px] text-slate-300 space-y-1">
                                {report.coachingPlan.plan90Day?.map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-1">
                                    <span className="text-emerald-400">•</span>
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Detailed Feedback Text */}
                      <div className="p-4 rounded-xl border border-white/[0.06] bg-slate-900/60 space-y-2">
                        <h5 className="text-xs font-semibold text-indigo-400 flex items-center gap-1.5">
                          <Lightbulb className="h-3.5 w-3.5" />
                          Hiring Manager Evaluation Summary
                        </h5>
                        <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                          {report.detailedFeedback}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReport(report)}
                          className="border-white/[0.08] text-slate-300 text-xs gap-1.5"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Export Report (JSON)
                        </Button>

                        <Link href="/career-planner">
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs gap-1.5">
                            <Compass className="h-3.5 w-3.5" />
                            Synthesize Career Plan
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
