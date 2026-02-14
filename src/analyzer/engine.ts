import type { CrawlData, RuleResult } from '../types/index.js';
import { allRules } from './rules/index.js';

/**
 * Run all CIPWE analyzer rules against crawled data.
 */
export function runAnalyzer(data: CrawlData): RuleResult[] {
  const results: RuleResult[] = [];

  for (const rule of allRules) {
    try {
      const result = rule.check(data);
      results.push(result);
    } catch (error) {
      // If a rule crashes, record it as a 0-score failure
      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        category: rule.category,
        passed: false,
        score: 0,
        maxScore: rule.weight,
        message: `Rule error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        suggestion: 'This rule encountered an error during analysis',
      });
    }
  }

  return results;
}
