import type { Rule, RuleResult } from '../../types/index.js';

export const hasRobotsRule: Rule = {
  id: 'has-robots',
  name: 'robots.txt',
  description: 'Check if robots.txt is accessible and well-formed',
  category: 'crawl-signals',
  weight: 5,
  check: (data): RuleResult => {
    if (!data.robotsTxt) {
      return {
        ruleId: 'has-robots',
        ruleName: 'robots.txt',
        category: 'crawl-signals',
        passed: false,
        score: 0,
        maxScore: 5,
        message: 'No robots.txt found',
        suggestion: 'Create a robots.txt file that explicitly allows AI agent crawling. Include Sitemap directive',
      };
    }

    const content = data.robotsTxt.toLowerCase();

    // Check if it blocks all bots
    const blocksAll = content.includes('disallow: /') &&
      !content.includes('disallow: /\n') === false;

    // Check for Sitemap directive
    const hasSitemap = content.includes('sitemap:');

    // Check for AI-specific bot rules
    const hasAiBotRules = content.includes('gptbot') ||
      content.includes('chatgpt') ||
      content.includes('anthropic') ||
      content.includes('claude') ||
      content.includes('perplexitybot') ||
      content.includes('googleother');

    if (hasSitemap && hasAiBotRules) {
      return {
        ruleId: 'has-robots',
        ruleName: 'robots.txt',
        category: 'crawl-signals',
        passed: true,
        score: 5,
        maxScore: 5,
        message: 'robots.txt found with Sitemap directive and AI bot rules',
      };
    }

    if (hasSitemap) {
      return {
        ruleId: 'has-robots',
        ruleName: 'robots.txt',
        category: 'crawl-signals',
        passed: true,
        score: 4,
        maxScore: 5,
        message: 'robots.txt found with Sitemap directive',
      };
    }

    if (blocksAll) {
      return {
        ruleId: 'has-robots',
        ruleName: 'robots.txt',
        category: 'crawl-signals',
        passed: false,
        score: 1,
        maxScore: 5,
        message: 'robots.txt exists but may be blocking crawlers',
        suggestion: 'Review your robots.txt — consider allowing GPTBot, Anthropic-AI, and PerplexityBot',
      };
    }

    return {
      ruleId: 'has-robots',
      ruleName: 'robots.txt',
      category: 'crawl-signals',
      passed: true,
      score: 3,
      maxScore: 5,
      message: 'robots.txt found but missing Sitemap directive',
      suggestion: 'Add "Sitemap: https://yoursite.com/sitemap.xml" to robots.txt',
    };
  },
};
