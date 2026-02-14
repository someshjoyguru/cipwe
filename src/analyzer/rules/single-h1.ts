import * as cheerio from 'cheerio';
import type { Rule, RuleResult } from '../../types/index.js';

export const singleH1Rule: Rule = {
  id: 'single-h1',
  name: 'Single H1 Tag',
  description: 'Check that the page has exactly one H1 heading',
  category: 'semantic-html',
  weight: 5,
  check: (data): RuleResult => {
    const $ = cheerio.load(data.html);
    const h1Count = $('h1').length;

    if (h1Count === 1) {
      const h1Text = $('h1').first().text().trim();
      return {
        ruleId: 'single-h1',
        ruleName: 'Single H1 Tag',
        category: 'semantic-html',
        passed: true,
        score: 5,
        maxScore: 5,
        message: `Single H1 found: "${h1Text.substring(0, 60)}${h1Text.length > 60 ? '...' : ''}"`,
      };
    }

    if (h1Count === 0) {
      return {
        ruleId: 'single-h1',
        ruleName: 'Single H1 Tag',
        category: 'semantic-html',
        passed: false,
        score: 0,
        maxScore: 5,
        message: 'No H1 heading found on the page',
        suggestion: 'Add exactly one <h1> tag that clearly describes the page\'s primary topic',
      };
    }

    return {
      ruleId: 'single-h1',
      ruleName: 'Single H1 Tag',
      category: 'semantic-html',
      passed: false,
      score: 2,
      maxScore: 5,
      message: `Found ${h1Count} H1 tags (should be exactly 1)`,
      suggestion: 'Use only one <h1> per page. Use <h2>-<h6> for sub-sections. AI agents rely on H1 to understand the page\'s primary topic',
    };
  },
};
