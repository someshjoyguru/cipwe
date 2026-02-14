import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { readdirSync } from 'node:fs';

/**
 * Read local HTML files from a directory.
 */
export function readLocalHtml(dirPath: string): string {
  const absPath = resolve(dirPath);

  // Check for index.html first
  const indexPath = join(absPath, 'index.html');
  if (existsSync(indexPath)) {
    return readFileSync(indexPath, 'utf-8');
  }

  // Look for any HTML file
  const files = readdirSync(absPath);
  const htmlFile = files.find(f => f.endsWith('.html') || f.endsWith('.htm'));

  if (htmlFile) {
    return readFileSync(join(absPath, htmlFile), 'utf-8');
  }

  // Check common build directories
  const buildDirs = ['dist', 'build', 'out', 'public', '.next'];
  for (const dir of buildDirs) {
    const buildIndex = join(absPath, dir, 'index.html');
    if (existsSync(buildIndex)) {
      return readFileSync(buildIndex, 'utf-8');
    }
  }

  throw new Error(`No HTML file found in ${absPath}. Looked for index.html and other .html files.`);
}

/**
 * Read a specific local file if it exists.
 */
export function readLocalFile(dirPath: string, filename: string): string | null {
  const filePath = join(resolve(dirPath), filename);
  if (existsSync(filePath)) {
    return readFileSync(filePath, 'utf-8');
  }

  // Also check public/ directory (common in frameworks)
  const publicPath = join(resolve(dirPath), 'public', filename);
  if (existsSync(publicPath)) {
    return readFileSync(publicPath, 'utf-8');
  }

  return null;
}
