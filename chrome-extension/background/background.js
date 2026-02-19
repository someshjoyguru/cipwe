/* ============================================================
   CIPWE Chrome Extension — Background Service Worker
   Handles fetching robots.txt, sitemap.xml, llms.txt
   ============================================================ */

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'fetchCrawlFiles') {
    const baseUrl = msg.baseUrl;

    Promise.allSettled([
      fetchText(`${baseUrl}/robots.txt`),
      fetchText(`${baseUrl}/sitemap.xml`),
      fetchText(`${baseUrl}/llms.txt`),
    ]).then(([robotsResult, sitemapResult, llmsResult]) => {
      sendResponse({
        robotsTxt: robotsResult.status === 'fulfilled' ? robotsResult.value : null,
        sitemapXml: sitemapResult.status === 'fulfilled' ? sitemapResult.value : null,
        llmsTxt:   llmsResult.status === 'fulfilled' ? llmsResult.value : null,
      });
    });

    return true; // keep channel open for async response
  }
});

async function fetchText(url) {
  try {
    const resp = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      redirect: 'follow',
    });
    if (!resp.ok) return null;
    const text = await resp.text();
    // Sanity check — if the response is HTML, it's probably a 404 page
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      return null;
    }
    return text;
  } catch {
    return null;
  }
}
