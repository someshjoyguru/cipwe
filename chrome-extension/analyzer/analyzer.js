/* ============================================================
   CIPWE Chrome Extension - Analyzer Engine
   All 19 rules ported to vanilla JS (no cheerio needed)
   ============================================================ */

// ─── TYPES & CONSTANTS ──────────────────────────────────────

const CATEGORY_NAMES = {
  'structured-data': 'Structured Data',
  'semantic-html':   'Semantic HTML',
  'metadata':        'Metadata',
  'crawl-signals':   'Crawl Signals',
  'content-clarity': 'Content Clarity',
  'agent-signals':   'Agent Signals',
};

const CATEGORY_ICONS = {
  'structured-data': '{ }',
  'semantic-html':   '◆',
  'metadata':        '◎',
  'crawl-signals':   '⇌',
  'content-clarity': '¶',
  'agent-signals':   '⚙',
};

const CATEGORY_ORDER = [
  'structured-data',
  'semantic-html',
  'metadata',
  'crawl-signals',
  'content-clarity',
  'agent-signals',
];

// ─── DOM PARSER HELPER ──────────────────────────────────────

function parseHTML(html) {
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

function stripHtml(text) {
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// ─── RULES ──────────────────────────────────────────────────

const VALID_SCHEMA_TYPES = [
  'WebSite', 'WebPage', 'Article', 'BlogPosting', 'NewsArticle',
  'Product', 'Organization', 'Person', 'LocalBusiness', 'FAQPage',
  'HowTo', 'Recipe', 'Event', 'Course', 'SoftwareApplication',
  'MobileApplication', 'VideoObject', 'ImageObject', 'BreadcrumbList',
  'ItemList', 'Service', 'Offer', 'Review', 'AggregateRating',
  'CreativeWork', 'TechArticle', 'APIReference', 'Book',
];

const RICH_SCHEMA_TYPES = [
  'Article', 'BlogPosting', 'NewsArticle', 'TechArticle',
  'Product', 'SoftwareApplication', 'MobileApplication',
  'WebSite', 'Organization', 'LocalBusiness',
  'Course', 'Event', 'Recipe', 'HowTo', 'VideoObject',
  'Service', 'Book', 'CreativeWork',
];

function getJsonLdBlocks(doc) {
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
  const blocks = [];
  scripts.forEach(s => {
    try {
      const content = s.textContent;
      if (content) {
        blocks.push(JSON.parse(content));
      }
    } catch { /* skip */ }
  });
  return blocks;
}

function extractTypes(obj) {
  const types = [];
  if (obj['@type']) {
    const t = Array.isArray(obj['@type']) ? obj['@type'] : [obj['@type']];
    types.push(...t);
  }
  if (obj['@graph'] && Array.isArray(obj['@graph'])) {
    obj['@graph'].forEach(item => types.push(...extractTypes(item)));
  }
  return types;
}

// --- Rule 1: JSON-LD Presence (10 pts) ---
function checkJsonldPresence(doc) {
  const scripts = doc.querySelectorAll('script[type="application/ld+json"]');

  if (scripts.length > 0) {
    let validCount = 0;
    scripts.forEach(s => {
      try {
        if (s.textContent) { JSON.parse(s.textContent); validCount++; }
      } catch { /* invalid */ }
    });

    if (validCount > 0) {
      return { ruleId: 'jsonld-presence', ruleName: 'JSON-LD Presence', category: 'structured-data', passed: true, score: 10, maxScore: 10, message: `Found ${validCount} valid JSON-LD block(s)` };
    }
    return { ruleId: 'jsonld-presence', ruleName: 'JSON-LD Presence', category: 'structured-data', passed: false, score: 3, maxScore: 10, message: 'JSON-LD blocks found but contain invalid JSON', suggestion: 'Fix the JSON syntax in your <script type="application/ld+json"> blocks' };
  }

  return { ruleId: 'jsonld-presence', ruleName: 'JSON-LD Presence', category: 'structured-data', passed: false, score: 0, maxScore: 10, message: 'No JSON-LD structured data found', suggestion: 'Add <script type="application/ld+json"> with Schema.org structured data to help AI agents understand your content' };
}

// --- Rule 2: JSON-LD Valid Type (8 pts) ---
function checkJsonldValidType(doc) {
  const blocks = getJsonLdBlocks(doc);

  if (blocks.length === 0) {
    return { ruleId: 'jsonld-valid-type', ruleName: 'JSON-LD Valid Type', category: 'structured-data', passed: false, score: 0, maxScore: 8, message: 'No JSON-LD found to validate type', suggestion: 'Add JSON-LD with a valid @type like WebSite, Article, Product, or Organization' };
  }

  const foundTypes = [];
  blocks.forEach(b => foundTypes.push(...extractTypes(b)));
  const validFound = foundTypes.filter(t => VALID_SCHEMA_TYPES.includes(t));

  if (validFound.length > 0) {
    return { ruleId: 'jsonld-valid-type', ruleName: 'JSON-LD Valid Type', category: 'structured-data', passed: true, score: 8, maxScore: 8, message: `Valid Schema.org types: ${validFound.join(', ')}` };
  }

  if (foundTypes.length > 0) {
    return { ruleId: 'jsonld-valid-type', ruleName: 'JSON-LD Valid Type', category: 'structured-data', passed: false, score: 4, maxScore: 8, message: `JSON-LD types found but not standard: ${foundTypes.join(', ')}`, suggestion: `Use standard Schema.org types like: ${VALID_SCHEMA_TYPES.slice(0, 8).join(', ')}` };
  }

  return { ruleId: 'jsonld-valid-type', ruleName: 'JSON-LD Valid Type', category: 'structured-data', passed: false, score: 0, maxScore: 8, message: 'No @type found in JSON-LD', suggestion: 'Add @type field to your JSON-LD structured data' };
}

// --- Rule 3: FAQ Schema (6 pts) ---
function checkFaqSchema(doc) {
  const blocks = getJsonLdBlocks(doc);
  let hasFaq = false;

  function checkForFaq(obj) {
    if (obj['@type'] === 'FAQPage') return true;
    if (obj['@graph'] && Array.isArray(obj['@graph'])) {
      return obj['@graph'].some(checkForFaq);
    }
    return false;
  }

  blocks.forEach(b => { if (checkForFaq(b)) hasFaq = true; });

  if (hasFaq) {
    return { ruleId: 'faq-schema', ruleName: 'FAQ Schema', category: 'structured-data', passed: true, score: 6, maxScore: 6, message: 'FAQPage schema detected - AI agents can parse Q&A content' };
  }

  const text = (doc.body?.textContent || '').toLowerCase();
  const hasQaContent = text.includes('frequently asked') || text.includes('faq') || doc.querySelectorAll('details').length > 0 || doc.querySelectorAll('dt').length > 2;

  if (hasQaContent) {
    return { ruleId: 'faq-schema', ruleName: 'FAQ Schema', category: 'structured-data', passed: false, score: 0, maxScore: 6, message: 'FAQ-like content detected but no FAQPage schema', suggestion: 'Wrap your FAQ content in FAQPage JSON-LD schema so AI agents can directly extract Q&A pairs' };
  }

  return { ruleId: 'faq-schema', ruleName: 'FAQ Schema', category: 'structured-data', passed: false, score: 2, maxScore: 6, message: 'No FAQ schema found (may not be applicable)', suggestion: 'Consider adding FAQPage schema if your page contains Q&A content' };
}

// --- Rule 4: Article/Product Schema (6 pts) ---
function checkArticleProductSchema(doc) {
  const blocks = getJsonLdBlocks(doc);
  const richTypes = [];

  blocks.forEach(b => {
    function extract(obj) {
      if (obj['@type'] && RICH_SCHEMA_TYPES.includes(obj['@type'])) {
        richTypes.push(obj['@type']);
      }
      if (obj['@graph'] && Array.isArray(obj['@graph'])) {
        obj['@graph'].forEach(extract);
      }
    }
    extract(b);
  });

  if (richTypes.length > 0) {
    return { ruleId: 'article-product-schema', ruleName: 'Article/Product Schema', category: 'structured-data', passed: true, score: 6, maxScore: 6, message: `Rich schema types: ${[...new Set(richTypes)].join(', ')}` };
  }

  return { ruleId: 'article-product-schema', ruleName: 'Article/Product Schema', category: 'structured-data', passed: false, score: 0, maxScore: 6, message: 'No Article, Product, or Organization schema found', suggestion: 'Add structured data for your primary content type (Article for blogs, Product for e-commerce, Organization for businesses)' };
}

// --- Rule 5: Single H1 (5 pts) ---
function checkSingleH1(doc) {
  const h1s = doc.querySelectorAll('h1');

  if (h1s.length === 1) {
    const text = h1s[0].textContent.trim();
    return { ruleId: 'single-h1', ruleName: 'Single H1 Tag', category: 'semantic-html', passed: true, score: 5, maxScore: 5, message: `Single H1: "${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"` };
  }
  if (h1s.length === 0) {
    return { ruleId: 'single-h1', ruleName: 'Single H1 Tag', category: 'semantic-html', passed: false, score: 0, maxScore: 5, message: 'No H1 heading found', suggestion: 'Add exactly one <h1> tag that describes the page\'s primary topic' };
  }
  return { ruleId: 'single-h1', ruleName: 'Single H1 Tag', category: 'semantic-html', passed: false, score: 2, maxScore: 5, message: `Found ${h1s.length} H1 tags (should be 1)`, suggestion: 'Use only one <h1> per page. AI agents rely on H1 to understand the primary topic' };
}

// --- Rule 6: Heading Hierarchy (5 pts) ---
function checkHeadingHierarchy(doc) {
  const headings = [];
  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(el => {
    headings.push({ level: parseInt(el.tagName.replace('H', ''), 10), text: el.textContent.trim() });
  });

  if (headings.length === 0) {
    return { ruleId: 'heading-hierarchy', ruleName: 'Heading Hierarchy', category: 'semantic-html', passed: false, score: 0, maxScore: 5, message: 'No headings found', suggestion: 'Add semantic headings (H1-H6) to structure your content' };
  }

  let violations = 0;
  for (let i = 1; i < headings.length; i++) {
    if (headings[i].level - headings[i - 1].level > 1) violations++;
  }

  if (violations === 0) {
    return { ruleId: 'heading-hierarchy', ruleName: 'Heading Hierarchy', category: 'semantic-html', passed: true, score: 5, maxScore: 5, message: `Clean hierarchy (${headings.length} headings, no skipped levels)` };
  }

  return { ruleId: 'heading-hierarchy', ruleName: 'Heading Hierarchy', category: 'semantic-html', passed: false, score: violations <= 2 ? 3 : 1, maxScore: 5, message: `${violations} hierarchy violation(s) - levels skipped`, suggestion: 'Ensure headings follow H1→H2→H3 order. Don\'t skip levels.' };
}

// --- Rule 7: Has <main> (5 pts) ---
function checkHasMain(doc) {
  const mains = doc.querySelectorAll('main');

  if (mains.length === 1) {
    return { ruleId: 'has-main', ruleName: 'Has <main> Element', category: 'semantic-html', passed: true, score: 5, maxScore: 5, message: '<main> element found - content region is clearly defined' };
  }
  if (mains.length > 1) {
    return { ruleId: 'has-main', ruleName: 'Has <main> Element', category: 'semantic-html', passed: false, score: 3, maxScore: 5, message: `Found ${mains.length} <main> elements (should be 1)`, suggestion: 'Use only one <main> element' };
  }

  if (doc.querySelector('[role="main"]')) {
    return { ruleId: 'has-main', ruleName: 'Has <main> Element', category: 'semantic-html', passed: true, score: 4, maxScore: 5, message: 'Found role="main" (prefer native <main>)' };
  }

  return { ruleId: 'has-main', ruleName: 'Has <main> Element', category: 'semantic-html', passed: false, score: 0, maxScore: 5, message: 'No <main> element found', suggestion: 'Wrap primary content in <main>. AI agents use this to identify core content vs navigation/footer' };
}

// --- Rule 8: Has <article>/<section> (5 pts) ---
function checkHasArticleSection(doc) {
  const a = doc.querySelectorAll('article').length;
  const s = doc.querySelectorAll('section').length;
  const n = doc.querySelectorAll('nav').length;
  const h = doc.querySelectorAll('header').length;
  const f = doc.querySelectorAll('footer').length;
  const total = a + s + n + h + f;

  if (a > 0 && s > 0) {
    return { ruleId: 'has-article-section', ruleName: 'Has <article>/<section>', category: 'semantic-html', passed: true, score: 5, maxScore: 5, message: `Rich semantic structure: ${a} <article>, ${s} <section>, ${n + h + f} others` };
  }
  if (a > 0 || s > 0) {
    return { ruleId: 'has-article-section', ruleName: 'Has <article>/<section>', category: 'semantic-html', passed: true, score: 4, maxScore: 5, message: `Semantic sectioning: ${a} <article>, ${s} <section>` };
  }
  if (total > 0) {
    return { ruleId: 'has-article-section', ruleName: 'Has <article>/<section>', category: 'semantic-html', passed: false, score: 2, maxScore: 5, message: 'Some semantic elements but missing <article>/<section>', suggestion: 'Use <article> for self-contained content and <section> for thematic groupings' };
  }

  return { ruleId: 'has-article-section', ruleName: 'Has <article>/<section>', category: 'semantic-html', passed: false, score: 0, maxScore: 5, message: 'No semantic sectioning elements found', suggestion: 'Replace <div> containers with <article>, <section>, <nav>, <header>, <footer>' };
}

// --- Rule 9: Page Title (5 pts) ---
function checkHasTitle(doc) {
  const title = (doc.querySelector('title')?.textContent || '').trim();

  if (!title) {
    return { ruleId: 'has-title', ruleName: 'Page Title', category: 'metadata', passed: false, score: 0, maxScore: 5, message: 'No <title> tag found', suggestion: 'Add a <title> with a clear page title (50-60 chars)' };
  }
  if (title.length < 10) {
    return { ruleId: 'has-title', ruleName: 'Page Title', category: 'metadata', passed: false, score: 2, maxScore: 5, message: `Title too short (${title.length} chars): "${title}"`, suggestion: 'Expand to 50-60 characters' };
  }
  if (title.length > 70) {
    return { ruleId: 'has-title', ruleName: 'Page Title', category: 'metadata', passed: true, score: 4, maxScore: 5, message: `Title slightly long (${title.length} chars): "${title.substring(0, 60)}..."` };
  }

  return { ruleId: 'has-title', ruleName: 'Page Title', category: 'metadata', passed: true, score: 5, maxScore: 5, message: `Good title (${title.length} chars): "${title}"` };
}

// --- Rule 10: Meta Description (5 pts) ---
function checkMetaDescription(doc) {
  const desc = (doc.querySelector('meta[name="description"]')?.getAttribute('content') || '').trim();

  if (!desc) {
    return { ruleId: 'has-meta-description', ruleName: 'Meta Description', category: 'metadata', passed: false, score: 0, maxScore: 5, message: 'No meta description found', suggestion: 'Add <meta name="description" content="..."> with 150-160 chars' };
  }
  if (desc.length < 50) {
    return { ruleId: 'has-meta-description', ruleName: 'Meta Description', category: 'metadata', passed: false, score: 2, maxScore: 5, message: `Meta description too short (${desc.length} chars)`, suggestion: 'Expand to 150-160 characters' };
  }
  if (desc.length > 170) {
    return { ruleId: 'has-meta-description', ruleName: 'Meta Description', category: 'metadata', passed: true, score: 4, maxScore: 5, message: `Meta description slightly long (${desc.length} chars) but present` };
  }

  return { ruleId: 'has-meta-description', ruleName: 'Meta Description', category: 'metadata', passed: true, score: 5, maxScore: 5, message: `Good meta description (${desc.length} chars)` };
}

// --- Rule 11: OpenGraph Tags (5 pts) ---
function checkOpengraph(doc) {
  const REQUIRED = ['og:title', 'og:description', 'og:image'];
  const BONUS = ['og:type', 'og:url', 'og:site_name'];

  const foundReq = [];
  const missingReq = [];
  const foundBonus = [];

  REQUIRED.forEach(tag => {
    const el = doc.querySelector(`meta[property="${tag}"]`);
    const content = el?.getAttribute('content')?.trim();
    content ? foundReq.push(tag) : missingReq.push(tag);
  });

  BONUS.forEach(tag => {
    const el = doc.querySelector(`meta[property="${tag}"]`);
    if (el?.getAttribute('content')?.trim()) foundBonus.push(tag);
  });

  const hasTwitter = doc.querySelector('meta[name="twitter:card"]')?.getAttribute('content') || doc.querySelector('meta[property="twitter:card"]')?.getAttribute('content');

  if (foundReq.length === REQUIRED.length) {
    const bonus = foundBonus.length > 0 ? ` + ${foundBonus.join(', ')}` : '';
    const twitter = hasTwitter ? ' + Twitter Card' : '';
    return { ruleId: 'has-opengraph', ruleName: 'OpenGraph Tags', category: 'metadata', passed: true, score: 5, maxScore: 5, message: `All OpenGraph tags present${bonus}${twitter}` };
  }

  if (foundReq.length > 0) {
    return { ruleId: 'has-opengraph', ruleName: 'OpenGraph Tags', category: 'metadata', passed: false, score: Math.round((foundReq.length / REQUIRED.length) * 4), maxScore: 5, message: `Partial OpenGraph: found ${foundReq.join(', ')}, missing ${missingReq.join(', ')}`, suggestion: `Add missing: ${missingReq.join(', ')}` };
  }

  return { ruleId: 'has-opengraph', ruleName: 'OpenGraph Tags', category: 'metadata', passed: false, score: 0, maxScore: 5, message: 'No OpenGraph tags found', suggestion: 'Add og:title, og:description, og:image meta tags' };
}

// --- Rule 12: robots.txt (5 pts) ---
function checkRobots(data) {
  if (!data.robotsTxt) {
    return { ruleId: 'has-robots', ruleName: 'robots.txt', category: 'crawl-signals', passed: false, score: 0, maxScore: 5, message: 'No robots.txt found', suggestion: 'Create a robots.txt that allows AI agent crawling' };
  }

  const content = data.robotsTxt.toLowerCase();
  const hasSitemap = content.includes('sitemap:');
  const hasAiBots = content.includes('gptbot') || content.includes('chatgpt') || content.includes('anthropic') || content.includes('claude') || content.includes('perplexitybot') || content.includes('googleother');
  const blocksAll = content.includes('disallow: /');

  if (hasSitemap && hasAiBots) {
    return { ruleId: 'has-robots', ruleName: 'robots.txt', category: 'crawl-signals', passed: true, score: 5, maxScore: 5, message: 'robots.txt with Sitemap directive and AI bot rules' };
  }
  if (hasSitemap) {
    return { ruleId: 'has-robots', ruleName: 'robots.txt', category: 'crawl-signals', passed: true, score: 4, maxScore: 5, message: 'robots.txt found with Sitemap directive' };
  }
  if (blocksAll) {
    return { ruleId: 'has-robots', ruleName: 'robots.txt', category: 'crawl-signals', passed: false, score: 1, maxScore: 5, message: 'robots.txt may be blocking crawlers', suggestion: 'Consider allowing GPTBot, Anthropic-AI, PerplexityBot' };
  }

  return { ruleId: 'has-robots', ruleName: 'robots.txt', category: 'crawl-signals', passed: true, score: 3, maxScore: 5, message: 'robots.txt found but missing Sitemap directive', suggestion: 'Add "Sitemap: https://yoursite.com/sitemap.xml"' };
}

// --- Rule 13: sitemap.xml (5 pts) ---
function checkSitemap(data) {
  if (!data.sitemapXml) {
    return { ruleId: 'has-sitemap', ruleName: 'sitemap.xml', category: 'crawl-signals', passed: false, score: 0, maxScore: 5, message: 'No sitemap.xml found', suggestion: 'Generate a sitemap.xml listing all important pages' };
  }

  const content = data.sitemapXml.toLowerCase();
  const hasUrlset = content.includes('<urlset') || content.includes('<sitemapindex');
  const hasUrls = content.includes('<url>') || content.includes('<sitemap>');

  if (hasUrlset && hasUrls) {
    const urlCount = (content.match(/<url>/g) || []).length + (content.match(/<sitemap>/g) || []).length;
    const hasLastmod = content.includes('<lastmod>');
    const hasPriority = content.includes('<priority>');

    if (hasLastmod && hasPriority) {
      return { ruleId: 'has-sitemap', ruleName: 'sitemap.xml', category: 'crawl-signals', passed: true, score: 5, maxScore: 5, message: `Rich sitemap (${urlCount} entries with lastmod & priority)` };
    }
    return { ruleId: 'has-sitemap', ruleName: 'sitemap.xml', category: 'crawl-signals', passed: true, score: 4, maxScore: 5, message: `Sitemap found (${urlCount} entries)`, suggestion: 'Add <lastmod> and <priority> tags' };
  }

  return { ruleId: 'has-sitemap', ruleName: 'sitemap.xml', category: 'crawl-signals', passed: false, score: 1, maxScore: 5, message: 'sitemap.xml found but appears malformed', suggestion: 'Ensure it follows the Sitemaps protocol' };
}

// --- Rule 14: Canonical URL (5 pts) ---
function checkCanonical(doc) {
  const canonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href')?.trim();

  if (canonical) {
    const isValid = canonical.startsWith('http://') || canonical.startsWith('https://') || canonical.startsWith('/');
    if (isValid) {
      return { ruleId: 'has-canonical', ruleName: 'Canonical URL', category: 'crawl-signals', passed: true, score: 5, maxScore: 5, message: `Canonical: ${canonical.substring(0, 80)}` };
    }
    return { ruleId: 'has-canonical', ruleName: 'Canonical URL', category: 'crawl-signals', passed: false, score: 2, maxScore: 5, message: `Canonical may be malformed: "${canonical}"`, suggestion: 'Use a full absolute URL' };
  }

  return { ruleId: 'has-canonical', ruleName: 'Canonical URL', category: 'crawl-signals', passed: false, score: 0, maxScore: 5, message: 'No canonical URL found', suggestion: 'Add <link rel="canonical" href="..."> to prevent duplicate content issues' };
}

// --- Rule 15: Content Length (3 pts) ---
function checkContentLength(doc) {
  const mainEl = doc.querySelector('main');
  const textSource = mainEl || doc.body;
  const text = (textSource?.textContent || '').trim();
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  if (wordCount >= 300) {
    return { ruleId: 'content-length', ruleName: 'Content Length', category: 'content-clarity', passed: true, score: 3, maxScore: 3, message: `Good content density (${wordCount} words)` };
  }
  if (wordCount >= 100) {
    return { ruleId: 'content-length', ruleName: 'Content Length', category: 'content-clarity', passed: true, score: 2, maxScore: 3, message: `Moderate content (${wordCount} words)`, suggestion: 'Consider adding more content (300+ words)' };
  }
  if (wordCount >= 30) {
    return { ruleId: 'content-length', ruleName: 'Content Length', category: 'content-clarity', passed: false, score: 1, maxScore: 3, message: `Thin content (${wordCount} words)`, suggestion: 'Add more substantive text for AI comprehension' };
  }

  return { ruleId: 'content-length', ruleName: 'Content Length', category: 'content-clarity', passed: false, score: 0, maxScore: 3, message: `Very thin content (${wordCount} words)`, suggestion: 'Your page has almost no readable text' };
}

// --- Rule 16: Lists & Tables (3 pts) ---
function checkListsTables(doc) {
  const ul = doc.querySelectorAll('ul:not(nav ul)').length;
  const ol = doc.querySelectorAll('ol').length;
  const dl = doc.querySelectorAll('dl').length;
  const table = doc.querySelectorAll('table').length;
  const details = doc.querySelectorAll('details').length;
  const total = ul + ol + dl + table + details;

  if (total >= 3) {
    const parts = [];
    if (ul > 0) parts.push(`${ul} ul`);
    if (ol > 0) parts.push(`${ol} ol`);
    if (dl > 0) parts.push(`${dl} dl`);
    if (table > 0) parts.push(`${table} table`);
    if (details > 0) parts.push(`${details} details`);
    return { ruleId: 'has-lists-tables', ruleName: 'Lists & Tables', category: 'content-clarity', passed: true, score: 3, maxScore: 3, message: `Good structured content: ${parts.join(', ')}` };
  }
  if (total >= 1) {
    return { ruleId: 'has-lists-tables', ruleName: 'Lists & Tables', category: 'content-clarity', passed: true, score: 2, maxScore: 3, message: `Some structured content (${total} elements)`, suggestion: 'Add more lists or tables for better AI parsing' };
  }

  return { ruleId: 'has-lists-tables', ruleName: 'Lists & Tables', category: 'content-clarity', passed: false, score: 0, maxScore: 3, message: 'No structured content elements found', suggestion: 'Use <ul>, <ol>, <table>, or <details> to structure information' };
}

// --- Rule 17: Q&A Structure (4 pts) ---
function checkQaStructure(doc) {
  const text = doc.body?.textContent || '';
  let qaSignals = 0;

  if (doc.querySelectorAll('details').length > 0) qaSignals += 2;
  if (doc.querySelectorAll('dt').length > 0 && doc.querySelectorAll('dd').length > 0) qaSignals += 2;

  const questionHeadings = [...doc.querySelectorAll('h2, h3, h4')].filter(el => {
    const t = el.textContent.trim().toLowerCase();
    return t.endsWith('?') || t.startsWith('what') || t.startsWith('how') || t.startsWith('why') || t.startsWith('when') || t.startsWith('where') || t.startsWith('who') || t.startsWith('can') || t.startsWith('is') || t.startsWith('does');
  });

  if (questionHeadings.length >= 2) qaSignals += 2;
  else if (questionHeadings.length === 1) qaSignals += 1;

  if (text.toLowerCase().includes('frequently asked') || text.toLowerCase().includes('faq')) qaSignals += 1;
  if (/\bQ:\s/i.test(text) || /\bA:\s/i.test(text)) qaSignals += 1;

  if (qaSignals >= 3) {
    return { ruleId: 'has-qa-structure', ruleName: 'Q&A Structure', category: 'content-clarity', passed: true, score: 4, maxScore: 4, message: 'Strong Q&A structure - AI tools can easily extract answers' };
  }
  if (qaSignals >= 1) {
    return { ruleId: 'has-qa-structure', ruleName: 'Q&A Structure', category: 'content-clarity', passed: true, score: 2, maxScore: 4, message: 'Some Q&A signals detected', suggestion: 'Strengthen Q&A structure with question-format headings' };
  }

  return { ruleId: 'has-qa-structure', ruleName: 'Q&A Structure', category: 'content-clarity', passed: false, score: 0, maxScore: 4, message: 'No Q&A structure detected', suggestion: 'Add FAQ-style content with question headings (H2/H3 ending with "?")' };
}

// --- Rule 18: llms.txt (5 pts) ---
function checkLlmsTxt(data) {
  if (!data.llmsTxt) {
    return { ruleId: 'has-llms-txt', ruleName: 'llms.txt', category: 'agent-signals', passed: false, score: 0, maxScore: 5, message: 'No llms.txt found', suggestion: 'Create a llms.txt at your site root describing your site\'s purpose and AI usage policy' };
  }

  const content = data.llmsTxt.trim();
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const hasTitle = /^#\s/m.test(content);
  const hasDescription = content.length > 100;
  const hasLinks = /https?:\/\//i.test(content);
  const hasSections = (content.match(/^>/gm) || []).length >= 1 || (content.match(/^##\s/gm) || []).length >= 1;
  const quality = [hasTitle, hasDescription, hasLinks, hasSections].filter(Boolean).length;

  if (quality >= 3) {
    return { ruleId: 'has-llms-txt', ruleName: 'llms.txt', category: 'agent-signals', passed: true, score: 5, maxScore: 5, message: `Rich llms.txt (${lines.length} lines)` };
  }
  if (quality >= 1) {
    return { ruleId: 'has-llms-txt', ruleName: 'llms.txt', category: 'agent-signals', passed: true, score: 3, maxScore: 5, message: `llms.txt found but could be richer (${lines.length} lines)`, suggestion: 'Add: title (# heading), description, key URLs, sections' };
  }

  return { ruleId: 'has-llms-txt', ruleName: 'llms.txt', category: 'agent-signals', passed: true, score: 2, maxScore: 5, message: 'llms.txt exists but is minimal', suggestion: 'Add site description, purpose, and AI usage policy' };
}

// --- Rule 19: Structured Summary (5 pts) ---
function checkStructuredSummary(doc) {
  let signals = 0;
  const details = [];

  const metaDesc = (doc.querySelector('meta[name="description"]')?.getAttribute('content') || '').trim();
  if (metaDesc.length > 50) { signals++; details.push('descriptive meta description'); }

  const appName = doc.querySelector('meta[name="application-name"]')?.getAttribute('content')?.trim();
  if (appName) { signals++; details.push('application-name meta'); }

  const ogDesc = (doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '').trim();
  if (ogDesc.length > 50) { signals++; details.push('rich og:description'); }

  const lang = doc.querySelector('html')?.getAttribute('lang');
  if (lang) { signals++; details.push(`lang="${lang}"`); }

  const author = doc.querySelector('meta[name="author"]')?.getAttribute('content')?.trim();
  if (author) { signals++; details.push('author meta'); }

  const keywords = doc.querySelector('meta[name="keywords"]')?.getAttribute('content')?.trim();
  if (keywords) { signals++; details.push('keywords meta'); }

  const hasAbstract = doc.querySelector('[class*="abstract"], [class*="summary"], [class*="description"], [class*="intro"]');
  if (hasAbstract) { signals++; details.push('content summary section'); }

  if (signals >= 4) {
    return { ruleId: 'has-structured-summary', ruleName: 'Structured Summary', category: 'agent-signals', passed: true, score: 5, maxScore: 5, message: `Strong AI-readable summary: ${details.join(', ')}` };
  }
  if (signals >= 2) {
    return { ruleId: 'has-structured-summary', ruleName: 'Structured Summary', category: 'agent-signals', passed: true, score: 3, maxScore: 5, message: `Some summary signals: ${details.join(', ')}`, suggestion: 'Add lang attribute, author, keywords metadata' };
  }

  return { ruleId: 'has-structured-summary', ruleName: 'Structured Summary', category: 'agent-signals', passed: false, score: signals > 0 ? 1 : 0, maxScore: 5, message: 'Weak page summary signals for AI agents', suggestion: 'Add: lang attribute, meta description > 50 chars, meta author, og:description' };
}

// ─── RUN ALL RULES ──────────────────────────────────────────

function runAllRules(html, crawlFiles) {
  const doc = parseHTML(html);
  const data = { ...crawlFiles };

  const results = [];
  const domRules = [
    checkJsonldPresence,
    checkJsonldValidType,
    checkFaqSchema,
    checkArticleProductSchema,
    checkSingleH1,
    checkHeadingHierarchy,
    checkHasMain,
    checkHasArticleSection,
    checkHasTitle,
    checkMetaDescription,
    checkOpengraph,
    checkCanonical,
    checkContentLength,
    checkListsTables,
    checkQaStructure,
    checkStructuredSummary,
  ];

  for (const rule of domRules) {
    try {
      results.push(rule(doc));
    } catch (e) {
      results.push({
        ruleId: 'error',
        ruleName: rule.name,
        category: 'structured-data',
        passed: false,
        score: 0,
        maxScore: 0,
        message: `Rule error: ${e.message}`,
      });
    }
  }

  // Crawl-file rules (need raw text, not DOM)
  const crawlRules = [
    { fn: checkRobots, args: data },
    { fn: checkSitemap, args: data },
    { fn: checkLlmsTxt, args: data },
  ];

  for (const { fn, args } of crawlRules) {
    try {
      results.push(fn(args));
    } catch (e) {
      results.push({
        ruleId: 'error',
        ruleName: fn.name,
        category: 'crawl-signals',
        passed: false,
        score: 0,
        maxScore: 0,
        message: `Rule error: ${e.message}`,
      });
    }
  }

  return results;
}

// ─── SCORING ────────────────────────────────────────────────

function calculateScore(url, results) {
  const categoryMap = {};
  for (const r of results) {
    if (!categoryMap[r.category]) categoryMap[r.category] = [];
    categoryMap[r.category].push(r);
  }

  const categories = CATEGORY_ORDER.map(cat => {
    const catResults = categoryMap[cat] || [];
    const score = catResults.reduce((s, r) => s + r.score, 0);
    const maxScore = catResults.reduce((s, r) => s + r.maxScore, 0);
    return {
      category: cat,
      categoryName: CATEGORY_NAMES[cat],
      categoryIcon: CATEGORY_ICONS[cat],
      score,
      maxScore,
      percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    };
  });

  const totalScore = results.reduce((s, r) => s + r.score, 0);
  const maxScore = results.reduce((s, r) => s + r.maxScore, 0);
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const grade = getGrade(percentage);

  return {
    url,
    totalScore,
    maxScore,
    percentage,
    grade,
    categories,
    rules: results,
    passedCount: results.filter(r => r.passed).length,
    failedCount: results.filter(r => !r.passed).length,
    timestamp: new Date().toISOString(),
  };
}

function getGrade(pct) {
  if (pct >= 95) return 'A+';
  if (pct >= 90) return 'A';
  if (pct >= 85) return 'A-';
  if (pct >= 80) return 'B+';
  if (pct >= 75) return 'B';
  if (pct >= 70) return 'B-';
  if (pct >= 65) return 'C+';
  if (pct >= 60) return 'C';
  if (pct >= 55) return 'C-';
  if (pct >= 50) return 'D+';
  if (pct >= 45) return 'D';
  if (pct >= 40) return 'D-';
  return 'F';
}
