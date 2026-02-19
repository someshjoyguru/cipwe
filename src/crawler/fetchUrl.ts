export interface FetchOptions {
  /** Skip TLS certificate verification (like curl -k) */
  insecure?: boolean;
  /** Request timeout in ms (default: 15000) */
  timeout?: number;
  /** Number of retries for transient errors (default: 2) */
  retries?: number;
}

/**
 * Use native fetch (Node 18+) or fall back to node-fetch for Node 16.
 */
let _fetch: typeof globalThis.fetch | undefined;

async function resolvedFetch(
  input: string,
  init?: RequestInit,
): Promise<Response> {
  if (!_fetch) {
    if (typeof globalThis.fetch === 'function') {
      _fetch = globalThis.fetch;
    } else {
      const mod = await import('node-fetch');
      _fetch = mod.default as unknown as typeof globalThis.fetch;
    }
  }
  return _fetch(input, init);
}

/** Shared state - set once if TLS fallback succeeds so subsequent requests don't fail */
let tlsFallbackActive = false;

const USER_AGENT = 'CIPWE-Bot/0.1 (+https://cipwe.someshghosh.me)';

const RETRY_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

/**
 * Node's native fetch wraps errors in a TypeError with the real cause
 * buried in `.cause`. This unwraps the full chain.
 */
function unwrapError(err: unknown): Error[] {
  const chain: Error[] = [];
  let current: unknown = err;
  while (current instanceof Error) {
    chain.push(current);
    current = (current as { cause?: unknown }).cause;
  }
  return chain;
}

/**
 * Detect if an error (or its cause chain) is a TLS / certificate issue.
 */
