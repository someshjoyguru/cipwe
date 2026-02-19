import type { CrawlData } from '../types/index.js';
import { fetchUrl, tryFetchUrl } from './fetchUrl.js';
import type { FetchOptions } from './fetchUrl.js';
import { readLocalHtml, readLocalFile } from './readLocal.js';
import { isUrl, normalizeUrl, getBaseUrl } from '../utils/helpers.js';

export type { FetchOptions } from './fetchUrl.js';

/**
 * Main crawler - orchestrates fetching all data needed for analysis.
 */
export async function crawl(
  target: string,
  opts: FetchOptions = {},
): Promise<CrawlData> {
  if (isUrl(target) || target.includes('.') && !target.includes('/')) {
    return crawlUrl(target, opts);
  }

  return crawlLocal(target);
}

/**
 * Crawl a deployed URL.
 */
async function crawlUrl(
  target: string,
  opts: FetchOptions = {},
): Promise<CrawlData> {
  const url = normalizeUrl(target);
  const baseUrl = getBaseUrl(url);

  // Fetch main HTML first so that TLS fallback can activate before
  // the parallel auxiliary requests fire.
  const html = await fetchUrl(url, opts);

  // Now fetch auxiliary files in parallel - they inherit TLS state
  const [robotsTxt, sitemapXml, llmsTxt] = await Promise.all([
    tryFetchUrl(`${baseUrl}/robots.txt`, opts),
    tryFetchUrl(`${baseUrl}/sitemap.xml`, opts),
    tryFetchUrl(`${baseUrl}/llms.txt`, opts),
  ]);

  return {
    url,
    html,
    robotsTxt,
    sitemapXml,
    llmsTxt,
    isLocal: false,
  };
}

/**
 * Crawl a local directory.
 */
async function crawlLocal(target: string): Promise<CrawlData> {
  const html = readLocalHtml(target);
  const robotsTxt = readLocalFile(target, 'robots.txt');
  const sitemapXml = readLocalFile(target, 'sitemap.xml');
  const llmsTxt = readLocalFile(target, 'llms.txt');

  return {
    url: target,
    html,
    robotsTxt,
    sitemapXml,
    llmsTxt,
    isLocal: true,
  };
}
