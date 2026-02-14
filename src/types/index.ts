// ============================================================
// CIPWE — Types & Interfaces
// The Web Vitals for the AI Web
// ============================================================

export type RuleCategory =
  | 'structured-data'
  | 'semantic-html'
  | 'metadata'
  | 'crawl-signals'
  | 'content-clarity'
  | 'agent-signals';

export const CATEGORY_NAMES: Record<RuleCategory, string> = {
  'structured-data': 'Structured Data',
  'semantic-html': 'Semantic HTML',
  'metadata': 'Metadata',
  'crawl-signals': 'Crawl Signals',
  'content-clarity': 'Content Clarity',
  'agent-signals': 'Agent Signals',
};

export const CATEGORY_MAX_SCORES: Record<RuleCategory, number> = {
  'structured-data': 30,
  'semantic-html': 20,
  'metadata': 15,
  'crawl-signals': 15,
  'content-clarity': 10,
  'agent-signals': 10,
};

export interface CrawlData {
  url: string;
  html: string;
  robotsTxt: string | null;
  sitemapXml: string | null;
  llmsTxt: string | null;
  isLocal: boolean;
}

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  category: RuleCategory;
  passed: boolean;
  score: number;
  maxScore: number;
  message: string;
  suggestion?: string;
}

export interface Rule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  weight: number;
  check: (data: CrawlData) => RuleResult;
}

export interface CategoryScore {
  category: RuleCategory;
  categoryName: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface AuditResult {
  url: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  grade: string;
  gradeEmoji: string;
  categories: CategoryScore[];
  rules: RuleResult[];
  passedCount: number;
  failedCount: number;
  timestamp: string;
}

export interface GeneratorOptions {
  url: string;
  html: string;
  outputDir: string;
  auditResult?: AuditResult;
}

export interface FixResult {
  filesGenerated: string[];
  suggestions: string[];
}