function isTlsError(err: unknown): boolean {
  for (const e of unwrapError(err)) {
    const msg = e.message.toLowerCase();
    const code = (e as NodeJS.ErrnoException).code?.toLowerCase() ?? '';
    if (
      msg.includes('self-signed') ||
      msg.includes('self_signed') ||
      msg.includes('cert') ||
      msg.includes('ssl') ||
      msg.includes('tls') ||
      msg.includes('unable to verify') ||
      msg.includes('unable to get local issuer') ||
      code === 'cert_has_expired' ||
      code === 'depth_zero_self_signed_cert' ||
      code === 'self_signed_cert_in_chain' ||
      code === 'unable_to_verify_leaf_signature' ||
      code === 'err_tls_cert_altname_invalid'
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Detect if an error (or its cause chain) is a transient network issue worth retrying.
 */
function isTransientError(err: unknown): boolean {
  for (const e of unwrapError(err)) {
    const code = (e as NodeJS.ErrnoException).code ?? '';
    if (
      code === 'ECONNRESET' ||
      code === 'ETIMEDOUT' ||
      code === 'EPIPE' ||
      code === 'EAI_AGAIN' ||
      e.name === 'AbortError'
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Check if error is ECONNREFUSED (server not running).
 */
function isConnectionRefused(err: unknown): boolean {
  return unwrapError(err).some(
    e => (e as NodeJS.ErrnoException).code === 'ECONNREFUSED',
  );
}

/**
 * Check if error is a timeout / abort.
 */
function isTimeoutError(err: unknown): boolean {
  return unwrapError(err).some(
    e => e.name === 'AbortError' || (e as NodeJS.ErrnoException).code === 'ETIMEDOUT',
  );
}

/**
 * Get a human-readable message from the deepest error in the chain.
 */
function getRootMessage(err: unknown): string {
  const chain = unwrapError(err);
  // Prefer the deepest cause - that's usually the real reason
  for (let i = chain.length - 1; i >= 0; i--) {
    const msg = chain[i].message;
    if (msg && msg !== 'fetch failed') return msg;
  }
  return chain[0]?.message ?? 'Unknown error';
}

/**
 * Enable insecure TLS for the process (equivalent to NODE_TLS_REJECT_UNAUTHORIZED=0).
 * Suppresses the noisy Node.js warning about the env variable.
 */
let tlsWarningsSuppressed = false;

function enableInsecureTls(): void {
  if (!tlsWarningsSuppressed) {
    const originalEmitWarning = process.emitWarning;
    process.emitWarning = ((warning: string | Error, ...args: unknown[]) => {
      const msg = typeof warning === 'string' ? warning : warning.message;
      if (msg?.includes('NODE_TLS_REJECT_UNAUTHORIZED')) return;
      return (originalEmitWarning as Function).call(process, warning, ...args);
    }) as typeof process.emitWarning;
    tlsWarningsSuppressed = true;
  }

  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  tlsFallbackActive = true;
}

/**
 * Core fetch wrapper with timeout.
 */
async function doFetch(
  url: string,
  opts: FetchOptions,
  accept?: string,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutMs = opts.timeout ?? 15_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // Ensure env-level flag is set when insecure mode is needed
  // (Node's native fetch doesn't support per-request agent easily)
  if (opts.insecure || tlsFallbackActive) {
    enableInsecureTls();
  }

  try {
    return await resolvedFetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        ...(accept ? { Accept: accept } : {}),
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Sleep helper for retry back-off.
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch HTML content from a URL.
 *
 * Resilience features:
 *  - Retries on transient network errors (ECONNRESET, 5xx, 429, …)
 *  - Auto-detects TLS / self-signed-cert errors and silently retries
 *    with certificate verification disabled (with a stderr warning).
 *  - Supports an explicit `--insecure` mode to skip TLS checks upfront.
 */
export async function fetchUrl(
  url: string,
  opts: FetchOptions = {},
): Promise<string> {
  const maxRetries = opts.retries ?? 2;
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await doFetch(
        url,
        opts,
        'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      );

      if (res.ok) return await res.text();

      // Retry on transient HTTP status codes
      if (RETRY_STATUS_CODES.has(res.status) && attempt < maxRetries) {
        await sleep(1000 * (attempt + 1));
        continue;
      }

      throw new Error(`HTTP ${res.status}: ${res.statusText || 'Request failed'}`);
    } catch (err) {
      lastError = err;

      // ── TLS error → auto-fallback ──────────────────────────────
      if (isTlsError(err) && !opts.insecure && !tlsFallbackActive) {
        process.stderr.write(
          '\n  ⚠  TLS certificate error detected - retrying with verification disabled.\n' +
          '     (Use --insecure to skip this check upfront.)\n\n',
        );
        enableInsecureTls();
        // Reset attempt counter so the retry has full chances
        attempt = -1;
        continue;
      }

      // ── Transient network error → retry with back-off ──────────
      if (isTransientError(err) && attempt < maxRetries) {
        await sleep(1000 * (attempt + 1));
        continue;
      }

      // Non-recoverable
      break;
    }
  }

  // Provide a human-friendly message depending on error type
  if (isConnectionRefused(lastError)) {
    throw new Error(
      `Connection refused: ${url} - is the server running?`,
    );
  }
  if (isTimeoutError(lastError)) {
    throw new Error(
      `Request timed out after ${opts.timeout ?? 15_000}ms: ${url}`,
    );
  }
  if (isTlsError(lastError)) {
    throw new Error(
      `TLS certificate error for ${url} - try: cipwe audit <url> --insecure`,
    );
  }
  if (lastError instanceof Error) {
    // Re-throw with the root cause message instead of generic "fetch failed"
    const rootMsg = getRootMessage(lastError);
    if (rootMsg !== lastError.message) {
      throw new Error(rootMsg);
    }
    throw lastError;
  }

  throw new Error(`Failed to fetch ${url}`);
}

/**
 * Try to fetch a resource, return null if it doesn't exist.
 * Inherits the same TLS / retry resilience as fetchUrl.
 */
export async function tryFetchUrl(
  url: string,
  opts: FetchOptions = {},
): Promise<string | null> {
  try {
    // Ensure env-level flag persists across parallel requests
    if (opts.insecure || tlsFallbackActive) {
      enableInsecureTls();
    }

    const res = await doFetch(url, opts);

    if (!res.ok) return null;

    return await res.text();
  } catch {
    return null;
  }
}
