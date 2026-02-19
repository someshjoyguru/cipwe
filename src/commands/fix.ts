import chalk from 'chalk';
import { crawl } from '../crawler/index.js';
import { runAnalyzer } from '../analyzer/engine.js';
import { calculateScore } from '../scoring/calculator.js';
import { generateFixes } from '../generator/index.js';
import { showBanner, showLoading, showDone, showError } from '../ui/banner.js';
import { isUrl, normalizeUrl } from '../utils/helpers.js';

interface FixOptions {
  output?: string;
  insecure?: boolean;
  timeout?: number;
}

/**
 * The `cipwe fix` command - generate fixes for AI crawlability issues.
 */
export async function fixCommand(target: string, options: FixOptions): Promise<void> {
  const outputDir = options.output || './cipwe-output';

  showBanner();
  const displayTarget = isUrl(target) || target.includes('.') ? normalizeUrl(target) : target;
  console.log(chalk.bold(`  Fixing: ${chalk.cyan(displayTarget)}`));
  console.log();

  try {
    // Step 1: Crawl
    showLoading('Crawling target');
    const crawlData = await crawl(target, {
      insecure: options.insecure,
      timeout: options.timeout,
    });
    showDone('Crawled successfully');

    // Step 2: Analyze
    showLoading('Running CIPWE analysis');
    const results = runAnalyzer(crawlData);
    showDone(`Analyzed ${results.length} rules`);

    // Step 3: Score
    showLoading('Calculating score');
    const audit = calculateScore(crawlData.url, results);
    showDone(`CIPWE Score: ${audit.totalScore}/${audit.maxScore} (${audit.grade})`);

    // Step 4: Generate fixes
    showLoading('Generating fixes');
    const fixResult = generateFixes(crawlData, audit, outputDir);
    showDone(`Generated ${fixResult.filesGenerated.length} files`);

    // Display results
    console.log();
    console.log(chalk.dim('  ─────────────────────────────────────────────'));
    console.log();

    if (fixResult.filesGenerated.length > 0) {
      console.log(chalk.bold.green('  📁 Generated Files:'));
      console.log();
      for (const file of fixResult.filesGenerated) {
        console.log(`    ${chalk.green('+')} ${chalk.cyan(file)}`);
      }
    }

    if (fixResult.suggestions.length > 0) {
      console.log();
      console.log(chalk.bold.yellow('  💡 Manual Improvements:'));
      console.log();
      for (const suggestion of fixResult.suggestions) {
        console.log(`    ${chalk.yellow('→')} ${suggestion}`);
      }
    }

    console.log();
    console.log(chalk.dim('  ─────────────────────────────────────────────'));
    console.log();
    console.log(chalk.bold('  Next Steps:'));
    console.log();
    console.log(chalk.dim('  1.') + ` Copy files from ${chalk.cyan(outputDir)} to your project`);
    console.log(chalk.dim('  2.') + ' Add the JSON-LD snippet to your HTML <head>');
    console.log(chalk.dim('  3.') + ' Deploy robots.txt and sitemap.xml to site root');
    console.log(chalk.dim('  4.') + ' Deploy llms.txt to site root');
    console.log(chalk.dim('  5.') + ` Re-run ${chalk.cyan('npx cipwe audit')} to verify improvements`);
    console.log();

  } catch (error) {
    showError('Fix generation failed');
    console.log();
    console.log(chalk.red(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
    console.log();
    process.exitCode = 1;
  }
}
