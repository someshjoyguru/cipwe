#!/usr/bin/env node

// ============================================================
// CIPWE — The Web Vitals for the AI Web
// https://cipwe.someshghosh.me
//
// Audit & optimize your website for AI agents, LLMs,
// and answer engines.
//
// Usage:
//   npx cipwe audit <url>       Audit a website
//   npx cipwe fix <url>         Generate fixes
//   npx cipwe audit . --json    JSON output for CI
// ============================================================

import { Command } from 'commander';
import { auditCommand } from './commands/audit.js';
import { fixCommand } from './commands/fix.js';

const program = new Command();

program
  .name('cipwe')
  .description('The Web Vitals for the AI Web — Make your website visible in AI answers.')
  .version('0.1.0');

program
  .command('audit <target>')
  .description('Analyze a website or local project for AI visibility')
  .option('--json', 'Output results as JSON (for CI/CD integration)')
  .option('--verbose', 'Show detailed analysis information')
  .option('-k, --insecure', 'Skip TLS certificate verification (useful for localhost / self-signed certs)')
  .option('--timeout <ms>', 'Request timeout in milliseconds (default: 15000)', parseInt)
  .addHelpText('after', `
Examples:
  $ cipwe audit https://example.com       Audit a deployed website
  $ cipwe audit example.com               Auto-adds https://
  $ cipwe audit .                          Audit local HTML files
  $ cipwe audit ./dist                     Audit build output
  $ cipwe audit https://example.com --json JSON output for CI
  $ cipwe audit https://localhost -k       Skip TLS cert checks`)
  .action(auditCommand);

program
  .command('fix <target>')
  .description('Generate visibility fixes (llms.txt, JSON-LD, robots.txt, sitemap.xml)')
  .option('-o, --output <dir>', 'Output directory for generated files', './cipwe-output')
  .option('-k, --insecure', 'Skip TLS certificate verification')
  .option('--timeout <ms>', 'Request timeout in milliseconds (default: 15000)', parseInt)
  .addHelpText('after', `
Examples:
  $ cipwe fix https://example.com          Generate fixes for a website
  $ cipwe fix . -o ./public                Output to public directory
  $ cipwe fix https://localhost -k         Skip TLS cert checks`)
  .action(fixCommand);

program
  .command('score <target>')
  .description('Quick score check (just the number)')
  .option('-k, --insecure', 'Skip TLS certificate verification')
  .option('--timeout <ms>', 'Request timeout in milliseconds (default: 15000)', parseInt)
  .action(async (target: string, opts: { insecure?: boolean; timeout?: number }) => {
    const { crawl } = await import('./crawler/index.js');
    const { runAnalyzer } = await import('./analyzer/engine.js');
    const { calculateScore } = await import('./scoring/calculator.js');

    try {
      const data = await crawl(target, {
        insecure: opts.insecure,
        timeout: opts.timeout,
      });
      const results = runAnalyzer(data);
      const audit = calculateScore(data.url, results);
      console.log(`${audit.gradeEmoji} CIPWE ${audit.totalScore}/${audit.maxScore} (${audit.grade})`);

      if (audit.percentage < 50) process.exitCode = 1;
    } catch (error) {
      console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      process.exitCode = 1;
    }
  });

program.parse();
