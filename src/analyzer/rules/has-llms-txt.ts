import type { Rule, RuleResult } from '../../types/index.js';

export const hasLlmsTxtRule: Rule = {
  id: 'has-llms-txt',
  name: 'llms.txt',
  description: 'Check if llms.txt file exists (AI agent directive file)',
  category: 'agent-signals',
  weight: 5,
  check: (data): RuleResult => {
    if (!data.llmsTxt) {
      return {
        ruleId: 'has-llms-txt',
        ruleName: 'llms.txt',
        category: 'agent-signals',
        passed: false,
        score: 0,
        maxScore: 5,
        message: 'No llms.txt found',
        suggestion: 'Create a llms.txt file at your site root describing your site\'s purpose, content, and AI usage policy. This emerging standard helps LLMs understand your site intent',
      };
    }

    const content = data.llmsTxt.trim();
    const lines = content.split('\n').filter(l => l.trim().length > 0);

    // Check for key fields
    const hasTitle = /^#\s/m.test(content);
    const hasDescription = content.length > 100;
    const hasLinks = /https?:\/\//i.test(content);
    const hasSections = (content.match(/^>/gm) || []).length >= 1 ||
                        (content.match(/^##\s/gm) || []).length >= 1;

    const qualityScore = [hasTitle, hasDescription, hasLinks, hasSections]
      .filter(Boolean).length;

    if (qualityScore >= 3) {
      return {
        ruleId: 'has-llms-txt',
        ruleName: 'llms.txt',
        category: 'agent-signals',
        passed: true,
        score: 5,
        maxScore: 5,
        message: `Rich llms.txt found (${lines.length} lines with structured content)`,
      };
    }

    if (qualityScore >= 1) {
      return {
        ruleId: 'has-llms-txt',
        ruleName: 'llms.txt',
        category: 'agent-signals',
        passed: true,
        score: 3,
        maxScore: 5,
        message: `llms.txt found but could be more comprehensive (${lines.length} lines)`,
        suggestion: 'Enhance your llms.txt with: site title (# heading), description, key URLs, and content sections',
      };
    }

    return {
      ruleId: 'has-llms-txt',
      ruleName: 'llms.txt',
      category: 'agent-signals',
      passed: true,
      score: 2,
      maxScore: 5,
      message: 'llms.txt exists but is minimal',
      suggestion: 'Add site description, purpose, primary content areas, and AI usage policy to llms.txt',
    };
  },
};
