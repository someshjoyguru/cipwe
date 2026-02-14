import * as cheerio from 'cheerio';
import type { Rule, RuleResult } from '../../types/index.js';

const REQUIRED_OG_TAGS = ['og:title', 'og:description', 'og:image'];
const BONUS_OG_TAGS = ['og:type', 'og:url', 'og:site_name'];

export const hasOpengraphRule: Rule = {
  id: 'has-opengraph',
  name: 'OpenGraph Tags',
  description: 'Check for OpenGraph meta tags (og:title, og:description, og:image)',
  category: 'metadata',
  weight: 5,
  check: (data): RuleResult => {
    const $ = cheerio.load(data.html);

    const foundRequired: string[] = [];
    const missingRequired: string[] = [];
    const foundBonus: string[] = [];

    for (const tag of REQUIRED_OG_TAGS) {
      const content = $(`meta[property="${tag}"]`).attr('content')?.trim();
      if (content) {
        foundRequired.push(tag);
      } else {
        missingRequired.push(tag);
      }
    }

    for (const tag of BONUS_OG_TAGS) {
      const content = $(`meta[property="${tag}"]`).attr('content')?.trim();
      if (content) foundBonus.push(tag);
    }

    // Also check Twitter Card tags
    const hasTwitterCard = $('meta[name="twitter:card"]').attr('content') ||
      $('meta[property="twitter:card"]').attr('content');

    if (foundRequired.length === REQUIRED_OG_TAGS.length) {
      const bonus = foundBonus.length > 0 ? ` + ${foundBonus.join(', ')}` : '';
      const twitter = hasTwitterCard ? ' + Twitter Card' : '';
      return {
        ruleId: 'has-opengraph',
        ruleName: 'OpenGraph Tags',
        category: 'metadata',
        passed: true,
        score: 5,
        maxScore: 5,
        message: `All OpenGraph tags present${bonus}${twitter}`,
      };
    }

    if (foundRequired.length > 0) {
      return {
        ruleId: 'has-opengraph',
        ruleName: 'OpenGraph Tags',
        category: 'metadata',
        passed: false,
        score: Math.round((foundRequired.length / REQUIRED_OG_TAGS.length) * 4),
        maxScore: 5,
        message: `Partial OpenGraph: found ${foundRequired.join(', ')}, missing ${missingRequired.join(', ')}`,
        suggestion: `Add missing tags: ${missingRequired.map(t => `<meta property="${t}" content="...">`).join(', ')}`,
      };
    }

    return {
      ruleId: 'has-opengraph',
      ruleName: 'OpenGraph Tags',
      category: 'metadata',
      passed: false,
      score: 0,
      maxScore: 5,
      message: 'No OpenGraph tags found',
      suggestion: 'Add og:title, og:description, and og:image meta tags. AI agents and social platforms use these to understand and preview your content',
    };
  },
};
