import * as cheerio from 'cheerio';
import type { Rule, RuleResult } from '../../types/index.js';
import { stripHtml } from '../../utils/helpers.js';

export const contentLengthRule: Rule = {
  id: 'content-length',
  name: 'Content Length',
  description: 'Check if the page has sufficient text content for AI comprehension',
  category: 'content-clarity',
  weight: 3,
  check: (data): RuleResult => {
    const $ = cheerio.load(data.html);

    // Get text from main content area, or body
    const mainContent = $('main').length > 0 ? $('main').text() : $('body').text();
    const text = stripHtml(mainContent).trim();
    const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

    if (wordCount >= 300) {
      return {
        ruleId: 'content-length',
        ruleName: 'Content Length',
        category: 'content-clarity',
        passed: true,
        score: 3,
        maxScore: 3,
        message: `Good content density (${wordCount} words)`,
      };
    }

    if (wordCount >= 100) {
      return {
        ruleId: 'content-length',
        ruleName: 'Content Length',
        category: 'content-clarity',
        passed: true,
        score: 2,
        maxScore: 3,
        message: `Moderate content (${wordCount} words)`,
        suggestion: 'Consider adding more descriptive content (300+ words) for better AI comprehension',
      };
    }

    if (wordCount >= 30) {
      return {
        ruleId: 'content-length',
        ruleName: 'Content Length',
        category: 'content-clarity',
        passed: false,
        score: 1,
        maxScore: 3,
        message: `Thin content (${wordCount} words)`,
        suggestion: 'Add more substantive text content. AI agents need sufficient text to understand and summarize your page',
      };
    }

    return {
      ruleId: 'content-length',
      ruleName: 'Content Length',
      category: 'content-clarity',
      passed: false,
      score: 0,
      maxScore: 3,
      message: `Very thin content (${wordCount} words)`,
      suggestion: 'Your page has almost no readable text content. AI agents cannot understand or answer questions about pages without text',
    };
  },
};
