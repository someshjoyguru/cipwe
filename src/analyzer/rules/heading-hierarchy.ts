import * as cheerio from 'cheerio';
import type { Rule, RuleResult } from '../../types/index.js';

export const headingHierarchyRule: Rule = {
  id: 'heading-hierarchy',
  name: 'Heading Hierarchy',
  description: 'Check that headings follow a logical hierarchy (H1 → H2 → H3)',
  category: 'semantic-html',
  weight: 5,
  check: (data): RuleResult => {
    const $ = cheerio.load(data.html);
    const headings: { level: number; text: string }[] = [];

    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const tagName = (el as any).tagName || (el as any).name;
      const level = parseInt(tagName.replace('h', ''), 10);
      headings.push({ level, text: $(el).text().trim() });
    });

    if (headings.length === 0) {
      return {
        ruleId: 'heading-hierarchy',
        ruleName: 'Heading Hierarchy',
        category: 'semantic-html',
        passed: false,
        score: 0,
        maxScore: 5,
        message: 'No headings found on the page',
        suggestion: 'Add semantic headings (H1-H6) to structure your content. AI agents use heading hierarchy to understand content organization',
      };
    }

    // Check for hierarchy violations (e.g., H1 → H3 skipping H2)
    let violations = 0;
    for (let i = 1; i < headings.length; i++) {
      const diff = headings[i].level - headings[i - 1].level;
      if (diff > 1) {
        violations++;
      }
    }

    if (violations === 0) {
      return {
        ruleId: 'heading-hierarchy',
        ruleName: 'Heading Hierarchy',
        category: 'semantic-html',
        passed: true,
        score: 5,
        maxScore: 5,
        message: `Heading hierarchy is clean (${headings.length} headings, no skipped levels)`,
      };
    }

    const score = violations <= 2 ? 3 : 1;

    return {
      ruleId: 'heading-hierarchy',
      ruleName: 'Heading Hierarchy',
      category: 'semantic-html',
      passed: false,
      score,
      maxScore: 5,
      message: `${violations} heading hierarchy violation(s) - levels are skipped`,
      suggestion: 'Ensure headings follow a logical order: H1 → H2 → H3. Don\'t skip levels (e.g., H1 → H3). AI agents use this hierarchy to parse content structure',
    };
  },
};
