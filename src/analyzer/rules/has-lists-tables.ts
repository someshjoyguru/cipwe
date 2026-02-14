import * as cheerio from 'cheerio';
import type { Rule, RuleResult } from '../../types/index.js';

export const hasListsTablesRule: Rule = {
  id: 'has-lists-tables',
  name: 'Lists & Tables',
  description: 'Check if the page uses structured content elements (lists, tables)',
  category: 'content-clarity',
  weight: 3,
  check: (data): RuleResult => {
    const $ = cheerio.load(data.html);

    const ulCount = $('ul:not(nav ul)').length;
    const olCount = $('ol').length;
    const dlCount = $('dl').length;
    const tableCount = $('table').length;
    const detailsCount = $('details').length;

    const totalStructured = ulCount + olCount + dlCount + tableCount + detailsCount;

    if (totalStructured >= 3) {
      const parts: string[] = [];
      if (ulCount > 0) parts.push(`${ulCount} unordered list(s)`);
      if (olCount > 0) parts.push(`${olCount} ordered list(s)`);
      if (dlCount > 0) parts.push(`${dlCount} definition list(s)`);
      if (tableCount > 0) parts.push(`${tableCount} table(s)`);
      if (detailsCount > 0) parts.push(`${detailsCount} details/summary`);

      return {
        ruleId: 'has-lists-tables',
        ruleName: 'Lists & Tables',
        category: 'content-clarity',
        passed: true,
        score: 3,
        maxScore: 3,
        message: `Good structured content: ${parts.join(', ')}`,
      };
    }

    if (totalStructured >= 1) {
      return {
        ruleId: 'has-lists-tables',
        ruleName: 'Lists & Tables',
        category: 'content-clarity',
        passed: true,
        score: 2,
        maxScore: 3,
        message: `Some structured content found (${totalStructured} elements)`,
        suggestion: 'Add more lists, tables, or definition lists to make content more parseable by AI agents',
      };
    }

    return {
      ruleId: 'has-lists-tables',
      ruleName: 'Lists & Tables',
      category: 'content-clarity',
      passed: false,
      score: 0,
      maxScore: 3,
      message: 'No structured content elements (lists, tables) found',
      suggestion: 'Use <ul>, <ol>, <dl>, <table>, or <details> to structure information. AI agents extract structured content more accurately than paragraphs',
    };
  },
};
