import chalk from 'chalk';
import type { AuditResult } from '../types/index.js';
import { scoreBar } from '../utils/helpers.js';

/**
 * Render the full CIPWE audit report to the terminal.
 */
export function renderReport(audit: AuditResult): void {
  const { totalScore, maxScore, percentage, grade, gradeEmoji } = audit;

  // === Score Header ===
  console.log();
  console.log(chalk.dim('  ─────────────────────────────────────────────'));
  console.log();

  // Big score display
  const scoreColor = percentage >= 80 ? chalk.green :
    percentage >= 60 ? chalk.yellow :
    percentage >= 40 ? chalk.hex('#FF8C00') :
    chalk.red;

  console.log(`  ${chalk.bold('CIPWE Score')}    ${scoreColor.bold(`${totalScore}`)}${chalk.dim(`/${maxScore}`)}  ${scoreColor.bold(`(${percentage}%)`)}`);
  console.log(`  ${chalk.bold('Grade')}          ${gradeEmoji} ${scoreColor.bold(grade)}`);
  console.log(`  ${chalk.bold('Checks')}         ${chalk.green(`${audit.passedCount} passed`)}  ${audit.failedCount > 0 ? chalk.red(`${audit.failedCount} failed`) : chalk.green('0 failed')}`);

  console.log();
  console.log(chalk.dim('  ─────────────────────────────────────────────'));

  // === Category Breakdown ===
  console.log();
  console.log(chalk.bold('  Category Scores'));
  console.log();

  for (const cat of audit.categories) {
    const bar = scoreBar(cat.score, cat.maxScore);
    const scoreText = `${cat.score}/${cat.maxScore}`;
    const pct = `${cat.percentage}%`;

    const nameWidth = 22;
    const name = cat.categoryName.padEnd(nameWidth);
    const scoreWidth = 7;
    const score = scoreText.padStart(scoreWidth);

    const statusIcon = cat.percentage >= 80 ? chalk.green('✔') :
      cat.percentage >= 50 ? chalk.yellow('◐') :
      chalk.red('✘');

    console.log(`  ${statusIcon} ${chalk.bold(name)} ${bar} ${chalk.dim(score)} ${chalk.dim(pct)}`);
  }

  // === Passed Checks ===
  const passed = audit.rules.filter(r => r.passed);
  if (passed.length > 0) {
    console.log();
    console.log(chalk.dim('  ─────────────────────────────────────────────'));
    console.log();
    console.log(chalk.bold.green(`  ✔ Passed (${passed.length})`));
    console.log();
    for (const rule of passed) {
      console.log(`    ${chalk.green('✔')} ${chalk.dim(rule.ruleName)}: ${rule.message}`);
    }
  }

  // === Failed Checks ===
  const failed = audit.rules.filter(r => !r.passed);
  if (failed.length > 0) {
    console.log();
    console.log(chalk.dim('  ─────────────────────────────────────────────'));
    console.log();
    console.log(chalk.bold.red(`  ✘ Issues (${failed.length})`));
    console.log();
    for (const rule of failed) {
      console.log(`    ${chalk.red('✘')} ${chalk.bold(rule.ruleName)}: ${rule.message}`);
      if (rule.suggestion) {
        console.log(`      ${chalk.dim('→')} ${chalk.yellow(rule.suggestion)}`);
      }
    }
  }

  // === Footer ===
  console.log();
  console.log(chalk.dim('  ─────────────────────────────────────────────'));
  console.log();

  if (failed.length > 0) {
    console.log(chalk.cyan(`  Run ${chalk.bold('npx cipwe fix <target>')} to auto-generate fixes`));
  } else {
    console.log(chalk.green.bold('  🎉 Your site is AI-ready! CIPWE Certified.'));
  }

  console.log(chalk.dim(`  Report: ${audit.timestamp}`));
  console.log();
}

/**
 * Render the report as JSON (for CI/CD integration).
 */
export function renderJson(audit: AuditResult): void {
  console.log(JSON.stringify(audit, null, 2));
}
