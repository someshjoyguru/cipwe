import * as cheerio from 'cheerio';

/**
 * Generate a basic sitemap.xml from page links.
 */
export function generateSitemapXml(url: string, html: string): string {
  const baseUrl = new URL(url).origin;
  const $ = cheerio.load(html);

  const urls = new Set<string>();
  urls.add(url); // Always include the scanned page

  // Extract all internal links
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';

    if (href.startsWith('/') && !href.startsWith('//')) {
      urls.add(`${baseUrl}${href}`);
    } else if (href.startsWith(baseUrl)) {
      urls.add(href);
    }
  });

  // Filter out non-page URLs
  const pageUrls = [...urls].filter(u => {
    const path = new URL(u).pathname;
    // Exclude common non-page patterns
    return !path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|pdf|zip)$/i) &&
      !path.startsWith('/api/') &&
      !path.startsWith('/_') &&
      !path.includes('#');
  });

  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  for (const pageUrl of pageUrls.slice(0, 500)) {
    const isHomepage = new URL(pageUrl).pathname === '/';
    xml += `  <url>
    <loc>${escapeXml(pageUrl)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${isHomepage ? 'daily' : 'weekly'}</changefreq>
    <priority>${isHomepage ? '1.0' : '0.8'}</priority>
  </url>
`;
  }

  xml += `</urlset>
`;

  return xml;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
