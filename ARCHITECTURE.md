# CIPWE Architecture Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Core Components](#core-components)
4. [Data Flow](#data-flow)
5. [Module Breakdown](#module-breakdown)
6. [Design Patterns](#design-patterns)
7. [Scoring System](#scoring-system)
8. [Extension Points](#extension-points)

---

## Overview

CIPWE (The Web Vitals for the AI Web) is a CLI tool designed to audit and optimize websites for AI agent crawlability and readability. It functions as an "ESLint for AI-readability," evaluating websites across 20 distinct rules organized into 6 categories, with a maximum achievable score of 100 points.

### Technology Stack
- **Language**: TypeScript (ES Modules)
- **Runtime**: Node.js >=18.0.0
- **CLI Framework**: Commander.js
- **HTML Parsing**: Cheerio
- **Terminal Styling**: Chalk
- **Build System**: TypeScript Compiler (tsc)

### Key Features
- **Dual Mode Operation**: Supports both remote URL crawling and local file system analysis
- **Comprehensive Audit**: 20 rules across 6 categories evaluating AI-readiness
- **Auto-Fix Generation**: Generates missing files (llms.txt, robots.txt, sitemap.xml, JSON-LD)
- **Multiple Output Formats**: Human-readable terminal reports and JSON for CI/CD integration
- **Robust Error Handling**: TLS fallback, retry mechanisms, and detailed error diagnostics

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLI Entry Point                          │
│                         (src/index.ts)                           │
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ audit <target>│  │ fix <target> │  │score <target>│         │
│  └───────┬──────┘  └──────┬───────┘  └──────┬───────┘         │
└──────────┼─────────────────┼──────────────────┼─────────────────┘
           │                 │                  │
           └────────┬────────┴──────────────────┘
                    │
           ┌────────▼──────────┐
           │  Command Layer     │
           │ (commands/)        │
           │  • audit.ts        │
           │  • fix.ts          │
           └────────┬───────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
   ┌────▼─────┐ ┌──▼──────┐ ┌─▼──────────┐
   │ Crawler  │ │Analyzer │ │  Scoring   │
   │ Module   │ │ Engine  │ │ Calculator │
   └────┬─────┘ └──┬──────┘ └─┬──────────┘
        │          │           │
        │     ┌────▼───────────▼─────┐
        │     │   Generator Module    │
        │     │    (generator/)       │
        │     └──────────┬────────────┘
        │                │
   ┌────▼────────────────▼────┐
   │      UI Layer             │
   │    (ui/report.ts)         │
   └───────────────────────────┘
```

### Component Interaction Flow

```
User Command
     │
     ├─► Crawler Module
     │   ├─► fetchUrl (remote) / readLocal (local)
     │   ├─► Parallel fetch: HTML, robots.txt, sitemap.xml, llms.txt
     │   └─► Returns CrawlData
     │
     ├─► Analyzer Engine
     │   ├─► Loads 20 Rules
     │   ├─► Executes each rule.check(crawlData)
     │   └─► Returns RuleResult[]
     │
     ├─► Scoring Calculator
     │   ├─► Groups results by category
     │   ├─► Calculates category scores & percentages
     │   └─► Returns AuditResult with grade
     │
     └─► Output Layer
         ├─► Terminal Report (colored, formatted)
         ├─► JSON Report (CI/CD integration)
         └─► Fix Generation (if fix command)
```

---

## Core Components

### 1. CLI Entry Point (`src/index.ts`)

**Responsibility**: Command-line interface definition and routing

**Key Features**:
- Defines three commands: `audit`, `fix`, `score`
- Parses CLI arguments and options using Commander.js
- Routes to appropriate command handlers
- Handles shebang execution (`#!/usr/bin/env node`)

**Commands**:
```typescript
cipwe audit <target> [--json] [--verbose] [-k] [--timeout <ms>]
cipwe fix <target> [-o <dir>] [-k] [--timeout <ms>]
cipwe score <target> [-k] [--timeout <ms>]
```

**Options**:
- `--json`: Output as JSON for CI/CD pipelines
- `--verbose`: Detailed analysis information
- `-k, --insecure`: Skip TLS certificate verification (self-signed certs)
- `--timeout <ms>`: Request timeout in milliseconds (default: 15000)
- `-o, --output <dir>`: Output directory for fix generation

---

### 2. Command Layer (`src/commands/`)

#### audit.ts

**Responsibility**: Orchestrates the audit workflow

**Workflow**:
1. Display banner (unless JSON mode)
2. **Crawl Phase**: Fetch/read target content
3. **Analysis Phase**: Run all 20 rules
4. **Scoring Phase**: Calculate CIPWE score
5. **Reporting Phase**: Display results (terminal or JSON)
6. **Exit Code**: Sets exit code 1 if score < 50% (CI integration)

**Error Handling**:
- TLS/certificate errors → suggests `--insecure` flag
- Connection refused → suggests server might not be running
- Timeout → suggests `--timeout` adjustment

#### fix.ts

**Responsibility**: Generates missing files and recommendations

**Workflow**:
1. Execute full audit workflow
2. Analyze failed rules
3. Generate missing files:
   - `llms.txt`: AI agent information file
   - `robots.txt`: Crawler directives
   - `sitemap.xml`: Site structure
   - `structured-data.jsonld`: Schema.org JSON-LD
   - `structured-data-snippet.html`: HTML snippet for JSON-LD
4. Provide manual improvement suggestions
5. Generate markdown report: `cipwe-report.md`

**Output Structure**:
```
cipwe-output/
├── llms.txt
├── robots.txt
├── sitemap.xml
├── structured-data.jsonld
├── structured-data-snippet.html
└── cipwe-report.md
```

---

### 3. Crawler Module (`src/crawler/`)

**Responsibility**: Data acquisition from remote URLs or local files

#### Architecture

```
crawler/
├── index.ts          # Main orchestrator
├── fetchUrl.ts       # Remote URL fetching
└── readLocal.ts      # Local file system reading
```

#### index.ts - Main Orchestrator

**Function**: `crawl(target, opts) → CrawlData`

**Logic**:
1. Detects if target is URL or local path
2. Routes to `crawlUrl()` or `crawlLocal()`
3. Returns unified `CrawlData` interface

#### fetchUrl.ts - Remote Fetching

**Advanced Features**:

1. **TLS Fallback Mechanism**:
   - Detects TLS/certificate errors automatically
   - Enables `NODE_TLS_REJECT_UNAUTHORIZED=0` on failure
   - Suppresses Node.js warning about TLS
   - Maintains global state for subsequent requests

2. **Retry Logic**:
   - Automatic retry for transient errors (ECONNRESET, ETIMEDOUT, etc.)
   - Exponential backoff (1s, 2s, 4s)
   - Retry on specific HTTP status codes: 429, 500, 502, 503, 504

3. **Error Classification**:
   - **TLS Errors**: Self-signed certificates, expired certs
   - **Transient Errors**: Network resets, timeouts
   - **Connection Errors**: ECONNREFUSED (server not running)
   - **Timeout Errors**: AbortError, ETIMEDOUT

4. **Timeout Control**:
   - Uses `AbortController` for request cancellation
   - Default: 15 seconds
   - Configurable via `--timeout` option

**Functions**:
- `fetchUrl(url, opts)`: Main HTML fetcher with retries
- `tryFetchUrl(url, opts)`: Auxiliary file fetcher (returns null on failure)
- `isTlsError()`, `isTransientError()`, `isConnectionRefused()`: Error classifiers

#### readLocal.ts - Local File System

**Function**: `crawlLocal(target) → CrawlData`

**Logic**:
1. Searches for `index.html` in target directory
2. Looks for `robots.txt`, `sitemap.xml`, `llms.txt` in same directory
3. Returns null for missing files (non-fatal)

**Search Priority**:
```
1. ./index.html
2. ./public/index.html
3. ./dist/index.html
4. ./build/index.html
```

#### CrawlData Interface

```typescript
interface CrawlData {
  url: string;              // Target URL or path
  html: string;             // Main HTML content
  robotsTxt: string | null; // robots.txt content
  sitemapXml: string | null;// sitemap.xml content
  llmsTxt: string | null;   // llms.txt content
  isLocal: boolean;         // Local vs remote flag
}
```

---

### 4. Analyzer Engine (`src/analyzer/`)

**Responsibility**: Rule execution and validation

#### Architecture

```
analyzer/
├── engine.ts         # Rule executor
└── rules/
    ├── index.ts      # Rule registry
    ├── jsonld-presence.ts
    ├── jsonld-valid-type.ts
    ├── faq-schema.ts
    ├── article-product-schema.ts
    ├── single-h1.ts
    ├── heading-hierarchy.ts
    ├── has-main.ts
    ├── has-article-section.ts
    ├── has-title.ts
    ├── has-meta-description.ts
    ├── has-opengraph.ts
    ├── has-robots.ts
    ├── has-sitemap.ts
    ├── has-canonical.ts
    ├── content-length.ts
    ├── has-lists-tables.ts
    ├── has-qa-structure.ts
    ├── has-llms-txt.ts
    └── has-structured-summary.ts
```

#### engine.ts - Rule Executor

**Function**: `runAnalyzer(data: CrawlData) → RuleResult[]`

**Logic**:
1. Iterates through all registered rules
2. Executes `rule.check(data)` for each rule
3. Catches rule execution errors (returns 0-score failure)
4. Returns array of `RuleResult` objects

**Error Isolation**:
- Each rule execution is wrapped in try-catch
- Failed rules don't crash entire analysis
- Error details captured in result message

#### Rule Interface

```typescript
interface Rule {
  id: string;               // Unique identifier (kebab-case)
  name: string;             // Human-readable name
  description: string;      // What the rule checks
  category: RuleCategory;   // Category assignment
  weight: number;           // Point value (1-10)
  check: (data: CrawlData) => RuleResult;  // Validation function
}
```

#### RuleResult Interface

```typescript
interface RuleResult {
  ruleId: string;           // Rule identifier
  ruleName: string;         // Display name
  category: RuleCategory;   // Category
  passed: boolean;          // Pass/fail status
  score: number;            // Points earned (0 to maxScore)
  maxScore: number;         // Maximum possible points
  message: string;          // Result description
  suggestion?: string;      // Fix recommendation (optional)
}
```

#### Rule Categories

**6 Categories with weighted scoring**:

| Category | Weight | Rules | Focus Area |
|----------|--------|-------|------------|
| **Structured Data** | 30 pts | 4 rules | JSON-LD, Schema.org, FAQ/Article schemas |
| **Semantic HTML** | 20 pts | 4 rules | H1 tags, heading hierarchy, `<main>`, `<article>` |
| **Metadata** | 15 pts | 3 rules | Title, meta description, OpenGraph tags |
| **Crawl Signals** | 15 pts | 3 rules | robots.txt, sitemap.xml, canonical tags |
| **Content Clarity** | 10 pts | 3 rules | Content length, lists/tables, Q&A structure |
| **Agent Signals** | 10 pts | 3 rules | llms.txt, structured summaries |

---

### 5. Rule Examples (Deep Dive)

#### Structured Data Rules

**jsonld-presence.ts** (10 points):
```typescript
check: (data) => {
  const $ = cheerio.load(data.html);
  const jsonldScripts = $('script[type="application/ld+json"]');
  
  if (jsonldScripts.length > 0) {
    let validCount = 0;
    jsonldScripts.each((_, el) => {
      try {
        JSON.parse($(el).html());
        validCount++;
      } catch { /* Invalid JSON */ }
    });
    
    return validCount > 0 
      ? { passed: true, score: 10, message: `Found ${validCount} valid JSON-LD blocks` }
      : { passed: false, score: 3, message: 'JSON-LD found but invalid JSON' };
  }
  
  return { passed: false, score: 0, message: 'No JSON-LD found' };
}
```

**jsonld-valid-type.ts** (8 points):
- Validates JSON-LD contains Schema.org types
- Checks for recognized `@type` values
- Awards partial credit for valid structure without optimal types

**faq-schema.ts** (6 points):
- Detects `FAQPage` schema type
- Validates `mainEntity` with `Question` and `acceptedAnswer`
- Checks for minimum 2 Q&A pairs

**article-product-schema.ts** (6 points):
- Looks for `Article`, `BlogPosting`, `NewsArticle`, `Product` schemas
- Validates required properties (headline, author, datePublished, etc.)

#### Semantic HTML Rules

**single-h1.ts** (5 points):
```typescript
check: (data) => {
  const $ = cheerio.load(data.html);
  const h1Count = $('h1').length;
  
  if (h1Count === 1) {
    return { passed: true, score: 5, message: 'Exactly one <h1> tag found' };
  } else if (h1Count === 0) {
    return { passed: false, score: 0, message: 'No <h1> tag found' };
  } else {
    return { passed: false, score: 2, message: `${h1Count} <h1> tags found (should be 1)` };
  }
}
```

**heading-hierarchy.ts** (5 points):
- Validates proper H1 → H2 → H3 → H4 progression
- Detects skipped levels (H1 → H3 is an error)
- Ensures logical document structure

**has-main.ts** (5 points):
- Checks for `<main>` landmark element
- Helps AI agents identify primary content area

**has-article-section.ts** (5 points):
- Looks for `<article>` or `<section>` elements
- Validates semantic content organization

#### Metadata Rules

**has-title.ts** (5 points):
- Validates presence of `<title>` tag
- Checks length (ideal: 50-60 characters)
- Awards partial credit for too short/long titles

**has-meta-description.ts** (5 points):
- Checks for `<meta name="description">` tag
- Validates length (ideal: 150-160 characters)

**has-opengraph.ts** (5 points):
- Validates OpenGraph tags: `og:title`, `og:description`, `og:image`
- Essential for social media and AI agent previews

#### Crawl Signal Rules

**has-robots.ts** (5 points):
- Checks for `/robots.txt` file
- Validates it's not empty
- Looks for sitemap reference

**has-sitemap.ts** (5 points):
- Checks for `/sitemap.xml` file
- Validates XML structure
- Checks for URL entries

**has-canonical.ts** (5 points):
- Validates `<link rel="canonical">` tag
- Prevents duplicate content issues

#### Content Clarity Rules

**content-length.ts** (3 points):
- Measures main content word count
- Minimum threshold: 300 words
- Ensures substantive content for AI understanding

**has-lists-tables.ts** (3 points):
- Detects `<ul>`, `<ol>`, `<table>` elements
- Structured data aids AI comprehension

**has-qa-structure.ts** (4 points):
- Identifies Q&A patterns (headings ending with "?")
- Checks for answer content following questions
- Optimizes for answer engines

#### Agent Signal Rules

**has-llms-txt.ts** (5 points):
- Checks for `/llms.txt` file
- Follows proposed llms.txt standard
- Provides AI agent metadata

**has-structured-summary.ts** (5 points):
- Looks for semantic summary sections
- Validates clear content structure
- Helps AI extraction

---

### 6. Scoring Calculator (`src/scoring/calculator.ts`)

**Responsibility**: Aggregates rule results into final audit score

#### Function: `calculateScore(url, results) → AuditResult`

**Algorithm**:

1. **Group by Category**:
```typescript
const categoryMap = new Map<RuleCategory, RuleResult[]>();
for (const result of results) {
  const existing = categoryMap.get(result.category) || [];
  existing.push(result);
  categoryMap.set(result.category, existing);
}
```

2. **Calculate Category Scores**:
```typescript
for (const category of categoryOrder) {
  const categoryResults = categoryMap.get(category) || [];
  const score = categoryResults.reduce((sum, r) => sum + r.score, 0);
  const maxScore = categoryResults.reduce((sum, r) => sum + r.maxScore, 0);
  const percentage = Math.round((score / maxScore) * 100);
}
```

3. **Calculate Total Score**:
```typescript
const totalScore = results.reduce((sum, r) => sum + r.score, 0);
const maxScore = results.reduce((sum, r) => sum + r.maxScore, 0);
const percentage = Math.round((totalScore / maxScore) * 100);
```

4. **Assign Letter Grade**:
```typescript
A+: 95-100%    B+: 80-84%    C+: 65-69%    D+: 50-54%
A:  90-94%     B:  75-79%    C:  60-64%    D:  45-49%
A-: 85-89%     B-: 70-74%    C-: 55-59%    D-: 40-44%
                                           F:  <40%
```

5. **Assign Grade Emoji**:
```typescript
A grades: 🟢 (Green)
B grades: 🔵 (Blue)
C grades: 🟡 (Yellow)
D grades: 🟠 (Orange)
F grade:  🔴 (Red)
```

#### AuditResult Interface

```typescript
interface AuditResult {
  url: string;                    // Audited target
  totalScore: number;             // Total points earned
  maxScore: number;               // Maximum possible (100)
  percentage: number;             // Score percentage
  grade: string;                  // Letter grade (A+, B, C-, etc.)
  gradeEmoji: string;             // Visual indicator
  categories: CategoryScore[];    // Category breakdowns
  rules: RuleResult[];            // Individual rule results
  passedCount: number;            // Number of passed rules
  failedCount: number;            // Number of failed rules
  timestamp: string;              // ISO 8601 timestamp
}
```

---

### 7. Generator Module (`src/generator/`)

**Responsibility**: Creates missing files and fixes

#### Architecture

```
generator/
├── index.ts          # Orchestrator
├── llms-txt.ts       # llms.txt generator
├── jsonld.ts         # JSON-LD generator
├── robots-txt.ts     # robots.txt generator
└── sitemap-xml.ts    # sitemap.xml generator
```

#### index.ts - Generator Orchestrator

**Function**: `generateFixes(data, audit, outputDir) → FixResult`

**Logic**:
1. Create output directory
2. Identify failed rules from audit
3. Generate files based on failures:
   - `has-llms-txt` failed → generate llms.txt
   - `jsonld-presence` failed → generate JSON-LD + HTML snippet
   - `has-robots` failed → generate robots.txt
   - `has-sitemap` failed → generate sitemap.xml
4. Collect manual improvement suggestions
5. Generate comprehensive markdown report

**Output Files**:
- `llms.txt`: AI agent information
- `structured-data.jsonld`: Raw JSON-LD
- `structured-data-snippet.html`: Copy-paste HTML
- `robots.txt`: Crawler directives
- `sitemap.xml`: Site structure
- `cipwe-report.md`: Full audit report with fixes

#### llms-txt.ts - LLMs.txt Generator

**Function**: `generateLlmsTxt(url, html) → string`

**Extraction Process**:
1. **Metadata Extraction**:
   - Title: `<title>`, `og:title`, or first `<h1>`
   - Description: `<meta name="description">`, `og:description`
   - Author: `<meta name="author">`
   - Language: `<html lang="...">`

2. **Content Structure**:
   - Key headings: Extract up to 10 H2/H3 headings
   - Navigation links: Extract up to 8 nav/header links

3. **Output Format** (follows llms.txt standard):
```
# [Site Title]

> [Description]

This file provides information about [Title] for AI agents and LLMs.

- **Author**: [Author]
- **Language**: [lang]
- **URL**: [url]
- **AI Usage**: Allowed with attribution
- **Last Updated**: [YYYY-MM-DD]

## Key Pages

- [Link Text](url)
...

## Content Overview

- [Heading 1]
- [Heading 2]
...

## Optional

For detailed documentation, visit: [url]
```

#### jsonld.ts - JSON-LD Generator

**Function**: `generateJsonLd(url, html) → string`

**Schema Generation**:
1. Detects content type (Article, WebPage, Organization)
2. Extracts metadata:
   - headline/name
   - description
   - author
   - datePublished/dateModified
   - image
3. Generates Schema.org compliant JSON-LD

**Example Output**:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Page Title",
  "description": "Page description",
  "author": {
    "@type": "Person",
    "name": "Author Name"
  },
  "datePublished": "2026-02-14",
  "dateModified": "2026-02-14",
  "publisher": {
    "@type": "Organization",
    "name": "Site Name",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
}
```

#### robots-txt.ts - Robots.txt Generator

**Function**: `generateRobotsTxt(url, hasSitemap) → string`

**Generated Content**:
```
# Robots.txt - Generated by CIPWE
# Allow all AI agents and crawlers

User-agent: *
Allow: /

# AI Agent specific
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

# Sitemap
Sitemap: https://example.com/sitemap.xml

# Allow llms.txt for AI agents
Allow: /llms.txt
```

#### sitemap-xml.ts - Sitemap Generator

**Function**: `generateSitemapXml(url, html) → string`

**Extraction Process**:
1. Extracts all internal links from HTML
2. Normalizes URLs (relative → absolute)
3. Deduplicates URLs
4. Generates XML sitemap

**Example Output**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2026-02-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/about</loc>
    <lastmod>2026-02-14</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

### 8. UI Layer (`src/ui/`)

**Responsibility**: User interface and report rendering

#### Architecture

```
ui/
├── banner.ts         # CLI animations and status
└── report.ts         # Report formatters
```

#### banner.ts - CLI Feedback

**Functions**:
- `showBanner()`: Displays CIPWE ASCII art logo
- `showLoading(message)`: Animated spinner with message
- `showDone(message)`: Success indicator (✓)
- `showError(message)`: Error indicator (✗)

**Visual Elements**:
```
   ██████╗██╗██████╗ ██╗    ██╗███████╗
  ██╔════╝██║██╔══██╗██║    ██║██╔════╝
  ██║     ██║██████╔╝██║ █╗ ██║█████╗  
  ██║     ██║██╔═══╝ ██║███╗██║██╔══╝  
  ╚██████╗██║██║     ╚███╔███╔╝███████╗
   ╚═════╝╚═╝╚═╝      ╚══╝╚══╝ ╚══════╝

  The Web Vitals for the AI Web
```

#### report.ts - Report Rendering

**Function**: `renderReport(audit: AuditResult) → void`

**Output Structure**:

1. **Score Header**:
```
  ─────────────────────────────────────────────

  CIPWE Score    72/100  (72%)
  Grade          🔵 B
  Checks         15 passed  5 failed

  ─────────────────────────────────────────────
```

2. **Category Breakdown**:
```
  Category Scores

  ✔ Structured Data       █████████████░░░░░░░ 20/30 67%
  ✔ Semantic HTML          ███████████████░░░░░ 15/20 75%
  ✔ Metadata               ████████████████████ 15/15 100%
  ◐ Crawl Signals          ██████████████░░░░░░ 10/15 67%
  ◐ Content Clarity        ██████████████░░░░░░  7/10 70%
  ✘ Agent Signals          ██████████░░░░░░░░░░  5/10 50%
```

3. **Passed Checks**:
```
  ✔ Passed (15)

    ✔ JSON-LD Presence: Found 2 valid JSON-LD blocks
    ✔ Single H1: Exactly one <h1> tag found
    ...
```

4. **Failed Checks**:
```
  ✘ Issues (5)

    ✘ llms.txt Presence: No llms.txt file found
      → Add llms.txt to site root for AI agent metadata
    ✘ FAQ Schema: No FAQPage schema detected
      → Add FAQ-style content with FAQPage schema
    ...
```

5. **Footer**:
```
  ─────────────────────────────────────────────

  Run npx cipwe fix <target> to auto-generate fixes
  Report: 2026-02-14T10:30:00.000Z
```

**Function**: `renderJson(audit: AuditResult) → void`

Outputs complete audit result as formatted JSON for CI/CD integration.

**Visual Score Bar**:
```typescript
function scoreBar(score: number, max: number, width: number = 20): string {
  const filled = Math.round((score / max) * width);
  const empty = width - filled;
  
  // Color coding:
  // Green (≥80%): █████████████████░░░
  // Yellow (≥60%): █████████████░░░░░░░
  // Orange (≥40%): █████████░░░░░░░░░░░
  // Red (<40%): ██████░░░░░░░░░░░░░░
}
```

---

### 9. Utility Layer (`src/utils/`)

#### helpers.ts - Utility Functions

**URL Utilities**:
```typescript
isUrl(target: string): boolean
// Validates if string is http/https URL

normalizeUrl(target: string): string
// Adds https:// prefix if missing

getBaseUrl(url: string): string
// Extracts protocol + host from URL
```

**File System Utilities**:
```typescript
isDirectory(path: string): boolean
// Checks if path exists and is directory
```

**Formatting Utilities**:
```typescript
scoreBar(score: number, max: number, width: number): string
// Generates colored progress bar

stripHtml(html: string): string
// Removes HTML tags and normalizes whitespace
```

#### logger.ts - Logging System

Provides consistent logging with color coding and formatting.

---

## Data Flow

### Audit Command Flow

```
1. USER INPUT
   └─► cipwe audit https://example.com

2. COMMAND PARSING (index.ts)
   └─► Commander.js parses arguments
   └─► Routes to auditCommand()

3. CRAWLING PHASE (crawler/)
   ├─► fetchUrl("https://example.com/")
   │   ├─► Fetch HTML with retry logic
   │   └─► TLS fallback if needed
   ├─► Parallel fetch auxiliary files:
   │   ├─► tryFetchUrl("/robots.txt")
   │   ├─► tryFetchUrl("/sitemap.xml")
   │   └─► tryFetchUrl("/llms.txt")
   └─► Returns CrawlData object

4. ANALYSIS PHASE (analyzer/)
   ├─► runAnalyzer(crawlData)
   ├─► For each of 20 rules:
   │   ├─► rule.check(crawlData)
   │   └─► Returns RuleResult
   └─► Returns RuleResult[] array

5. SCORING PHASE (scoring/)
   ├─► calculateScore(url, results)
   ├─► Group results by category
   ├─► Sum scores per category
   ├─► Calculate total score
   ├─► Assign grade and emoji
   └─► Returns AuditResult

6. REPORTING PHASE (ui/)
   ├─► renderReport(auditResult)
   │   ├─► Display score header
   │   ├─► Display category breakdown
   │   ├─► Display passed checks
   │   ├─► Display failed checks
   │   └─► Display footer
   └─► OR renderJson(auditResult) for CI

7. EXIT CODE
   └─► process.exitCode = (percentage < 50) ? 1 : 0
```

### Fix Command Flow

```
1. USER INPUT
   └─► cipwe fix https://example.com -o ./output

2. COMMAND PARSING
   └─► Routes to fixCommand()

3. AUDIT WORKFLOW (steps 3-5 from audit flow)
   └─► Generates full AuditResult

4. FIX GENERATION (generator/)
   ├─► generateFixes(crawlData, audit, outputDir)
   ├─► Analyze failed rules
   ├─► Generate missing files:
   │   ├─► llms.txt (if has-llms-txt failed)
   │   ├─► JSON-LD files (if jsonld-* failed)
   │   ├─► robots.txt (if has-robots failed)
   │   └─► sitemap.xml (if has-sitemap failed)
   ├─► Collect manual suggestions
   ├─► Generate cipwe-report.md
   └─► Returns FixResult

5. OUTPUT DISPLAY
   ├─► List generated files
   ├─► List manual suggestions
   └─► Display next steps
```

### Score Command Flow

```
1. USER INPUT
   └─► cipwe score https://example.com

2. QUICK AUDIT
   ├─► Execute steps 3-5 from audit flow
   └─► Skip detailed reporting

3. OUTPUT
   └─► Display: "🔵 CIPWE 72/100 (B)"

4. EXIT CODE
   └─► process.exitCode = (percentage < 50) ? 1 : 0
```

---

## Design Patterns

### 1. Command Pattern
- Each CLI command is encapsulated in its own module
- Consistent interface: `async function(target, options)`
- Easy to add new commands

### 2. Strategy Pattern
- Rules are interchangeable strategies
- All implement same `Rule` interface
- Easy to add/remove rules

### 3. Factory Pattern
- Generator module creates different file types
- Each generator is a specialized factory function
- Unified interface for file generation

### 4. Pipeline Pattern
- Data flows through distinct phases:
  - Crawl → Analyze → Score → Report
- Each phase is independent and testable
- Clear separation of concerns

### 5. Dependency Injection
- Crawler options injected at runtime
- Output directory configurable
- Easy mocking for tests

### 6. Error Boundary Pattern
- Each rule execution wrapped in try-catch
- Failed rules don't crash entire analysis
- Graceful degradation

### 7. Adapter Pattern
- `CrawlData` interface adapts both URL and local sources
- Unified data structure for heterogeneous inputs

---

## Scoring System

### Score Distribution

**Total: 100 points across 20 rules**

```
Structured Data (30 pts)
├── JSON-LD Presence           10 pts
├── JSON-LD Valid Type          8 pts
├── FAQ Schema                  6 pts
└── Article/Product Schema      6 pts

Semantic HTML (20 pts)
├── Single H1                   5 pts
├── Heading Hierarchy           5 pts
├── Has <main>                  5 pts
└── Has <article>/<section>     5 pts

Metadata (15 pts)
├── Has <title>                 5 pts
├── Has Meta Description        5 pts
└── Has OpenGraph               5 pts

Crawl Signals (15 pts)
├── Has robots.txt              5 pts
├── Has sitemap.xml             5 pts
└── Has Canonical               5 pts

Content Clarity (10 pts)
├── Content Length              3 pts
├── Has Lists/Tables            3 pts
└── Has Q&A Structure           4 pts

Agent Signals (10 pts)
├── Has llms.txt                5 pts
└── Has Structured Summary      5 pts
```

### Grading Scale

```
Letter  Range    Emoji  Interpretation
------  -----    -----  --------------
A+      95-100%  🟢     Excellent - AI-ready
A       90-94%   🟢     Excellent
A-      85-89%   🟢     Very Good
B+      80-84%   🔵     Good
B       75-79%   🔵     Good
B-      70-74%   🔵     Acceptable
C+      65-69%   🟡     Fair
C       60-64%   🟡     Fair
C-      55-59%   🟡     Needs Improvement
D+      50-54%   🟠     Poor
D       45-49%   🟠     Poor
D-      40-44%   🟠     Very Poor
F       <40%     🔴     Failing - Not AI-ready
```

### Partial Credit System

Many rules award partial credit:
- **JSON-LD Presence**: 3/10 if JSON-LD exists but invalid
- **Single H1**: 2/5 if multiple H1s exist
- **Title Length**: 3/5 if title too short/long
- **Content Length**: Graduated scoring based on word count

---

## Extension Points

### Adding New Rules

1. **Create Rule File**: `src/analyzer/rules/my-rule.ts`

```typescript
import type { Rule, RuleResult, CrawlData } from '../../types/index.js';

export const myNewRule: Rule = {
  id: 'my-new-rule',
  name: 'My New Rule',
  description: 'Checks for something important',
  category: 'structured-data',  // or other category
  weight: 5,  // point value
  check: (data: CrawlData): RuleResult => {
    // Your validation logic here
    
    return {
      ruleId: 'my-new-rule',
      ruleName: 'My New Rule',
      category: 'structured-data',
      passed: true,
      score: 5,
      maxScore: 5,
      message: 'Check passed!',
      suggestion: 'Optional improvement suggestion',
    };
  },
};
```

2. **Register Rule**: Add to `src/analyzer/rules/index.ts`

```typescript
import { myNewRule } from './my-new-rule.js';

export const allRules: Rule[] = [
  // ... existing rules
  myNewRule,
];
```

3. **Update Category Weights** (if adding new category):

```typescript
// src/types/index.ts
export const CATEGORY_MAX_SCORES: Record<RuleCategory, number> = {
  'structured-data': 35,  // Increased from 30
  // ... rest
};
```

### Adding New Generators

1. **Create Generator**: `src/generator/my-generator.ts`

```typescript
export function generateMyFile(url: string, html: string): string {
  // Generation logic
  return fileContent;
}
```

2. **Integrate in Generator Index**: `src/generator/index.ts`

```typescript
import { generateMyFile } from './my-generator.js';

export function generateFixes(...) {
  // ... existing logic
  
  if (failedRuleIds.has('my-rule-id')) {
    const content = generateMyFile(data.url, data.html);
    const filePath = join(outputDir, 'my-file.txt');
    writeFileSync(filePath, content, 'utf-8');
    filesGenerated.push(filePath);
  }
}
```

### Adding New Commands

1. **Create Command File**: `src/commands/my-command.ts`

```typescript
export async function myCommand(target: string, options: MyOptions): Promise<void> {
  // Command logic
}
```

2. **Register in CLI**: `src/index.ts`

```typescript
program
  .command('mycommand <target>')
  .description('My new command')
  .option('--my-option', 'My option')
  .action(myCommand);
```

---

## Type System

### Core Type Definitions

```typescript
// Rule categories
type RuleCategory =
  | 'structured-data'
  | 'semantic-html'
  | 'metadata'
  | 'crawl-signals'
  | 'content-clarity'
  | 'agent-signals';

// Crawl data from URL or local files
interface CrawlData {
  url: string;
  html: string;
  robotsTxt: string | null;
  sitemapXml: string | null;
  llmsTxt: string | null;
  isLocal: boolean;
}

// Individual rule definition
interface Rule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  weight: number;
  check: (data: CrawlData) => RuleResult;
}

// Result from executing a rule
interface RuleResult {
  ruleId: string;
  ruleName: string;
  category: RuleCategory;
  passed: boolean;
  score: number;
  maxScore: number;
  message: string;
  suggestion?: string;
}

// Category-level score aggregation
interface CategoryScore {
  category: RuleCategory;
  categoryName: string;
  score: number;
  maxScore: number;
  percentage: number;
}

// Complete audit result
interface AuditResult {
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

// Fix generation result
interface FixResult {
  filesGenerated: string[];
  suggestions: string[];
}
```

---

## Error Handling

### Error Classification System

CIPWE implements a sophisticated error classification and handling system:

#### 1. TLS/Certificate Errors
- **Detection**: Pattern matching on error messages and codes
- **Recovery**: Automatic fallback to insecure mode
- **User Feedback**: Suggests `--insecure` flag

#### 2. Network Errors
- **Transient Errors**: ECONNRESET, ETIMEDOUT, EPIPE, EAI_AGAIN
- **Recovery**: Automatic retry with exponential backoff
- **Max Retries**: 2 retries by default

#### 3. HTTP Errors
- **Retry Codes**: 429, 500, 502, 503, 504
- **Recovery**: Automatic retry
- **Non-Retry Codes**: 404, 403, 401 (immediate failure)

#### 4. Connection Errors
- **Detection**: ECONNREFUSED
- **User Feedback**: "Server might not be running"
- **No Retry**: Immediate failure

#### 5. Timeout Errors
- **Detection**: AbortError, ETIMEDOUT
- **User Feedback**: Suggests `--timeout` adjustment
- **Configurable**: Via `--timeout` option

#### 6. Rule Execution Errors
- **Isolation**: Each rule wrapped in try-catch
- **Recovery**: Record 0-score result, continue with other rules
- **Logging**: Error captured in result message

### Error Recovery Flow

```
Error Occurs
    │
    ├─► Is TLS Error?
    │   └─► Enable TLS fallback
    │       └─► Retry request
    │
    ├─► Is Transient Error?
    │   └─► Wait 1s/2s/4s (exponential)
    │       └─► Retry (max 2 times)
    │
    ├─► Is HTTP 5xx or 429?
    │   └─► Wait and retry
    │
    └─► Fatal Error
        └─► Display user-friendly message
        └─► Exit with code 1
```

---

## Performance Optimization

### 1. Parallel Fetching
- HTML fetched first (enables TLS detection)
- Auxiliary files (robots.txt, sitemap.xml, llms.txt) fetched in parallel
- `Promise.all()` for concurrent requests

### 2. Lazy Loading
- Cheerio DOM parsing only when needed
- JSON.parse only for JSON-LD validation
- Modules imported only when commands execute

### 3. Early Exit
- Score command skips detailed reporting
- JSON mode skips UI rendering
- Failed fetch doesn't retry if non-transient

### 4. Memory Efficiency
- Stream processing for large files (not yet implemented)
- Single HTML parse shared across all rules
- No file caching (stateless operation)

---

## CI/CD Integration

### JSON Output Mode

```bash
cipwe audit https://example.com --json
```

**Output Schema**:
```json
{
  "url": "https://example.com",
  "totalScore": 72,
  "maxScore": 100,
  "percentage": 72,
  "grade": "B",
  "gradeEmoji": "🔵",
  "categories": [...],
  "rules": [...],
  "passedCount": 15,
  "failedCount": 5,
  "timestamp": "2026-02-14T10:30:00.000Z"
}
```

### Exit Codes

- **0**: Success (score ≥ 50%)
- **1**: Failure (score < 50% OR error occurred)

### GitHub Actions Example

```yaml
name: CIPWE Audit

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npx cipwe audit https://example.com --json > cipwe-report.json
      - uses: actions/upload-artifact@v3
        with:
          name: cipwe-report
          path: cipwe-report.json
```

---

## Security Considerations

### 1. TLS Certificate Validation
- **Default**: Strict TLS validation
- **Insecure Mode**: Available via `--insecure` flag
- **Use Cases**: Localhost, self-signed certificates, development

### 2. HTTP Redirects
- **Behavior**: Automatic following with `redirect: 'follow'`
- **Limit**: Default limit enforced by Node.js fetch
- **Security**: Prevents redirect loops

### 3. User Agent
- **Value**: `CIPWE-Bot/0.1 (+https://cipwe.com)`
- **Purpose**: Identifies traffic for server logs
- **Compliance**: Follows robot.txt specifications

### 4. File System Access
- **Scope**: Limited to specified directory
- **Validation**: Checks file existence before reading
- **No Writes**: Audit mode is read-only

### 5. Code Injection Prevention
- **HTML Parsing**: Uses Cheerio (prevents XSS)
- **JSON Parsing**: try-catch wrapped
- **User Input**: Sanitized through URL/path validation

---

## Testing Strategy (Recommended)

### Unit Tests
- **Target**: Individual rules
- **Approach**: Mock `CrawlData` inputs
- **Example**:
```typescript
describe('jsonld-presence', () => {
  it('should pass with valid JSON-LD', () => {
    const data: CrawlData = {
      html: '<script type="application/ld+json">{"@type":"Article"}</script>',
      // ... other fields
    };
    const result = jsonldPresenceRule.check(data);
    expect(result.passed).toBe(true);
    expect(result.score).toBe(10);
  });
});
```

### Integration Tests
- **Target**: End-to-end command flow
- **Approach**: Test with sample HTML files
- **Example**: Test audit command with fixture HTML

### E2E Tests
- **Target**: Full CLI execution
- **Approach**: Spawn child process with CLI commands
- **Example**: Test against live test URLs

---

## Future Enhancements

### Potential Features
1. **Configurable Rules**: Allow users to enable/disable specific rules
2. **Custom Rule Loading**: Plugin system for user-defined rules
3. **HTML Report**: Generate visual HTML report with charts
4. **Watch Mode**: Continuous monitoring of local files
5. **Diff Mode**: Compare two audits to track improvements
6. **Benchmark Mode**: Test multiple URLs in batch
7. **Language Detection**: Multi-language content analysis
8. **Performance Metrics**: Measure page load time, resource size
9. **Accessibility Checks**: Integrate a11y validation
10. **API Mode**: Run as HTTP service for remote auditing

### Scalability Improvements
1. **Streaming Parser**: Handle very large HTML files
2. **Caching Layer**: Cache repeated URL fetches
3. **Parallel Rule Execution**: Run rules concurrently
4. **Worker Threads**: CPU-intensive rule processing
5. **Database Storage**: Store historical audit data

---

## Conclusion

CIPWE implements a clean, modular architecture with clear separation of concerns:

- **CLI Layer**: User interface and command routing
- **Command Layer**: Orchestrates workflows
- **Crawler Layer**: Data acquisition with robust error handling
- **Analyzer Layer**: Rule-based validation engine
- **Scoring Layer**: Score calculation and grading
- **Generator Layer**: Fix generation and file creation
- **UI Layer**: Report rendering and formatting

The architecture supports:
- ✅ Easy rule addition/removal
- ✅ Multiple output formats
- ✅ Local and remote auditing
- ✅ Robust error recovery
- ✅ CI/CD integration
- ✅ Extensibility through well-defined interfaces

This design ensures CIPWE remains maintainable, testable, and extensible as the AI-readability landscape evolves.

---

*Generated on: February 14, 2026*
*CIPWE Version: 0.1.0*
*Documentation maintained by the CIPWE project*
