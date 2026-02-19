/* ============================================================
   CIPWE Chrome Extension — Popup Controller
   Orchestrates the audit and renders the beautiful UI.
   ============================================================ */

// ─── ELEMENT REFS ───────────────────────────────────────────

const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const views = {
  initial:  $('#initial-view'),
  loading:  $('#loading-view'),
  results:  $('#results-view'),
  error:    $('#error-view'),
};

function showView(name) {
  Object.values(views).forEach(v => v.classList.add('hidden'));
  views[name].classList.remove('hidden');
}

// ─── LOADING STEPS ──────────────────────────────────────────

const LOADING_STEPS = [
  'Extracting page data',
  'Checking structured data',
  'Analyzing semantic HTML',
  'Validating metadata',
  'Fetching crawl signals',
  'Evaluating content clarity',
  'Checking agent signals',
  'Calculating score',
];

let loadingInterval;

function startLoadingAnimation() {
  let step = 0;
  const stepEl = $('#loading-step');
  stepEl.textContent = LOADING_STEPS[0];

  loadingInterval = setInterval(() => {
    step = (step + 1) % LOADING_STEPS.length;
    stepEl.style.opacity = 0;
    setTimeout(() => {
      stepEl.textContent = LOADING_STEPS[step];
      stepEl.style.opacity = 1;
    }, 150);
  }, 800);
}

function stopLoadingAnimation() {
  clearInterval(loadingInterval);
}

// ─── INIT ───────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  // Get current tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url || '';
  $('#current-url').textContent = url;

  // Button handlers
  $('#run-audit-btn').addEventListener('click', () => runAudit(tab));
  $('#rerun-btn').addEventListener('click', () => runAudit(tab));
  $('#retry-btn').addEventListener('click', () => runAudit(tab));

  // Tab switching
  $$('.tab').forEach(t => {
    t.addEventListener('click', () => {
      $$('.tab').forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      renderRulesList(window.__lastAudit, t.dataset.tab);
    });
  });
});

// ─── AUDIT FLOW ─────────────────────────────────────────────

async function runAudit(tab) {
  showView('loading');
  startLoadingAnimation();

  try {
    // 1. Inject content script & get page data
    let pageData;
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'gatherPageData' });
      pageData = response;
    } catch {
      // Content script might not be loaded yet, inject it
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/content.js'],
      });
      // Small delay then retry
      await new Promise(r => setTimeout(r, 200));
      pageData = await chrome.tabs.sendMessage(tab.id, { action: 'gatherPageData' });
    }

    if (!pageData || !pageData.html) {
      throw new Error('Could not read page content. Make sure you\'re on a web page.');
    }

    // 2. Get base URL and fetch crawl files from background
    const urlObj = new URL(pageData.url);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;

    const crawlFiles = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ action: 'fetchCrawlFiles', baseUrl }, resolve);
    });

    // 3. Run analyzer (loaded via <script> tag in popup.html)
    const results = runAllRules(pageData.html, crawlFiles || {});
    const audit = calculateScore(pageData.url, results);
    audit.framework = pageData.framework || null;

    stopLoadingAnimation();
    window.__lastAudit = audit;
    renderResults(audit);
    showView('results');

  } catch (err) {
    stopLoadingAnimation();
    $('#error-msg').textContent = err.message || 'Something went wrong while auditing this page.';
    showView('error');
  }
}

// ─── RENDER RESULTS ─────────────────────────────────────────

function renderResults(audit) {
  // Score ring animation
  const pct = audit.percentage;
  const circumference = 2 * Math.PI * 52; // r=52
  const offset = circumference - (pct / 100) * circumference;

  const ringFill = $('#score-ring-fill');
  ringFill.style.strokeDasharray = circumference;
  ringFill.style.strokeDashoffset = circumference;

  // Animate after a tiny delay
  requestAnimationFrame(() => {
    setTimeout(() => {
      ringFill.style.strokeDashoffset = offset;
    }, 50);
  });

  // Score value counter animation
  animateCounter($('#score-value'), 0, audit.percentage, 800);

  // Grade & meta
  const gradeBadge = $('#grade-badge');
  gradeBadge.textContent = audit.grade;

  // Color the header based on grade
  const header = $('#score-header');
  if (pct >= 80) {
    header.style.background = 'linear-gradient(135deg, #1D4ED8, #1E3A8A)';
  } else if (pct >= 60) {
    header.style.background = 'linear-gradient(135deg, #2563EB, #1D4ED8)';
  } else if (pct >= 40) {
    header.style.background = 'linear-gradient(135deg, #D97706, #B45309)';
  } else {
    header.style.background = 'linear-gradient(135deg, #DC2626, #991B1B)';
  }

  $('#score-label').textContent = `${audit.totalScore}/${audit.maxScore}`;
  $('#checks-passed').textContent = `${audit.passedCount} passed`;
  $('#checks-failed').textContent = `${audit.failedCount} failed`;

  // Framework badge
  const fwBadge = $('#framework-badge');
  if (audit.framework) {
    fwBadge.textContent = `Built with ${audit.framework}`;
    fwBadge.classList.remove('hidden');
  } else {
    fwBadge.classList.add('hidden');
  }

  // Categories
  renderCategories(audit.categories);

  // Rules (default: failed)
  renderRulesList(audit, 'failed');
}

