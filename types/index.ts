// ============================================================
// TypeScript Types for InterviewAce AI V6 (Enterprise Platform)
// ============================================================

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  createdAt: Date;
  updatedAt: Date;
  resumeScore?: number;
  totalInterviews?: number;
  averageScore?: number;
  readinessScore?: number;
  targetRole?: string;
  interviewStreak?: number;
  completedTracks?: string[];
  xp?: number;
  level?: number;
  levelTitle?: string;
  badges?: string[];
  weakestSkill?: string;
  strongestSkill?: string;
  lastInterviewDate?: string;
  nextRecommendedInterview?: string;
  onboardingCompleted?: boolean;
  careerGoal?: string;
  experienceLevel?: string;
  targetCompanies?: string[];
  activeInterviewId?: string;
  activeInterviewRole?: string;
  activeInterviewQuestion?: number;
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  uploadedAt: Date;
  analysisId?: string;
}

export interface ResumeAnalysis {
  id: string;
  userId: string;
  resumeId: string;
  atsScore: number;
  keywordMatchScore?: number;
  skillMatchScore?: number;
  roleMatchScore?: number;
  achievementScore?: number;
  impactScore?: number;
  grammarScore?: number;
  formattingScore?: number;
  sectionCompletenessScore?: number;
  marketCompetitivenessScore?: number;
  industryBenchmarkComparison?: string;
  salaryImpactEstimate?: string;
  suggestedKeywords?: string[];
  technicalSkills: string[];
  techStack?: string[];
  projects?: string[];
  softSkills: string[];
  missingSkills: string[];
  suggestions: string[];
  strengths: string[];
  weaknesses?: string[];
  experience: string;
  education: string;
  summary: string;
  createdAt: Date;
}

export type InterviewRole =
  | "Full Stack Developer"
  | "Cloud Engineer"
  | "DevOps Engineer"
  | "Data Analyst"
  | "AI Engineer"
  | "Frontend Developer"
  | "Backend Developer"
  | "Product Manager";

export type InterviewDifficulty = "Entry Level" | "Intermediate" | "Senior" | "Staff / Principal";
export type InterviewType = "Technical" | "Behavioral" | "System Design" | "Mixed";
export type InterviewTrack = "General" | "Google" | "Amazon" | "Microsoft" | "Meta" | "Netflix" | "Startup";
export type HiringRecommendation = "Strong Hire" | "Hire" | "Borderline" | "No Hire";
export type InterviewMode = "text" | "voice" | "video";

export type QuestionCategory =
  | "Java"
  | "Python"
  | "React"
  | "Node"
  | "Full Stack"
  | "Cloud"
  | "System Design"
  | "Databases"
  | "DevOps"
  | "STAR"
  | "Conflict handling"
  | "Leadership"
  | "Ownership"
  | "Communication"
  | "Production outage"
  | "Scaling issue"
  | "Security incident"
  | "Customer escalation"
  | "Algorithms"
  | "Debugging"
  | "Architecture";

export interface RecruiterPersona {
  id: string;
  name: string;
  role: string;
  title: string;
  company: string;
  companyType: string;
  avatarBg: string;
  avatarAccent: string;
  specialty: string;
  tagline: string;
  difficulty: string;
  speakingStyle: string;
  focusAreas: string[];
}

export interface VideoAnalyticsTelemetry {
  eyeContactScore: number;
  speakingCadenceWpm: number;
  fillerWordCount: number;
  fillerWordPercentage: number;
  confidenceScore: number;
  communicationScore?: number;
  bodyLanguageScore?: number;
  professionalismScore?: number;
  energyLevel: "Calm" | "Engaged" | "High Impact" | "Nervous";
  detectedFillers: string[];
}

export interface QuestionScore {
  knowledge: number;
  communication: number;
  problemSolving: number;
  confidence: number;
  depth: number;
  feedback?: string;
}

export interface InterviewMessage {
  role: "interviewer" | "candidate";
  content: string;
  timestamp: Date;
  questionNumber?: number;
  category?: string;
  difficultyLevel?: string;
  codeSnippet?: string;
  score?: QuestionScore;
  followUpReason?: string;
}

export interface Interview {
  id: string;
  userId: string;
  role: InterviewRole;
  difficulty: InterviewDifficulty | string;
  type: InterviewType | string;
  track?: InterviewTrack;
  personaId?: string;
  personaName?: string;
  mode?: InterviewMode;
  status: "active" | "completed";
  currentQuestion: number;
  totalQuestions: number;
  messages: InterviewMessage[];
  askedQuestions?: string[];
  createdAt: Date;
  completedAt?: Date;
  reportId?: string;
  telemetry?: VideoAnalyticsTelemetry;
}

