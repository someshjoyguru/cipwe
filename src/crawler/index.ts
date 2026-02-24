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
 * Parse Sitemap: directives from robots.txt content.
 * Falls back to {baseUrl}/sitemap.xml if no directives found.
 */
function parseSitemapUrls(robotsTxt: string | null, baseUrl: string): string[] {
  if (!robotsTxt) {
    return [`${baseUrl}/sitemap.xml`];
  }

  const urls: string[] = [];
  const lines = robotsTxt.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^sitemap\s*:/i.test(trimmed)) {
      const url = trimmed.replace(/^sitemap\s*:\s*/i, '').trim();
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        urls.push(url);
      }
    }
  }

  if (urls.length === 0) {
    urls.push(`${baseUrl}/sitemap.xml`);
  }

  return urls;
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

  // Fetch robots.txt first to discover sitemap URLs
  const robotsTxt = await tryFetchUrl(`${baseUrl}/robots.txt`, opts);

  // Parse Sitemap: directives from robots.txt
  const sitemapUrls = parseSitemapUrls(robotsTxt, baseUrl);

  // Fetch all discovered sitemaps and llms.txt in parallel
  const sitemapPromises = sitemapUrls.map(u => tryFetchUrl(u, opts));
  const [llmsTxt, ...sitemapResults] = await Promise.all([
    tryFetchUrl(`${baseUrl}/llms.txt`, opts),
    ...sitemapPromises,
  ]);

  // Combine all successful sitemap contents
  const validSitemaps = sitemapResults.filter((s): s is string => s !== null);
  const sitemapXml = validSitemaps.length > 0 ? validSitemaps.join('\n') : null;

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
