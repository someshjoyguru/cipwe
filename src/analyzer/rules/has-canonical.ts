import * as cheerio from 'cheerio';
import type { Rule, RuleResult } from '../../types/index.js';

export const hasCanonicalRule: Rule = {
  id: 'has-canonical',
  name: 'Canonical URL',
  description: 'Check if the page has a canonical link tag',
  category: 'crawl-signals',
  weight: 5,
  check: (data): RuleResult => {
    const $ = cheerio.load(data.html);
    const canonical = $('link[rel="canonical"]').attr('href')?.trim();

    if (canonical) {
      // Validate it looks like a real URL
      const isValid = canonical.startsWith('http://') ||
        canonical.startsWith('https://') ||
        canonical.startsWith('/');

      if (isValid) {
        return {
          ruleId: 'has-canonical',
          ruleName: 'Canonical URL',
          category: 'crawl-signals',
          passed: true,
          score: 5,
          maxScore: 5,
          message: `Canonical URL set: ${canonical.substring(0, 80)}`,
        };
      }

      return {
        ruleId: 'has-canonical',
        ruleName: 'Canonical URL',
        category: 'crawl-signals',
        passed: false,
        score: 2,
        maxScore: 5,
        message: `Canonical URL found but may be malformed: "${canonical}"`,
        suggestion: 'Use a full absolute URL for the canonical link',
      };
    }

    return {
      ruleId: 'has-canonical',
      ruleName: 'Canonical URL',
      category: 'crawl-signals',
      passed: false,
      score: 0,
      maxScore: 5,
      message: 'No canonical URL tag found',
      suggestion: 'Add <link rel="canonical" href="..."> to prevent duplicate content issues and help AI agents identify the authoritative URL',
    };
  },
};
