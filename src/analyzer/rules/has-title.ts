import * as cheerio from 'cheerio';
import type { Rule, RuleResult } from '../../types/index.js';

export const hasTitleRule: Rule = {
  id: 'has-title',
  name: 'Page Title',
  description: 'Check if the page has a meaningful <title> tag',
  category: 'metadata',
  weight: 5,
  check: (data): RuleResult => {
    const $ = cheerio.load(data.html);
    const title = $('title').text().trim();

    if (!title) {
      return {
        ruleId: 'has-title',
        ruleName: 'Page Title',
        category: 'metadata',
        passed: false,
        score: 0,
        maxScore: 5,
        message: 'No <title> tag found',
        suggestion: 'Add a <title> tag with a clear, descriptive page title (50-60 characters)',
      };
    }

    if (title.length < 10) {
      return {
        ruleId: 'has-title',
        ruleName: 'Page Title',
        category: 'metadata',
        passed: false,
        score: 2,
        maxScore: 5,
        message: `Title is too short (${title.length} chars): "${title}"`,
        suggestion: 'Expand your title to 50-60 characters for better AI agent understanding',
      };
    }

    if (title.length > 70) {
      return {
        ruleId: 'has-title',
        ruleName: 'Page Title',
        category: 'metadata',
        passed: true,
        score: 4,
        maxScore: 5,
        message: `Title is slightly long (${title.length} chars): "${title.substring(0, 60)}..."`,
      };
    }

    return {
      ruleId: 'has-title',
      ruleName: 'Page Title',
      category: 'metadata',
      passed: true,
      score: 5,
      maxScore: 5,
      message: `Good title (${title.length} chars): "${title}"`,
    };
  },
};
