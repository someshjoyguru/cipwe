import type { Rule, RuleResult } from '../../types/index.js';

export const hasSitemapRule: Rule = {
  id: 'has-sitemap',
  name: 'sitemap.xml',
  description: 'Check if sitemap.xml is accessible',
  category: 'crawl-signals',
  weight: 5,
  check: (data): RuleResult => {
    if (!data.sitemapXml) {
      return {
        ruleId: 'has-sitemap',
        ruleName: 'sitemap.xml',
        category: 'crawl-signals',
        passed: false,
        score: 0,
        maxScore: 5,
        message: 'No sitemap.xml found',
        suggestion: 'Generate a sitemap.xml listing all important pages. AI agents use sitemaps to discover and prioritize content',
      };
    }

    const content = data.sitemapXml.toLowerCase();

    // Check for valid sitemap XML structure
    const hasUrlset = content.includes('<urlset') || content.includes('<sitemapindex');
    const hasUrls = content.includes('<url>') || content.includes('<sitemap>');

    if (hasUrlset && hasUrls) {
      // Count URLs
      const urlCount = (content.match(/<url>/g) || []).length +
        (content.match(/<sitemap>/g) || []).length;

      // Check for lastmod
      const hasLastmod = content.includes('<lastmod>');

      // Check for priority
      const hasPriority = content.includes('<priority>');

      if (hasLastmod && hasPriority) {
        return {
          ruleId: 'has-sitemap',
          ruleName: 'sitemap.xml',
          category: 'crawl-signals',
          passed: true,
          score: 5,
          maxScore: 5,
          message: `Rich sitemap found (${urlCount} entries with lastmod and priority)`,
        };
      }

      return {
        ruleId: 'has-sitemap',
        ruleName: 'sitemap.xml',
        category: 'crawl-signals',
        passed: true,
        score: 4,
        maxScore: 5,
        message: `Sitemap found (${urlCount} entries)`,
        suggestion: 'Add <lastmod> and <priority> tags to help AI agents prioritize content',
      };
    }

    return {
      ruleId: 'has-sitemap',
      ruleName: 'sitemap.xml',
      category: 'crawl-signals',
      passed: false,
      score: 1,
      maxScore: 5,
      message: 'sitemap.xml found but appears malformed',
      suggestion: 'Ensure sitemap.xml follows the Sitemaps protocol (sitemaps.org)',
    };
  },
};
