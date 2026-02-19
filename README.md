<div align="center">

```
   ██████╗██╗██████╗ ██╗    ██╗███████╗
  ██╔════╝██║██╔══██╗██║    ██║██╔════╝
  ██║     ██║██████╔╝██║ █╗ ██║█████╗  
  ██║     ██║██╔═══╝ ██║███╗██║██╔══╝  
  ╚██████╗██║██║     ╚███╔███╔╝███████╗
   ╚═════╝╚═╝╚═╝      ╚══╝╚══╝ ╚══════╝
```

### Can AI Find Your Website?

**ChatGPT, Perplexity & Google AI pull answers from websites. CIPWE checks if yours shows up.**

[![npm version](https://img.shields.io/npm/v/cipwe.svg)](https://www.npmjs.com/package/cipwe)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

[Website](https://cipwe.someshghosh.me) · [Report Bug](https://github.com/user/cipwe/issues) · [Request Feature](https://github.com/user/cipwe/issues)

</div>

---

## What is CIPWE?

**CIPWE** checks if AI tools can find, understand, and cite your website. It scans your page and tells you exactly what ChatGPT, Perplexity, Claude, and Google AI can (and can't) read.

Think of it like **Lighthouse** for AI visibility. One command, instant score, actionable fixes.

```bash
npx cipwe audit https://your-site.com
```

```
  CIPWE Score    72/100  (72%)
  Grade          🔵 B

  ✔ Structured Data       █████████████░░░░░░░ 20/30
  ✔ Semantic HTML          ███████████████░░░░░ 15/20
  ✔ Metadata               ████████████████████ 15/15
  ◐ Crawl Signals          ██████████████░░░░░░ 10/15
  ◐ Content Clarity        ██████████████░░░░░░  7/10
  ✘ Agent Signals          ██████████░░░░░░░░░░  5/10
```

## Why CIPWE?

AI tools are the new front page of the internet:

- **ChatGPT** browses the web to answer questions
- **Perplexity** indexes websites for instant answers
- **Claude** reads pages for research and analysis
- **Google AI Overview** summarizes web content in search results

If your site isn't set up right, AI skips you and cites your competitors instead.

**CIPWE tells you what to fix in 60 seconds.**

## Quick Start

```bash
# Audit any website
npx cipwe audit https://example.com

# Audit local project
npx cipwe audit .

# Auto-generate fixes
npx cipwe fix https://example.com

# Quick score check
npx cipwe score https://example.com

# JSON output for CI/CD
npx cipwe audit https://example.com --json
```

## Installation

```bash
# Use directly with npx (no install needed)
npx cipwe audit https://your-site.com

# Or install globally
npm install -g cipwe

# Or add to project
npm install --save-dev cipwe
```

## The CIPWE Score

CIPWE checks **19 things AI tools actually look for** across **6 categories**, scoring up to **100 points**:

| Category | Weight | What AI Tools Check |
|----------|--------|-----------------|
| **Structured Data** | 30 pts | Can AI read your data? JSON-LD, Schema.org, FAQ schemas |
| **Semantic HTML** | 20 pts | Is your page well-structured? H1, headings, `<main>`, `<article>` |
| **Metadata** | 15 pts | Can AI discover you? Title, description, OpenGraph |
| **Crawl Signals** | 15 pts | Can AI crawlers find you? robots.txt, sitemap, canonical |
| **Content Clarity** | 10 pts | Is your content AI-friendly? Length, lists, Q&A |
| **Agent Signals** | 10 pts | Ready for AI agents? llms.txt, summaries |

### Grading Scale

| Grade | Score | Meaning |
|-------|-------|---------|
| 🟢 A+ | 95-100 | AI-ready. Top-tier. |
| 🟢 A | 90-94 | Excellent AI visibility |
| 🔵 B+ | 80-89 | Good, minor improvements needed |
| 🔵 B | 70-79 | Decent, several improvements possible |
| 🟡 C | 60-69 | Moderate, significant gaps |
| 🟠 D | 40-59 | Poor AI-readability |
| 🔴 F | 0-39 | Not AI-readable |

## Commands

### `cipwe audit <target>`

Scan a website and generate a full CIPWE report.

```bash
cipwe audit https://example.com        # Deployed site
cipwe audit example.com                # Auto-adds https://
cipwe audit .                          # Local HTML files
cipwe audit ./dist                     # Build output
cipwe audit https://example.com --json # JSON for CI/CD
```

### `cipwe fix <target>`

Auto-generate missing files to improve your CIPWE score.

```bash
cipwe fix https://example.com
cipwe fix . -o ./public
```

Generates:
- `llms.txt` - AI agent directive file
- `structured-data.jsonld` - JSON-LD schema
- `structured-data-snippet.html` - Copy-paste HTML snippet
- `robots.txt` - AI-bot-friendly robots file
- `sitemap.xml` - Auto-generated sitemap
- `cipwe-report.md` - Detailed audit report

### `cipwe score <target>`

Quick one-line score check.

```bash
$ cipwe score https://example.com
🔵 CIPWE 72/100 (B)
```

## CI/CD Integration

### GitHub Actions

```yaml
name: CIPWE Audit
on: [push]

jobs:
  cipwe:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npx cipwe audit https://your-site.com --json > cipwe-report.json
      - name: Check CIPWE Score
        run: |
          SCORE=$(cat cipwe-report.json | jq '.percentage')
          echo "CIPWE Score: $SCORE%"
          if [ "$SCORE" -lt 50 ]; then
            echo "CIPWE Score below threshold!"
            exit 1
          fi
```

## What is `llms.txt`?

`llms.txt` is an emerging standard (like `robots.txt` but for AI). It tells AI agents:
- What your site is about
- What content is available
- How AI should use your content

CIPWE auto-generates this for you with the `fix` command.

## Rules Reference

<details>
<summary><strong>Structured Data (30 pts)</strong></summary>

| Rule | Points | Description |
|------|--------|-------------|
| JSON-LD Presence | 10 | Has `<script type="application/ld+json">` |
| JSON-LD Valid Type | 8 | Uses recognized Schema.org @type |
| FAQ Schema | 6 | FAQPage schema for Q&A content |
| Article/Product Schema | 6 | Rich content type schemas |

</details>

<details>
<summary><strong>Semantic HTML (20 pts)</strong></summary>

| Rule | Points | Description |
|------|--------|-------------|
| Single H1 | 5 | Exactly one `<h1>` tag |
| Heading Hierarchy | 5 | Proper H1→H2→H3 nesting |
| Has `<main>` | 5 | Uses semantic `<main>` element |
| Has `<article>`/`<section>` | 5 | Semantic sectioning elements |

</details>

<details>
<summary><strong>Metadata (15 pts)</strong></summary>

| Rule | Points | Description |
|------|--------|-------------|
| Page Title | 5 | Meaningful `<title>` tag (50-60 chars) |
| Meta Description | 5 | Descriptive meta description (150-160 chars) |
| OpenGraph Tags | 5 | og:title, og:description, og:image |

</details>

<details>
<summary><strong>Crawl Signals (15 pts)</strong></summary>

| Rule | Points | Description |
|------|--------|-------------|
| robots.txt | 5 | Accessible with AI bot directives |
| sitemap.xml | 5 | Valid sitemap with URLs |
| Canonical URL | 5 | `<link rel="canonical">` present |

</details>

<details>
<summary><strong>Content Clarity (10 pts)</strong></summary>

| Rule | Points | Description |
|------|--------|-------------|
| Content Length | 3 | 300+ words of readable content |
| Lists & Tables | 3 | Uses `<ul>`, `<ol>`, `<table>` |
| Q&A Structure | 4 | Question headings, FAQ patterns |

</details>

<details>
<summary><strong>Agent Signals (10 pts)</strong></summary>

| Rule | Points | Description |
|------|--------|-------------|
| llms.txt | 5 | AI directive file at site root |
| Structured Summary | 5 | Rich meta signals (lang, author, etc.) |

</details>

## Philosophy

> SEO made your site findable on Google.  
> CIPWE makes your site findable by AI.

The web is shifting. People don't just click links anymore - they ask ChatGPT, Perplexity, and Google AI. Your content needs to be:

1. **Findable** - AI crawlers can discover it
2. **Parseable** - Structured so AI can extract facts
3. **Citable** - Clear enough that AI quotes you, not your competitor

CIPWE measures all three.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

```bash
git clone https://github.com/user/cipwe.git
cd cipwe
npm install
npm run build
node dist/index.js audit https://example.com
```

## License

MIT © [CIPWE](https://cipwe.someshghosh.me)

---

<div align="center">

**Make your site visible to AI.**

[cipwe.someshghosh.me](https://cipwe.someshghosh.me)

</div>
