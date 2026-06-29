import { useState, useEffect, useCallback } from "react";
import {
  ExternalLink, RefreshCw, Menu, X, Clock, Shield, Edit3,
  Trash2, Plus, LogOut, BarChart2, FileText, Tag, ChevronRight,
  Globe, AlertCircle, CheckCircle, Wifi, WifiOff, Settings,
} from "lucide-react";

/* ─── Design tokens — Black + Cyan ─────────────────────────────────── */
const C = {
  page:       "#08090D",
  card:       "#0D1117",
  cardHover:  "#111826",
  nav:        "#040507",
  navBorder:  "#0F1520",
  cyan:       "#22D3EE",
  cyanDim:    "#0891B2",
  cyanGlow:   "rgba(34,211,238,0.12)",
  cyanBorder: "rgba(34,211,238,0.25)",
  white:      "#F1F5F9",
  text:       "#CBD5E1",
  textMid:    "#64748B",
  textFaint:  "#2A3A4E",
  border:     "#1A2535",
  borderHi:   "#263548",
  red:        "#F87171",
  redSolid:   "#EF4444",
  green:      "#34D399",
};

/* ─── Source accent colors ──────────────────────────────────────────── */
const SRC = {
  "Punch":             "#E53935",
  "Vanguard":          "#1E88E5",
  "Premium Times":     "#1565C0",
  "Guardian Nigeria":  "#43A047",
  "The Nation":        "#F9A825",
  "Daily Trust":       "#8E24AA",
  "BBC Africa":        "#D32F2F",
  "BBC World":         "#D32F2F",
  "BBC Business":      "#D32F2F",
  "BBC Sport":         "#C62828",
  "BBC Entertainment": "#D32F2F",
  "BBC Technology":    "#D32F2F",
  "BBC Health":        "#D32F2F",
  "Al Jazeera":        "#E64A19",
  "Reuters":           "#FF8F00",
  "ESPN":              "#D50000",
  "Punch Sports":      "#E53935",
  "Punch Ents":        "#E53935",
  "Punch Politics":    "#E53935",
  "Vanguard Business": "#1E88E5",
  "Vanguard Politics": "#1E88E5",
  "TechCabal":         "#00ACC1",
  "NeriBuzz Blog":     "#22D3EE",
};

const DEF_CATS = ["Nigeria","International","Business","Sports","Entertainment","Technology","Health","Politics"];
const serif    = '"Playfair Display", Georgia, serif';

