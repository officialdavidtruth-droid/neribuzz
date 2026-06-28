import { useState, useEffect, useCallback } from "react";
import {
  ExternalLink, RefreshCw, Menu, X, Clock, Shield,
  Edit3, Trash2, Plus, LogOut, BarChart2, FileText,
  Tag, ChevronRight, Globe, AlertCircle, CheckCircle,
  Wifi, WifiOff,
} from "lucide-react";

/* ─── Design tokens ──────────────────────────────────────────────────── */
const C = {
  navy:      "#0A1929",
  gold:      "#F5A623",
  goldDim:   "#C47F0F",
  bg:        "#F0F4F8",
  white:     "#FFFFFF",
  text:      "#0F172A",
  textMid:   "#475569",
  textLight: "#94A3B8",
  border:    "#E2E8F0",
  red:       "#DC2626",
  green:     "#16A34A",
};

const SRC_COLOR = {
  "Punch":             "#D32F2F",
  "Vanguard":          "#1565C0",
  "Premium Times":     "#1A5276",
  "Guardian Nigeria":  "#2E7D32",
  "The Nation":        "#827717",
  "Daily Trust":       "#4A235A",
  "BBC Africa":        "#B71C1C",
  "BBC World":         "#B71C1C",
  "BBC Business":      "#B71C1C",
  "BBC Sport":         "#C62828",
  "BBC Entertainment": "#B71C1C",
  "BBC Technology":    "#B71C1C",
  "BBC Health":        "#B71C1C",
  "Al Jazeera":        "#E64A19",
  "Reuters":           "#DD6B20",
  "ESPN":              "#D50000",
  "TechCabal":         "#0288D1",
  "Punch Sports":      "#D32F2F",
  "Punch Ents":        "#D32F2F",
  "Punch Politics":    "#D32F2F",
  "Vanguard Business": "#1565C0",
  "Vanguard Politics": "#1565C0",
  "NeriBuzz Blog":     "#C47F0F",
};

const DEF_CATS = ["Nigeria","International","Business","Sports","Entertainment","Technology","Health","Politics"];
const serif    = '"Playfair Display", Georgia, serif';

/* ─── Storage helpers ────────────────────────────────────────────────── */
const lsGet = (k, fb) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; } catch { return fb; } };
const lsSet = (k, v)  => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ─── Skeleton card ──────────────────────────────────────────────────── */
function Skeleton() {
  const b = { background: C.border, borderRadius: 4 };
  return (
    <div className="nb-shimmer" style={{ background: C.white, borderRadius: 10, border: `1px solid ${C.border}`, padding: 18 }}>
      <div style={{ ...b, height: 3,  marginBottom: 16 }} />
      <div style={{ ...b, height: 10, width: "30%", marginBottom: 14 }} />
      <div style={{ ...b, height: 15, width: "92%", marginBottom: 8  }} />
      <div style={{ ...b, height: 15, width: "76%", marginBottom: 16 }} />
      <div style={{ ...b, height: 11, width: "58%", marginBottom: 10 }} />
      <div style={{ ...b, height: 11, width: "44%", marginBottom: 18 }} />
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ ...b, height: 24, width: 70, borderRadius: 12 }} />
        <div style={{ ...b, height: 28, width: 90, borderRadius:  6 }} />
      </div>
    </div>
  );
}

/* ─── Source badge ───────────────────────────────────────────────────── */
function SourceBadge({ source }) {
  return (
    <span style={{
      background: SRC_COLOR[source] || "#64748B",
      color: "#fff", fontSize: 10, fontWeight: 700,
      padding: "2px 7px", borderRadius: 3,
      letterSpacing: 0.6, textTransform: "uppercase", flexShrink: 0,
    }}>
      {source}
    </span>
  );
}

