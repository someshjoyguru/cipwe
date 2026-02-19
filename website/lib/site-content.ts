export const commands = [
  "npx cipwe audit https://your-site.com",
  "npx cipwe fix https://your-site.com",
  "npm i -g cipwe && cipwe score https://your-site.com"
];

export const features = [
  {
    title: "Command-first UX",
    description: "No bloated setup. Copy one command and run your first audit in seconds."
  },
  {
    title: "Actionable score",
    description: "See exactly what AI tools check for across 19 rules, with clear priority fixes."
  },
  {
    title: "Autofix engine",
    description: "Generate the files AI tools need — llms.txt, JSON-LD, robots.txt, and sitemap.xml — instantly."
  },
  {
    title: "CI ready",
    description: "Use JSON output in pipelines and block deploys that drop below your visibility threshold."
  },
  {
    title: "Built for modern teams",
    description: "Works for marketing sites, docs portals, products, and content platforms."
  },
  {
    title: "Transparent checks",
    description: "Every rule is explicit so teams can reason about quality and ownership."
  }
];

export const testimonials = [
  {
    quote:
      "CIPWE helped us move from random AI visibility to a measurable engineering workflow in one sprint.",
    name: "Nora Patel",
    role: "Head of Growth, Vectorly"
  },
  {
    quote:
      "The score and recommendations gave our content and platform teams a shared language immediately.",
    name: "Mason Reed",
    role: "Staff Engineer, Clipnote"
  },
  {
    quote:
      "The fix command generated exactly what we needed to improve AI visibility quickly.",
    name: "Iris Monroe",
    role: "SEO Lead, Operaa"
  }
];

export const faqs = [
  {
    q: "Can I use CIPWE without installing anything?",
    a: "Yes. Use npx for instant execution: npx cipwe audit https://your-site.com"
  },
  {
    q: "Is CIPWE only for large teams?",
    a: "No. Solo makers, agencies, and enterprises use it. The workflow scales from one page to thousands."
  },
  {
    q: "Can I run CIPWE in CI/CD?",
    a: "Yes. Use --json output, parse score, and enforce thresholds in pull requests or deployment gates."
  },
  {
    q: "What makes CIPWE different from standard SEO tools?",
    a: "SEO tools optimize for search rankings. CIPWE checks whether ChatGPT, Perplexity, and Google AI can actually find, parse, and cite your content — a different problem entirely."
  }
];

export const changelog = [
  {
    date: "2026-02-15",
    title: "v1.2.0 - Enhanced video showcase and UX polish",
    description: "Added terminal tutorial video with auto-scroll snap behavior. Improved Poppins font rendering on hero heading. Enhanced footer sticky positioning across all pages. Optimized highlight boxes with gradient backgrounds and hover effects."
  },
  {
    date: "2026-02-14",
    title: "v1.1.0 - Website and comprehensive documentation launch",
    description: "Launched full Next.js 15 + TypeScript marketing site with 8-page documentation system. Introduced docs sidebar navigation, responsive layout, and production-ready architecture. Added screenshot gallery showcasing CLI output and terminal workflows."
  },
  {
    date: "2026-02-13",
    title: "v1.0.5 - Tailwind CSS v4 integration",
    description: "Migrated to Tailwind CSS v4 with PostCSS plugin architecture. Improved build performance and enabled utility-first styling patterns across components. Added JetBrains Mono as primary monospace font for coder-first aesthetic."
  },
  {
    date: "2026-02-10",
    title: "v1.0.4 - Scoring transparency and recommendations",
    description: "Enhanced category weight explanations with detailed breakdowns. Added prioritized recommendation engine that surfaces top 3 action items. Improved score calculation visibility with per-rule attribution in JSON output."
  },
  {
    date: "2026-02-08",
    title: "v1.0.3 - Terminal output color coding",
    description: "Added color-coded pass/fail indicators in terminal output. Improved readability with distinct visual hierarchy for scores, categories, and recommendations. Enhanced progress indicators during audit execution."
  },
  {
    date: "2026-02-05",
    title: "v1.0.2 - CI/CD JSON output stabilization",
    description: "Stabilized --json flag output schema for reliable CI parsing. Added machine-readable exit codes: 0 for pass, 1 for threshold failure, 2 for audit errors. Improved error messages with actionable troubleshooting steps."
  },
  {
    date: "2026-02-01",
    title: "v1.0.0 - Fix command and artifact generation",
    description: "Released production fix command with support for llms.txt, JSON-LD structured data, robots.txt, sitemap.xml, and HTML snippet generation. Added configurable output directory via -o flag. Introduced intelligent defaults based on audit findings."
  },
  {
    date: "2026-01-28",
    title: "v0.9.0 - Beta release and scoring model finalization",
    description: "Finalized 100-point weighted scoring model across 6 categories. Launched beta with 20 production rules covering structured data, semantic HTML, metadata, crawl signals, and agent directives. Added comprehensive rule documentation."
  },
  {
    date: "2026-01-20",
    title: "v0.8.0 - Local folder auditing support",
    description: "Added support for auditing local build outputs (dist, build, public folders). Enabled pre-deployment validation workflows. Improved file path resolution and relative link handling for static sites."
  },
  {
    date: "2026-01-15",
    title: "v0.7.0 - Alpha release and community preview",
    description: "First public alpha release with core audit engine. Introduced npx zero-install workflow. Implemented 15 foundational rules checking what AI tools look for. Gathered initial feedback from early adopters."
  }
];

export const roadmap = [
  {
    quarter: "Q2 2026",
    items: ["Framework-aware audits", "Team reporting dashboards", "Rule suppression config"]
  },
  {
    quarter: "Q3 2026",
    items: ["PR comment bot", "Historical score trends", "Plugin API for custom rules"]
  },
  {
    quarter: "Q4 2026",
    items: ["Multi-page crawl mode", "Auto-remediation assistant", "Enterprise policy packs"]
  }
];
