import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Plus,
  Trash2,
  Eye,
  LogOut,
  Save,
  Loader2,
  Upload,
  Sparkles,
  ArrowRight,
  Target,
  Lightbulb,
  RefreshCw,
  Github,
  Linkedin,
  Building2,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Zap,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { toast } from "sonner";
import { useCollegeSettings } from "@/hooks/useCollegeSettings";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { EmptyState, LoadingGrid, StatePanel } from "@/components/common/AsyncState";
import { doc, getDoc, updateDoc } from "@/lib/postgres-bridge";

// Interfaces (Strictly conserved)
interface PersonalInfo {
  name: string;
  location: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
}

interface Education {
  institution: string;
  degree: string;
  major: string;
  year: string;
  gpa: string;
  honors: string;
  coursework: string[];
}

interface Experience {
  company: string;
  title: string;
  duration: string;
  location: string;
  description: string[];
}

interface Project {
  name: string;
  date: string;
  description: string[];
}

interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: {
    technical: string;
    programming: string;
    languages: string;
    certifications: string;
  };
}

interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
  keywordMatch: { keyword: string; found: boolean }[];
}

const RESUME_DRAFT_STORAGE_KEY_PREFIX = "resume-builder-draft:";
const PROGRAMMING_LANGUAGE_KEYWORDS = [
  "c",
  "c++",
  "c#",
  "java",
  "python",
  "javascript",
  "typescript",
  "go",
  "rust",
  "kotlin",
  "swift",
  "scala",
  "ruby",
  "php",
];

const LANGUAGE_PATTERNS: Record<string, RegExp> = {
  "c": /\bc\s+language\b|(?:^|[\s,;|/()\[\]-])c(?=$|[\s,;|/()\[\]-])/i,
  "c++": /\bc\+\+\b/i,
  "c#": /\bc#\b|\bcsharp\b/i,
  "java": /\bjava\b/i,
  "python": /\bpython\b/i,
  "javascript": /\bjavascript\b/i,
  "typescript": /\btypescript\b/i,
  "go": /\bgolang\b|(?:^|[\s,;|/()\[\]-])go(?=$|[\s,;|/()\[\]-])/i,
  "rust": /\brust\b/i,
  "kotlin": /\bkotlin\b/i,
  "swift": /\bswift\b/i,
  "scala": /\bscala\b/i,
  "ruby": /\bruby\b/i,
  "php": /\bphp\b/i,
};

const SDE_CORE_KEYWORDS = [
  "data structures",
  "algorithms",
  "system design",
  "object-oriented",
  "oop",
  "problem solving",
  "leetcode",
];

const CODING_BASELINE_KEYWORDS = [
  "data structures",
  "algorithms",
  "system design",
  "problem solving",
  "sql",
  "rest api",
  "distributed systems",
  "testing",
];

const SDE_ROLE_SIGNAL_KEYWORDS = [
  "data structures",
  "algorithms",
  "system design",
  "distributed systems",
  "rest api",
  "microservices",
  "sql",
  "testing",
  "ci/cd",
  "docker",
  "kubernetes",
  "cloud",
  "node.js",
  "java",
  "python",
  "javascript",
  "typescript",
  "react",
];

const KEYWORD_PATTERNS: Record<string, RegExp> = {
  "rest api": /rest(?:ful)?\s+api(?:s)?/i,
  "system design": /system\s+design/i,
  "distributed systems": /distributed\s+systems?/i,
  "data structures": /data\s+structures?/i,
  "algorithms": /algorithms?/i,
  "problem solving": /problem[-\s]?solving/i,
  "object-oriented": /object[-\s]?oriented|\boop\b/i,
  "sql": /\bsql\b|postgresql|mysql|sqlite|mssql/i,
  "testing": /\btesting\b|unit\s+test|integration\s+test/i,
  "ci/cd": /ci\s*\/\s*cd|continuous\s+integration|continuous\s+delivery/i,
  "cloud": /\bcloud\b|aws|gcp|azure/i,
  "node.js": /node\.?js/i,
};

const STRONG_SDE_SIGNAL_PATTERNS = [
  /leetcode|codeforces|codechef|hackerrank|icpc/i,
  /system\s+design|distributed\s+systems|scalability|high\s+throughput|low\s+latency/i,
  /aws|gcp|azure|kubernetes|docker|microservices/i,
  /\b(50k|100k|1m|million|latency|throughput|p95|p99|sla)\b/i,
];