/* ─── News card ──────────────────────────────────────────────────────── */
function NewsCard({ item, blog = false }) {
  const url    = item.sourceUrl || item.url || "#";
  const accent = blog ? C.gold : (SRC_COLOR[item.source] || "#64748B");
  return (
    <div className="nb-card" style={{
      background: C.white, borderRadius: 10, overflow: "hidden",
      border: `1px solid ${C.border}`, display: "flex", flexDirection: "column",
      boxShadow: "0 2px 8px rgba(0,0,0,.05)",
    }}>
      <div style={{ height: 3, background: accent, flexShrink: 0 }} />
      <div style={{ padding: "16px 18px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>

        {/* Meta */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <SourceBadge source={item.source} />
          {item.isBreaking && (
            <span style={{ fontSize: 10, fontWeight: 700, color: C.red, border: `1px solid ${C.red}`, padding: "1px 6px", borderRadius: 3 }}>
              ● BREAKING
            </span>
          )}
          {blog && (
            <span style={{ fontSize: 10, fontWeight: 700, color: C.goldDim, border: `1px solid ${C.gold}`, padding: "1px 6px", borderRadius: 3 }}>
              BLOG POST
            </span>
          )}
          <span style={{ fontSize: 11, color: C.textLight, marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={11} /> {item.timeAgo}
          </span>
        </div>

        {/* Title */}
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: C.text, lineHeight: 1.4, fontFamily: serif }}>
          {item.title}
        </h3>

        {/* Excerpt */}
        <p style={{ margin: 0, fontSize: 13, color: C.textMid, lineHeight: 1.65, flex: 1 }}>
          {item.excerpt.length > 118 ? item.excerpt.slice(0, 118) + "…" : item.excerpt}
        </p>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 11, color: C.textLight, background: C.bg, padding: "3px 9px", borderRadius: 12 }}>
            {item.category}
          </span>
          <a
            href={url} target="_blank" rel="noopener noreferrer"
            className="nb-btn"
            style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: C.gold, textDecoration: "none", padding: "5px 12px", borderRadius: 6, border: `1px solid ${C.gold}` }}
            onMouseEnter={e => { e.currentTarget.style.background = C.gold; e.currentTarget.style.color = C.navy; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.gold; }}
          >
            Read More <ExternalLink size={11} />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Hero card ──────────────────────────────────────────────────────── */
function HeroCard({ item }) {
  const url = item.sourceUrl || item.url || "#";
  return (
    <div style={{ background: C.navy, borderRadius: 14, padding: "clamp(24px,4vw,36px)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -60,  right: -60, width: 200, height: 200, background: C.gold, opacity: 0.05, borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: -80, left: -80, width: 280, height: 280, background: C.gold, opacity: 0.04, borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ background: C.gold, color: C.navy, fontSize: 11, fontWeight: 900, padding: "4px 10px", borderRadius: 4, letterSpacing: 1 }}>
            TOP STORY
          </span>
          {item.isBreaking && (
            <span style={{ color: "#F87171", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
              <span className="nb-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: "#F87171", display: "inline-block" }} />
              BREAKING
            </span>
          )}
        </div>
        <h2 style={{ margin: "0 0 12px", fontSize: "clamp(20px,3vw,28px)", fontWeight: 900, color: "#fff", lineHeight: 1.3, fontFamily: serif, maxWidth: 700 }}>
          {item.title}
        </h2>
        <p style={{ margin: "0 0 22px", fontSize: 15, color: "rgba(255,255,255,.72)", lineHeight: 1.65, maxWidth: 620 }}>
          {item.excerpt}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <a
            href={url} target="_blank" rel="noopener noreferrer"
            className="nb-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.gold, color: C.navy, padding: "11px 22px", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}
            onMouseEnter={e => e.currentTarget.style.opacity = ".88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            Read Full Story <ExternalLink size={14} />
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <SourceBadge source={item.source} />
            <span style={{ color: "rgba(255,255,255,.45)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <Clock size={12} /> {item.timeAgo}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Breaking news ticker ───────────────────────────────────────────── */
function BreakingTicker({ items }) {
  const breaking = items.filter(n => n.isBreaking);
  if (!breaking.length) return null;
  const doubled = [...breaking, ...breaking];
  return (
    <div style={{ background: "#B91C1C", overflow: "hidden", display: "flex", alignItems: "center", height: 36 }}>
      <div style={{ background: "#991B1B", padding: "0 16px", fontWeight: 900, fontSize: 11, color: "#fff", height: "100%", display: "flex", alignItems: "center", gap: 5, flexShrink: 0, letterSpacing: 1 }}>
        <span className="nb-pulse" style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff", display: "inline-block" }} />
        LIVE
      </div>
      <div style={{ flex: 1, overflow: "hidden", height: "100%", display: "flex", alignItems: "center" }}>
        <div className="nb-ticker">
          {doubled.map((it, i) => (
            <span key={i} style={{ padding: "0 36px", fontSize: 12, color: "rgba(255,255,255,.95)", fontWeight: 500 }}>
              {it.title}
              <span style={{ marginLeft: 36, color: "rgba(255,255,255,.3)" }}>|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Header ─────────────────────────────────────────────────────────── */
function Header({ categories, activeCat, onCat, onHome, onAdmin, mobileOpen, onMobile }) {
  return (
    <header style={{ background: C.navy, position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 16px rgba(0,0,0,.35)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <div onClick={onHome} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 27, fontWeight: 900, color: "#fff",   letterSpacing: -1, fontFamily: serif }}>Neri</span>
          <span style={{ fontSize: 27, fontWeight: 900, color: C.gold,   letterSpacing: -1, fontFamily: serif }}>Buzz</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,.38)", marginLeft: 8, alignSelf: "flex-end", marginBottom: 4, letterSpacing: .5 }}>NIGERIA</span>
        </div>
        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button className="nb-btn" onClick={onAdmin}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(245,166,35,.13)", border: "1px solid rgba(245,166,35,.3)", color: C.gold, padding: "7px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            <Shield size={13} /> Admin
          </button>
          <button onClick={onMobile}
            style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.8)", cursor: "pointer", padding: 4, display: "flex" }}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
      {/* Category nav */}
      <div style={{ borderTop: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 20px", display: "flex", overflowX: "auto" }}>
          {["All", ...categories].map(cat => (
            <button key={cat} onClick={() => onCat(cat)} className="nb-btn"
              style={{ padding: "10px 15px", background: "transparent", border: "none",
                borderBottom: activeCat === cat ? `2px solid ${C.gold}` : "2px solid transparent",
                color: activeCat === cat ? C.gold : "rgba(255,255,255,.62)",
                fontSize: 13, fontWeight: activeCat === cat ? 700 : 500, cursor: "pointer", whiteSpace: "nowrap",
              }}>
              {cat}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

/* ─── Section heading ────────────────────────────────────────────────── */
function SectionHead({ title, count, onRefresh, loading }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 4, height: 22, background: C.gold, borderRadius: 2, display: "inline-block" }} />
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.text, fontFamily: serif }}>{title}</h2>
        {count != null && <span style={{ fontSize: 12, color: C.textLight, background: C.bg, padding: "2px 9px", borderRadius: 10 }}>{count}</span>}
      </div>
      {onRefresh && (
        <button onClick={onRefresh} disabled={loading} className="nb-btn"
          style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${C.border}`, color: C.textMid, padding: "6px 13px", borderRadius: 8, fontSize: 12, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1 }}>
          <RefreshCw size={13} className={loading ? "nb-spin" : ""} /> Refresh
        </button>
      )}
    </div>
  );
}

/* ─── News grid ──────────────────────────────────────────────────────── */
function NewsGrid({ items, loading }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(290px,1fr))", gap: 16 }}>
      {loading
        ? [1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} />)
        : items.map((it, i) => <NewsCard key={it.id || `b${i}`} item={it} blog={!!it.isBlog} />)
      }
    </div>
  );
}

/* ─── Error banner ───────────────────────────────────────────────────── */
function ErrorBanner({ count }) {
  if (!count) return null;
  return (
    <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 16px", marginBottom: 20, fontSize: 13, color: C.red, display: "flex", alignItems: "center", gap: 8 }}>
      <AlertCircle size={15} />
      {count} feed{count > 1 ? "s" : ""} failed to load — some stories may be missing.
    </div>
  );
}

/* ─── Home view ──────────────────────────────────────────────────────── */
function HomeView({ news, blogPosts, categories, onCatSelect, onRefresh, loading, lastRefresh, errorCount }) {
  const hero  = news.find(n => n.isBreaking) || news[0];
  const rest  = news.filter(n => n !== hero);
  const blogs = blogPosts.map(p => ({ ...p, isBlog: true }));
  const top6  = [...rest, ...blogs].slice(0, 6);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px 48px" }}>
      {/* Feed bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <span style={{ fontSize: 12, color: C.textLight, display: "flex", alignItems: "center", gap: 5 }}>
          <Clock size={13} />
          {loading ? "Fetching live headlines…" : `${news.length} stories · ${lastRefresh.toLocaleTimeString()}`}
        </span>
        <button onClick={onRefresh} disabled={loading} className="nb-btn"
          style={{ display: "flex", alignItems: "center", gap: 6, background: C.gold, border: "none", color: C.navy, padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .75 : 1 }}>
          <RefreshCw size={13} className={loading ? "nb-spin" : ""} />
          {loading ? "Loading…" : "Refresh Feed"}
        </button>
      </div>

      <ErrorBanner count={errorCount} />

      {/* Hero */}
      {loading ? (
        <div className="nb-shimmer" style={{ background: C.navy, borderRadius: 14, height: 230, marginBottom: 34 }} />
      ) : hero ? (
        <div style={{ marginBottom: 34 }}><HeroCard item={hero} /></div>
      ) : null}

      {/* Top 6 */}
      <div style={{ marginBottom: 42 }}>
        <SectionHead title="Top Stories" count={loading ? null : top6.length} />
        <NewsGrid items={top6} loading={loading} />
      </div>

      {/* Per-category sections */}
      {!loading && categories.map(cat => {
        const catItems = [
          ...news.filter(n => n.category === cat).slice(0, 3),
          ...blogs.filter(b => b.category === cat).slice(0, 1),
        ].slice(0, 3);
        if (!catItems.length) return null;
        return (
          <div key={cat} style={{ marginBottom: 42 }}>
            <SectionHead title={cat} count={catItems.length} />
            <NewsGrid items={catItems} />
            <button onClick={() => onCatSelect(cat)} className="nb-btn"
              style={{ marginTop: 12, display: "inline-flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${C.border}`, color: C.textMid, padding: "8px 16px", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
              More {cat} stories <ChevronRight size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Category view ──────────────────────────────────────────────────── */
function CategoryView({ cat, news, blogPosts, onBack, onRefresh, loading, lastRefresh }) {
  const blogs = blogPosts.map(p => ({ ...p, isBlog: true }));
  const items = cat === "All"
    ? [...news, ...blogs]
    : [...news.filter(n => n.category === cat), ...blogs.filter(b => b.category === cat)];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 20px 48px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 26, flexWrap: "wrap", gap: 14 }}>
        <div>
          <button onClick={onBack} style={{ background: "transparent", border: "none", color: C.textMid, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginBottom: 6, padding: 0 }}>
            ← Back to Home
          </button>
          <h1 style={{ margin: "0 0 4px", fontSize: 28, fontWeight: 900, color: C.text, fontFamily: serif }}>
            {cat} <span style={{ color: C.gold }}>News</span>
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: C.textLight }}>
            {loading ? "Fetching…" : `${items.length} stories · ${lastRefresh.toLocaleTimeString()}`}
          </p>
        </div>
        <button onClick={onRefresh} disabled={loading} className="nb-btn"
          style={{ display: "flex", alignItems: "center", gap: 6, background: C.gold, border: "none", color: C.navy, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .75 : 1 }}>
          <RefreshCw size={13} className={loading ? "nb-spin" : ""} /> Refresh
        </button>
      </div>
      {!loading && items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "72px 20px", color: C.textLight }}>
          <Globe size={48} style={{ marginBottom: 16, opacity: .35 }} />
          <p style={{ fontSize: 16, margin: 0 }}>No stories in {cat} yet.</p>
        </div>
      ) : (
        <NewsGrid items={items} loading={loading} />
      )}
    </div>
  );
}

/* ─── Admin login ────────────────────────────────────────────────────── */
function AdminLogin({ onLogin, onBack }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err,  setErr]  = useState("");
  const [busy, setBusy] = useState(false);
  const inp = { width: "100%", padding: "11px 14px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, outline: "none" };

  const attempt = () => {
    setBusy(true); setErr("");
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "neribuzz2025";
    setTimeout(() => {
      if (user === "admin" && pass === adminPass) { onLogin(); }
      else { setErr("Invalid username or password."); setBusy(false); }
    }, 700);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: C.white, borderRadius: 16, padding: "40px 36px", width: "100%", maxWidth: 400, boxShadow: "0 28px 64px rgba(0,0,0,.45)" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, background: C.gold, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Shield size={26} color={C.navy} />
          </div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text, fontFamily: serif }}>Admin Login</h2>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: C.textMid }}>NeriBuzz Control Panel</p>
        </div>
        {err && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: C.red, display: "flex", alignItems: "center", gap: 8 }}>
            <AlertCircle size={15} /> {err}
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 7 }}>Username</label>
          <input type="text" value={user} placeholder="admin" onChange={e => setUser(e.target.value)} onKeyDown={e => e.key === "Enter" && attempt()} style={inp} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 7 }}>Password</label>
          <input type="password" value={pass} placeholder="••••••••" onChange={e => setPass(e.target.value)} onKeyDown={e => e.key === "Enter" && attempt()} style={inp} />
        </div>
        <button onClick={attempt} disabled={busy} className="nb-btn"
          style={{ width: "100%", padding: 13, background: C.gold, border: "none", borderRadius: 8, color: C.navy, fontSize: 15, fontWeight: 700, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? .8 : 1 }}>
          {busy ? "Signing in…" : "Sign In"}
        </button>
        <button onClick={onBack} style={{ width: "100%", marginTop: 10, padding: 10, background: "transparent", border: "none", color: C.textMid, fontSize: 13, cursor: "pointer" }}>
          ← Back to NeriBuzz
        </button>
      </div>
    </div>
  );
}

/* ─── Admin dashboard ────────────────────────────────────────────────── */
function AdminDashboard({ posts, categories, news, feedLog, loading, onCreate, onDelete, onEdit, onAddCat, onRemoveCat, onLogout, onRefresh, lastRefresh, onGoHome }) {
  const [tab,     setTab]    = useState("dashboard");
  const [form,    setForm]   = useState({ title: "", excerpt: "", url: "", category: categories[0] || "Nigeria", source: "NeriBuzz Blog" });
  const [editing, setEditing]= useState(null);
  const [newCat,  setNewCat] = useState("");
  const [postMsg, setPostMsg]= useState("");
  const [catMsg,  setCatMsg] = useState("");
  const [sidebar, setSidebar]= useState(true);

  const setF = k => v => setForm(p => ({ ...p, [k]: v }));
  const inp  = { width: "100%", padding: "11px 14px", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, outline: "none", fontFamily: "inherit" };
  const isOk = postMsg && (postMsg.includes("published") || postMsg.includes("updated"));

  const TABS = [
    { id: "dashboard", label: "Dashboard",  Icon: BarChart2 },
    { id: "posts",     label: "Blog Posts", Icon: FileText  },
    { id: "create",    label: "Write Post", Icon: Plus      },
    { id: "categories",label: "Categories", Icon: Tag       },
  ];

  const submitPost = () => {
    if (!form.title || !form.excerpt || !form.url) { setPostMsg("Fill in all fields."); return; }
    const p = { ...form, id: editing || Date.now(), timeAgo: "Just now", isBreaking: false };
    editing ? onEdit(p) : onCreate(p);
    setPostMsg(editing ? "Post updated!" : "Post published!");
    setEditing(null);
    setForm({ title: "", excerpt: "", url: "", category: categories[0] || "Nigeria", source: "NeriBuzz Blog" });
    setTimeout(() => setPostMsg(""), 3000);
    setTab("posts");
  };

  const startEdit = p => {
    setEditing(p.id);
    setForm({ title: p.title, excerpt: p.excerpt, url: p.url || p.sourceUrl || "", category: p.category, source: p.source });
    setTab("create");
  };

  const addCat = () => {
    const c = newCat.trim();
    if (!c) return;
    if (categories.includes(c)) { setCatMsg("Already exists."); return; }
    onAddCat(c); setNewCat(""); setCatMsg(`"${c}" added!`); setTimeout(() => setCatMsg(""), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column" }}>
      {/* Admin header */}
      <div style={{ background: C.navy, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => setSidebar(!sidebar)} style={{ background: "transparent", border: "none", color: "rgba(255,255,255,.55)", cursor: "pointer", padding: 4, display: "flex" }}>
            <Menu size={20} />
          </button>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontWeight: 900, color: "#fff",   fontSize: 19, fontFamily: serif }}>Neri</span>
            <span style={{ fontWeight: 900, color: C.gold, fontSize: 19, fontFamily: serif }}>Buzz</span>
          </div>
          <span style={{ background: "rgba(245,166,35,.2)", color: C.gold, fontSize: 11, padding: "3px 10px", borderRadius: 4, fontWeight: 700, letterSpacing: .5 }}>ADMIN</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onGoHome} className="nb-btn" style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.08)", border: "none", color: "rgba(255,255,255,.8)", padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>← Site</button>
          <button onClick={onRefresh} disabled={loading} className="nb-btn" style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,.08)", border: "none", color: "rgba(255,255,255,.8)", padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .7 : 1 }}>
            <RefreshCw size={13} className={loading ? "nb-spin" : ""} /> {loading ? "Loading…" : "Refresh Feeds"}
          </button>
          <button onClick={onLogout} className="nb-btn" style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(220,38,38,.13)", border: "1px solid rgba(220,38,38,.3)", color: "#FCA5A5", padding: "7px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer" }}>
            <LogOut size={13} /> Sign Out
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar */}
        {sidebar && (
          <div style={{ width: 215, background: C.white, borderRight: `1px solid ${C.border}`, padding: "20px 0", flexShrink: 0 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 10, padding: "11px 20px", border: "none", cursor: "pointer",
                  background: tab === t.id ? "rgba(245,166,35,.1)" : "transparent",
                  borderLeft: tab === t.id ? `3px solid ${C.gold}` : "3px solid transparent",
                  color: tab === t.id ? C.gold : C.textMid, fontSize: 14, fontWeight: tab === t.id ? 700 : 500 }}>
                <t.Icon size={16} /> {t.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ flex: 1, padding: 26, overflowY: "auto" }}>

          {/* ── Dashboard ── */}
          {tab === "dashboard" && (
            <div>
              <h2 style={{ margin: "0 0 22px", fontSize: 22, fontWeight: 800, color: C.text, fontFamily: serif }}>Dashboard</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(185px,1fr))", gap: 14, marginBottom: 26 }}>
                {[
                  { label: "Live Stories", val: news.length,                      Icon: Globe,    col: "#3B82F6" },
                  { label: "Blog Posts",   val: posts.length,                     Icon: FileText, col: C.gold    },
                  { label: "Feeds Online", val: feedLog.filter(f => f.ok).length, Icon: Wifi,     col: C.green   },
                  { label: "Feeds Failed", val: feedLog.filter(f => !f.ok).length,Icon: WifiOff,  col: C.red     },
                ].map(s => (
                  <div key={s.label} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: C.textMid, fontWeight: 600 }}>{s.label}</span>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: s.col + "20", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <s.Icon size={16} color={s.col} />
                      </div>
                    </div>
                    <div style={{ fontSize: 34, fontWeight: 900, color: C.text }}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Feed status */}
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 22px", marginBottom: 22, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>RSS Feed Status</p>
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: C.textLight }}>Refreshed {lastRefresh.toLocaleTimeString()} · Auto-refreshes every hour</p>
                </div>
                <button onClick={onRefresh} disabled={loading} className="nb-btn"
                  style={{ display: "flex", alignItems: "center", gap: 8, background: C.gold, border: "none", color: C.navy, padding: "10px 20px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? .75 : 1 }}>
                  <RefreshCw size={14} className={loading ? "nb-spin" : ""} /> Manual Refresh
                </button>
              </div>

              {/* Feed log */}
              {feedLog.length > 0 && (
                <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "18px 22px", marginBottom: 22 }}>
                  <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: C.text }}>Feed Log</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(195px,1fr))", gap: 6 }}>
                    {feedLog.map(f => (
                      <div key={f.source} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                        {f.ok ? <CheckCircle size={13} color={C.green} style={{ flexShrink: 0 }} /> : <AlertCircle size={13} color={C.red} style={{ flexShrink: 0 }} />}
                        <span style={{ color: C.text }}>{f.source}</span>
                        <span style={{ color: C.textLight, marginLeft: "auto" }}>{f.ok ? f.count : "failed"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent posts */}
              {posts.length > 0 && (
                <div>
                  <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700, color: C.text }}>Recent Blog Posts</h3>
                  {posts.slice(0, 5).map(p => (
                    <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: "12px 16px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: C.text }}>{p.title}</p>
                        <span style={{ fontSize: 12, color: C.textLight }}>{p.category} · {p.timeAgo}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button onClick={() => startEdit(p)} className="nb-btn" style={{ padding: "5px 10px", border: `1px solid ${C.border}`, borderRadius: 6, background: "transparent", cursor: "pointer", color: C.textMid, fontSize: 12 }}>Edit</button>
                        <button onClick={() => onDelete(p.id)} className="nb-btn" style={{ padding: "5px 10px", border: "1px solid #FCA5A5", borderRadius: 6, background: "transparent", cursor: "pointer", color: C.red, fontSize: 12 }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Posts ── */}
          {tab === "posts" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text, fontFamily: serif }}>Blog Posts</h2>
                <button onClick={() => { setEditing(null); setForm({ title: "", excerpt: "", url: "", category: categories[0] || "Nigeria", source: "NeriBuzz Blog" }); setTab("create"); }} className="nb-btn"
                  style={{ display: "flex", alignItems: "center", gap: 6, background: C.gold, border: "none", color: C.navy, padding: "9px 18px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  <Plus size={14} /> New Post
                </button>
              </div>
              {posts.length === 0 ? (
                <div style={{ textAlign: "center", padding: "70px 20px", background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, color: C.textLight }}>
                  <FileText size={48} style={{ marginBottom: 14, opacity: .35 }} />
                  <p style={{ margin: "0 0 18px", fontSize: 15 }}>No blog posts yet.</p>
                  <button onClick={() => setTab("create")} style={{ background: C.gold, border: "none", color: C.navy, padding: "10px 22px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13 }}>Write First Post</button>
                </div>
              ) : posts.map(p => (
                <div key={p.id} style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px", marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                        <span style={{ background: C.gold + "30", color: C.goldDim, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>BLOG</span>
                        <span style={{ fontSize: 11, color: C.textLight }}>{p.category} · {p.timeAgo}</span>
                      </div>
                      <h3 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: C.text }}>{p.title}</h3>
                      <p style={{ margin: "0 0 8px", fontSize: 13, color: C.textMid, lineHeight: 1.5 }}>{p.excerpt}</p>
                      <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: C.gold, textDecoration: "none" }}>{p.url}</a>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => startEdit(p)} className="nb-btn" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", border: `1px solid ${C.border}`, borderRadius: 7, background: "transparent", cursor: "pointer", color: C.textMid, fontSize: 12 }}><Edit3 size={12} /> Edit</button>
                      <button onClick={() => onDelete(p.id)} className="nb-btn" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", border: "1px solid #FCA5A5", borderRadius: 7, background: "transparent", cursor: "pointer", color: C.red, fontSize: 12 }}><Trash2 size={12} /> Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Create / Edit ── */}
          {tab === "create" && (
            <div style={{ maxWidth: 660 }}>
              <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 800, color: C.text, fontFamily: serif }}>{editing ? "Edit Post" : "Write New Post"}</h2>
              {postMsg && (
                <div style={{ background: isOk ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${isOk ? "#BBF7D0" : "#FECACA"}`, borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: isOk ? C.green : C.red, display: "flex", alignItems: "center", gap: 8 }}>
                  {isOk ? <CheckCircle size={15} /> : <AlertCircle size={15} />} {postMsg}
                </div>
              )}
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 26 }}>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 7 }}>Headline</label>
                  <input type="text" value={form.title} placeholder="Enter a compelling headline…" onChange={e => setF("title")(e.target.value)} style={inp} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 7 }}>Article URL</label>
                  <input type="url" value={form.url} placeholder="https://…" onChange={e => setF("url")(e.target.value)} style={inp} />
                </div>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 7 }}>Excerpt</label>
                  <textarea value={form.excerpt} rows={4} placeholder="Brief summary…" onChange={e => setF("excerpt")(e.target.value)} style={{ ...inp, resize: "vertical" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 7 }}>Category</label>
                    <select value={form.category} onChange={e => setF("category")(e.target.value)} style={{ ...inp, background: C.white }}>
                      {categories.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "block", marginBottom: 7 }}>Source</label>
                    <input type="text" value={form.source} placeholder="NeriBuzz Blog" onChange={e => setF("source")(e.target.value)} style={inp} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={submitPost} className="nb-btn" style={{ flex: 1, padding: 13, background: C.gold, border: "none", borderRadius: 8, color: C.navy, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
                    {editing ? "✓ Update Post" : "+ Publish Post"}
                  </button>
                  {editing && (
                    <button onClick={() => { setEditing(null); setForm({ title: "", excerpt: "", url: "", category: categories[0] || "Nigeria", source: "NeriBuzz Blog" }); setTab("posts"); }} className="nb-btn"
                      style={{ padding: "12px 20px", border: `1px solid ${C.border}`, borderRadius: 8, background: "transparent", color: C.textMid, fontSize: 14, cursor: "pointer" }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Categories ── */}
          {tab === "categories" && (
            <div style={{ maxWidth: 580 }}>
              <h2 style={{ margin: "0 0 24px", fontSize: 22, fontWeight: 800, color: C.text, fontFamily: serif }}>Manage Categories</h2>
              {catMsg && <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: C.green }}>✓ {catMsg}</div>}
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: C.text }}>Add Category</h3>
                <div style={{ display: "flex", gap: 10 }}>
                  <input type="text" value={newCat} placeholder="Category name…" onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === "Enter" && addCat()} style={{ flex: 1, ...inp }} />
                  <button onClick={addCat} className="nb-btn" style={{ padding: "10px 20px", background: C.gold, border: "none", borderRadius: 8, color: C.navy, fontWeight: 700, fontSize: 14, cursor: "pointer" }}>Add</button>
                </div>
              </div>
              <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
                <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: C.text }}>Active Categories ({categories.length})</h3>
                {categories.map((cat, i) => (
                  <div key={cat} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: i < categories.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Tag size={14} color={C.gold} />
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{cat}</span>
                      <span style={{ fontSize: 12, color: C.textLight }}>{news.filter(n => n.category === cat).length} stories</span>
                    </div>
                    <button onClick={() => onRemoveCat(cat)} className="nb-btn"
                      style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", border: "1px solid #FCA5A5", borderRadius: 6, background: "transparent", cursor: "pointer", color: C.red, fontSize: 12 }}>
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

/* ─── Footer ─────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background: C.navy, color: "rgba(255,255,255,.5)", textAlign: "center", padding: "28px 20px", fontSize: 13 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, marginBottom: 8 }}>
        <span style={{ fontWeight: 900, color: "#fff",   fontFamily: serif, fontSize: 17 }}>Neri</span>
        <span style={{ fontWeight: 900, color: C.gold, fontFamily: serif, fontSize: 17 }}>Buzz</span>
        <span style={{ marginLeft: 10 }}>— Your Nigerian News Pulse</span>
      </div>
      <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,.3)" }}>
        NeriBuzz aggregates headlines from public RSS feeds. All rights belong to their respective publishers.
      </p>
    </footer>
  );
}

/* ─── Main App ───────────────────────────────────────────────────────── */
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

  /* ── Fetch news from /api/news (server-side RSS, no CORS) ── */
  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/news");
      if (!res.ok) throw new Error("API error");
      const { news: fetched, feedLog: log } = await res.json();
      setFeedLog(log);
      setErrCnt(log.filter(f => !f.ok).length);
      setNews(fetched);
      setLR(new Date());
    } catch (err) {
      console.error("News fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNews(); }, [loadNews]);
  useEffect(() => { const t = setInterval(loadNews, 3600000); return () => clearInterval(t); }, [loadNews]);

  const navTo   = cat => { setActive(cat); setPage(cat === "All" ? "home" : "category"); setMobile(false); };
  const onGoHome= ()  => { setPage("home"); setActive("All"); };

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
    <div style={{ background: C.bg, minHeight: "100vh" }}>
      <BreakingTicker items={news} />
      <Header
        categories={cats} activeCat={activeCat}
        onCat={navTo} onHome={onGoHome}
        onAdmin={() => isAdmin ? setPage("admin") : setPage("admin-login")}
        mobileOpen={mobileOpen} onMobile={() => setMobile(o => !o)}
      />
      {page === "home" && (
        <HomeView news={news} blogPosts={posts} categories={cats}
          onCatSelect={cat => { setActive(cat); setPage("category"); }}
          onRefresh={loadNews} loading={loading} lastRefresh={lastRefresh} errorCount={errorCount} />
      )}
      {page === "category" && (
        <CategoryView cat={activeCat} news={news} blogPosts={posts}
          onBack={onGoHome} onRefresh={loadNews} loading={loading} lastRefresh={lastRefresh} />
      )}
      <Footer />
    </div>
  );
}