/* ─── Helpers ───────────────────────────────────────────────────────── */
const lsGet = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const lsSet = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ─── Skeleton ──────────────────────────────────────────────────────── */
function Skeleton() {
  const s = { background: "#1A2535", borderRadius: 4 };
  return (
    <div className="nb-shimmer" style={{ background: C.card, borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
      <div style={{ height: 160, background: "#0A0F18" }} />
      <div style={{ padding: 18 }}>
        <div style={{ ...s, height: 10, width: "28%", marginBottom: 14 }} />
        <div style={{ ...s, height: 16, width: "95%", marginBottom: 8  }} />
        <div style={{ ...s, height: 16, width: "80%", marginBottom: 20 }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ ...s, height: 22, width: 64, borderRadius: 20 }} />
          <div style={{ ...s, height: 30, width: 96, borderRadius: 8  }} />
        </div>
      </div>
    </div>
  );
}

/* ─── Source badge ──────────────────────────────────────────────────── */
function SourceBadge({ source }) {
  return (
    <span style={{
      background: SRC[source] || "#334155",
      color: "#fff", fontSize: 10, fontWeight: 700,
      padding: "2px 8px", borderRadius: 4,
      letterSpacing: 0.7, textTransform: "uppercase", flexShrink: 0,
    }}>
      {source}
    </span>
  );
}

/* ─── News card (with optional image) ──────────────────────────────── */
function NewsCard({ item, blog = false }) {
  const url    = item.sourceUrl || item.url || "#";
  const accent = blog ? C.cyan : (SRC[item.source] || "#334155");

  return (
    <div className="nb-card nb-fade" style={{
      background: C.card, borderRadius: 12,
      border: `1px solid ${C.border}`,
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      {/* Image */}
      {item.image && (
        <div className="nb-img-wrap" style={{ height: 185, overflow: "hidden", position: "relative", background: "#040608", flexShrink: 0 }}>
          <img
            src={item.image} alt=""
            referrerPolicy="no-referrer"
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={e => { e.target.parentElement.style.display = "none"; }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(13,17,23,.85) 0%, transparent 60%)" }} />
          {item.isBreaking && (
            <span style={{
              position: "absolute", top: 10, left: 10,
              background: C.redSolid, color: "#fff",
              fontSize: 9, fontWeight: 800, padding: "3px 7px",
              borderRadius: 3, letterSpacing: 1,
            }}>● BREAKING</span>
          )}
          <span style={{
            position: "absolute", bottom: 10, left: 10,
            background: "rgba(0,0,0,.7)", color: C.text,
            fontSize: 10, padding: "2px 8px", borderRadius: 20, backdropFilter: "blur(4px)",
          }}>{item.category}</span>
        </div>
      )}

      {/* Accent line */}
      <div style={{ height: 2, background: accent, flexShrink: 0 }} />

      {/* Content */}
      <div style={{ padding: "15px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <SourceBadge source={item.source} />
          {item.isBreaking && !item.image && (
            <span style={{ fontSize: 9, fontWeight: 800, color: C.red, border: `1px solid ${C.red}`, padding: "1px 6px", borderRadius: 3, letterSpacing: 1 }}>● BREAKING</span>
          )}
          {blog && (
            <span style={{ fontSize: 9, fontWeight: 800, color: C.cyan, border: `1px solid ${C.cyanBorder}`, padding: "1px 6px", borderRadius: 3, letterSpacing: 1 }}>✦ BLOG</span>
          )}
          <span style={{ fontSize: 11, color: C.textMid, marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={11} />{item.timeAgo}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.white, lineHeight: 1.45, fontFamily: serif }}>
          {item.title}
        </h3>

        {/* Excerpt — show less if image present */}
        {!item.image && (
          <p style={{ margin: 0, fontSize: 13, color: C.text, lineHeight: 1.65, flex: 1 }}>
            {item.excerpt.length > 110 ? item.excerpt.slice(0, 110) + "…" : item.excerpt}
          </p>
        )}

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: item.image ? 4 : 8 }}>
          {!item.image && (
            <span style={{ fontSize: 11, color: C.textMid, background: "rgba(255,255,255,.04)", padding: "3px 10px", borderRadius: 20, border: `1px solid ${C.border}` }}>
              {item.category}
            </span>
          )}
          {item.image && <span />}
          <a
            href={url} target="_blank" rel="noopener noreferrer"
            className="nb-btn"
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: C.cyan, textDecoration: "none", padding: "6px 14px", borderRadius: 7, border: `1px solid ${C.cyanBorder}`, background: C.cyanGlow }}
            onMouseEnter={e => { e.currentTarget.style.background = C.cyan; e.currentTarget.style.color = "#040507"; e.currentTarget.style.borderColor = C.cyan; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.cyanGlow; e.currentTarget.style.color = C.cyan; e.currentTarget.style.borderColor = C.cyanBorder; }}
          >
            Read More <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero card ─────────────────────────────────────────────────────── */
function HeroCard({ item }) {
  const url = item.sourceUrl || item.url || "#";
  return (
    <div style={{ position: "relative", borderRadius: 16, overflow: "hidden", minHeight: 420, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
      {/* Background image */}
      {item.image && (
        <img src={item.image} alt="" referrerPolicy="no-referrer"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
          onError={e => { e.target.style.display = "none"; }}
        />
      )}
      {/* Fallback bg */}
      {!item.image && (
        <div style={{ position: "absolute", inset: 0, zIndex: 0, background: "linear-gradient(135deg, #0A0F18 0%, #061530 55%, #04111F 100%)" }}>
          <div style={{ position: "absolute", top: 0, left: "32%", width: 1, height: "100%", background: "linear-gradient(to bottom, transparent, rgba(34,211,238,.12), transparent)" }} />
          <div style={{ position: "absolute", top: 0, right: "18%", width: 1, height: "100%", background: "linear-gradient(to bottom, transparent, rgba(34,211,238,.07), transparent)" }} />
          <div style={{ position: "absolute", bottom: -80, right: -80, width: 320, height: 320, borderRadius: "50%", border: "1px solid rgba(34,211,238,.07)" }} />
        </div>
      )}
      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: item.image
          ? "linear-gradient(to top, rgba(4,5,7,.97) 0%, rgba(4,5,7,.65) 45%, rgba(4,5,7,.18) 100%)"
          : "rgba(4,5,7,.35)",
      }} />
      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, padding: "clamp(24px,5vw,48px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
          <span style={{ background: C.cyan, color: "#040507", fontSize: 11, fontWeight: 900, padding: "5px 12px", borderRadius: 5, letterSpacing: 1 }}>TOP STORY</span>
          {item.isBreaking && (
            <span style={{ color: C.red, fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="nb-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: C.red, display: "inline-block" }} />
              BREAKING NEWS
            </span>
          )}
          <SourceBadge source={item.source} />
        </div>
        <h2 style={{ margin: "0 0 14px", fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 900, color: C.white, lineHeight: 1.25, fontFamily: serif, maxWidth: 740 }}>
          {item.title}
        </h2>
        <p style={{ margin: "0 0 26px", fontSize: 15, color: "rgba(203,213,225,.8)", lineHeight: 1.7, maxWidth: 640 }}>
          {item.excerpt.length > 200 ? item.excerpt.slice(0, 200) + "…" : item.excerpt}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <a href={url} target="_blank" rel="noopener noreferrer" className="nb-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.cyan, color: "#040507", padding: "12px 26px", borderRadius: 9, fontWeight: 700, fontSize: 14, textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
            Read Full Story <ExternalLink size={14} />
          </a>
          <span style={{ color: "rgba(203,213,225,.45)", fontSize: 12, display: "flex", alignItems: "center", gap: 5 }}>
            <Clock size={12} /> {item.timeAgo}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Breaking ticker ───────────────────────────────────────────────── */
function BreakingTicker({ items }) {
  const breaking = items.filter(n => n.isBreaking);
  if (!breaking.length) return null;
  const doubled = [...breaking, ...breaking];
  return (
    <div style={{ background: "#0A0C10", borderBottom: `1px solid ${C.border}`, overflow: "hidden", display: "flex", alignItems: "center", height: 38 }}>
      <div style={{ background: C.redSolid, padding: "0 16px", fontSize: 10, fontWeight: 900, color: "#fff", height: "100%", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, letterSpacing: 1.5 }}>
        <span className="nb-pulse" style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
        BREAKING
      </div>
      <div style={{ width: 1, height: "100%", background: "#1A2535", flexShrink: 0 }} />
      <div style={{ flex: 1, overflow: "hidden", display: "flex", alignItems: "center" }}>
        <div className="nb-ticker">
          {doubled.map((it, i) => (
            <span key={i} style={{ padding: "0 32px", fontSize: 12, color: C.text, fontWeight: 500 }}>
              {it.title}
              <span style={{ marginLeft: 32, color: C.textFaint }}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Header (NO admin button) ──────────────────────────────────────── */
function Header({ categories, activeCat, onCat, onHome, mobileOpen, onMobile }) {
  return (
    <header style={{ background: C.nav, borderBottom: `1px solid ${C.navBorder}`, position: "sticky", top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
        {/* Logo */}
        <div onClick={onHome} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 1, userSelect: "none" }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: C.white, letterSpacing: -1, fontFamily: serif }}>Neri</span>
          <span style={{ fontSize: 26, fontWeight: 900, color: C.cyan,  letterSpacing: -1, fontFamily: serif }}>Buzz</span>
          <span style={{
            marginLeft: 10, fontSize: 9, fontWeight: 700, color: C.cyan,
            background: C.cyanGlow, border: `1px solid ${C.cyanBorder}`,
            padding: "2px 7px", borderRadius: 4, letterSpacing: 1.5, alignSelf: "center",
          }}>NIGERIA</span>
        </div>
        {/* Mobile toggle */}
        <button onClick={onMobile} className="nb-btn"
          style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.text, cursor: "pointer", padding: "6px 8px", borderRadius: 7, display: "flex" }}>
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {/* Category nav */}
      <div style={{ borderTop: `1px solid ${C.navBorder}`, overflowX: "auto" }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 20px", display: "flex" }}>
          {["All", ...categories].map(cat => (
            <button key={cat} onClick={() => onCat(cat)} className="nb-btn"
              style={{
                padding: "10px 16px", background: "transparent", border: "none",
                borderBottom: activeCat === cat ? `2px solid ${C.cyan}` : "2px solid transparent",
                color: activeCat === cat ? C.cyan : C.textMid,
                fontSize: 13, fontWeight: activeCat === cat ? 700 : 500,
                cursor: "pointer", whiteSpace: "nowrap",
              }}>
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ─── Section heading ───────────────────────────────────────────────── */
function SectionHead({ title, count, onRefresh, loading }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ width: 3, height: 24, background: C.cyan, borderRadius: 2, display: "inline-block" }} />
        <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: C.white, fontFamily: serif }}>{title}</h2>
        {count != null && (
          <span style={{ fontSize: 11, color: C.textMid, background: "rgba(255,255,255,.04)", padding: "2px 9px", borderRadius: 20, border: `1px solid ${C.border}` }}>
            {count}
          </span>
        )}
      </div>
      {onRefresh && (
        <button onClick={onRefresh} disabled={loading} className="nb-btn"
          style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${C.border}`, color: C.textMid, padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .6 : 1 }}>
          <RefreshCw size={13} className={loading ? "nb-spin" : ""} /> Refresh
        </button>
      )}
    </div>
  );
}

/* ─── News grid ─────────────────────────────────────────────────────── */
function NewsGrid({ items, loading }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(295px,1fr))", gap: 18 }}>
      {loading
        ? [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} />)
        : items.map((it, i) => <NewsCard key={it.id || `b${i}`} item={it} blog={!!it.isBlog} />)
      }
    </div>
  );
}

/* ─── Home view ─────────────────────────────────────────────────────── */
function HomeView({ news, blogPosts, categories, onCatSelect, onRefresh, loading, lastRefresh, errorCount }) {
  const hero  = news.find(n => n.isBreaking) || news[0];
  const rest  = news.filter(n => n !== hero);
  const blogs = blogPosts.map(p => ({ ...p, isBlog: true }));
  const top   = [...rest, ...blogs].slice(0, 6);

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "28px 20px 60px" }}>
      {/* Status bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
        <span style={{ fontSize: 12, color: C.textMid, display: "flex", alignItems: "center", gap: 6 }}>
          <Clock size={13} />
          {loading ? "Fetching live headlines…" : `${news.length} live stories · ${lastRefresh.toLocaleTimeString()}`}
        </span>
        <button onClick={onRefresh} disabled={loading} className="nb-btn"
          style={{ display: "flex", alignItems: "center", gap: 7, background: C.cyanGlow, border: `1px solid ${C.cyanBorder}`, color: C.cyan, padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1 }}>
          <RefreshCw size={13} className={loading ? "nb-spin" : ""} />
          {loading ? "Loading…" : "Refresh Feed"}
        </button>
      </div>

      {/* Error notice */}
      {errorCount > 0 && !loading && (
        <div style={{ background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, padding: "10px 16px", marginBottom: 22, fontSize: 13, color: C.red, display: "flex", alignItems: "center", gap: 8 }}>
          <AlertCircle size={14} /> {errorCount} feed{errorCount > 1 ? "s" : ""} unavailable — some stories may be missing.
        </div>
      )}

      {/* Hero */}
      {loading ? (
        <div className="nb-shimmer" style={{ background: "#0A0F18", borderRadius: 16, height: 420, marginBottom: 36 }} />
      ) : hero ? (
        <div style={{ marginBottom: 36 }}><HeroCard item={hero} /></div>
      ) : null}

      {/* Top stories */}
      <div style={{ marginBottom: 48 }}>
        <SectionHead title="Top Stories" count={loading ? null : top.length} />
        <NewsGrid items={top} loading={loading} />
      </div>

      {/* Category sections */}
      {!loading && categories.map(cat => {
        const catItems = [
          ...news.filter(n => n.category === cat).slice(0, 3),
          ...blogs.filter(b => b.category === cat).slice(0, 1),
        ].slice(0, 3);
        if (!catItems.length) return null;
        return (
          <div key={cat} style={{ marginBottom: 48 }}>
            <SectionHead title={cat} count={catItems.length} />
            <NewsGrid items={catItems} />
            <button onClick={() => onCatSelect(cat)} className="nb-btn"
              style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${C.border}`, color: C.textMid, padding: "9px 18px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
              More {cat} stories <ChevronRight size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Category view ─────────────────────────────────────────────────── */
function CategoryView({ cat, news, blogPosts, onBack, onRefresh, loading, lastRefresh }) {
  const blogs = blogPosts.map(p => ({ ...p, isBlog: true }));
  const items = cat === "All"
    ? [...news, ...blogs]
    : [...news.filter(n => n.category === cat), ...blogs.filter(b => b.category === cat)];

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto", padding: "28px 20px 60px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 14 }}>
        <div>
          <button onClick={onBack} className="nb-btn"
            style={{ background: "transparent", border: "none", color: C.textMid, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginBottom: 8, padding: 0 }}>
            ← Back to Home
          </button>
          <h1 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 900, color: C.white, fontFamily: serif }}>
            {cat} <span style={{ color: C.cyan }}>News</span>
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: C.textMid }}>
            {loading ? "Fetching…" : `${items.length} stories · ${lastRefresh.toLocaleTimeString()}`}
          </p>
        </div>
        <button onClick={onRefresh} disabled={loading} className="nb-btn"
          style={{ display: "flex", alignItems: "center", gap: 7, background: C.cyanGlow, border: `1px solid ${C.cyanBorder}`, color: C.cyan, padding: "10px 20px", borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1 }}>
          <RefreshCw size={13} className={loading ? "nb-spin" : ""} /> Refresh
        </button>
      </div>
      {!loading && items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 20px", color: C.textMid }}>
          <Globe size={52} style={{ marginBottom: 18, opacity: .25 }} />
          <p style={{ fontSize: 16, margin: 0 }}>No stories in {cat} yet.</p>
        </div>
      ) : (
        <NewsGrid items={items} loading={loading} />
      )}
    </div>
  );
}

/* ─── Footer (WITH admin link) ──────────────────────────────────────── */
function Footer({ onAdmin }) {
  return (
    <footer style={{ background: C.nav, borderTop: `1px solid ${C.navBorder}`, padding: "36px 20px 28px" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        {/* Top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 28 }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: C.white, fontFamily: serif }}>Neri</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: C.cyan,  fontFamily: serif }}>Buzz</span>
            </div>
            <p style={{ margin: 0, fontSize: 13, color: C.textMid, maxWidth: 320, lineHeight: 1.6 }}>
              Real-time Nigerian news aggregation — pulling live headlines from Punch, Vanguard, BBC Africa, Al Jazeera and more.
            </p>
          </div>
          {/* Sources */}
          <div>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 700, color: C.textMid, letterSpacing: 1, textTransform: "uppercase" }}>News Sources</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Punch","Vanguard","Premium Times","Guardian NG","BBC Africa","Al Jazeera","Reuters","ESPN","TechCabal"].map(s => (
                <span key={s} style={{ fontSize: 11, color: C.textMid, background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`, padding: "3px 9px", borderRadius: 20 }}>{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ margin: 0, fontSize: 12, color: C.textFaint }}>
            © {new Date().getFullYear()} NeriBuzz. All headline rights belong to their respective publishers.
          </p>
          {/* Admin link — subtle, in footer only */}
          <button onClick={onAdmin} className="nb-btn"
            style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${C.border}`, color: C.textMid, padding: "6px 14px", borderRadius: 7, fontSize: 12, cursor: "pointer" }}>
            <Settings size={13} /> Admin Panel
          </button>
        </div>
      </div>
    </footer>
  );
}

/* ─── Admin login ───────────────────────────────────────────────────── */
function AdminLogin({ onLogin, onBack }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);

  const inp = {
    width: "100%", padding: "11px 14px",
    background: "#0A0F18", border: `1px solid ${C.border}`,
    borderRadius: 8, fontSize: 14, outline: "none",
    color: C.white, fontFamily: "inherit",
  };

  const attempt = () => {
    setBusy(true); setErr("");
    const pwd = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_ADMIN_PASSWORD) || "neribuzz2025";
    setTimeout(() => {
      if (user === "admin" && pass === pwd) { onLogin(); }
      else { setErr("Invalid username or password."); setBusy(false); }
    }, 700);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.page, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, padding: "44px 40px", width: "100%", maxWidth: 420, boxShadow: `0 32px 80px rgba(0,0,0,.6), 0 0 0 1px ${C.border}` }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 56, height: 56, background: C.cyanGlow, border: `1px solid ${C.cyanBorder}`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
            <Shield size={26} color={C.cyan} />
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.white, fontFamily: serif }}>Admin Access</h2>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: C.textMid }}>NeriBuzz Control Panel</p>
        </div>

        {err && (
          <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: C.red, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={14} /> {err}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 7, letterSpacing: .5, textTransform: "uppercase" }}>Username</label>
          <input type="text" value={user} placeholder="admin" autoComplete="username"
            onChange={e => setUser(e.target.value)} onKeyDown={e => e.key === "Enter" && attempt()} style={inp} />
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: C.textMid, display: "block", marginBottom: 7, letterSpacing: .5, textTransform: "uppercase" }}>Password</label>
          <input type="password" value={pass} placeholder="••••••••••" autoComplete="current-password"
            onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && attempt()} style={inp} />
        </div>

        <button onClick={attempt} disabled={busy} className="nb-btn"
          style={{ width: "100%", padding: 14, background: busy ? C.cyanDim : C.cyan, border: "none", borderRadius: 9, color: "#040507", fontSize: 15, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer" }}>
          {busy ? "Verifying…" : "Sign In"}
        </button>
        <button onClick={onBack} className="nb-btn"
          style={{ width: "100%", marginTop: 12, padding: 10, background: "transparent", border: "none", color: C.textMid, fontSize: 13, cursor: "pointer" }}>
          ← Back to NeriBuzz
        </button>
        <p style={{ textAlign: "center", fontSize: 11, color: C.textFaint, margin: "22px 0 0" }}>
          Default: admin / neribuzz2025 — change via Vercel env vars
        </p>
      </div>
    </div>
  );
}