const clampScore = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const dedupeTextList = (items: string[]) => {
  const seen = new Set<string>();
  return items.filter((item) => {
    const normalized = item.trim().toLowerCase();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
};

const normalizeTechText = (text: string) =>
  text
    .toLowerCase()
    .replace(/node\.?js/g, "nodejs")
    .replace(/ci\s*\/\s*cd/g, "cicd")
    .replace(/[^a-z0-9+#\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const hasLanguageMention = (text: string, language: string) => {
  const pattern = LANGUAGE_PATTERNS[language];
  return pattern ? pattern.test(text) : false;
};

const hasKeywordMention = (text: string, keyword: string) => {
  if (PROGRAMMING_LANGUAGE_KEYWORDS.includes(keyword)) {
    return hasLanguageMention(text, keyword);
  }

  const pattern = KEYWORD_PATTERNS[keyword];
  if (pattern) {
    return pattern.test(text);
  }

  const normalizedText = normalizeTechText(text);
  const normalizedKeyword = normalizeTechText(keyword);
  return normalizedText.includes(normalizedKeyword);
};

const toStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const toKeywordMatchArray = (value: unknown) => {
  if (!Array.isArray(value)) return [] as { keyword: string; found: boolean }[];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      const keyword = typeof record.keyword === "string" ? record.keyword.trim() : "";
      if (!keyword) return null;
      return {
        keyword,
        found: Boolean(record.found),
      };
    })
    .filter((item): item is { keyword: string; found: boolean } => Boolean(item));
};

const extractJsonObjectFromText = (raw: string) => {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  return trimmed;
};

const normalizeAnalysisResult = (raw: unknown): AnalysisResult => {
  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const keywordMatch = toKeywordMatchArray(record.keywordMatch);
  const numericScore = Number(record.matchScore);
  const derivedScore =
    keywordMatch.length > 0
      ? Math.round((keywordMatch.filter((entry) => entry.found).length / keywordMatch.length) * 100)
      : 0;

  const strengths = toStringArray(record.strengths);
  const gaps = toStringArray(record.gaps);
  const suggestions = toStringArray(record.suggestions);

  return {
    matchScore: clampScore(Number.isFinite(numericScore) ? numericScore : derivedScore),
    strengths: strengths.length > 0 ? strengths : ["No clear strengths were extracted from the AI response."],
    gaps: gaps.length > 0 ? gaps : ["Unable to extract complete analysis details from the AI response."],
    suggestions:
      suggestions.length > 0
        ? suggestions
        : ["Try running the audit again with a full job description for a more reliable score."],
    keywordMatch,
  };
};

const isImageResumePlaceholder = (resumeContext: string) =>
  resumeContext.toLowerCase().includes("[image_resume_upload:");

const buildDeterministicFallbackAnalysis = (
  resumeContext: string,
  jobDescription: string,
): AnalysisResult => {
  const resumeText = resumeContext.toLowerCase();
  const jdText = jobDescription.toLowerCase();
  const imageSource = isImageResumePlaceholder(resumeContext);

  if (imageSource) {
    return {
      matchScore: clampScore(64),
      strengths: ["Resume image was received and prepared for AI vision analysis."],
      gaps: ["AI vision response was unavailable, so this fallback score is conservative."],
      suggestions: [
        "Retry once with the same image after a few seconds.",
        "For highest reliability, upload a text-based PDF resume.",
        "Use a clear, high-contrast screenshot with all resume sections visible.",
      ],
      keywordMatch: CODING_BASELINE_KEYWORDS.map((keyword) => ({ keyword, found: false })),
    };
  }

  const targetedKeywords = Array.from(
    new Set(
      [
        ...PROGRAMMING_LANGUAGE_KEYWORDS,
        ...SDE_ROLE_SIGNAL_KEYWORDS,
        ...CODING_BASELINE_KEYWORDS,
      ].filter((keyword) => hasKeywordMention(jdText, keyword)),
    ),
  );

  const keywordUniverse =
    targetedKeywords.length > 0
      ? targetedKeywords.slice(0, 14)
      : CODING_BASELINE_KEYWORDS.slice(0, 8);

  const keywordMatch = keywordUniverse.map((keyword) => ({
    keyword,
    found: hasKeywordMention(resumeText, keyword),
  }));

  const matchedCount = keywordMatch.filter((item) => item.found).length;
  const coverage = keywordMatch.length > 0 ? matchedCount / keywordMatch.length : 0;
  const knownLanguages = PROGRAMMING_LANGUAGE_KEYWORDS.filter((lang) =>
    hasLanguageMention(resumeText, lang),
  );
  const isVagueJd = jobDescription.trim().split(/\s+/).filter(Boolean).length < 6;

  let score = 20 + coverage * 60 + Math.min(knownLanguages.length, 4) * 4;
  if (isVagueJd) score = Math.min(score, 68);

  const strengths = keywordMatch
    .filter((item) => item.found)
    .slice(0, 4)
    .map((item) => `Resume includes ${item.keyword} relevant to the target role.`);

  const gaps = keywordMatch
    .filter((item) => !item.found)
    .slice(0, 4)
    .map((item) => `Missing or weak evidence for ${item.keyword}.`);

  return {
    matchScore: clampScore(score),
    strengths:
      strengths.length > 0
        ? strengths
        : ["Limited direct match signals were detected in the uploaded resume."],
    gaps:
      gaps.length > 0
        ? gaps
        : ["Add more role-specific depth and measurable impact for stronger matching."],
    suggestions: [
      "Add quantified impact bullets with scale, latency, or throughput metrics.",
      "Mirror the job description keywords in projects and experience sections.",
      "Include explicit language/tool evidence for each core requirement.",
    ],
    keywordMatch,
  };
};

const applyDeterministicScoreGuard = (
  analysis: AnalysisResult,
  resumeContext: string,
  jobDescription: string,
): AnalysisResult => {
  if (isImageResumePlaceholder(resumeContext)) {
    const normalizedGaps = dedupeTextList(analysis.gaps);
    if (normalizedGaps.length === 0) {
      normalizedGaps.push("Image-based analysis has lower confidence than text extraction.");
    }
    return {
      ...analysis,
      matchScore: clampScore(analysis.matchScore),
      gaps: normalizedGaps,
      suggestions: dedupeTextList(analysis.suggestions),
    };
  }

  const resumeText = resumeContext.toLowerCase();
  const jdText = jobDescription.toLowerCase();
  const jdWordCount = jobDescription.trim().split(/\s+/).filter(Boolean).length;
  const isCodingRole =
    /(\bsde\b|software\s+engineer|software\s+developer|backend|frontend|full\s*stack)/i.test(
      jobDescription,
    );
  const demandsHighScale =
    /(scalability|high\s+throughput|low\s+latency|distributed\s+systems?|system\s+design)/i.test(
      jdText,
    );
  const isVagueJd = jdWordCount < 6 || jobDescription.trim().length < 30;

  if (!isCodingRole) {
    return analysis;
  }

  const jdLanguages = PROGRAMMING_LANGUAGE_KEYWORDS.filter((lang) =>
    hasLanguageMention(jdText, lang),
  );
  const jdRoleSignals = SDE_ROLE_SIGNAL_KEYWORDS.filter((keyword) =>
    hasKeywordMention(jdText, keyword),
  );
  const knownLanguages = PROGRAMMING_LANGUAGE_KEYWORDS.filter((lang) =>
    hasLanguageMention(resumeText, lang),
  );
  const matchedRoleSignals = jdRoleSignals.filter((keyword) =>
    hasKeywordMention(resumeText, keyword),
  );
  const roleSignalCoverage =
    jdRoleSignals.length > 0
      ? matchedRoleSignals.length / jdRoleSignals.length
      : 0;
  const hasCoreSdeSignal = SDE_CORE_KEYWORDS.some((kw) => resumeText.includes(kw));

  let penalty = 0;
  const gaps = [...analysis.gaps];
  const suggestions = [...analysis.suggestions];

  if (isVagueJd) {
    penalty += 14;
    gaps.push("Job description is too short for reliable evaluation.");
    suggestions.push("Paste the full SDE job description (responsibilities, required skills, and qualifications) for a rigorous score.");
  }

  if (knownLanguages.length === 0) {
    penalty += 18;
    gaps.push("No programming language evidence found for a software engineering role.");
    suggestions.push("Add a Programming Languages section with your strongest coding languages and projects using them.");
  }

  if (jdLanguages.length > 0) {
    const matchedRequiredLanguages = jdLanguages.filter((lang) =>
      hasLanguageMention(resumeText, lang),
    );
    if (matchedRequiredLanguages.length === 0) {
      penalty += 12;
      gaps.push(
        `Job description requires specific languages (${jdLanguages.join(", ")}), but none were found in the resume.`,
      );
    } else if (matchedRequiredLanguages.length < Math.ceil(jdLanguages.length / 2)) {
      penalty += 5;
      gaps.push("Only a small subset of required programming languages appears in the resume.");
    }
  }

  if (!hasCoreSdeSignal) {
    penalty += 7;
    suggestions.push("Highlight Data Structures, Algorithms, and problem-solving experience for SDE screening.");
  }

  if (jdRoleSignals.length >= 3 && roleSignalCoverage < 0.35) {
    penalty += 8;
    gaps.push("Resume has low coverage of role-specific SDE signals required in the job description.");
  }

  if (demandsHighScale) {
    const strongSignalCount = STRONG_SDE_SIGNAL_PATTERNS.filter((pattern) =>
      pattern.test(resumeContext),
    ).length;
    if (strongSignalCount === 0) {
      penalty += 12;
      gaps.push("No strong evidence for high-scale engineering requirements in the job description (scalable systems or quantified impact).");
      suggestions.push("Add quantified impact, DSA/problem-solving achievements, and scalable backend/project evidence aligned to this role.");
    } else if (strongSignalCount === 1) {
      penalty += 4;
      gaps.push("This role asks for high-scale engineering depth; only one strong signal is visible.");
    }
  }

  const guardedScore = clampScore(analysis.matchScore - penalty);
  const keywordMap = new Map<string, { keyword: string; found: boolean }>();

  analysis.keywordMatch.forEach((item) => {
    const keyword = item.keyword.trim();
    if (!keyword) return;
    const key = keyword.toLowerCase();
    keywordMap.set(key, {
      keyword,
      found: hasKeywordMention(resumeText, key),
    });
  });

  jdLanguages.forEach((lang) => {
    const key = lang.toLowerCase();
    if (!keywordMap.has(key)) {
      keywordMap.set(key, { keyword: lang, found: hasLanguageMention(resumeText, lang) });
    }
  });

  CODING_BASELINE_KEYWORDS.forEach((keyword) => {
    const key = keyword.toLowerCase();
    if (!keywordMap.has(key)) {
      keywordMap.set(key, { keyword, found: hasKeywordMention(resumeText, key) });
    }
  });

  let adjustedScore = guardedScore;
  if (isVagueJd) {
    adjustedScore = Math.min(adjustedScore, 72);
  }
  if (jdLanguages.length > 0) {
    const matchedRequiredLanguages = jdLanguages.filter((lang) =>
      hasLanguageMention(resumeText, lang),
    );
    if (matchedRequiredLanguages.length === 0) {
      adjustedScore = Math.min(adjustedScore, 58);
    }
  }
  if (jdRoleSignals.length >= 3) {
    if (roleSignalCoverage < 0.2) {
      adjustedScore = Math.min(adjustedScore, 58);
    } else if (roleSignalCoverage < 0.35) {
      adjustedScore = Math.min(adjustedScore, 72);
    }
  }
  if (demandsHighScale && knownLanguages.length < 2) {
    adjustedScore = Math.min(adjustedScore, 64);
  }

  const normalizedGaps = dedupeTextList(gaps);
  if (normalizedGaps.length === 0) {
    normalizedGaps.push("Resume lacks role-specific depth expected for this target SDE role.");
  }

  return {
    ...analysis,
    matchScore: adjustedScore,
    gaps: normalizedGaps,
    suggestions: dedupeTextList(suggestions),
    keywordMatch: Array.from(keywordMap.values()),
  };
};
let pdfJsPromise: Promise<any> | null = null;

const callOpenAI = async (payload: unknown) => {
  const response = await fetch('/api/openai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      (typeof data?.error === 'string' && data.error) ||
      (typeof data?.message === 'string' && data.message) ||
      `AI proxy request failed (${response.status})`;
    throw new Error(message);
  }

  return data;
};

const getPdfJs = async () => {
  if (!pdfJsPromise) {
    pdfJsPromise = import("pdfjs-dist").then((pdfjs) => {
      // Use CDN worker to avoid bundler-specific `?url` import issues.
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
      return pdfjs;
    });
  }
  return pdfJsPromise;
};

export default function ResumeBuilderIvyLeague() {
  const { user } = useAuth();
  const { settings } = useCollegeSettings();
  const hydratedProfileUidRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  // Add this with your other state declarations
  const [selectedResume, setSelectedResume] = useState<"current" | "upload">(
    "current",
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("builder");

  // Layout Controls
  const [zoom, setZoom] = useState(0.85); // Default scaled down to fit better

  // Builder State
  const [preview, setPreview] = useState(false);
  const [isSavingResume, setIsSavingResume] = useState(false);
  const [hasUnsavedResumeChanges, setHasUnsavedResumeChanges] = useState(false);
  const lastSavedResumeSnapshotRef = useRef<string>("");
  const hasInitializedSaveStateRef = useRef(false);
  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      name: "ARJUN PATEL",
      location: "Kanpur, Uttar Pradesh",
      email: "arjun.patel@pec.edu",
      phone: "+91 7700454732",
      linkedin: "linkedin.com/in/arjunpatel",
      github: "github.com/arjuncode",
    },
    // Dummy Data Pre-filled
    education: [
      {
        institution: "PUNJAB ENGINEERING COLLEGE",
        degree: "Bachelor of Technology",
        major: "Computer Science & Engineering",
        year: "Expected 2026",
        gpa: "8.4/10.0",
        honors: "",
        coursework: ["Data Structures", "Algorithms", "DBMS", "OS"],
      },
    ],
    experience: [
      {
        company: "TECH INNOVATIONS INC.",
        title: "Software Engineering Intern",
        duration: "Jun 2024 - Aug 2024",
        location: "Bangalore, India",
        description: [
          "Developed RESTful APIs using Node.js and Express to handle 10k+ daily requests.",
          "Optimized MongoDB queries reducing response time by 40%.",
          "Collaborated with frontend team to integrate React components.",
        ],
      },
    ],
    projects: [
      {
        name: "SMART CAMPUS APP",
        date: "Jan 2024",
        description: [
          "Built a Flutter based mobile application for campus navigation and attendance.",
          "Integrated PostgreSQL-backed APIs for real-time notifications and data sync.",
          "Deployed to Play Store with over 500+ active student users.",
        ],
      },
    ],
    skills: {
      technical: "Unreal Engine 5, Blender, React.js, Node.js",
      programming: "C++, Python, JavaScript, TypeScript, Dart",
      languages: "English (Fluent), Hindi (Native)",
      certifications: "AWS Cloud Practitioner, Meta Frontend Developer",
    },
  });

  // Analyzer State
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );

  const getDraftStorageKey = (uid?: string | null) =>
    `${RESUME_DRAFT_STORAGE_KEY_PREFIX}${uid || "guest"}`;

  const readLocalResumeDraft = (uid?: string | null): ResumeData | null => {
    try {
      const raw = localStorage.getItem(getDraftStorageKey(uid));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ResumeData;
      if (!parsed || typeof parsed !== "object") return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const writeLocalResumeDraft = (payload: ResumeData, uid?: string | null) => {
    localStorage.setItem(getDraftStorageKey(uid), JSON.stringify(payload));
  };

  useEffect(() => {
    hasInitializedSaveStateRef.current = false;
    lastSavedResumeSnapshotRef.current = "";
    setHasUnsavedResumeChanges(false);

    if (!user) {
      hydratedProfileUidRef.current = null;
      const guestDraft = readLocalResumeDraft(null);
      if (guestDraft) {
        setResumeData(guestDraft);
      }
      setLoading(false);
      return;
    }

    if (hydratedProfileUidRef.current === user.uid) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      // Logic: Only overwrite fields if they are defaults, or if user data exists.
      // Current dummy data is useful placeholders. We will overwrite personal info with real user info if available.
      if (!user) return;

      try {
        const localDraft = readLocalResumeDraft(user.uid);
        const profileDoc = await getDoc(doc(({} as any), "studentProfiles", user.uid));
        if (profileDoc.exists()) {
          const profile = profileDoc.data();

          setResumeData((prev) => {
            const profileSeeded: ResumeData = {
              ...prev,
              personalInfo: {
                name: user.fullName || prev.personalInfo.name,
                email: user.email || prev.personalInfo.email,
                phone: profile.phone || prev.personalInfo.phone,
                location:
                  [profile.city, profile.state].filter(Boolean).join(", ") ||
                  prev.personalInfo.location,
                linkedin: profile.linkedinUsername
                  ? `linkedin.com/in/${profile.linkedinUsername}`
                  : prev.personalInfo.linkedin,
                github: profile.githubUsername
                  ? `github.com/${profile.githubUsername}`
                  : prev.personalInfo.github,
              },
              education: [
                {
                  institution:
                    settings?.collegeName || prev.education[0].institution,
                  degree: profile.degree || prev.education[0].degree,
                  major: profile.department || prev.education[0].major,
                  year: profile.batch
                    ? `Expected ${profile.batch.split("-")[1]}`
                    : prev.education[0].year,
                  gpa: profile.cgpa
                    ? `${profile.cgpa}/10.0`
                    : prev.education[0].gpa,
                  honors: "",
                  coursework: prev.education[0].coursework,
                },
              ],
            };

            return localDraft || profileSeeded;
          });

          // Note: We deliberately KEEP the dummy Experience/Projects if the user's profile doesn't have them
          // In a real app we might fetch these from 'experiences' collection if it existed.
          toast.success("Synced with your profile");
        } else if (localDraft) {
          setResumeData(localDraft);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        hydratedProfileUidRef.current = user.uid;
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.uid, settings?.collegeName]);

  useEffect(() => {
    if (loading) return;

    const snapshot = JSON.stringify(resumeData);
    if (!hasInitializedSaveStateRef.current) {
      lastSavedResumeSnapshotRef.current = snapshot;
      hasInitializedSaveStateRef.current = true;
      setHasUnsavedResumeChanges(false);
      return;
    }

    setHasUnsavedResumeChanges(snapshot !== lastSavedResumeSnapshotRef.current);
  }, [resumeData, loading]);

  const handleSaveResume = async () => {
    if (!hasUnsavedResumeChanges || isSavingResume) return;

    setIsSavingResume(true);
    try {
      writeLocalResumeDraft(resumeData, user?.uid || null);

      if (user?.uid) {
        await updateDoc(doc(({} as any), "studentProfiles", user.uid), {
          phone: resumeData.personalInfo.phone || null,
          address: resumeData.personalInfo.location || null,
        });
      }

      lastSavedResumeSnapshotRef.current = JSON.stringify(resumeData);
      setHasUnsavedResumeChanges(false);
      toast.success("Resume changes saved.");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Could not save resume changes. Please try again.");
    } finally {
      setIsSavingResume(false);
    }
  };

  // --- Builder Handlers ---
  const handlePersonalInfoChange = (
    field: keyof PersonalInfo,
    value: string,
  ) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const pdfjs = await getPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    // Load the document using the local worker
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false, // Prevents additional external fetches
      isEvalSupported: false,
    });
    
    const pdf = await loadingTask.promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(" ");
      fullText += pageText + "\n";
    }

    return fullText;
  } catch (error) {
    console.error("Text extraction failed:", error);
    throw new Error("Could not read PDF text. Please ensure it's not a scanned image.");
  }
};

  const estimateDataUrlBytes = (dataUrl: string) => {
    const base64 = dataUrl.split(",")[1] || "";
    return Math.floor((base64.length * 3) / 4);
  };

  const fileToDataUrl = (file: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const loadImageElement = (dataUrl: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  const optimizeImageForVision = async (file: File): Promise<string> => {
    const MAX_IMAGE_BYTES = 850_000;
    const MAX_DIMENSION = 1400;

    const initialDataUrl = await fileToDataUrl(file);
    const image = await loadImageElement(initialDataUrl);
    let scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
    let quality = 0.82;
    let bestDataUrl = initialDataUrl;

    for (let attempt = 0; attempt < 5; attempt++) {
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Unable to process image. Please try a different file.");
      }

      ctx.drawImage(image, 0, 0, width, height);
      bestDataUrl = canvas.toDataURL("image/jpeg", quality);

      if (estimateDataUrlBytes(bestDataUrl) <= MAX_IMAGE_BYTES) {
        return bestDataUrl;
      }

      scale *= 0.82;
      quality = Math.max(0.58, quality - 0.1);
    }

    if (estimateDataUrlBytes(bestDataUrl) > MAX_IMAGE_BYTES) {
      throw new Error("Image is too large for analysis after compression. Crop it to the resume area and retry.");
    }

    return bestDataUrl;
  };
  const handleEducationChange = (index: number, field: string, value: any) => {
    setResumeData((prev) => {
      const newEdu = [...prev.education];
      (newEdu[index] as any)[field] = value;
      return { ...prev, education: newEdu };
    });
  };

  const addExperience = () => {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: "Company Name",
          title: "Job Title",
          duration: "Date Range",
          location: "Location",
          description: ["Description bullet point"],
        },
      ],
    }));
  };

  const addProject = () => {
    setResumeData((prev) => ({
      ...prev,
      projects: [
        ...prev.projects,
        {
          name: "Project Name",
          date: "Date",
          description: ["Project description"],
        },
      ],
    }));
  };

  const removeExperience = (index: number) =>
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  const removeProject = (index: number) =>
    setResumeData((prev) => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index),
    }));

  const handleExperienceChange = (i: number, f: string, v: any) => {
    setResumeData((prev) => {
      const arr = [...prev.experience];
      (arr[i] as any)[f] = v;
      return { ...prev, experience: arr };
    });
  };

  const handleProjectChange = (i: number, f: string, v: any) => {
    setResumeData((prev) => {
      const arr = [...prev.projects];
      (arr[i] as any)[f] = v;
      return { ...prev, projects: arr };
    });
  };

  const downloadPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let yPos = 20;

    // Logo Logic (Try to fetch if URL exists)
    // For simplicity in client-side only without proxy, we might skip actual image or use a placeholder
    // If settings?.logoUrl is base64 it works instantly. If https, it might fail CORS.

    // Header
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text(resumeData.personalInfo.name.toUpperCase(), 105, yPos, {
      align: "center",
    });
    yPos += 6;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const contactParts = [
      resumeData.personalInfo.location,
      resumeData.personalInfo.phone,
      resumeData.personalInfo.email,
      resumeData.personalInfo.linkedin,
      resumeData.personalInfo.github,
    ];

    doc.text(contactParts.filter(Boolean).join(" | "), 105, yPos, {
      align: "center",
    });
    yPos += 10;

    const addSection = (title: string) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(title.toUpperCase(), 14, yPos);
      doc.setLineWidth(0.5);
      doc.line(14, yPos + 2, 196, yPos + 2);
      yPos += 7;
    };

    // Education
    if (resumeData.education.length > 0) {
      addSection("Education");
      resumeData.education.forEach((edu) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(edu.institution, 14, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(edu.year, 196, yPos, { align: "right" });
        yPos += 5;

        doc.setFont("helvetica", "italic");
        doc.text(`${edu.degree} in ${edu.major}`, 14, yPos);
        if (edu.gpa) doc.text(`GPA: ${edu.gpa}`, 196, yPos, { align: "right" });
        yPos += 5;

        if (edu.coursework.length > 0 && edu.coursework[0]) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          const text = `Relevant Coursework: ${edu.coursework.join(", ")}`;
          const split = doc.splitTextToSize(text, 180);
          doc.text(split, 14, yPos);
          yPos += split.length * 4;
        }
        yPos += 3;
      });
    }

    // Experience
    if (resumeData.experience.length > 0) {
      addSection("Work Experience");
      resumeData.experience.forEach((exp) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(exp.company, 14, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(exp.location, 196, yPos, { align: "right" });
        yPos += 5;

        doc.setFont("helvetica", "italic");
        doc.text(exp.title, 14, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(exp.duration, 196, yPos, { align: "right" });
        yPos += 5;

        exp.description.forEach((d) => {
          if (!d) return;
          doc.setFontSize(9);
          const bullet = `• ${d}`;
          const split = doc.splitTextToSize(bullet, 180);
          doc.text(split, 18, yPos);
          yPos += split.length * 4;
        });
        yPos += 3;
      });
    }

    // Projects
    if (resumeData.projects.length > 0) {
      addSection("Projects");
      resumeData.projects.forEach((proj) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(proj.name, 14, yPos);
        doc.setFont("helvetica", "normal");
        doc.text(proj.date, 196, yPos, { align: "right" });
        yPos += 5;

        proj.description.forEach((d) => {
          if (!d) return;
          doc.setFontSize(9);
          const bullet = `• ${d}`;
          const split = doc.splitTextToSize(bullet, 180);
          doc.text(split, 18, yPos);
          yPos += split.length * 4;
        });
        yPos += 3;
      });
    }

    // Skills
    addSection("Skills");
    const skills = [
      { l: "Technical", v: resumeData.skills.technical },
      { l: "Programming", v: resumeData.skills.programming },
      { l: "Languages", v: resumeData.skills.languages },
      { l: "Certifications", v: resumeData.skills.certifications },
    ];
    doc.setFontSize(9);
    skills.forEach((s) => {
      if (s.v) {
        doc.setFont("helvetica", "bold");
        doc.text(`${s.l}:`, 14, yPos);
        doc.setFont("helvetica", "normal");
        const split = doc.splitTextToSize(s.v, 150);
        doc.text(split, 45, yPos);
        yPos += split.length * 4 + 2;
      }
    });

    doc.save(`${resumeData.personalInfo.name}_Resume.pdf`);
  };

  // --- Analyzer Handlers ---
