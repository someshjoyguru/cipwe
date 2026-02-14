import * as cheerio from 'cheerio';
import type { Rule, RuleResult } from '../../types/index.js';

export const faqSchemaRule: Rule = {
  id: 'faq-schema',
  name: 'FAQ Schema',
  description: 'Check if FAQPage schema exists for Q&A content',
  category: 'structured-data',
  weight: 6,
  check: (data): RuleResult => {
    const $ = cheerio.load(data.html);
    const jsonldScripts = $('script[type="application/ld+json"]');

    let hasFaqSchema = false;

    jsonldScripts.each((_, el) => {
      try {
        const content = $(el).html();
        if (content) {
          const parsed = JSON.parse(content);
          const checkForFaq = (obj: any): boolean => {
            if (obj['@type'] === 'FAQPage') return true;
            if (obj['@graph'] && Array.isArray(obj['@graph'])) {
              return obj['@graph'].some(checkForFaq);
            }
            return false;
          };
          if (checkForFaq(parsed)) hasFaqSchema = true;
        }
      } catch {
        // Skip
      }
    });

    if (hasFaqSchema) {
      return {
        ruleId: 'faq-schema',
        ruleName: 'FAQ Schema',
        category: 'structured-data',
        passed: true,
        score: 6,
        maxScore: 6,
        message: 'FAQPage schema detected — AI agents can parse Q&A content',
      };
    }

    // Check if page has FAQ-like content that could benefit from schema
    const text = $.text().toLowerCase();
    const hasQaContent = text.includes('frequently asked') ||
      text.includes('faq') ||
      $('details').length > 0 ||
      $('dt').length > 2;

    if (hasQaContent) {
      return {
        ruleId: 'faq-schema',
        ruleName: 'FAQ Schema',
        category: 'structured-data',
        passed: false,
        score: 0,
        maxScore: 6,
        message: 'FAQ-like content detected but no FAQPage schema',
        suggestion: 'Wrap your FAQ content in FAQPage JSON-LD schema so AI agents can directly extract Q&A pairs',
      };
    }

    return {
      ruleId: 'faq-schema',
      ruleName: 'FAQ Schema',
      category: 'structured-data',
      passed: false,
      score: 2,
      maxScore: 6,
      message: 'No FAQ schema found (may not be applicable)',
      suggestion: 'Consider adding FAQPage schema if your page contains Q&A content',
    };
  },
};
