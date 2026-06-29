// pages/api/news.js
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; NeriBuzz/3.0; +https://neribuzz.vercel.app)",
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
  },
  customFields: {
    item: ["media:content","media:thumbnail","media:group","content:encoded","enclosure"],
  },
});

// Updated feeds with more reliable sources
const FEEDS = [
  // ── Nigeria ────────────────────────────────────────────────
  { url: "https://punchng.com/feed/",              source: "Punch",         category: "Nigeria" },
  { url: "https://www.vanguardngr.com/feed/",      source: "Vanguard",      category: "Nigeria" },
  { url: "https://www.premiumtimesng.com/feed/",   source: "Premium Times", category: "Nigeria" },
  { url: "https://www.channelstv.com/feed/",       source: "Channels TV",   category: "Nigeria" },
  { url: "https://www.thecable.ng/feed",           source: "The Cable",     category: "Nigeria" },
  // ── International ──────────────────────────────────────────
  { url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml", source: "BBC Africa",  category: "International" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml",         source: "BBC World",   category: "International" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml",           source: "Al Jazeera",  category: "International" },
  // ── Business ───────────────────────────────────────────────
  { url: "https://feeds.bbci.co.uk/news/business/rss.xml",      source: "BBC Business",category: "Business" },
  // ── Sports ─────────────────────────────────────────────────
  { url: "https://feeds.bbci.co.uk/sport/rss.xml",              source: "BBC Sport",   category: "Sports" },
  { url: "https://punchng.com/category/sports/feed/",           source: "Punch Sports",category: "Sports" },
  // ── Entertainment ──────────────────────────────────────────
  { url: "https://punchng.com/category/entertainment/feed/",    source: "Punch Entertainment",category: "Entertainment" },
  { url: "https://www.vanguardngr.com/category/entertainment/feed/", source: "Vanguard Entertainment",category: "Entertainment" },
  // ── Technology ─────────────────────────────────────────────
  { url: "https://feeds.bbci.co.uk/news/technology/rss.xml",    source: "BBC Technology",category: "Technology" },
  { url: "https://techcabal.com/feed/",                         source: "TechCabal",   category: "Technology" },
  // ── Politics ───────────────────────────────────────────────
  { url: "https://www.vanguardngr.com/category/politics/feed/", source: "Vanguard Politics",category: "Politics" },
  // ── Health ─────────────────────────────────────────────────
  { url: "https://www.vanguardngr.com/category/health/feed/",   source: "Vanguard Health",category: "Health" },
  { url: "https://punchng.com/category/health/feed/",           source: "Punch Health",category: "Health" },
];

// Backup image if none found
const FALLBACK_IMAGES = {
  "Punch": "https://punchng.com/wp-content/uploads/2024/01/punch-logo.png",
  "Vanguard": "https://www.vanguardngr.com/wp-content/uploads/2021/08/vanguard-logo.png",
  "BBC Africa": "https://www.bbc.co.uk/news/special/2015/newsspec_10828/bbc_news_logo.png?cb=1",
  "Al Jazeera": "https://www.aljazeera.com/favicon.ico",
};

function extractImage(item) {
  // Try all possible image sources
  const sources = [
    () => item["media:content"]?.$?.url,
    () => item["media:content"]?.[0]?.$?.url,
    () => item["media:thumbnail"]?.$?.url,
    () => item["media:thumbnail"]?.[0]?.$?.url,
    () => item["media:group"]?.["media:content"]?.$?.url,
    () => item["media:group"]?.["media:content"]?.[0]?.$?.url,
    () => item.enclosure?.url,
    () => {
      const html = item["content:encoded"] || item.content || item.description || "";
      const match = html.match(/<img[^>]+src=["']([^"']+\.(?:jpg|jpeg|png|webp|gif)(\?[^"']*)?)[^"']*["']/i);
      return match?.[1];
    },
    () => item["media:thumbnail"]?.url,
  ];
  
  for (const fn of sources) {
    try {
      const url = fn();
      if (url && typeof url === "string" && url.startsWith("http")) return url;
    } catch {}
  }
  return null;
}

function stripHtml(s = "") {
  return s.replace(/<[^>]+>/g,"").replace(/&amp;/g,"&").replace(/&quot;/g,'"')
    .replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&nbsp;/g," ")
    .replace(/&#\d+;/g,"").replace(/\s+/g," ").trim();
}

function timeAgo(str) {
  if (!str) return "Recently";
  const d = new Date(str); 
  if (isNaN(d)) return "Recently";
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff/60000);
  if (m<1) return "Just now"; 
  if (m<60) return `${m}m ago`;
  const h = Math.floor(m/60);
  if (h<24) return `${h}h ago`; 
  return `${Math.floor(h/24)}d ago`;
}

// Parse a single feed with retry
async function parseFeed(feed, retries = 2) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await Promise.race([
        parser.parseURL(feed.url),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 15000)),
      ]);
      
      const items = (result.items || []).slice(0, 12).map(item => {
        const rawDesc = item["content:encoded"] || item.content || item.contentSnippet || item.summary || "";
        const excerpt = stripHtml(rawDesc).slice(0, 260) || `Read more at ${feed.source}.`;
        const pubDate = item.pubDate || item.isoDate || new Date().toISOString();
        const imageUrl = extractImage(item);
        
        return {
          id: item.guid || item.link || `${feed.source}-${Date.now()}-${Math.random()}`,
          title: stripHtml(item.title || ""),
          excerpt: excerpt || stripHtml(item.title || ""),
          source: feed.source,
          sourceUrl: item.link || "",
          category: feed.category,
          timeAgo: timeAgo(pubDate),
          pubDate,
          image: imageUrl || FALLBACK_IMAGES[feed.source] || null,
          isBreaking: false,
        };
      }).filter(n => n.title && n.sourceUrl);
      
      return items;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
      }
    }
  }
  throw lastError;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "s-maxage=1200, stale-while-revalidate=1800");
  
  // Fetch all feeds in parallel with individual timeouts
  const results = await Promise.allSettled(
    FEEDS.map(feed => parseFeed(feed))
  );
  
  const feedLog = results.map((r, i) => ({
    source: FEEDS[i].source,
    ok: r.status === "fulfilled",
    count: r.status === "fulfilled" ? r.value.length : 0,
    error: r.status === "rejected" ? String(r.reason?.message || "unknown error") : null,
  }));
  
  // Merge all news items
  let news = results
    .filter(r => r.status === "fulfilled")
    .flatMap(r => r.value)
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  
  // Remove duplicates by title (keep first occurrence)
  const seen = new Set();
  news = news.filter(n => {
    const key = n.title.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  // Mark breaking news (last 6 hours, up to 8 items)
  const cutoff = Date.now() - 6 * 3600000;
  let breakCount = 0;
  news = news.map(n => {
    if (breakCount < 8 && new Date(n.pubDate).getTime() > cutoff) {
      breakCount++;
      return { ...n, isBreaking: true };
    }
    return n;
  });
  
  res.status(200).json({ news, feedLog });
}