function renderCategories(categories) {
  const container = $('#categories-container');
  container.innerHTML = '';

  categories.forEach(cat => {
    const barClass = cat.percentage >= 80 ? 'good' : cat.percentage >= 60 ? 'ok' : cat.percentage >= 40 ? 'warn' : 'bad';

    const row = document.createElement('div');
    row.className = 'cat-row';
    row.innerHTML = `
      <span class="cat-icon">${getCategoryIcon(cat.category)}</span>
      <span class="cat-name">${cat.categoryName}</span>
      <div class="cat-bar-wrap">
        <div class="cat-bar-fill ${barClass}" style="width: 0%"></div>
      </div>
      <span class="cat-score">${cat.score}/${cat.maxScore}</span>
      <span class="cat-pct">${cat.percentage}%</span>
    `;
    container.appendChild(row);

    // Animate bar
    setTimeout(() => {
      row.querySelector('.cat-bar-fill').style.width = `${cat.percentage}%`;
    }, 100);
  });
}

function getCategoryIcon(category) {
  const icons = {
    'structured-data': '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    'semantic-html':   '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 2l-2 6 2 6M13 2l2 6-2 6M6 14L10 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'metadata':        '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.3"/><path d="M8 5v3l2 2" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    'crawl-signals':   '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 8h3l2-4 2 8 2-4h3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'content-clarity': '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M4 3h8M4 7h6M4 11h8M4 15h4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
    'agent-signals':   '<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1v2M14 8h-2M8 15v-2M2 8h2M12.2 3.8l-1.4 1.4M12.2 12.2l-1.4-1.4M3.8 12.2l1.4-1.4M3.8 3.8l1.4 1.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  };
  return icons[category] || '●';
}

function renderRulesList(audit, filter) {
  const container = $('#rules-list');
  container.innerHTML = '';

  let rules;
  if (filter === 'passed') {
    rules = audit.rules.filter(r => r.passed);
  } else if (filter === 'failed') {
    rules = audit.rules.filter(r => !r.passed);
  } else {
    rules = audit.rules;
  }

  if (rules.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14" stroke="#D1D5DB" stroke-width="1.5"/><path d="M11 16l3 3 7-7" stroke="#10B981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <p>${filter === 'failed' ? 'No issues found — great job! 🎉' : 'No rules to show.'}</p>
      </div>
    `;
    return;
  }

  // Update tab counts
  const failedTab = document.querySelector('[data-tab="failed"]');
  const passedTab = document.querySelector('[data-tab="passed"]');
  failedTab.textContent = `Issues (${audit.failedCount})`;
  passedTab.textContent = `Passed (${audit.passedCount})`;

  rules.forEach((rule, i) => {
    const card = document.createElement('div');
    card.className = 'rule-card';
    card.style.animationDelay = `${i * 0.04}s`;

    const isPartial = !rule.passed && rule.score > 0;
    const statusClass = rule.passed ? 'pass' : 'fail';
    const scoreClass = rule.passed ? 'pass' : (isPartial ? 'partial' : 'fail');
    const statusIcon = rule.passed ? '✓' : '✗';

    card.innerHTML = `
      <div class="rule-header">
        <div class="rule-status ${statusClass}">${statusIcon}</div>
        <div class="rule-info">
          <div class="rule-name">${escapeHtml(rule.ruleName)}</div>
          <div class="rule-msg">${escapeHtml(rule.message)}</div>
        </div>
        <span class="rule-score-badge ${scoreClass}">${rule.score}/${rule.maxScore}</span>
        <svg class="rule-chevron" width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
      <div class="rule-details">
        ${rule.suggestion ? `<div class="rule-suggestion">${escapeHtml(rule.suggestion)}</div>` : ''}
        <div class="rule-category-tag">${escapeHtml(CATEGORY_NAMES[rule.category] || rule.category)}</div>
      </div>
    `;

    // Toggle expand
    card.querySelector('.rule-header').addEventListener('click', () => {
      card.classList.toggle('expanded');
    });

    container.appendChild(card);
  });
}

// ─── UTILS ──────────────────────────────────────────────────

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function animateCounter(el, from, to, duration) {
  const start = performance.now();
  const diff = to - from;

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(from + diff * eased);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}
