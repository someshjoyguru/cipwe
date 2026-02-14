import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { CrawlData, AuditResult, FixResult } from '../types/index.js';
import { generateLlmsTxt } from './llms-txt.js';
import { generateJsonLd } from './jsonld.js';
import { generateRobotsTxt } from './robots-txt.js';
import { generateSitemapXml } from './sitemap-xml.js';

/**
 * Generate all missing/improved files based on audit results.
 */
export function generateFixes(
  data: CrawlData,
  audit: AuditResult,
  outputDir: string = './cipwe-output'
): FixResult {
  const filesGenerated: string[] = [];
  const suggestions: string[] = [];

  // Ensure output directory exists
  mkdirSync(outputDir, { recursive: true });

  // Determine what needs to be generated based on failed rules
  const failedRuleIds = new Set(audit.rules.filter(r => !r.passed).map(r => r.ruleId));

  // Always generate llms.txt if missing
  if (failedRuleIds.has('has-llms-txt') || !data.llmsTxt) {
    const llmsTxt = generateLlmsTxt(data.url, data.html);
    const filePath = join(outputDir, 'llms.txt');
    writeFileSync(filePath, llmsTxt, 'utf-8');
    filesGenerated.push(filePath);
  }

  // Generate JSON-LD if missing
  if (failedRuleIds.has('jsonld-presence') || failedRuleIds.has('jsonld-valid-type')) {
    const jsonld = generateJsonLd(data.url, data.html);
    const filePath = join(outputDir, 'structured-data.jsonld');
    writeFileSync(filePath, jsonld, 'utf-8');
    filesGenerated.push(filePath);

    // Also generate an HTML snippet
    const snippet = `<!-- Add this to your <head> section -->
<script type="application/ld+json">
${jsonld}
</script>
`;
    const snippetPath = join(outputDir, 'structured-data-snippet.html');
    writeFileSync(snippetPath, snippet, 'utf-8');
    filesGenerated.push(snippetPath);
  }

  // Generate robots.txt if missing or incomplete
  if (failedRuleIds.has('has-robots')) {
    const hasSitemap = !failedRuleIds.has('has-sitemap');
    const robotsTxt = generateRobotsTxt(data.url, hasSitemap);
    const filePath = join(outputDir, 'robots.txt');
    writeFileSync(filePath, robotsTxt, 'utf-8');
    filesGenerated.push(filePath);
  }

  // Generate sitemap.xml if missing
  if (failedRuleIds.has('has-sitemap')) {
    const sitemapXml = generateSitemapXml(data.url, data.html);
    const filePath = join(outputDir, 'sitemap.xml');
    writeFileSync(filePath, sitemapXml, 'utf-8');
    filesGenerated.push(filePath);
  }

  // Generate FAQ schema if Q&A content detected but no FAQ schema
  if (failedRuleIds.has('faq-schema')) {
    suggestions.push('Add FAQ-style Q&A content to your page, then re-run CIPWE to generate FAQPage schema');
  }

  // Add general suggestions based on failures
  if (failedRuleIds.has('single-h1')) {
    suggestions.push('Ensure your page has exactly one <h1> tag describing the primary topic');
  }
  if (failedRuleIds.has('has-main')) {
    suggestions.push('Wrap your main content in a <main> element');
  }
  if (failedRuleIds.has('has-opengraph')) {
    suggestions.push('Add OpenGraph meta tags: og:title, og:description, og:image');
  }
  if (failedRuleIds.has('has-canonical')) {
    suggestions.push('Add <link rel="canonical" href="..."> to your page');
  }
  if (failedRuleIds.has('has-qa-structure')) {
    suggestions.push('Add FAQ-style content with question headings (ending with "?") for better answer engine visibility');
  }

  // Generate a summary report
  const report = generateFixReport(audit, filesGenerated, suggestions);
  const reportPath = join(outputDir, 'cipwe-report.md');
  writeFileSync(reportPath, report, 'utf-8');
  filesGenerated.push(reportPath);

  return { filesGenerated, suggestions };
}

function generateFixReport(audit: AuditResult, files: string[], suggestions: string[]): string {
  let report = `# CIPWE Audit Report

**URL**: ${audit.url}
**Score**: ${audit.totalScore}/${audit.maxScore} (${audit.percentage}%)
**Grade**: ${audit.gradeEmoji} ${audit.grade}
**Date**: ${audit.timestamp}

## Category Breakdown

| Category | Score | Max | Status |
|----------|-------|-----|--------|
`;

  for (const cat of audit.categories) {
    const status = cat.percentage >= 80 ? '✅' : cat.percentage >= 50 ? '⚠️' : '❌';
    report += `| ${cat.categoryName} | ${cat.score} | ${cat.maxScore} | ${status} |\n`;
  }

  report += `\n## Issues Found\n\n`;

  const failed = audit.rules.filter(r => !r.passed);
  if (failed.length === 0) {
    report += `No issues found! Your site is AI-ready. 🎉\n`;
  } else {
    for (const rule of failed) {
      report += `### ❌ ${rule.ruleName}\n`;
      report += `- **Issue**: ${rule.message}\n`;
      if (rule.suggestion) {
        report += `- **Fix**: ${rule.suggestion}\n`;
      }
      report += '\n';
    }
  }

  if (files.length > 0) {
    report += `\n## Generated Files\n\n`;
    for (const file of files) {
      if (!file.endsWith('cipwe-report.md')) {
        report += `- \`${file}\`\n`;
      }
    }
    report += '\nCopy these files to your project root / public directory.\n';
  }

  if (suggestions.length > 0) {
    report += `\n## Manual Improvements Needed\n\n`;
    for (const suggestion of suggestions) {
      report += `- ${suggestion}\n`;
    }
  }

  report += `\n---\n*Generated by [CIPWE](https://cipwe.com) — The Web Vitals for the AI Web*\n`;

  return report;
}