/* ─── Admin dashboard ───────────────────────────────────────────────── */
function AdminDashboard({ posts, categories, news, feedLog, loading, onCreate, onDelete, onEdit, onAddCat, onRemoveCat, onLogout, onRefresh, lastRefresh, onGoHome }) {
  const [tab,     setTab]    = useState("dashboard");
  const [form,    setForm]   = useState({ title: "", excerpt: "", url: "", category: categories[0] || "Nigeria", source: "NeriBuzz Blog" });
  const [editing, setEditing]= useState(null);
  const [newCat,  setNewCat] = useState("");
  const [postMsg, setPostMsg]= useState({ text: "", ok: false });
  const [catMsg,  setCatMsg] = useState("");
  const [sidebar, setSidebar]= useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const setF = k => v => setForm(p => ({ ...p, [k]: v }));

  const darkInp = {
    width: "100%", padding: "11px 14px",
    background: "#070B10", border: `1px solid ${C.border}`,
    borderRadius: 8, fontSize: 14, outline: "none",
    color: C.white, fontFamily: "inherit",
  };

  const TABS = [
    { id: "dashboard", label: "Dashboard",  Icon: BarChart2 },
    { id: "posts",     label: "Blog Posts", Icon: FileText  },
    { id: "create",    label: "Write Post", Icon: Plus      },
    { id: "categories",label: "Categories", Icon: Tag       },
  ];

  const resetForm = () => setForm({ title: "", excerpt: "", url: "", category: categories[0] || "Nigeria", source: "NeriBuzz Blog" });

  const submitPost = () => {
    if (!form.title.trim())   { setPostMsg({ text: "Title is required.",   ok: false }); return; }
    if (!form.excerpt.trim()) { setPostMsg({ text: "Excerpt is required.", ok: false }); return; }
    if (!form.url.trim())     { setPostMsg({ text: "URL is required.",     ok: false }); return; }
    try { new URL(form.url); } catch { setPostMsg({ text: "Enter a valid URL (include https://).", ok: false }); return; }

    const p = { ...form, title: form.title.trim(), excerpt: form.excerpt.trim(), url: form.url.trim(), id: editing || Date.now(), timeAgo: "Just now", isBreaking: false, isBlog: true };
    if (editing) { onEdit(p); setPostMsg({ text: "Post updated successfully!", ok: true }); setEditing(null); }
    else         { onCreate(p); setPostMsg({ text: "Post published successfully!", ok: true }); }
    resetForm();
    setTimeout(() => setPostMsg({ text: "", ok: false }), 3500);
    setTab("posts");
  };

  const startEdit = p => {
    setEditing(p.id);
    setForm({ title: p.title, excerpt: p.excerpt, url: p.url || p.sourceUrl || "", category: p.category, source: p.source || "NeriBuzz Blog" });
    setPostMsg({ text: "", ok: false });
    setTab("create");
  };

  const confirmDelete = id => {
    if (deleteConfirm === id) { onDelete(id); setDeleteConfirm(null); }
    else { setDeleteConfirm(id); setTimeout(() => setDeleteConfirm(null), 3000); }
  };

  const addCat = () => {
    const c = newCat.trim();
    if (!c) return;
    if (categories.includes(c)) { setCatMsg("Category already exists."); return; }
    onAddCat(c); setNewCat(""); setCatMsg(`"${c}" added!`); setTimeout(() => setCatMsg(""), 3000);
  };

  const panel = { background: "#0A0E14", border: `1px solid ${C.border}`, borderRadius: 12, padding: "20px 22px", marginBottom: 18 };

  return (
    <div style={{ minHeight: "100vh", background: C.page, display: "flex", flexDirection: "column" }}>

      {/* Admin topbar */}
      <div style={{ background: C.nav, borderBottom: `1px solid ${C.navBorder}`, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setSidebar(!sidebar)} className="nb-btn"
            style={{ background: "transparent", border: "none", color: C.textMid, cursor: "pointer", padding: 4, display: "flex" }}>
            <Menu size={20} />
          </button>
          <span style={{ fontSize: 18, fontWeight: 900, color: C.white, fontFamily: serif }}>Neri<span style={{ color: C.cyan }}>Buzz</span></span>
          <span style={{ background: C.cyanGlow, border: `1px solid ${C.cyanBorder}`, color: C.cyan, fontSize: 10, padding: "3px 10px", borderRadius: 4, fontWeight: 700, letterSpacing: 1 }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onGoHome} className="nb-btn"
            style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${C.border}`, color: C.textMid, padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            ← Live Site
          </button>
          <button onClick={onRefresh} disabled={loading} className="nb-btn"
            style={{ display: "flex", alignItems: "center", gap: 6, background: C.cyanGlow, border: `1px solid ${C.cyanBorder}`, color: C.cyan, padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1 }}>
            <RefreshCw size={13} className={loading ? "nb-spin" : ""} />{loading ? "Loading…" : "Refresh Feeds"}
          </button>
          <button onClick={onLogout} className="nb-btn"
            style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.25)", color: C.red, padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Sidebar */}
        {sidebar && (
          <div style={{ width: 220, background: C.nav, borderRight: `1px solid ${C.navBorder}`, padding: "24px 0", flexShrink: 0 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className="nb-btn"
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 11, padding: "12px 20px", border: "none", cursor: "pointer",
                  background: tab === t.id ? C.cyanGlow : "transparent",
                  borderLeft: tab === t.id ? `3px solid ${C.cyan}` : "3px solid transparent",
                  color: tab === t.id ? C.cyan : C.textMid, fontSize: 14, fontWeight: tab === t.id ? 700 : 500,
                }}>
                <t.Icon size={16} /> {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Content area */}
        <div style={{ flex: 1, padding: "28px 28px", overflowY: "auto" }}>

          {/* ── Dashboard ── */}
          {tab === "dashboard" && (
            <div className="nb-fade">
              <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 800, color: C.white, fontFamily: serif }}>Dashboard</h2>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))", gap: 14, marginBottom: 22 }}>
                {[
                  { label: "Live Stories",  val: news.length,                        Icon: Globe,    col: "#38BDF8" },
                  { label: "Blog Posts",    val: posts.length,                       Icon: FileText, col: C.cyan   },
                  { label: "Feeds Online",  val: feedLog.filter(f => f.ok).length,  Icon: Wifi,     col: C.green  },
                  { label: "Feeds Failed",  val: feedLog.filter(f => !f.ok).length, Icon: WifiOff,  col: C.red    },
                ].map(s => (
                  <div key={s.label} style={{ ...panel, marginBottom: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: C.textMid, fontWeight: 600, letterSpacing: .3 }}>{s.label}</span>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: s.col + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <s.Icon size={16} color={s.col} />
                      </div>
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 900, color: C.white, lineHeight: 1 }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Feed status */}
              <div style={{ ...panel, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.white }}>RSS Feed Status</p>
                  <p style={{ margin: "5px 0 0", fontSize: 12, color: C.textMid }}>
                    Last refreshed: {lastRefresh.toLocaleTimeString()} · Auto-refreshes every hour
                  </p>
                </div>
                <button onClick={onRefresh} disabled={loading} className="nb-btn"
                  style={{ display: "flex", alignItems: "center", gap: 8, background: C.cyan, border: "none", color: "#040507", padding: "10px 22px", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .75 : 1 }}>
                  <RefreshCw size={14} className={loading ? "nb-spin" : ""} /> Refresh Now
                </button>
              </div>

              {/* Feed log */}
              {feedLog.length > 0 && (
                <div style={panel}>
                  <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.white }}>Feed Log ({feedLog.filter(f => f.ok).length}/{feedLog.length} online)</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 2 }}>
                    {feedLog.map(f => (
                      <div key={f.source} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, padding: "7px 4px", borderBottom: `1px solid ${C.border}` }}>
                        {f.ok ? <CheckCircle size={13} color={C.green} style={{ flexShrink: 0 }} /> : <AlertCircle size={13} color={C.red} style={{ flexShrink: 0 }} />}
                        <span style={{ color: f.ok ? C.text : C.textMid }}>{f.source}</span>
                        <span style={{ color: C.textMid, marginLeft: "auto" }}>{f.ok ? `${f.count}` : "–"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent posts preview */}
              {posts.length > 0 && (
                <div>
                  <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.white }}>Recent Blog Posts</h3>
                  {posts.slice(0, 5).map(p => (
                    <div key={p.id} style={{ ...panel, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 600, color: C.white, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</p>
                        <span style={{ fontSize: 12, color: C.textMid }}>{p.category} · {p.timeAgo}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button onClick={() => startEdit(p)} className="nb-btn"
                          style={{ padding: "5px 12px", border: `1px solid ${C.border}`, borderRadius: 6, background: "transparent", cursor: "pointer", color: C.textMid, fontSize: 12 }}>Edit</button>
                        <button onClick={() => confirmDelete(p.id)} className="nb-btn"
                          style={{ padding: "5px 12px", border: `1px solid rgba(239,68,68,.3)`, borderRadius: 6, background: deleteConfirm === p.id ? "rgba(239,68,68,.15)" : "transparent", cursor: "pointer", color: C.red, fontSize: 12, fontWeight: deleteConfirm === p.id ? 700 : 400 }}>
                          {deleteConfirm === p.id ? "Confirm?" : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Blog Posts ── */}
          {tab === "posts" && (
            <div className="nb-fade">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.white, fontFamily: serif }}>Blog Posts</h2>
                <button onClick={() => { setEditing(null); resetForm(); setPostMsg({ text: "", ok: false }); setTab("create"); }} className="nb-btn"
                  style={{ display: "flex", alignItems: "center", gap: 6, background: C.cyan, border: "none", color: "#040507", padding: "9px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  <Plus size={14} /> New Post
                </button>
              </div>

              {posts.length === 0 ? (
                <div style={{ ...panel, textAlign: "center", padding: "70px 20px", color: C.textMid }}>
                  <FileText size={48} style={{ marginBottom: 16, opacity: .3 }} />
                  <p style={{ margin: "0 0 20px", fontSize: 15 }}>No blog posts yet.</p>
                  <button onClick={() => setTab("create")} className="nb-btn"
                    style={{ background: C.cyan, border: "none", color: "#040507", padding: "11px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                    Write Your First Post
                  </button>
                </div>
              ) : posts.map(p => (
                <div key={p.id} style={{ ...panel }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                        <span style={{ background: C.cyanGlow, border: `1px solid ${C.cyanBorder}`, color: C.cyan, fontSize: 10, fontWeight: 800, padding: "2px 8px", borderRadius: 4, letterSpacing: .5 }}>BLOG</span>
                        <span style={{ fontSize: 12, color: C.textMid }}>{p.category} · {p.timeAgo}</span>
                      </div>
                      <h3 style={{ margin: "0 0 7px", fontSize: 15, fontWeight: 700, color: C.white }}>{p.title}</h3>
                      <p style={{ margin: "0 0 9px", fontSize: 13, color: C.text, lineHeight: 1.55 }}>{p.excerpt}</p>
                      <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.cyan, textDecoration: "none" }}>{p.url}</a>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => startEdit(p)} className="nb-btn"
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", border: `1px solid ${C.border}`, borderRadius: 7, background: "transparent", cursor: "pointer", color: C.textMid, fontSize: 12 }}>
                        <Edit3 size={12} /> Edit
                      </button>
                      <button onClick={() => confirmDelete(p.id)} className="nb-btn"
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", border: `1px solid rgba(239,68,68,.3)`, borderRadius: 7, background: deleteConfirm === p.id ? "rgba(239,68,68,.15)" : "transparent", cursor: "pointer", color: C.red, fontSize: 12, fontWeight: deleteConfirm === p.id ? 700 : 400 }}>
                        <Trash2 size={12} /> {deleteConfirm === p.id ? "Confirm?" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Create / Edit ── */}
          {tab === "create" && (
            <div className="nb-fade" style={{ maxWidth: 680 }}>
              <h2 style={{ margin: "0 0 26px", fontSize: 22, fontWeight: 800, color: C.white, fontFamily: serif }}>
                {editing ? "Edit Post" : "Write New Post"}
              </h2>

              {postMsg.text && (
                <div style={{ background: postMsg.ok ? "rgba(52,211,153,.1)" : "rgba(239,68,68,.1)", border: `1px solid ${postMsg.ok ? "rgba(52,211,153,.3)" : "rgba(239,68,68,.3)"}`, borderRadius: 9, padding: "11px 16px", marginBottom: 20, fontSize: 13, color: postMsg.ok ? C.green : C.red, display: "flex", alignItems: "center", gap: 8 }}>
                  {postMsg.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />} {postMsg.text}
                </div>
              )}

              <div style={{ ...panel }}>
                {/* Title */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.textMid, display: "block", marginBottom: 8, letterSpacing: .5, textTransform: "uppercase" }}>Headline *</label>
                  <input type="text" value={form.title} placeholder="Enter a compelling headline…" onChange={e => setF("title")(e.target.value)} style={darkInp} />
                </div>
                {/* URL */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.textMid, display: "block", marginBottom: 8, letterSpacing: .5, textTransform: "uppercase" }}>Article URL *</label>
                  <input type="url" value={form.url} placeholder="https://…" onChange={e => setF("url")(e.target.value)} style={darkInp} />
                </div>
                {/* Excerpt */}
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: C.textMid, display: "block", marginBottom: 8, letterSpacing: .5, textTransform: "uppercase" }}>Excerpt *</label>
                  <textarea value={form.excerpt} rows={4} placeholder="Brief summary of the article…"
                    onChange={e => setF("excerpt")(e.target.value)}
                    style={{ ...darkInp, resize: "vertical" }} />
                  <p style={{ margin: "5px 0 0", fontSize: 11, color: C.textMid }}>{form.excerpt.length}/240 characters</p>
                </div>
                {/* Category + Source */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 26 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: C.textMid, display: "block", marginBottom: 8, letterSpacing: .5, textTransform: "uppercase" }}>Category</label>
                    <select value={form.category} onChange={e => setF("category")(e.target.value)} style={{ ...darkInp }}>
                      {categories.map(c => <option key={c} value={c} style={{ background: "#070B10" }}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: C.textMid, display: "block", marginBottom: 8, letterSpacing: .5, textTransform: "uppercase" }}>Source Label</label>
                    <input type="text" value={form.source} placeholder="NeriBuzz Blog" onChange={e => setF("source")(e.target.value)} style={darkInp} />
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={submitPost} className="nb-btn"
                    style={{ flex: 1, padding: 14, background: C.cyan, border: "none", borderRadius: 9, color: "#040507", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                    {editing ? "✓ Update Post" : "+ Publish Post"}
                  </button>
                  {editing && (
                    <button onClick={() => { setEditing(null); resetForm(); setPostMsg({ text: "", ok: false }); setTab("posts"); }} className="nb-btn"
                      style={{ padding: "12px 22px", border: `1px solid ${C.border}`, borderRadius: 9, background: "transparent", color: C.textMid, fontSize: 14, cursor: "pointer" }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Categories ── */}
          {tab === "categories" && (
            <div className="nb-fade" style={{ maxWidth: 580 }}>
              <h2 style={{ margin: "0 0 26px", fontSize: 22, fontWeight: 800, color: C.white, fontFamily: serif }}>Manage Categories</h2>

              {catMsg && (
                <div style={{ background: "rgba(52,211,153,.1)", border: "1px solid rgba(52,211,153,.3)", borderRadius: 8, padding: "10px 16px", marginBottom: 18, fontSize: 13, color: C.green }}>
                  ✓ {catMsg}
                </div>
              )}

              {/* Add category */}
              <div style={panel}>
                <h3 style={{ margin: "0 0 14px", fontSize: 14, fontWeight: 700, color: C.white }}>Add New Category</h3>
                <div style={{ display: "flex", gap: 10 }}>
                  <input type="text" value={newCat} placeholder="e.g. Opinion, Diaspora, Agriculture…"
                    onChange={e => setNewCat(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addCat()}
                    style={{ flex: 1, padding: "11px 14px", background: "#070B10", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, outline: "none", color: C.white, fontFamily: "inherit" }} />
                  <button onClick={addCat} className="nb-btn"
                    style={{ padding: "11px 22px", background: C.cyan, border: "none", borderRadius: 8, color: "#040507", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                    Add
                  </button>
                </div>
              </div>

              {/* Category list */}
              <div style={panel}>
                <h3 style={{ margin: "0 0 16px", fontSize: 14, fontWeight: 700, color: C.white }}>Active Categories ({categories.length})</h3>
                {categories.map((cat, i) => (
                  <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i < categories.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Tag size={14} color={C.cyan} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.white }}>{cat}</span>
                      <span style={{ fontSize: 12, color: C.textMid }}>
                        {news.filter(n => n.category === cat).length} stories
                      </span>
                    </div>
                    <button onClick={() => onRemoveCat(cat)} className="nb-btn"
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", border: `1px solid rgba(239,68,68,.25)`, borderRadius: 7, background: "transparent", cursor: "pointer", color: C.red, fontSize: 12 }}>
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* ─── Main App ──────────────────────────────────────────────────────── */
export default function NeriBuzz() {
  const [page,       setPage]    = useState("home");
  const [activeCat,  setActive]  = useState("All");
  const [isAdmin,    setIsAdmin] = useState(false);
  const [loading,    setLoading] = useState(true);
  const [lastRefresh,setLR]      = useState(new Date());
  const [news,       setNews]    = useState([]);
  const [feedLog,    setFeedLog] = useState([]);
  const [errorCount, setErrCnt]  = useState(0);
  const [mobileOpen, setMobile]  = useState(false);

  const [posts, setPosts] = useState(() => lsGet("nb_posts", []));
  const [cats,  setCats]  = useState(() => lsGet("nb_cats",  DEF_CATS));

  useEffect(() => lsSet("nb_posts", posts), [posts]);
  useEffect(() => lsSet("nb_cats",  cats),  [cats]);

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error(`API ${res.status}`);
      const { news: fetched, feedLog: log } = await res.json();
      setFeedLog(log || []);
      setErrCnt((log || []).filter(f => !f.ok).length);
      setNews(fetched || []);
      setLR(new Date());
    } catch (err) {
      console.error("News load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNews(); }, [loadNews]);
  useEffect(() => { const t = setInterval(loadNews, 3600000); return () => clearInterval(t); }, [loadNews]);

  const navTo   = cat => { setActive(cat); setPage(cat === "All" ? "home" : "category"); setMobile(false); };
  const onGoHome= ()  => { setPage("home"); setActive("All"); };
  const onAdmin = ()  => isAdmin ? setPage("admin") : setPage("admin-login");

  if (page === "admin-login") return <AdminLogin onLogin={() => { setIsAdmin(true); setPage("admin"); }} onBack={() => setPage("home")} />;
  if (page === "admin") return (
    <AdminDashboard
      posts={posts} categories={cats} news={news} feedLog={feedLog} loading={loading}
      onCreate={p  => setPosts(v => [p, ...v])}
      onDelete={id => setPosts(v => v.filter(p => p.id !== id))}
      onEdit={p    => setPosts(v => v.map(x => x.id === p.id ? p : x))}
      onAddCat={c  => setCats(v => [...v, c])}
      onRemoveCat={c => setCats(v => v.filter(x => x !== c))}
      onLogout={() => { setIsAdmin(false); setPage("home"); }}
      onRefresh={loadNews} lastRefresh={lastRefresh} onGoHome={onGoHome}
    />
  );

  return (
    <div style={{ background: C.page, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <BreakingTicker items={news} />
      <Header categories={cats} activeCat={activeCat} onCat={navTo} onHome={onGoHome} mobileOpen={mobileOpen} onMobile={() => setMobile(o => !o)} />

      <div style={{ flex: 1 }}>
        {page === "home" && (
          <HomeView news={news} blogPosts={posts} categories={cats}
            onCatSelect={cat => { setActive(cat); setPage("category"); }}
            onRefresh={loadNews} loading={loading} lastRefresh={lastRefresh} errorCount={errorCount} />
        )}
        {page === "category" && (
          <CategoryView cat={activeCat} news={news} blogPosts={posts}
            onBack={onGoHome} onRefresh={loadNews} loading={loading} lastRefresh={lastRefresh} />
        )}
      </div>

      <Footer onAdmin={onAdmin} />
    </div>
  );
}
