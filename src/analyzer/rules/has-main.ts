import * as cheerio from 'cheerio';
import type { Rule, RuleResult } from '../../types/index.js';

export const hasMainRule: Rule = {
  id: 'has-main',
  name: 'Has <main> Element',
  description: 'Check if the page uses the semantic <main> element',
  category: 'semantic-html',
  weight: 5,
  check: (data): RuleResult => {
    const $ = cheerio.load(data.html);
    const mainCount = $('main').length;

    if (mainCount === 1) {
      return {
        ruleId: 'has-main',
        ruleName: 'Has <main> Element',
        category: 'semantic-html',
        passed: true,
        score: 5,
        maxScore: 5,
        message: '<main> element found - content region is clearly defined',
      };
    }

    if (mainCount > 1) {
      return {
        ruleId: 'has-main',
        ruleName: 'Has <main> Element',
        category: 'semantic-html',
        passed: false,
        score: 3,
        maxScore: 5,
        message: `Found ${mainCount} <main> elements (should be exactly 1)`,
        suggestion: 'Use only one <main> element to define the primary content area',
      };
    }

    // Check for role="main" as fallback
    const roleMain = $('[role="main"]').length;
    if (roleMain > 0) {
      return {
        ruleId: 'has-main',
        ruleName: 'Has <main> Element',
        category: 'semantic-html',
        passed: true,
        score: 4,
        maxScore: 5,
        message: 'Found role="main" (prefer native <main> element)',
      };
    }

    return {
      ruleId: 'has-main',
      ruleName: 'Has <main> Element',
      category: 'semantic-html',
      passed: false,
      score: 0,
      maxScore: 5,
      message: 'No <main> element found',
      suggestion: 'Wrap your primary content in a <main> element. AI agents use this to identify the core content vs navigation/footer',
    };
  },
};
