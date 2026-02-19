# CIPWE - Chrome Extension

> **Can AI find your website?** Check if ChatGPT, Perplexity & Google AI can find, understand, and cite your content — one click, instant score, actionable fixes.

![CIPWE Chrome Extension](icons/icon128.png)

## Features

- 🔍 **One-click audit** of the current page
- 📊 **19 rules** across 6 categories (100-point scale)
- 🎯 **Animated score ring** with letter grade
- 📋 **Category breakdown** with visual progress bars
- 💡 **Actionable suggestions** for every failed rule
- 🎨 **Clean, modern UI** with a blue-shade design system

## Categories

| Category | Max Score | What AI Tools Look For |
|---|---|---|
| **Structured Data** | 30 | JSON-LD presence, valid types, FAQ/Article schema |
| **Semantic HTML** | 20 | H1 tag, heading hierarchy, `<main>`, `<article>`/`<section>` |
| **Metadata** | 15 | Title, meta description, OpenGraph tags |
| **Crawl Signals** | 15 | robots.txt, sitemap.xml, canonical URL |
| **Content Clarity** | 10 | Content length, lists/tables, Q&A structure |
| **Agent Signals** | 10 | llms.txt, structured summary metadata |

## Installation (Developer Mode)

1. Clone or download this repository
2. Open **chrome://extensions/** in Chrome
3. Enable **Developer mode** (toggle in top-right)
4. Click **"Load unpacked"**
5. Select the `chrome-extension/` folder
6. Click the CIPWE icon in your toolbar to start auditing!

## How It Works

1. Click the extension icon on any webpage
2. Hit **"Audit This Page"**
3. The extension:
   - Extracts the page's HTML via a content script
   - Fetches `/robots.txt`, `/sitemap.xml`, and `/llms.txt` from the site
   - Runs all 19 checks that AI tools look for
   - Calculates your visibility score
4. View results with category breakdowns and actionable fixes

## Project Structure

```
chrome-extension/
├── manifest.json          # Extension manifest (MV3)
├── icons/                 # Extension icons
├── popup/
│   ├── popup.html         # Popup UI
│   ├── popup.css          # Blue-shade design system
│   └── popup.js           # Popup controller
├── analyzer/
│   └── analyzer.js        # 19 analysis rules + scoring engine
├── content/
│   └── content.js         # Content script (page data extraction)
└── background/
    └── background.js      # Service worker (fetch crawl files)
```

## Scoring

| Grade | Score Range |
|---|---|
| A+ | 95–100% |
| A  | 90–94% |
| A- | 85–89% |
| B+ | 80–84% |
| B  | 75–79% |
| B- | 70–74% |
| C+ | 65–69% |
| C  | 60–64% |
| C- | 55–59% |
| D+ | 50–54% |
| D  | 45–49% |
| D- | 40–44% |
| F  | 0–39% |

## CLI Tool

Want to run audits from the command line? Check out the main [CIPWE CLI tool](https://www.npmjs.com/package/cipwe):

```bash
npx cipwe audit example.com
```

## License

MIT - Made by [Somesh Ghosh](https://github.com/someshjoyguru)