export interface UserPreferences {
  userId: string;
  targetRole?: string;
  targetCompanies?: string[];
  preferredDifficulty?: InterviewDifficulty;
  preferredMode?: InterviewMode;
  ttsEnabled?: boolean;
  handsFreeMode?: boolean;
  codeTheme?: string;
  updatedAt?: Date;
}

export interface EvaluationScore {
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
}

export interface CoachingPlan {
  plan7Day: string[];
  plan30Day: string[];
  plan90Day: string[];
  practiceExercises: string[];
  recommendedResources: string[];
}

export interface SkillBenchmark {
  currentLevel: "Junior" | "Mid-Level" | "Senior" | "Staff" | "Principal";
  targetLevel: string;
  percentileRank: number;
  gapToNextLevel: string[];
  timelineToAdvance: string;
}

export interface InterviewReport {
  id: string;
  userId: string;
  interviewId: string;
  role: InterviewRole | string;
  difficulty: InterviewDifficulty | string;
  type: InterviewType | string;
  track?: InterviewTrack;
  personaName?: string;
  mode?: InterviewMode;
  scores: EvaluationScore;
  hiringRecommendation?: HiringRecommendation;
  strengths: string[];
  weaknesses: string[];
  missedOpportunities?: string[];
  recommendations: string[];
  detailedFeedback: string;
  coachingPlan?: CoachingPlan;
  benchmarking?: SkillBenchmark;
  telemetry?: VideoAnalyticsTelemetry;
  createdAt: Date;
}

export interface RoadmapWeek {
  week: number;
  title: string;
  topics: string[];
  resources: string[];
  goals: string[];
}

export interface LearningRoadmap {
  id: string;
  userId: string;
  role: string;
  basedOnResumeId?: string;
  basedOnInterviewId?: string;
  title: string;
  description: string;
  weeks: RoadmapWeek[];
  totalDays: number;
  createdAt: Date;
}

export interface CareerPlan {
  id: string;
  userId: string;
  targetRole: string;
  basedOnResumeId?: string;
  basedOnInterviewId?: string;
  readinessScore: number;
  readinessEstimate: string;
  skillGaps: string[];
  recommendedTechnologies: string[];
  recommendedCertifications: string[];
  recommendedProjects: string[];
  interviewPrepAreas: string[];
  careerStrategy: string;
  salaryGrowthPlan?: {
    currentEstimate: string;
    targetEstimate: string;
    timeline: string;
    keyLevers: string[];
  };
  plan90Day?: string;
  plan180Day?: string;
  plan365Day?: string;
  createdAt: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  category: "interview" | "resume" | "mastery" | "streak";
  progress?: number;
  target?: number;
  xpReward: number;
}

export interface GamificationStats {
  xp: number;
  level: number;
  levelTitle: string;
  xpToNextLevel: number;
  streakDays: number;
  achievements: Achievement[];
  weeklyInterviewsGoal: number;
  weeklyInterviewsCompleted: number;
}

export interface SmartRecommendation {
  id: string;
  title: string;
  description: string;
  category: "interview" | "resume" | "skill" | "cert";
  actionText: string;
  actionHref: string;
  priority: "High" | "Medium" | "Low";
}

export interface ActiveInterviewSummary {
  id: string;
  role: string;
  currentQuestion: number;
  totalQuestions: number;
  track?: string;
  personaName?: string;
  mode?: InterviewMode;
  updatedAt?: Date | string;
}

export interface AutoResumeData {
  id: string;
  fileName?: string;
  atsScore: number;
  missingSkills: string[];
  suggestions: string[];
  technicalSkills: string[];
  summary?: string;
}

export interface DashboardStats {
  interviewsTaken: number;
  averageScore: number;
  resumeScore: number;
  readinessScore: number;
  improvementTrend: number;
  weakestSkill?: string;
  strongestSkill?: string;
  lastInterviewDate?: string;
  nextRecommendedInterview?: string;
  gamification?: GamificationStats;
  activeInterview?: ActiveInterviewSummary | null;
  autoResume?: AutoResumeData | null;
  smartRecommendations?: SmartRecommendation[];
  careerReadinessScore?: number;
  welcomeMessage?: string;
  skillLevel?: string;
}

export interface CareerCoachMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestedFollowUps?: string[];
  actionItems?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
