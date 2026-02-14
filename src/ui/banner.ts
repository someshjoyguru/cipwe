import chalk from 'chalk';

/**
 * Display the CIPWE ASCII banner.
 */
export function showBanner(): void {
  const banner = chalk.bold.cyan(`
   ██████╗██╗██████╗ ██╗    ██╗███████╗
  ██╔════╝██║██╔══██╗██║    ██║██╔════╝
  ██║     ██║██████╔╝██║ █╗ ██║█████╗  
  ██║     ██║██╔═══╝ ██║███╗██║██╔══╝  
  ╚██████╗██║██║     ╚███╔███╔╝███████╗
   ╚═════╝╚═╝╚═╝      ╚══╝╚══╝ ╚══════╝`);

  console.log(banner);
  console.log(chalk.dim('  The Web Vitals for the AI Web'));
  console.log(chalk.dim('  https://cipwe.com'));
  console.log();
}

/**
 * Show a spinner-style loading message.
 */
export function showLoading(message: string): void {
  process.stdout.write(chalk.cyan(`  ◌ ${message}...`));
}

/**
 * Clear the loading line and show completion.
 */
export function showDone(message: string): void {
  process.stdout.write(`\r${chalk.green(`  ● ${message}     `)}\n`);
}

/**
 * Show error inline.
 */
export function showError(message: string): void {
  process.stdout.write(`\r${chalk.red(`  ✘ ${message}     `)}\n`);
}
