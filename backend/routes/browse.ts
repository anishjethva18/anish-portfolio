import { Router, Request, Response } from 'express';
import { contentProxy } from '../services/contentProxy';
import { searchService } from '../services/searchService';
import { geminiSearchService } from '../services/geminiSearchService';

export const browseRouter = Router();

// GET /api/browse/gemini-search?q=<query>
browseRouter.get('/gemini-search', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  if (!query.trim()) {
    return res.json({
      query: '',
      organicResults: [],
      videos: [],
      news: [],
      images: [],
      peopleAlsoAsk: [],
      relatedSearches: [],
    });
  }

  try {
    const data = await geminiSearchService.searchWeb(query);
    res.json({ success: true, ...data });
  } catch (err: any) {
    console.warn('[browseRouter] gemini-search handled error:', err?.message || err);
    // Fallback to local search index
    const fallbackResults = await searchService.search(query);
    res.json({
      success: true,
      query,
      organicResults: fallbackResults,
      videos: [],
      news: [],
      images: [],
      peopleAlsoAsk: [],
      relatedSearches: [],
    });
  }
});

// GET /api/browse/youtube?q=<query>&category=<category>
browseRouter.get('/youtube', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const category = (req.query.category as string) || 'All';

  try {
    const videos = await geminiSearchService.searchYouTube(query, category);
    res.json({ success: true, query, category, count: videos.length, videos });
  } catch (err: any) {
    console.warn('[browseRouter] youtube handled error:', err?.message || err);
    res.json({ success: true, query, category, count: 0, videos: [] });
  }
});

// GET /api/browse/proxy?url=<target_url>
browseRouter.get('/proxy', async (req: Request, res: Response) => {
  const targetUrl = req.query.url as string;
  if (!targetUrl) {
    return res.status(400).send('Missing "url" query parameter.');
  }

  const result = await contentProxy.fetchAndSanitize(targetUrl);
  if (!result.success || !result.html) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Proxy Error</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; display: flex; justify-content: center; align-items: center; min-height: 80vh; margin: 0; }
            .card { background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; max-width: 540px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.5); text-align: center; }
            h2 { color: #f87171; margin-top: 0; font-size: 18px; }
            p { color: #94a3b8; line-height: 1.6; font-size: 13px; }
            .btn { display: inline-block; margin-top: 16px; background: #2563eb; color: #fff; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 13px; }
            .btn:hover { background: #1d4ed8; }
            code { background: #0f172a; padding: 2px 6px; border-radius: 4px; color: #38bdf8; font-size: 12px; }
          </style>
          <script>
            function sendErr() {
              try {
                window.parent.postMessage({
                  type: 'BROWSER_PROXY_ERROR',
                  error: ${JSON.stringify(result.error || 'Host unreachable or refusing proxy connection.')},
                  url: ${JSON.stringify(targetUrl)}
                }, '*');
              } catch(e) {}
            }
            sendErr();
            window.addEventListener('load', sendErr);
          </script>
        </head>
        <body>
          <div class="card">
            <h2>⚠️ Unable to Connect to Web Page</h2>
            <p>The Edge proxy was unable to fetch content from <code>${targetUrl}</code>.</p>
            <p><strong>Reason:</strong> ${result.error || 'Host unreachable or refusing proxy connection.'}</p>
            <a href="${targetUrl}" target="_blank" class="btn" rel="noreferrer">Open in New Browser Window ↗</a>
          </div>
        </body>
      </html>
    `);
  }

  res.setHeader('Content-Type', result.contentType || 'text/html; charset=utf-8');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.send(result.html);
});

// GET /api/browse/search?q=<query>
browseRouter.get('/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  if (!query.trim()) {
    return res.json({ query: '', results: [] });
  }

  try {
    const results = await searchService.search(query);
    res.json({ query, count: results.length, results });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Search service error' });
  }
});

// GET /api/browse/news
browseRouter.get('/news', async (req: Request, res: Response) => {
  try {
    const news = await searchService.getTechNews();
    res.json({ success: true, count: news.length, news });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'News service error' });
  }
});

// GET /api/browse/wikipedia?title=<title>
browseRouter.get('/wikipedia', async (req: Request, res: Response) => {
  const title = req.query.title as string;
  if (!title) {
    return res.status(400).json({ error: 'Title required' });
  }

  const summary = await searchService.getWikipediaSummary(title);
  if (!summary) {
    return res.status(404).json({ error: 'Wikipedia article not found' });
  }
  res.json(summary);
});
