import type { RuleResult, CategoryScore, AuditResult, RuleCategory } from '../types/index.js';
import { CATEGORY_NAMES } from '../types/index.js';

/**
 * Calculate the CIPWE Score from rule results.
 */
export function calculateScore(url: string, results: RuleResult[]): AuditResult {
  // Group results by category
  const categoryMap = new Map<RuleCategory, RuleResult[]>();
  for (const result of results) {
    const existing = categoryMap.get(result.category) || [];
    existing.push(result);
    categoryMap.set(result.category, existing);
  }

  // Calculate category scores
  const categories: CategoryScore[] = [];
  const categoryOrder: RuleCategory[] = [
    'structured-data',
    'semantic-html',
    'metadata',
    'crawl-signals',
    'content-clarity',
    'agent-signals',
  ];

  for (const category of categoryOrder) {
    const categoryResults = categoryMap.get(category) || [];
    const score = categoryResults.reduce((sum, r) => sum + r.score, 0);
    const maxScore = categoryResults.reduce((sum, r) => sum + r.maxScore, 0);

    categories.push({
      category,
      categoryName: CATEGORY_NAMES[category],
      score,
      maxScore,
      percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
    });
  }

  // Calculate total
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const maxScore = results.reduce((sum, r) => sum + r.maxScore, 0);
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  const grade = getGrade(percentage);
  const gradeEmoji = getGradeEmoji(grade);

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  return {
    url,
    totalScore,
    maxScore,
    percentage,
    grade,
    gradeEmoji,
    categories,
    rules: results,
    passedCount,
    failedCount,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Map percentage to letter grade.
 */
function getGrade(percentage: number): string {
  if (percentage >= 95) return 'A+';
  if (percentage >= 90) return 'A';
  if (percentage >= 85) return 'A-';
  if (percentage >= 80) return 'B+';
  if (percentage >= 75) return 'B';
  if (percentage >= 70) return 'B-';
  if (percentage >= 65) return 'C+';
  if (percentage >= 60) return 'C';
  if (percentage >= 55) return 'C-';
  if (percentage >= 50) return 'D+';
  if (percentage >= 45) return 'D';
  if (percentage >= 40) return 'D-';
  return 'F';
}

/**
 * Get emoji for grade.
 */
function getGradeEmoji(grade: string): string {
  if (grade.startsWith('A')) return '🟢';
  if (grade.startsWith('B')) return '🔵';
  if (grade.startsWith('C')) return '🟡';
  if (grade.startsWith('D')) return '🟠';
  return '🔴';
}
