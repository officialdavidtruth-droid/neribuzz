import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "NeriBuzz/1.0 RSS Reader" },
  customFields: { item: ["media:content", "media:thumbnail", "content:encoded"] },
});

const FEEDS = [
  // ── Nigeria ────────────────────────────────────────────────────────────
  { url: "https://punchng.com/feed/",                                     source: "Punch",            category: "Nigeria"       },
  { url: "https://www.vanguardngr.com/feed/",                             source: "Vanguard",         category: "Nigeria"       },
  { url: "https://www.premiumtimesng.com/feed/",                          source: "Premium Times",    category: "Nigeria"       },
  { url: "https://guardian.ng/feed/",                                     source: "Guardian Nigeria", category: "Nigeria"       },
  { url: "https://thenationonlineng.net/feed/",                           source: "The Nation",       category: "Nigeria"       },
  { url: "https://dailytrust.com/feed/",                                  source: "Daily Trust",      category: "Nigeria"       },
  // ── International ──────────────────────────────────────────────────────
  { url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml",           source: "BBC Africa",       category: "International" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml",                    source: "Al Jazeera",       category: "International" },
  { url: "https://feeds.bbci.co.uk/news/world/rss.xml",                  source: "BBC World",        category: "International" },
  { url: "https://feeds.reuters.com/reuters/topNews",                     source: "Reuters",          category: "International" },
  // ── Business ───────────────────────────────────────────────────────────
  { url: "https://feeds.bbci.co.uk/news/business/rss.xml",               source: "BBC Business",     category: "Business"      },
  { url: "https://www.vanguardngr.com/category/businesses/feed/",        source: "Vanguard Business",category: "Business"      },
  // ── Sports ─────────────────────────────────────────────────────────────
  { url: "https://feeds.bbci.co.uk/sport/rss.xml",                       source: "BBC Sport",        category: "Sports"        },
  { url: "https://www.espn.com/espn/rss/news",                           source: "ESPN",             category: "Sports"        },
  { url: "https://punchng.com/category/sports/feed/",                    source: "Punch Sports",     category: "Sports"        },
  // ── Entertainment ──────────────────────────────────────────────────────
  { url: "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml", source: "BBC Entertainment",category: "Entertainment" },
  { url: "https://punchng.com/category/entertainment/feed/",             source: "Punch Ents",       category: "Entertainment" },
  // ── Technology ─────────────────────────────────────────────────────────
  { url: "https://feeds.bbci.co.uk/news/technology/rss.xml",             source: "BBC Technology",   category: "Technology"    },
  { url: "https://techcabal.com/feed/",                                  source: "TechCabal",        category: "Technology"    },
  // ── Health ─────────────────────────────────────────────────────────────
  { url: "https://feeds.bbci.co.uk/news/health/rss.xml",                 source: "BBC Health",       category: "Health"        },
  // ── Politics ───────────────────────────────────────────────────────────
  { url: "https://punchng.com/category/politics/feed/",                  source: "Punch Politics",   category: "Politics"      },
  { url: "https://www.vanguardngr.com/category/politics/feed/",          source: "Vanguard Politics",category: "Politics"      },
];

function stripHtml(s = "") {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function timeAgo(dateStr) {
  if (!dateStr) return "Recently";
  const d = new Date(dateStr);
  if (isNaN(d)) return "Recently";
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

async function parseFeed(feed) {
  const parsed = await parser.parseURL(feed.url);
  return parsed.items.slice(0, 10).map((item) => {
    const rawDesc =
      item["content:encoded"] ||
      item.content ||
      item.contentSnippet ||
      item.summary ||
      "";
    const excerpt = stripHtml(rawDesc).slice(0, 240) || `Read more at ${feed.source}.`;
    const pubDate = item.pubDate || item.isoDate || new Date().toISOString();

    return {
      id:        item.guid || item.link || Math.random().toString(),
      title:     stripHtml(item.title || ""),
      excerpt,
      source:    feed.source,
      sourceUrl: item.link || "",
      category:  feed.category,
      timeAgo:   timeAgo(pubDate),
      pubDate,
      isBreaking:false,
    };
  }).filter((n) => n.title && n.sourceUrl);
}

export default async function handler(req, res) {
  // Cache for 30 minutes on Vercel's CDN edge
  res.setHeader("Cache-Control", "s-maxage=1800, stale-while-revalidate=3600");

  const results = await Promise.allSettled(FEEDS.map(parseFeed));

  const feedLog = results.map((r, i) => ({
    source: FEEDS[i].source,
    ok:     r.status === "fulfilled",
    count:  r.status === "fulfilled" ? r.value.length : 0,
    error:  r.status === "rejected"  ? r.reason?.message : null,
  }));

  let news = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value)
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

  // Tag the most recent stories (within 3 hours) as Breaking
  const cutoff = Date.now() - 3 * 3600000;
  let bc = 0;
  news = news.map((n) => {
    if (bc < 5 && new Date(n.pubDate).getTime() > cutoff) {
      bc++;
      return { ...n, isBreaking: true };
    }
    return n;
  });

  res.status(200).json({ news, feedLog });
}
