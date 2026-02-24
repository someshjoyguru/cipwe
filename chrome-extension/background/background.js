/* ============================================================
   CIPWE Chrome Extension - Background Service Worker
   Handles fetching robots.txt, sitemap.xml, llms.txt
   ============================================================ */

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'fetchCrawlFiles') {
    const baseUrl = msg.baseUrl;

    // Fetch robots.txt first, then use it to discover sitemap URLs
    fetchText(`${baseUrl}/robots.txt`).then(async (robotsTxt) => {
      // Parse all Sitemap: directives from robots.txt
      const sitemapUrls = parseSitemapUrls(robotsTxt, baseUrl);

      // Fetch all discovered sitemaps in parallel
      const sitemapResults = await Promise.allSettled(
        sitemapUrls.map(url => fetchText(url))
      );

      // Combine all successful sitemap contents
      let sitemapXml = null;
      const validSitemaps = sitemapResults
        .filter(r => r.status === 'fulfilled' && r.value)
        .map(r => r.value);

      if (validSitemaps.length > 0) {
        sitemapXml = validSitemaps.join('\n');
      }

      // Fetch llms.txt in parallel with sitemap processing
      const llmsResult = await fetchText(`${baseUrl}/llms.txt`);

      sendResponse({
        robotsTxt,
        sitemapXml,
        llmsTxt: llmsResult,
      });
    });

    return true; // keep channel open for async response
  }
});

/**
 * Parse Sitemap: directives from robots.txt content.
 * Falls back to {baseUrl}/sitemap.xml if no directives found.
 */
function parseSitemapUrls(robotsTxt, baseUrl) {
  if (!robotsTxt) {
    return [`${baseUrl}/sitemap.xml`];
  }

  const urls = [];
  const lines = robotsTxt.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    // Match "Sitemap:" (case-insensitive) followed by a URL
    if (/^sitemap\s*:/i.test(trimmed)) {
      const url = trimmed.replace(/^sitemap\s*:\s*/i, '').trim();
      if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
        urls.push(url);
      }
    }
  }

  // Fall back to default /sitemap.xml if no directives found
  if (urls.length === 0) {
    urls.push(`${baseUrl}/sitemap.xml`);
  }

  return urls;
}

async function fetchText(url) {
  try {
    const resp = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'follow',
    });
    if (!resp.ok) return null;
    const text = await resp.text();
    // Sanity check - if the response is HTML, it's probably a 404 page
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      return null;
    }
    return text;
  } catch {
    return null;
  }
}
