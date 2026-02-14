import * as cheerio from 'cheerio';
import type { Rule, RuleResult } from '../../types/index.js';

export const hasMetaDescriptionRule: Rule = {
  id: 'has-meta-description',
  name: 'Meta Description',
  description: 'Check if the page has a meaningful meta description',
  category: 'metadata',
  weight: 5,
  check: (data): RuleResult => {
    const $ = cheerio.load(data.html);
    const description = $('meta[name="description"]').attr('content')?.trim() || '';

    if (!description) {
      return {
        ruleId: 'has-meta-description',
        ruleName: 'Meta Description',
        category: 'metadata',
        passed: false,
        score: 0,
        maxScore: 5,
        message: 'No meta description found',
        suggestion: 'Add <meta name="description" content="..."> with a clear 150-160 character summary. This is the first thing AI agents read to understand your page',
      };
    }

    if (description.length < 50) {
      return {
        ruleId: 'has-meta-description',
        ruleName: 'Meta Description',
        category: 'metadata',
        passed: false,
        score: 2,
        maxScore: 5,
        message: `Meta description is too short (${description.length} chars)`,
        suggestion: 'Expand to 150-160 characters for optimal AI comprehension',
      };
    }

    if (description.length > 170) {
      return {
        ruleId: 'has-meta-description',
        ruleName: 'Meta Description',
        category: 'metadata',
        passed: true,
        score: 4,
        maxScore: 5,
        message: `Meta description slightly long (${description.length} chars) but present`,
      };
    }

    return {
      ruleId: 'has-meta-description',
      ruleName: 'Meta Description',
      category: 'metadata',
      passed: true,
      score: 5,
      maxScore: 5,
      message: `Good meta description (${description.length} chars)`,
    };
  },
};
