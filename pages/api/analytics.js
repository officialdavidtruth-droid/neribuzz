/**
 * Simple in-memory analytics.
 * Resets on Vercel cold-start (serverless).
 * For persistent data → enable Vercel Analytics in your Vercel dashboard (free).
 */
const store = { byDay:{}, byCategory:{}, byArticle:{} };

export default function handler(req, res) {
  res.setHeader("Cache-Control","no-store");

  if (req.method === "POST") {
    const { type, category, articleId, articleTitle } = req.body || {};
    const today = new Date().toISOString().slice(0,10);

    if (type === "pageview") {
      store.byDay[today] = (store.byDay[today]||0) + 1;
      if (category) store.byCategory[category] = (store.byCategory[category]||0) + 1;
    }
    if (type === "article" && articleId) {
      if (!store.byArticle[articleId]) store.byArticle[articleId] = { title: articleTitle||"", views:0 };
      store.byArticle[articleId].views++;
      if (category) store.byCategory[category] = (store.byCategory[category]||0) + 1;
    }
    return res.status(200).json({ ok: true });
  }

  const entries = Object.entries(store.byDay).sort(([a],[b])=>a.localeCompare(b));
  const last7   = entries.slice(-7);
  const total   = entries.reduce((s,[,v])=>s+v, 0);
  const today   = new Date().toISOString().slice(0,10);

  return res.status(200).json({
    totalViews:  total,
    todayViews:  store.byDay[today]||0,
    last7Days:   last7,
    byCategory:  store.byCategory,
    topArticles: Object.entries(store.byArticle)
      .sort(([,a],[,b])=>b.views-a.views)
      .slice(0,10)
      .map(([id,d])=>({ id, ...d })),
  });
}
