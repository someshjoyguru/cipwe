/* ============================================================
   CIPWE Chrome Extension — Content Script
   Runs in the page context to extract DOM data for analysis.
   Works on SSR, SSG, and client-rendered SPAs (React, Vue, etc.)
   ============================================================ */

(() => {
  /**
   * Wait for the page to be truly "ready".
   * Handles React/Vue/Angular SPAs that render after initial load.
   *  - Waits for document.readyState === 'complete'
   *  - Waits for any pending React hydration / lazy loads (up to 2s)
   *  - Falls back immediately if already settled
   */
  function waitForContent() {
    return new Promise((resolve) => {
      // If the DOM already looks populated, resolve fast
      if (document.readyState === 'complete' && document.body.children.length > 1) {
        // Give React/frameworks a small grace period for hydration
        setTimeout(resolve, 300);
        return;
      }

      // Otherwise wait for load event + grace period
      const onReady = () => {
        setTimeout(resolve, 800);
      };

      if (document.readyState === 'complete') {
        onReady();
      } else {
        window.addEventListener('load', onReady, { once: true });
        // Safety timeout — don't wait forever
        setTimeout(resolve, 3000);
      }
    });
  }

  /**
   * Detect SPA framework for informational purposes.
   */
  function detectFramework() {
    if (document.querySelector('#__next') || document.querySelector('[data-nextjs-page]')) return 'Next.js';
    if (document.querySelector('#__nuxt') || document.querySelector('[data-server-rendered]')) return 'Nuxt';
    if (document.querySelector('[data-reactroot]') || document.querySelector('[id="root"]._reactRootContainer') || document.querySelector('[data-reactroot]')) return 'React';
    // Check for React fiber in any element
    const rootEl = document.getElementById('root') || document.getElementById('app');
    if (rootEl) {
      const keys = Object.keys(rootEl);
      if (keys.some(k => k.startsWith('__reactFiber') || k.startsWith('__reactContainer'))) return 'React';
      if (rootEl.__vue_app__ || rootEl.__vue__) return 'Vue';
    }
    if (document.querySelector('[ng-version]') || document.querySelector('app-root')) return 'Angular';
    if (document.querySelector('[data-svelte-h]') || document.querySelector('[data-sveltekit]')) return 'SvelteKit';
    if (document.querySelector('#__gatsby')) return 'Gatsby';
    if (document.querySelector('[data-astro-cid]')) return 'Astro';
    return null;
  }

  /**
   * Gather all page data needed for CIPWE analysis.
   */
  function gatherPageData() {
    const html = document.documentElement.outerHTML;
    const url = window.location.href;
    const framework = detectFramework();

    return { url, html, framework };
  }

  // Listen for messages from popup / background
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action === 'gatherPageData') {
      // Wait for SPA content to be fully rendered before gathering
      waitForContent().then(() => {
        sendResponse(gatherPageData());
      });
      return true; // keep channel open for async response
    }
    return true;
  });
})();
