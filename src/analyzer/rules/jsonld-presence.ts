import * as cheerio from 'cheerio';
import type { Rule, RuleResult } from '../../types/index.js';

export const jsonldPresenceRule: Rule = {
  id: 'jsonld-presence',
  name: 'JSON-LD Presence',
  description: 'Check if the page contains JSON-LD structured data',
  category: 'structured-data',
  weight: 10,
  check: (data): RuleResult => {
    const $ = cheerio.load(data.html);
    const jsonldScripts = $('script[type="application/ld+json"]');

    if (jsonldScripts.length > 0) {
      // Validate that at least one is parseable
      let validCount = 0;
      jsonldScripts.each((_, el) => {
        try {
          const content = $(el).html();
          if (content) {
            JSON.parse(content);
            validCount++;
          }
        } catch {
          // Invalid JSON-LD
        }
      });

      if (validCount > 0) {
        return {
          ruleId: 'jsonld-presence',
          ruleName: 'JSON-LD Presence',
          category: 'structured-data',
          passed: true,
          score: 10,
          maxScore: 10,
          message: `Found ${validCount} valid JSON-LD block(s)`,
        };
      }

      return {
        ruleId: 'jsonld-presence',
        ruleName: 'JSON-LD Presence',
        category: 'structured-data',
        passed: false,
        score: 3,
        maxScore: 10,
        message: 'JSON-LD blocks found but contain invalid JSON',
        suggestion: 'Fix the JSON syntax in your <script type="application/ld+json"> blocks',
      };
    }

    return {
      ruleId: 'jsonld-presence',
      ruleName: 'JSON-LD Presence',
      category: 'structured-data',
      passed: false,
      score: 0,
      maxScore: 10,
      message: 'No JSON-LD structured data found',
      suggestion: 'Add <script type="application/ld+json"> with Schema.org structured data to help AI agents understand your content',
    };
  },
};
