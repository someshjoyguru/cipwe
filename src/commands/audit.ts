import chalk from 'chalk';
import { crawl } from '../crawler/index.js';
import { runAnalyzer } from '../analyzer/engine.js';
import { calculateScore } from '../scoring/calculator.js';
import { renderReport, renderJson } from '../ui/report.js';
import { showBanner, showLoading, showDone, showError } from '../ui/banner.js';
import { isUrl, normalizeUrl } from '../utils/helpers.js';

interface AuditOptions {
  json?: boolean;
  verbose?: boolean;
  insecure?: boolean;
  timeout?: number;
}

/**
 * The `cipwe audit` command — scan and score a website.
 */
export async function auditCommand(target: string, options: AuditOptions): Promise<void> {
  const isJsonMode = options.json || false;

  if (!isJsonMode) {
    showBanner();
    const displayTarget = isUrl(target) || target.includes('.') ? normalizeUrl(target) : target;
    console.log(chalk.bold(`  Auditing: ${chalk.cyan(displayTarget)}`));
    console.log();
  }

  try {
    // Step 1: Crawl
    if (!isJsonMode) showLoading('Crawling target');
    const crawlData = await crawl(target, {
      insecure: options.insecure,
      timeout: options.timeout,
    });
    if (!isJsonMode) showDone('Crawled successfully');

    // Step 2: Analyze
    if (!isJsonMode) showLoading('Running 20 CIPWE checks');
    const results = runAnalyzer(crawlData);
    if (!isJsonMode) showDone(`Analyzed ${results.length} rules`);

    // Step 3: Score
    if (!isJsonMode) showLoading('Calculating CIPWE Score');
    const audit = calculateScore(crawlData.url, results);
    if (!isJsonMode) showDone('Score calculated');

    // Step 4: Report
    if (isJsonMode) {
      renderJson(audit);
    } else {
      renderReport(audit);
    }

    // Exit with appropriate code for CI
    if (audit.percentage < 50) {
      process.exitCode = 1;
    }
  } catch (error) {
    if (isJsonMode) {
      console.error(JSON.stringify({
        error: true,
        message: error instanceof Error ? error.message : 'Unknown error',
      }));
    } else {
      showError('Audit failed');
      console.log();
      console.log(chalk.red(`  Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      console.log();

      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes('tls') || msg.includes('cert') || msg.includes('ssl') || msg.includes('self-signed') || msg.includes('self_signed')) {
          console.log(chalk.dim('  TLS/certificate issue detected.'));
          console.log(chalk.dim('  Try: cipwe audit <url> --insecure'));
        } else if (msg.includes('refused')) {
          console.log(chalk.dim('  The server refused the connection. Is it running?'));
        } else if (msg.includes('timed out') || msg.includes('timeout')) {
          console.log(chalk.dim('  The request timed out. Try: cipwe audit <url> --timeout 30000'));
        } else {
          console.log(chalk.dim('  Make sure the URL is accessible and returns HTML.'));
          console.log(chalk.dim('  For local projects, pass the directory path instead.'));
        }
      }
    }

    process.exitCode = 1;
  }
}
