export type DocSection = {
  heading: string;
  body: string;
  bullets?: string[];
  code?: string;
};

export type DocPage = {
  slug: string;
  title: string;
  description: string;
  sections: DocSection[];
};

export const docsShowcaseImages = [
  {
    src: "/img/analysis-screenshot-0.png",
    alt: "CIPWE CLI showing the overall score and category breakdown"
  },
  {
    src: "/img/analysis-screenshot-1.png",
    alt: "Detailed report listing passed and failed checks"
  },
  {
    src: "/img/analysis-screenshot-2.png",
    alt: "Prioritized action items and structured-data validation"
  }
];

export const docs: DocPage[] = [
  {
    slug: "getting-started",
    title: "Getting Started",
    description: "Install and run CIPWE in under 60 seconds.",
    sections: [
      {
        heading: "Who this is for",
        body: "CIPWE is for teams that want to be discoverable and answerable by AI agents like ChatGPT, Gemini, Claude, and Perplexity.",
        bullets: [
          "Growth teams improving answer-engine visibility",
          "Engineering teams building repeatable quality gates",
          "SEO/content teams validating machine-readable structure"
        ]
      },
      {
        heading: "Quickstart",
        body: "Use npx for zero setup.",
        code: "npx cipwe audit https://your-site.com"
      },
      {
        heading: "Recommended first workflow",
        body: "Follow this order to get impact fast and avoid analysis paralysis.",
        bullets: [
          "Run audit on your highest-traffic URL first",
          "Fix critical score gaps with the fix command",
          "Re-run audit and track score delta",
          "Roll checks into CI once your baseline stabilizes"
        ],
        code: "npx cipwe audit https://your-site.com\nnpx cipwe fix https://your-site.com\nnpx cipwe audit https://your-site.com"
      },
      {
        heading: "Installation options",
        body: "Pick the approach that fits your workflow.",
        bullets: [
          "npx for one-time runs and quick checks",
          "Global install for frequent CLI usage",
          "Project dev dependency for CI consistency"
        ],
        code: "npm install -g cipwe\n# or\nnpm install --save-dev cipwe"
      },
      {
        heading: "Success criteria for week 1",
        body: "A practical baseline to know adoption is working.",
        bullets: [
          "At least one production URL audited",
          "A repeatable command shared with the team",
          "Initial score documented in your tracker",
          "One remediation cycle completed"
        ]
      }
    ]
  },
  {
    slug: "cli-reference",
    title: "CLI Reference",
    description: "All commands, options, and examples.",
    sections: [
      {
        heading: "audit",
        body: "Analyzes your site for AI visibility and outputs a score with detailed findings.",
        code: "cipwe audit https://example.com\ncipwe audit .\ncipwe audit https://example.com --json"
      },
      {
        heading: "audit flags",
        body: "Use flags to adapt output for CI, scripting, and debugging.",
        bullets: [
          "--json: machine-readable output",
          "Local folder targets such as . or ./dist",
          "Direct URL targets with automatic HTTPS normalization"
        ]
      },
      {
        heading: "fix",
        body: "Generates recommended files to raise your score and improve machine readability.",
        code: "cipwe fix https://example.com\ncipwe fix . -o ./public"
      },
      {
        heading: "score",
        body: "Returns a compact score output for dashboards and PR comments.",
        code: "cipwe score https://example.com"
      },
      {
        heading: "Command usage patterns",
        body: "Use command modes intentionally by environment.",
        bullets: [
          "Local development: npx cipwe audit .",
          "Pre-release checks: npx cipwe audit https://staging.example.com",
          "Release gate: npx cipwe audit https://example.com --json"
        ]
      }
    ]
  },
  {
    slug: "scoring-model",
    title: "Scoring Model",
    description: "How the 100-point CIPWE score works.",
    sections: [
      {
        heading: "Category weights",
        body: "CIPWE uses six weighted categories to produce a practical, explainable score.",
        bullets: [
          "Structured Data: 30 points",
          "Semantic HTML: 20 points",
          "Metadata: 15 points",
          "Crawl Signals: 15 points",
          "Content Clarity: 10 points",
          "Agent Signals: 10 points"
        ]
      },
      {
        heading: "Grade bands",
        body: "Grade boundaries make trend analysis easier across teams.",
        bullets: [
          "A+: 95-100",
          "A: 90-94",
          "B+: 80-89",
          "B: 70-79",
          "C: 60-69",
          "D: 40-59",
          "F: 0-39"
        ]
      },
      {
        heading: "How to interpret score changes",
        body: "Not all points are equal in implementation cost. Prioritize high-leverage categories first.",
        bullets: [
          "First improve Structured Data and Crawl Signals",
          "Then harden metadata and semantic structure",
          "Use Agent Signals to close the final visibility gap"
        ]
      },
      {
        heading: "Target thresholds by team stage",
        body: "Set realistic progression to drive consistency instead of one-off spikes.",
        bullets: [
          "Early stage: 55+",
          "Growth stage: 70+",
          "Mature org: 85+ with regression alerts"
        ]
      }
    ]
  },
  {
    slug: "rules-reference",
    title: "Rules Reference",
    description: "Complete list of checks and what they validate.",
    sections: [
      {
        heading: "Structured data rules",
        body: "CIPWE validates JSON-LD presence, schema type quality, and rich intent fit.",
        bullets: [
          "jsonld-presence",
          "jsonld-valid-type",
          "faq-schema",
          "article-product-schema"
        ]
      },
      {
        heading: "Semantic and metadata rules",
        body: "Markup quality directly affects parsing quality for AI systems.",
        bullets: [
          "single-h1, heading-hierarchy, has-main, has-article-section",
          "has-title, has-meta-description, has-opengraph"
        ]
      },
      {
        heading: "Crawl and agent signal rules",
        body: "These checks evaluate machine discoverability and explicit AI directives.",
        bullets: [
          "has-robots, has-sitemap, has-canonical",
          "has-llms-txt, has-structured-summary"
        ]
      },
      {
        heading: "Rule triage model",
        body: "A simple triage model helps teams coordinate implementation quickly.",
        bullets: [
          "Critical: blocking discoverability or structured parsing",
          "Important: quality and clarity improvements",
          "Nice-to-have: incremental trust and consistency gains"
        ]
      },
      {
        heading: "Ownership mapping",
        body: "Assign each rule category to clear owners.",
        bullets: [
          "Platform engineering: crawl + infrastructure signals",
          "Frontend engineering: semantic + metadata rules",
          "Content team: clarity + schema intent"
        ]
      }
    ]
  },
  {
    slug: "ci-cd-integration",
    title: "CI/CD Integration",
    description: "Gate merges with automated AI visibility checks.",
    sections: [
      {
        heading: "GitHub Actions",
        body: "Use JSON output, parse score, fail below threshold.",
        code: "- run: npx cipwe audit https://your-site.com --json > cipwe-report.json\n- run: |\n    SCORE=$(jq '.percentage' cipwe-report.json)\n    if [ \"$SCORE\" -lt 70 ]; then exit 1; fi"
      },
      {
        heading: "Pull request gating strategy",
        body: "Start with non-blocking reports, then graduate to strict thresholds.",
        bullets: [
          "Phase 1: post score as PR comment",
          "Phase 2: warn below threshold",
          "Phase 3: block merges on regression"
        ]
      },
      {
        heading: "Quality policy",
        body: "Recommended thresholds by maturity stage.",
        bullets: [
          "Early teams: fail below 55",
          "Growth teams: fail below 70",
          "Mature teams: fail below 85"
        ]
      },
      {
        heading: "Monorepo implementation tips",
        body: "Keep audits focused and deterministic in multi-app repos.",
        bullets: [
          "Audit the deployed URL for each app",
          "Store JSON artifacts with build outputs",
          "Track trends per app rather than one aggregate score"
        ]
      }
    ]
  },
  {
    slug: "generated-files",
    title: "Generated Files",
    description: "What CIPWE can auto-generate and why it matters.",
    sections: [
      {
        heading: "Output artifacts",
        body: "The fix command creates practical files you can ship immediately.",
        bullets: [
          "llms.txt",
          "structured-data.jsonld",
          "structured-data-snippet.html",
          "robots.txt",
          "sitemap.xml",
          "cipwe-report.md"
        ]
      },
      {
        heading: "Output path",
        body: "Choose where generated assets are written.",
        code: "cipwe fix https://example.com -o ./public"
      },
      {
        heading: "How to apply generated files",
        body: "Treat generated files as starting points and review before merge.",
        bullets: [
          "Validate robots directives against crawler policy",
          "Ensure schema fields reflect real page intent",
          "Review canonical and sitemap URLs for correctness"
        ]
      },
      {
        heading: "Versioning and governance",
        body: "Generated files should be committed and reviewed like any source artifact.",
        bullets: [
          "Store outputs in source control",
          "Attach score change to each release",
          "Re-generate after major IA/content updates"
        ]
      }
    ]
  },
  {
    slug: "llms-txt-guide",
    title: "llms.txt Guide",
    description: "Best practices for AI-specific directives.",
    sections: [
      {
        heading: "What is llms.txt",
        body: "It is an emerging convention that communicates AI-usage guidance for your site content."
      },
      {
        heading: "Best practices",
        body: "Keep it concise, explicit, and easy to maintain.",
        bullets: [
          "State your domain and content scope",
          "List canonical source sections",
          "Clarify policy and attribution preferences",
          "Review and update quarterly"
        ]
      },
      {
        heading: "Suggested llms.txt template",
        body: "Use this as a baseline template and adapt to your publishing model.",
        code: "site: https://example.com\nsummary: Product docs and technical guides\npreferred-canonical: https://example.com/docs\npolicy: Cite source URLs when summarizing"
      },
      {
        heading: "Maintenance checklist",
        body: "Review this file whenever structure or policy changes.",
        bullets: [
          "Update section paths after navigation changes",
          "Validate policy language with legal/comms",
          "Confirm canonical source sections remain accurate"
        ]
      }
    ]
  },
  {
    slug: "faq",
    title: "FAQ",
    description: "Answers to common implementation questions.",
    sections: [
      {
        heading: "Do I need to install globally?",
        body: "No. npx is enough for most teams and keeps usage frictionless."
      },
      {
        heading: "Can I run this on local HTML output?",
        body: "Yes. Point CIPWE to local directories such as build or dist folders.",
        code: "npx cipwe audit ./dist"
      },
      {
        heading: "Does this replace SEO?",
        body: "No. CIPWE complements SEO by focusing on answer-engine and agent readability."
      },
      {
        heading: "How often should we run audits?",
        body: "Run on every release candidate and at least weekly for production domains."
      },
      {
        heading: "Can non-engineers use CIPWE?",
        body: "Yes. The CLI is command-first and output is readable for content, growth, and product teams."
      }
    ]
  }
];

export const getDocBySlug = (slug: string): DocPage | undefined => docs.find((doc) => doc.slug === slug);
