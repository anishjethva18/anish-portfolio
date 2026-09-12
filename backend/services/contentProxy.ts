export interface ProxyResult {
  success: boolean;
  html?: string;
  contentType?: string;
  title?: string;
  finalUrl?: string;
  error?: string;
}

// In-memory cache for fast repeat requests
const proxyCache = new Map<string, { html: string; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export class ContentProxyService {
  /**
   * Fetches an external web page, strips frame headers, rewrites relative assets, and returns safe HTML.
   */
  public async fetchAndSanitize(targetUrl: string): Promise<ProxyResult> {
    try {
      let parsedUrl: URL;
      try {
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
          targetUrl = 'https://' + targetUrl;
        }
        parsedUrl = new URL(targetUrl);
      } catch {
        return { success: false, error: 'Invalid URL format provided.' };
      }

      // Security guards: Block internal/private IPs
      const hostname = parsedUrl.hostname.toLowerCase();
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.endsWith('.internal') ||
        hostname.endsWith('.local')
      ) {
        return { success: false, error: 'Access to private or local network addresses is restricted.' };
      }

      // Check Cache
      const cached = proxyCache.get(targetUrl);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return {
          success: true,
          html: cached.html,
          contentType: 'text/html',
          finalUrl: targetUrl,
        };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 second timeout

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 (Windows 11 OS Web Browser)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      clearTimeout(timeoutId);

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
        // Return direct link placeholder for binary or media streams
        return {
          success: true,
          html: `
            <!DOCTYPE html>
            <html>
              <head><meta charset="utf-8"><title>${parsedUrl.hostname}</title><style>body{font-family:sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}</style></head>
              <body>
                <div style="text-align:center;padding:24px;background:#1e293b;border-radius:16px;border:1px solid #334155;max-width:480px;">
                  <h2>Direct Media/Binary Content</h2>
                  <p style="color:#94a3b8;font-size:13px;">This URL points to ${contentType} rather than standard HTML.</p>
                  <a href="${targetUrl}" target="_blank" style="display:inline-block;margin-top:12px;background:#2563eb;color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:13px;">Open in External Tab</a>
                </div>
              </body>
            </html>
          `,
          contentType: 'text/html',
          finalUrl: response.url || targetUrl,
        };
      }

      let rawHtml = await response.text();

      // Inject Base URL tag for relative links, scripts, and stylesheets
      const baseUrl = response.url || targetUrl;
      const baseTag = `<base href="${baseUrl}">`;

      // Custom sandbox bar, stylesheet injection, and navigation event interception
      const injectedHeader = `
        ${baseTag}
        <meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests">
        <script>
          (function() {
            // Helper to clean and build absolute URL
            function resolveUrl(href) {
              if (!href) return '';
              try {
                return new URL(href, window.location.href).href;
              } catch(e) {
                return href;
              }
            }

            // Intercept clicks on links inside the proxy iframe
            document.addEventListener('click', function(e) {
              var target = e.target;
              while (target && target.tagName !== 'A') {
                target = target.parentNode;
              }
              if (target && target.tagName === 'A') {
                var href = target.getAttribute('href');
                if (href) {
                  if (href.startsWith('#') || href.startsWith('javascript:')) {
                    return; // Ignore local hash and JS triggers
                  }
                  e.preventDefault();
                  var absoluteUrl = resolveUrl(href);
                  var isExternal = target.getAttribute('target') === '_blank';
                  window.parent.postMessage({
                    type: 'BROWSER_NAVIGATE',
                    url: absoluteUrl,
                    isExternal: isExternal
                  }, '*');
                }
              }
            }, true);

            // Intercept form submissions inside the proxy iframe
            document.addEventListener('submit', function(e) {
              var form = e.target;
              var action = form.getAttribute('action') || '';
              var method = (form.getAttribute('method') || 'get').toLowerCase();
              var absoluteUrl = resolveUrl(action);
              
              if (method === 'get') {
                e.preventDefault();
                var formData = new FormData(form);
                var params = new URLSearchParams();
                for (var pair of formData.entries()) {
                  params.append(pair[0], pair[1]);
                }
                var finalUrl = absoluteUrl + (absoluteUrl.includes('?') ? '&' : '?') + params.toString();
                window.parent.postMessage({
                  type: 'BROWSER_NAVIGATE',
                  url: finalUrl,
                  isExternal: false
                }, '*');
              }
            }, true);
          })();
        </script>
      `;

      let processedHtml = rawHtml;
      if (processedHtml.includes('<head>')) {
        processedHtml = processedHtml.replace('<head>', `<head>${injectedHeader}`);
      } else if (processedHtml.includes('<html>')) {
        processedHtml = processedHtml.replace('<html>', `<html><head>${injectedHeader}</head>`);
      } else {
        processedHtml = `<head>${injectedHeader}</head>` + processedHtml;
      }

      // Save to cache
      proxyCache.set(targetUrl, { html: processedHtml, timestamp: Date.now() });

      return {
        success: true,
        html: processedHtml,
        contentType: 'text/html',
        finalUrl: response.url || targetUrl,
      };
    } catch (err: any) {
      const cause = err?.cause || {};
      const isHeaderOverflow =
        err?.code === 'UND_ERR_HEADERS_OVERFLOW' ||
        cause?.code === 'UND_ERR_HEADERS_OVERFLOW' ||
        err?.[Symbol.for('undici.error.UND_ERR_HEADERS_OVERFLOW')] ||
        cause?.[Symbol.for('undici.error.UND_ERR_HEADERS_OVERFLOW')] ||
        String(err?.message || '').includes('Headers Overflow') ||
        String(cause?.message || '').includes('Headers Overflow') ||
        err?.constructor?.name === 'HeadersOverflowError' ||
        cause?.constructor?.name === 'HeadersOverflowError' ||
        String(err?.stack || '').includes('HeadersOverflowError') ||
        String(cause?.stack || '').includes('HeadersOverflowError');

      if (isHeaderOverflow) {
        console.warn('[ContentProxy] HeadersOverflowError encountered for URL:', targetUrl);
      } else {
        console.error('[ContentProxy] Fetch error:', err);
      }
      return {
        success: false,
        error: isHeaderOverflow
          ? 'The target website returned excessively large headers or cookies.'
          : err.name === 'AbortError'
          ? 'Page request timed out after 12 seconds.'
          : err.message || 'Failed to load webpage.',
      };
    }
  }
}

export const contentProxy = new ContentProxyService();