const handleAnalyze = async (customFile?: File) => {
    if (!jobDescription.trim()) {
      toast.error("Please enter a job description first");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    let resumeContext = "";
    const deterministicFallback = () =>
      buildDeterministicFallbackAnalysis(
        resumeContext || JSON.stringify(resumeData, null, 2),
        jobDescription,
      );

    try {
      const targetFile = customFile || (selectedResume === "upload" ? uploadedFile : null);
      const systemPrompt =
        "You are an expert ATS (Applicant Tracking System). Analyze the resume against the job description and return strictly JSON. Be conservative with scoring. Penalize vague claims, missing quantified impact, weak signal coverage, and weak language/skill match against the provided role requirements.";
      let userContent: string | Array<Record<string, unknown>> = "";

      if (targetFile) {
        const isPdf =
          targetFile.type === "application/pdf" ||
          targetFile.name.toLowerCase().endsWith(".pdf") ||
          targetFile.type.toLowerCase().includes("pdf");

        // CASE 1: External PDF Upload - Extract text locally
        if (isPdf) {
          resumeContext = await extractTextFromPDF(targetFile);
          if (resumeContext.trim().length < 40) {
            throw new Error("Could not extract readable text from this PDF. It may be scanned/image-only.");
          }
        } else {
          const optimizedImageDataUrl = await optimizeImageForVision(targetFile);
          resumeContext = `[IMAGE_RESUME_UPLOAD:${targetFile.name}]`;
          userContent = [
            {
              type: "text",
              text: `Analyze this resume image against the job description below.\n\nJOB DESCRIPTION:\n"${jobDescription}"\n\nThe resume content is provided as the attached image. Return a JSON object exactly in this format:\n{\n  "matchScore": number,\n  "strengths": string[],\n  "gaps": string[],\n  "suggestions": string[],\n  "keywordMatch": [{"keyword": string, "found": boolean}]\n}`,
            },
            {
              type: "image_url",
              image_url: {
                url: optimizedImageDataUrl,
              },
            },
          ];
        }
      } else {
        // CASE 2: Builder Data - Use structured JSON
        resumeContext = JSON.stringify(resumeData, null, 2);
      }

      if (!userContent) {
        userContent = `
            Analyze this resume against the job description below.
            
            JOB DESCRIPTION:
            "${jobDescription}"

            RESUME DATA/TEXT:
            "${resumeContext}"

            Return a JSON object exactly in this format:
            {
              "matchScore": number,
              "strengths": string[],
              "gaps": string[],
              "suggestions": string[],
              "keywordMatch": [{"keyword": string, "found": boolean}]
            }`;
      }

      const response = await callOpenAI({
        model: "gpt-4o-mini", // Optimized for high-speed text analysis
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userContent,
          },
        ],
        response_format: { type: "json_object" },
      });

      const content = response?.choices?.[0]?.message?.content;
      if (!content || typeof content !== "string") {
        throw new Error("AI returned an empty response");
      }

      let normalized = deterministicFallback();
      let usedFallback = true;

      try {
        const jsonPayload = extractJsonObjectFromText(content);
        const parsed = JSON.parse(jsonPayload);
        const aiNormalized = normalizeAnalysisResult(parsed);
        const hasPlaceholderGaps = aiNormalized.gaps.some((gap) =>
          gap.includes("Unable to extract complete analysis details"),
        );
        const hasPlaceholderStrength = aiNormalized.strengths.some((strength) =>
          strength.includes("No clear strengths were extracted"),
        );
        const aiLooksValid =
          aiNormalized.keywordMatch.length > 0 ||
          (!hasPlaceholderGaps && !hasPlaceholderStrength);

        if (aiLooksValid) {
          normalized = aiNormalized;
          usedFallback = false;
        }
      } catch {
        // Keep deterministic fallback so UI can still render a meaningful score.
      }

      const guarded = applyDeterministicScoreGuard(
        normalized,
        resumeContext,
        jobDescription,
      );

      setAnalysisResult(guarded);
      if (usedFallback) {
        toast.info("AI response was unstable. Showing deterministic backup analysis.");
      }
      toast.success("AI Analysis Complete!");
    } catch (error: any) {
      console.error("Analysis Error:", error);
      const message =
        typeof error?.message === "string"
          ? error.message
          : "Analysis failed. Please check your network or PDF format.";
      const guardedFallback = applyDeterministicScoreGuard(
        deterministicFallback(),
        resumeContext || JSON.stringify(resumeData, null, 2),
        jobDescription,
      );
      setAnalysisResult(guardedFallback);
      toast.info("Used deterministic backup analysis because AI request failed.");
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="h-8 w-56 bg-muted rounded-md animate-pulse" />
        <LoadingGrid count={3} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" itemClassName="h-32 rounded-md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12 space-y-6">
      {/* Top Navigation Bar */}
      <div className="bg-card/95 border-b border-border sticky top-0 z-30 shadow-sm backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between py-3 gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-foreground">Resume Hub</h1>
                <p className="text-xs text-muted-foreground">
                  {settings?.collegeName || "Career Center"}
                </p>
              </div>
            </div>

            <div className="flex bg-secondary/70 p-1 rounded-md border border-border">
              <button
                onClick={() => setActiveTab("builder")}
                className={cn(
                  "px-4 h-9 rounded-sm text-sm font-medium transition-colors",
                  activeTab === "builder"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40",
                )}
              >
                Builder
              </button>
              <button
                onClick={() => setActiveTab("analyzer")}
                className={cn(
                  "px-4 h-9 rounded-sm text-sm font-medium transition-colors",
                  activeTab === "analyzer"
                    ? "bg-background text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/40",
                )}
              >
                AI Analyzer
              </button>
            </div>

            <div className="flex items-center gap-2">
              {activeTab === "builder" && (
                <>
                  <div className="flex items-center gap-1 mr-2 bg-secondary rounded-md p-0.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
                    >
                      <ZoomOut className="w-3 h-3" />
                    </Button>
                    <span className="text-xs w-9 text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
                    >
                      <ZoomIn className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    onClick={() => setPreview(!preview)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {preview ? "Edit" : "Preview"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9"
                    disabled={!hasUnsavedResumeChanges || isSavingResume}
                    onClick={handleSaveResume}
                  >
                    {isSavingResume ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {hasUnsavedResumeChanges ? "Save Changes" : "Saved"}
                      </>
                    )}
                  </Button>
                  <Button size="sm" className="h-9" onClick={downloadPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* BUILDER TAB */}
        {activeTab === "builder" && (
          <div className="grid xl:grid-cols-12 gap-6 items-start">
            {/* Editor - Scrollable */}
            {!preview && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="xl:col-span-6 space-y-6"
              >
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="w-full justify-start overflow-auto no-scrollbar bg-muted/40 border border-border p-1">
                    <TabsTrigger value="personal" className="h-9 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Personal</TabsTrigger>
                    <TabsTrigger value="education" className="h-9 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Education</TabsTrigger>
                    <TabsTrigger value="experience" className="h-9 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Experience</TabsTrigger>
                    <TabsTrigger value="projects" className="h-9 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Projects</TabsTrigger>
                    <TabsTrigger value="skills" className="h-9 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Skills</TabsTrigger>
                  </TabsList>

                  {/* Content Panels (Same as before, preserved logic) */}
                  <TabsContent
                    value="personal"
                    className="card-elevated ui-card-pad space-y-4 mt-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name</label>
                        <Input
                          value={resumeData.personalInfo.name}
                          onChange={(e) =>
                            handlePersonalInfoChange("name", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input
                          value={resumeData.personalInfo.location}
                          onChange={(e) =>
                            handlePersonalInfoChange("location", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          value={resumeData.personalInfo.email}
                          onChange={(e) =>
                            handlePersonalInfoChange("email", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Phone</label>
                        <Input
                          value={resumeData.personalInfo.phone}
                          onChange={(e) =>
                            handlePersonalInfoChange("phone", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">LinkedIn</label>
                        <Input
                          value={resumeData.personalInfo.linkedin}
                          onChange={(e) =>
                            handlePersonalInfoChange("linkedin", e.target.value)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">GitHub</label>
                        <Input
                          value={resumeData.personalInfo.github}
                          onChange={(e) =>
                            handlePersonalInfoChange("github", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="education" className="space-y-4 mt-4">
                    {resumeData.education.map((edu, idx) => (
                      <div key={idx} className="card-elevated ui-card-pad space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            Institution
                          </label>
                          <Input
                            value={edu.institution}
                            onChange={(e) =>
                              handleEducationChange(
                                idx,
                                "institution",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">
                              Degree
                            </label>
                            <Input
                              value={edu.degree}
                              onChange={(e) =>
                                handleEducationChange(
                                  idx,
                                  "degree",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">Year</label>
                            <Input
                              value={edu.year}
                              onChange={(e) =>
                                handleEducationChange(
                                  idx,
                                  "year",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium">Major</label>
                            <Input
                              value={edu.major}
                              onChange={(e) =>
                                handleEducationChange(
                                  idx,
                                  "major",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">GPA</label>
                            <Input
                              value={edu.gpa}
                              onChange={(e) =>
                                handleEducationChange(
                                  idx,
                                  "gpa",
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">
                            Relevant Coursework
                          </label>
                          <Textarea
                            value={edu.coursework.join(", ")}
                            onChange={(e) =>
                              handleEducationChange(
                                idx,
                                "coursework",
                                e.target.value.split(", "),
                              )
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-4 mt-4">
                    {resumeData.experience.map((exp, idx) => (
                      <div
                        key={idx}
                        className="card-elevated ui-card-pad space-y-4 relative"
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 text-destructive"
                          onClick={() => removeExperience(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="Company"
                            value={exp.company}
                            onChange={(e) =>
                              handleExperienceChange(
                                idx,
                                "company",
                                e.target.value,
                              )
                            }
                          />
                          <Input
                            placeholder="Title"
                            value={exp.title}
                            onChange={(e) =>
                              handleExperienceChange(
                                idx,
                                "title",
                                e.target.value,
                              )
                            }
                          />
                          <Input
                            placeholder="Date Range"
                            value={exp.duration}
                            onChange={(e) =>
                              handleExperienceChange(
                                idx,
                                "duration",
                                e.target.value,
                              )
                            }
                          />
                          <Input
                            placeholder="Location"
                            value={exp.location}
                            onChange={(e) =>
                              handleExperienceChange(
                                idx,
                                "location",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <Textarea
                          placeholder="Description"
                          value={exp.description.join("\n")}
                          onChange={(e) =>
                            handleExperienceChange(
                              idx,
                              "description",
                              e.target.value.split("\n"),
                            )
                          }
                        />
                      </div>
                    ))}
                    <Button
                      onClick={addExperience}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Experience
                    </Button>
                  </TabsContent>

                  <TabsContent value="projects" className="space-y-4 mt-4">
                    {resumeData.projects.map((proj, idx) => (
                      <div
                        key={idx}
                        className="card-elevated ui-card-pad space-y-4 relative"
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2 text-destructive"
                          onClick={() => removeProject(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="Project Name"
                            value={proj.name}
                            onChange={(e) =>
                              handleProjectChange(idx, "name", e.target.value)
                            }
                          />
                          <Input
                            placeholder="Date"
                            value={proj.date}
                            onChange={(e) =>
                              handleProjectChange(idx, "date", e.target.value)
                            }
                          />
                        </div>
                        <Textarea
                          placeholder="Description"
                          value={proj.description.join("\n")}
                          onChange={(e) =>
                            handleProjectChange(
                              idx,
                              "description",
                              e.target.value.split("\n"),
                            )
                          }
                        />
                      </div>
                    ))}
                    <Button
                      onClick={addProject}
                      variant="outline"
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Project
                    </Button>
                  </TabsContent>

                  <TabsContent
                    value="skills"
                    className="card-elevated ui-card-pad space-y-4 mt-4"
                  >
                    <div>
                      <label className="text-sm font-medium">
                        Technical Skills
                      </label>
                      <Input
                        value={resumeData.skills.technical}
                        onChange={(e) =>
                          setResumeData((p) => ({
                            ...p,
                            skills: { ...p.skills, technical: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Programming</label>
                      <Input
                        value={resumeData.skills.programming}
                        onChange={(e) =>
                          setResumeData((p) => ({
                            ...p,
                            skills: {
                              ...p.skills,
                              programming: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Languages</label>
                      <Input
                        value={resumeData.skills.languages}
                        onChange={(e) =>
                          setResumeData((p) => ({
                            ...p,
                            skills: { ...p.skills, languages: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Certifications
                      </label>
                      <Input
                        value={resumeData.skills.certifications}
                        onChange={(e) =>
                          setResumeData((p) => ({
                            ...p,
                            skills: {
                              ...p.skills,
                              certifications: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            )}

            {/* Preview - Sticky & Scaled */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "xl:col-span-6 sticky top-24",
                preview
                  ? "xl:col-span-12 relative top-0 mx-auto max-w-4xl"
                  : "",
              )}
            >
              <div
                className="bg-white text-black shadow-xl border border-border origin-top-left transition-transform duration-150"
                style={{
                  width: "8.5in",
                  minHeight: "11in",
                  transform: preview ? "none" : `scale(${zoom})`,
                  transformOrigin: "top center",
                  margin: preview ? "0 auto" : "0 auto",
                }}
              >
                <div className="p-[0.75in]">
                  {/* Resume Header */}
                  <div className="text-center border-b-2 border-black pb-4 mb-4">
                    <h1 className="text-3xl font-bold tracking-widest mb-3">
                      {resumeData.personalInfo.name.toUpperCase()}
                    </h1>
                    <div className="text-xs flex flex-wrap justify-center gap-x-2 text-gray-800">
                      {resumeData.personalInfo.location && (
                        <span>{resumeData.personalInfo.location}</span>
                      )}
                      {resumeData.personalInfo.phone && (
                        <span>• {resumeData.personalInfo.phone}</span>
                      )}
                      {resumeData.personalInfo.email && (
                        <span className="text-blue-900">
                          • {resumeData.personalInfo.email}
                        </span>
                      )}
                    </div>
                    <div className="text-xs flex flex-wrap justify-center gap-x-3 mt-1 text-blue-800 font-medium">
                      {resumeData.personalInfo.linkedin && (
                        <span>{resumeData.personalInfo.linkedin}</span>
                      )}
                      {resumeData.personalInfo.github && (
                        <span>{resumeData.personalInfo.github}</span>
                      )}
                    </div>
                  </div>

                  {/* Resume Body */}
                  <div className="space-y-5">
                    {/* Education */}
                    <section>
                      <h2 className="text-xs font-bold border-b border-black mb-2 uppercase tracking-wider pb-0.5">
                        Education
                      </h2>
                      {resumeData.education.map((edu, i) => (
                        <div key={i} className="mb-3">
                          <div className="flex justify-between font-bold text-sm">
                            <span>{edu.institution.toUpperCase()}</span>
                            <span>{edu.year}</span>
                          </div>
                          <div className="flex justify-between text-xs italic">
                            <span>
                              {edu.degree} in {edu.major}
                            </span>
                            <span className="font-semibold">
                              {edu.gpa ? `GPA: ${edu.gpa}` : ""}
                            </span>
                          </div>
                          {edu.coursework.length > 0 && (
                            <div className="text-xs mt-1.5 leading-relaxed">
                              <span className="font-semibold">
                                Relevant Coursework:
                              </span>{" "}
                              {edu.coursework.join(", ")}
                            </div>
                          )}
                        </div>
                      ))}
                    </section>

                    {/* Experience */}
                    {resumeData.experience.length > 0 && (
                      <section>
                        <h2 className="text-xs font-bold border-b border-black mb-2 uppercase tracking-wider pb-0.5">
                          Work Experience
                        </h2>
                        {resumeData.experience.map((exp, i) => (
                          <div key={i} className="mb-4">
                            <div className="flex justify-between font-bold text-sm">
                              <span>{exp.company.toUpperCase()}</span>
                              <span>{exp.location}</span>
                            </div>
                            <div className="flex justify-between text-xs italic mb-1.5">
                              <span>{exp.title}</span>
                              <span>{exp.duration}</span>
                            </div>
                            <ul className="list-disc list-outside ml-4 text-xs space-y-1 leading-normal">
                              {exp.description.filter(Boolean).map((d, j) => (
                                <li key={j}>{d}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </section>
                    )}

                    {/* Projects */}
                    {resumeData.projects.length > 0 && (
                      <section>
                        <h2 className="text-xs font-bold border-b border-black mb-2 uppercase tracking-wider pb-0.5">
                          Projects
                        </h2>
                        {resumeData.projects.map((proj, i) => (
                          <div key={i} className="mb-4">
                            <div className="flex justify-between font-bold text-sm">
                              <span>{proj.name.toUpperCase()}</span>
                              <span>{proj.date}</span>
                            </div>
                            <ul className="list-disc list-outside ml-4 text-xs space-y-1 mt-1 leading-normal">
                              {proj.description.filter(Boolean).map((d, j) => (
                                <li key={j}>{d}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </section>
                    )}

                    {/* Skills */}
                    <section>
                      <h2 className="text-xs font-bold border-b border-black mb-2 uppercase tracking-wider pb-0.5">
                        Skills & Interests
                      </h2>
                      <div className="text-xs space-y-1.5 leading-normal">
                        {resumeData.skills.technical && (
                          <div>
                            <span className="font-bold">Technical:</span>{" "}
                            {resumeData.skills.technical}
                          </div>
                        )}
                        {resumeData.skills.programming && (
                          <div>
                            <span className="font-bold">Programming:</span>{" "}
                            {resumeData.skills.programming}
                          </div>
                        )}
                        {resumeData.skills.languages && (
                          <div>
                            <span className="font-bold">Languages:</span>{" "}
                            {resumeData.skills.languages}
                          </div>
                        )}
                        {resumeData.skills.certifications && (
                          <div>
                            <span className="font-bold">Certifications:</span>{" "}
                            {resumeData.skills.certifications}
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
              {/* Preview Footer Helper */}
              {!preview && (
                <p className="text-center text-xs text-muted-foreground mt-2">
                  Preview scaled by {Math.round(zoom * 100)}%. Download PDF for
                  actual A4 size.
                </p>
              )}
            </motion.div>
          </div>
        )}

        {/* ANALYZER TAB (Unchanged logic, just ensure wrapper exists) */}
        {activeTab === 'analyzer' && (
  <div className="space-y-6">
    {/* 1. Source Selection Bar: Toggles between Builder and External PDF */}
    <div className="card-elevated ui-card-pad flex flex-col md:flex-row gap-4 items-center justify-between border-l-2 border-primary bg-card">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-sm">Analysis Source</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
            Evaluate Builder Data or an External PDF/Image
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="flex bg-secondary/40 p-1 rounded-md w-full md:w-auto border border-border">
          <button
            onClick={() => { setSelectedResume("current"); setUploadedFile(null); }}
            className={cn(
              "flex-1 md:flex-none px-4 py-1.5 rounded-sm text-xs font-medium transition-all duration-150 flex items-center justify-center gap-2",
              selectedResume === "current" ? "bg-background shadow-md text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            Builder Data
          </button>

          <div className="relative flex-1 md:flex-none">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,image/*"
              className="hidden"
              id="resume-upload-field"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setUploadedFile(file);
                  setSelectedResume("upload");
                  toast.success(`Loaded: ${file.name}`);
                }
              }}
            />
            <button
              onClick={() => document.getElementById("resume-upload-field")?.click()}
              className={cn(
                "w-full px-4 py-1.5 rounded-sm text-xs font-medium transition-all duration-150 flex items-center justify-center gap-2",
                selectedResume === "upload" ? "bg-background shadow-md text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Upload className="w-3.5 h-3.5" />
              {uploadedFile ? uploadedFile.name.substring(0, 10) + "..." : "Upload File"}
            </button>
          </div>
        </div>

        {/* Remove External File Button */}
        {uploadedFile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => {
              setUploadedFile(null);
              setSelectedResume("current");
              toast.info("External file removed");
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>

    <div className="grid lg:grid-cols-2 gap-8 items-start">
      {/* LEFT: Input Section */}
      <div className="space-y-6">
        <div className="card-elevated ui-card-pad border-t-2 border-primary">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Job Description</h3>
              <p className="text-xs text-muted-foreground font-medium">Define your target role requirements</p>
            </div>
          </div>

          <Textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the target job description here for deep semantic analysis..."
            className="min-h-[280px] bg-muted/20 border border-border focus-visible:ring-1 resize-none leading-relaxed text-sm"
          />

          <Button
            className="w-full mt-6 h-12 text-md font-semibold shadow-sm transition-all duration-150"
            onClick={() => handleAnalyze()}
            disabled={isAnalyzing || !jobDescription.trim()}
          >
            {isAnalyzing ? (
              <><RefreshCw className="w-5 h-5 animate-spin mr-3" /> Processing Data...</>
            ) : (
              <><Sparkles className="w-5 h-5 mr-3 text-amber-400" /> Run AI Audit</>
            )}
          </Button>

          {uploadedFile && selectedResume === 'upload' && !isAnalyzing && (
            <p className="text-[10px] text-center mt-3 text-muted-foreground italic flex items-center justify-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-success" />
              Targeting external file: <span className="font-bold text-primary">{uploadedFile.name}</span>
            </p>
          )}
        </div>

        {isAnalyzing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <StatePanel
              title="Analyzing resume"
              description="Checking semantic relevance and ATS keyword coverage..."
              className="w-full"
            />
          </motion.div>
        )}
      </div>

      {/* RIGHT: Results Section */}
      <div className="space-y-6 min-h-[500px]">
        {analysisResult && !isAnalyzing ? (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* Score Card */}
            <div className="card-elevated ui-card-pad text-center border-b-2 border-primary">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Overall Match Score</p>
              <div className={cn("text-7xl font-black mb-4 font-mono transition-colors", getScoreColor(analysisResult.matchScore))}>
                {analysisResult.matchScore}%
              </div>
              <Progress value={analysisResult.matchScore} className="h-3 shadow-inner bg-secondary" />
            </div>

            {/* Keyword Match Chips */}
            <div className="card-elevated ui-card-pad">
              <h4 className="font-bold text-xs mb-4 flex items-center gap-2 uppercase tracking-tight">
                <Target className="w-4 h-4 text-primary" /> Industry Keyword Matching
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysisResult.keywordMatch.map((k, i) => (
                  <Badge 
                    key={i} 
                    variant={k.found ? "default" : "outline"} 
                    className={cn(
                      "px-3 py-1 text-[10px] transition-all", 
                      k.found ? "bg-green-500/10 text-green-700 border-green-500/20 hover:bg-green-500/20" : "opacity-40 grayscale border-dashed"
                    )}
                  >
                    {k.found ? "✓ " : "× "}{k.keyword}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Strengths & Gaps Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-500/5 border-l-4 border-green-600 p-4 rounded-r-lg shadow-sm ring-1 ring-green-500/10">
                <h5 className="font-bold text-green-700 text-xs mb-3 flex items-center gap-2 uppercase">
                  <CheckCircle2 className="w-4 h-4" /> Core Strengths
                </h5>
                <ul className="text-[11px] space-y-2 text-foreground/80 list-disc ml-4 leading-relaxed">
                  {analysisResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div className="bg-red-500/5 border-l-4 border-red-600 p-4 rounded-r-lg shadow-sm ring-1 ring-red-500/10">
                <h5 className="font-bold text-red-700 text-xs mb-3 flex items-center gap-2 uppercase">
                  <XCircle className="w-4 h-4" /> Optimization Gaps
                </h5>
                <ul className="text-[11px] space-y-2 text-foreground/80 list-disc ml-4 leading-relaxed">
                  {analysisResult.gaps.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              </div>
            </div>

            {/* AI Optimization Tips */}
            <div className="card-elevated ui-card-pad bg-primary/5 border border-primary/20 relative overflow-hidden">
              <h4 className="font-bold flex items-center gap-2 mb-4 text-primary uppercase tracking-wider text-xs">
                <Lightbulb className="w-5 h-5 text-amber-500" /> Strategic AI Suggestions
              </h4>
              <div className="space-y-4">
                {analysisResult.suggestions.map((s, i) => (
                  <div key={i} className="flex gap-3 text-sm leading-relaxed text-foreground/90 group">
                    <ArrowRight className="w-4 h-4 text-primary shrink-0 mt-1 transition-transform duration-150 group-hover:translate-x-1" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : !isAnalyzing && (
          <EmptyState
            title="Analysis pending"
            description="Paste a job description and run the audit to generate your compatibility report."
            className="min-h-[420px] flex items-center justify-center"
          />
        )}
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
}
