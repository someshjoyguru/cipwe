import * as cheerio from 'cheerio';
import type { Rule, RuleResult } from '../../types/index.js';

export const hasQaStructureRule: Rule = {
  id: 'has-qa-structure',
  name: 'Q&A Structure',
  description: 'Check if the page has question-and-answer formatted content',
  category: 'content-clarity',
  weight: 4,
  check: (data): RuleResult => {
    const $ = cheerio.load(data.html);
    const text = $('body').text();

    let qaSignals = 0;

    // Check for <details>/<summary> (expandable Q&A)
    if ($('details').length > 0) qaSignals += 2;

    // Check for <dt>/<dd> (definition lists = Q&A style)
    if ($('dt').length > 0 && $('dd').length > 0) qaSignals += 2;

    // Check for question-like headings
    const questionHeadings = $('h2, h3, h4').filter((_, el) => {
      const headingText = $(el).text().trim();
      return headingText.endsWith('?') ||
        headingText.toLowerCase().startsWith('what') ||
        headingText.toLowerCase().startsWith('how') ||
        headingText.toLowerCase().startsWith('why') ||
        headingText.toLowerCase().startsWith('when') ||
        headingText.toLowerCase().startsWith('where') ||
        headingText.toLowerCase().startsWith('who') ||
        headingText.toLowerCase().startsWith('can') ||
        headingText.toLowerCase().startsWith('is') ||
        headingText.toLowerCase().startsWith('does');
    });
    if (questionHeadings.length >= 2) qaSignals += 2;
    else if (questionHeadings.length === 1) qaSignals += 1;

    // Check for "FAQ" keyword
    if (text.toLowerCase().includes('frequently asked') ||
      text.toLowerCase().includes('faq')) {
      qaSignals += 1;
    }

    // Check for Q: A: patterns
    if (/\bQ:\s/i.test(text) || /\bA:\s/i.test(text)) {
      qaSignals += 1;
    }

    if (qaSignals >= 3) {
      return {
        ruleId: 'has-qa-structure',
        ruleName: 'Q&A Structure',
        category: 'content-clarity',
        passed: true,
        score: 4,
        maxScore: 4,
        message: 'Strong Q&A structure detected - AI tools can easily extract answers',
      };
    }

    if (qaSignals >= 1) {
      return {
        ruleId: 'has-qa-structure',
        ruleName: 'Q&A Structure',
        category: 'content-clarity',
        passed: true,
        score: 2,
        maxScore: 4,
        message: 'Some Q&A signals detected',
        suggestion: 'Strengthen Q&A structure: use question-format headings (H2/H3 ending with "?") followed by clear answers',
      };
    }

    return {
      ruleId: 'has-qa-structure',
      ruleName: 'Q&A Structure',
      category: 'content-clarity',
      passed: false,
      score: 0,
      maxScore: 4,
      message: 'No Q&A structure detected',
      suggestion: 'Add FAQ-style content with question headings. AI tools like Perplexity & ChatGPT prioritize pages with clear Q&A patterns',
    };
  },
};
