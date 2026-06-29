// components/NeriBuzz.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ExternalLink, RefreshCw, X, Clock, ChevronRight,
  Globe, AlertCircle, ChevronLeft, Menu, Bell, BellOff,
  Share2, Facebook, Twitter, Link as LinkIcon,
} from "lucide-react";

const C = {
  page:"#08090D", card:"#0D1117", cardHover:"#111826", nav:"#040507", navBorder:"#0F1520",
  cyan:"#22D3EE", cyanDim:"#0891B2", cyanGlow:"rgba(34,211,238,0.12)", cyanBorder:"rgba(34,211,238,0.22)",
  white:"#F1F5F9", text:"#CBD5E1", textMid:"#64748B", textFaint:"#1E2D3D",
  border:"#1A2535", borderHi:"#263548", red:"#F87171", redSolid:"#EF4444", green:"#34D399",
  wa:"#25D366", facebook:"#1877F2", twitter:"#000000",
};
const SRC = {
  "Punch":"#E53935","Vanguard":"#1E88E5","Premium Times":"#1565C0",
  "Guardian Nigeria":"#43A047","Channels TV":"#FB8C00","The Cable":"#8E24AA",
  "BBC Africa":"#D32F2F","BBC World":"#D32F2F","BBC Business":"#D32F2F",
  "BBC Sport":"#C62828","BBC Entertainment":"#D32F2F","BBC Technology":"#D32F2F",
  "BBC Health":"#D32F2F","Al Jazeera":"#E64A19","TechCabal":"#00ACC1",
  "Punch Sports":"#E53935","Punch Politics":"#E53935","Punch Entertainment":"#E53935",
  "Vanguard Business":"#1E88E5","Vanguard Politics":"#1E88E5","Vanguard Health":"#1E88E5",
  "Vanguard Entertainment":"#1E88E5","NeriBuzz":"#22D3EE",
};
const WA_URL = "https://whatsapp.com/channel/0029Vb6xYzRFMqrRNDnpwm1V";
const serif  = '"Playfair Display", Georgia, serif';
const DEF_CATS = ["Nigeria","International","Business","Sports","Entertainment","Technology","Health","Politics"];
const lsGet = (k,fb) => { try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;} };
const lsSet = (k,v)  => { try{localStorage.setItem(k,JSON.stringify(v));}catch{} };

/* ── Page loader ──────────────────────────────────────── */
function PageLoader() {
  return (
    <div style={{ position:"fixed", inset:0, background:C.page, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24, zIndex:9999 }}>
      <div style={{ fontSize:34, fontFamily:serif, fontWeight:900 }}>
        <span style={{color:C.white}}>Neri</span><span style={{color:C.cyan}}>Buzz</span>
      </div>
      <div className="nb-ring" />
      <p style={{ color:C.textMid, fontSize:13, margin:0 }}>Loading live headlines…</p>
    </div>
  );
}

/* ── Skeleton card ────────────────────────────────────── */
function Skeleton() {
  const s = { background:"#1A2535", borderRadius:4 };
  return (
    <div className="nb-shimmer" style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
      <div style={{ height:160, background:"#0A0F18" }} />
      <div style={{ padding:18 }}>
        <div style={{...s,height:10,width:"28%",marginBottom:14}} />
        <div style={{...s,height:15,width:"95%",marginBottom:8 }} />
        <div style={{...s,height:15,width:"78%",marginBottom:20}} />
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div style={{...s,height:22,width:64,borderRadius:20}} />
          <div style={{...s,height:30,width:96,borderRadius:8}} />
        </div>
      </div>
    </div>
  );
}

/* ── Source badge ─────────────────────────────────────── */
function SourceBadge({ source }) {
  return (
    <span style={{ background:SRC[source]||"#334155", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 8px", borderRadius:4, letterSpacing:.7, textTransform:"uppercase", flexShrink:0 }}>
      {source}
    </span>
  );
}

/* ── Share Buttons ────────────────────────────────────── */
function ShareButtons({ title, url, onClose }) {
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  
  const shareTo = (platform) => {
    const encodedTitle = encodeURIComponent(title || "Check this out on NeriBuzz");
    const encodedUrl = encodeURIComponent(shareUrl);
    let shareLink = "";
    
    switch(platform) {
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case "whatsapp_story":
        shareLink = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "copy":
        navigator.clipboard?.writeText(shareUrl).then(() => {
          alert("Link copied to clipboard!");
        });
        return;
      default:
        return;
    }
    
    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=500");
    }
    onClose?.();
  };
  
  const buttons = [
    { id: "whatsapp", label: "WhatsApp", color: C.wa, icon: "💬" },
    { id: "whatsapp_story", label: "WhatsApp Story", color: C.wa, icon: "📱" },
    { id: "facebook", label: "Facebook", color: C.facebook, icon: "📘" },
    { id: "twitter", label: "Twitter/X", color: C.twitter, icon: "🐦" },
    { id: "linkedin", label: "LinkedIn", color: "#0A66C2", icon: "🔗" },
    { id: "copy", label: "Copy Link", color: C.textMid, icon: "📋" },
  ];
  
  return (
    <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
      {buttons.map(({id, label, color, icon}) => (
        <button
          key={id}
          onClick={() => shareTo(id)}
          style={{
            display:"flex", alignItems:"center", gap:5,
            background: color + "18",
            border: `1px solid ${color}30`,
            color: color,
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all .15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = color + "18"; e.currentTarget.style.color = color; }}
        >
          {icon} {label}
        </button>
      ))}
    </div>
  );
}

/* ── Notification Settings ────────────────────────────── */
function NotificationSettings({ categories, onSave }) {
  const [enabled, setEnabled] = useState(() => lsGet("nb_notifications_enabled", false));
  const [selectedCats, setSelectedCats] = useState(() => 
    lsGet("nb_notification_cats", categories.slice(0, 4))
  );
  const [browserSupported, setBrowserSupported] = useState(false);
  const [permission, setPermission] = useState("default");
  
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserSupported(true);
      setPermission(Notification.permission);
    }
  }, []);
  
  const toggleNotification = () => {
    if (!enabled) {
      if (typeof window !== "undefined" && "Notification" in window) {
        Notification.requestPermission().then(result => {
          setPermission(result);
          if (result === "granted") {
            setEnabled(true);
            lsSet("nb_notifications_enabled", true);
            onSave?.(true, selectedCats);
            new Notification("🔔 NeriBuzz Notifications Enabled", {
              body: "You'll now get alerts for breaking news in your selected categories.",
              icon: "/favicon.ico",
            });
          }
        });
      }
    } else {
      setEnabled(false);
      lsSet("nb_notifications_enabled", false);
      onSave?.(false, selectedCats);
    }
  };
  
  const toggleCategory = (cat) => {
    const newCats = selectedCats.includes(cat)
      ? selectedCats.filter(c => c !== cat)
      : [...selectedCats, cat];
    setSelectedCats(newCats);
    lsSet("nb_notification_cats", newCats);
    if (enabled) {
      onSave?.(enabled, newCats);
    }
  };
  
  return (
    <div style={{ 
      background: C.card, 
      border: `1px solid ${C.border}`, 
      borderRadius: 12, 
      padding: "16px 20px",
      marginBottom: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.white, display: "flex", alignItems: "center", gap: 8 }}>
            {enabled ? <Bell size={16} color={C.green}/> : <BellOff size={16} color={C.textMid}/>}
            Browser Notifications
          </h4>
          <p style={{ margin: "4px 0 0", fontSize: 11, color: C.textMid }}>
            {enabled ? "🔔 Alerts enabled" : "Get breaking news alerts on your device"}
          </p>
        </div>
        <button
          onClick={toggleNotification}
          style={{
            padding: "6px 16px",
            background: enabled ? C.green : (browserSupported ? C.cyan : C.textFaint),
            border: "none",
            borderRadius: 7,
            color: enabled ? "#040507" : (browserSupported ? "#040507" : C.textMid),
            fontWeight: 700,
            fontSize: 12,
            cursor: browserSupported ? "pointer" : "not-allowed",
            opacity: browserSupported ? 1 : 0.5,
          }}
        >
          {enabled ? "✅ Enabled" : (browserSupported ? "Enable" : "Not Supported")}
        </button>
      </div>
      
      {enabled && (
        <div>
          <p style={{ fontSize: 11, color: C.textMid, margin: "0 0 8px" }}>
            Select categories to get notifications for:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {categories.map(cat => (
              <label key={cat} style={{
                display: "flex", alignItems: "center", gap: 5,
                fontSize: 12,
                cursor: "pointer",
                padding: "4px 10px",
                background: selectedCats.includes(cat) ? C.cyanGlow : "transparent",
                border: `1px solid ${selectedCats.includes(cat) ? C.cyanBorder : C.border}`,
                borderRadius: 20,
                color: selectedCats.includes(cat) ? C.cyan : C.textMid,
              }}>
                <input
                  type="checkbox"
                  checked={selectedCats.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  style={{ accentColor: C.cyan, width: 13, height: 13 }}
                />
                {cat}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── News card with share ─────────────────────────────── */
function NewsCard({ item, blog=false }) {
  const url    = item.isBlog ? `/blog/${item.id}` : (item.sourceUrl||item.url||"#");
  const isExt  = !item.isBlog;
  const accent = blog ? C.cyan : (SRC[item.source]||"#334155");
  const [showShare, setShowShare] = useState(false);

  return (
    <div className="nb-card" style={{ background:C.card, borderRadius:12, border:`1px solid ${C.border}`, display:"flex", flexDirection:"column", overflow:"hidden" }}>
      {item.image && (
        <div className="nb-img-wrap" style={{ height:185, overflow:"hidden", position:"relative", background:"#040608", flexShrink:0 }}>
          <img src={item.image} alt="" referrerPolicy="no-referrer" loading="lazy"
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
            onError={e=>{ e.target.parentElement.style.display="none"; }} />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(13,17,23,.85) 0%,transparent 60%)" }} />
          {item.isBreaking && (
            <span style={{ position:"absolute", top:10, left:10, background:C.redSolid, color:"#fff", fontSize:9, fontWeight:800, padding:"3px 7px", borderRadius:3, letterSpacing:1 }}>● BREAKING</span>
          )}
          <span style={{ position:"absolute", bottom:10, left:10, background:"rgba(0,0,0,.7)", color:C.text, fontSize:10, padding:"2px 8px", borderRadius:20 }}>
            {item.category}
          </span>
        </div>
      )}
      <div style={{ height:2, background:accent, flexShrink:0 }} />
      <div style={{ padding:"15px 18px", flex:1, display:"flex", flexDirection:"column", gap:10 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <SourceBadge source={item.source} />
          {item.isBreaking && !item.image && (
            <span style={{ fontSize:9, fontWeight:800, color:C.red, border:`1px solid ${C.red}`, padding:"1px 6px", borderRadius:3 }}>● BREAKING</span>
          )}
          {blog && <span style={{ fontSize:9, fontWeight:800, color:C.cyan, border:`1px solid ${C.cyanBorder}`, padding:"1px 6px", borderRadius:3 }}>✦ BLOG</span>}
          <span style={{ fontSize:11, color:C.textMid, marginLeft:"auto", display:"flex", alignItems:"center", gap:4 }}>
            <Clock size={11}/>{item.timeAgo}
          </span>
        </div>
        <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:C.white, lineHeight:1.45, fontFamily:serif }}>
          {item.title}
        </h3>
        {!item.image && (
          <p style={{ margin:0, fontSize:13, color:C.text, lineHeight:1.65, flex:1 }}>
            {item.excerpt?.length > 110 ? item.excerpt.slice(0,110)+"…" : item.excerpt}
          </p>
        )}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:item.image?4:8, flexWrap:"wrap", gap:6 }}>
          {!item.image && <span style={{ fontSize:11, color:C.textMid, background:"rgba(255,255,255,.04)", padding:"3px 10px", borderRadius:20, border:`1px solid ${C.border}` }}>{item.category}</span>}
          {item.image && <span/>}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              onClick={() => setShowShare(!showShare)}
              style={{
                display: "flex", alignItems: "center", gap: 4,
                background: "transparent",
                border: `1px solid ${C.border}`,
                borderRadius: 7,
                color: C.textMid,
                padding: "5px 10px",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              <Share2 size={12}/> Share
            </button>
            <a href={url} {...(isExt?{target:"_blank",rel:"noopener noreferrer"}:{})}
              className="nb-btn"
              style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, fontWeight:600, color:C.cyan, textDecoration:"none", padding:"5px 14px", borderRadius:7, border:`1px solid ${C.cyanBorder}`, background:C.cyanGlow }}
              onMouseEnter={e=>{e.currentTarget.style.background=C.cyan;e.currentTarget.style.color="#040507";e.currentTarget.style.borderColor=C.cyan;}}
              onMouseLeave={e=>{e.currentTarget.style.background=C.cyanGlow;e.currentTarget.style.color=C.cyan;e.currentTarget.style.borderColor=C.cyanBorder;}}>
              Read {isExt&&<ExternalLink size={11}/>}
            </a>
          </div>
        </div>
        {showShare && (
          <div style={{ paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
            <ShareButtons title={item.title} url={url} onClose={() => setShowShare(false)} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Trending slideshow ───────────────────────────────── */
function TrendingSlideshow({ items, loading }) {
  const [idx, setIdx]   = useState(0);
  const [paused, pause] = useState(false);
  const timerRef        = useRef(null);

  const slides = items.filter(n=>n.image||n.isBreaking).slice(0,8);

  const goTo = useCallback(i => {
    setIdx((i + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(()=>{
    if(paused||slides.length<2) return;
    timerRef.current = setInterval(()=>goTo(idx+1), 5000);
    return ()=>clearInterval(timerRef.current);
  },[idx, paused, slides.length, goTo]);

  if(loading) return (
    <div className="nb-shimmer" style={{ height:460, background:"#0A0F18", borderRadius:16, marginBottom:48 }}/>
  );
  if(!slides.length) return null;

  const cur = slides[idx];
  const url = cur.isBlog ? `/blog/${cur.id}` : (cur.sourceUrl||cur.url||"#");

  return (
    <div style={{ position:"relative", height:"clamp(320px,45vw,480px)", borderRadius:16, overflow:"hidden", marginBottom:48 }}
      onMouseEnter={()=>pause(true)} onMouseLeave={()=>pause(false)}>

      {slides.map((s,i)=>(
        <div key={s.id||i} className={i===idx?"nb-slide nb-slide-active":"nb-slide nb-slide-inactive"}
          style={{ position:"absolute", inset:0 }}>
          {s.image && <img src={s.image} alt="" referrerPolicy="no-referrer"
            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
            onError={e=>e.target.style.display="none"} />}
          {!s.image && <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#0A0F18,#061530)" }}/>}
        </div>
      ))}

      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(4,5,7,.97) 0%,rgba(4,5,7,.5) 50%,rgba(4,5,7,.12) 100%)", zIndex:2 }}/>

      <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"clamp(20px,4vw,40px)", zIndex:3 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, flexWrap:"wrap" }}>
          <span style={{ background:C.cyan, color:"#040507", fontSize:10, fontWeight:900, padding:"4px 10px", borderRadius:4, letterSpacing:1 }}>TRENDING</span>
          {cur.isBreaking && (
            <span style={{ color:C.red, fontSize:11, fontWeight:700, display:"flex", alignItems:"center", gap:5 }}>
              <span className="nb-pulse" style={{ width:7,height:7,borderRadius:"50%",background:C.red,display:"inline-block" }}/> BREAKING
            </span>
          )}
          <SourceBadge source={cur.source}/>
          <span style={{ color:"rgba(255,255,255,.45)", fontSize:12, display:"flex", alignItems:"center", gap:4 }}><Clock size={11}/>{cur.timeAgo}</span>
        </div>
        <h2 style={{ margin:"0 0 16px", fontSize:"clamp(18px,3vw,30px)", fontWeight:900, color:C.white, lineHeight:1.25, fontFamily:serif, maxWidth:700 }}>
          {cur.title}
        </h2>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <a href={url} {...(!cur.isBlog?{target:"_blank",rel:"noopener noreferrer"}:{})}
            className="nb-btn"
            style={{ display:"inline-flex", alignItems:"center", gap:7, background:C.cyan, color:"#040507", padding:"10px 22px", borderRadius:8, fontWeight:700, fontSize:13, textDecoration:"none" }}
            onMouseEnter={e=>e.currentTarget.style.opacity=".88"}
            onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
            Read Story {!cur.isBlog&&<ExternalLink size={13}/>}
          </a>
        </div>
      </div>

      {slides.length > 1 && <>
        <button onClick={()=>{pause(true);goTo(idx-1);}}
          style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", zIndex:4, background:"rgba(0,0,0,.55)", border:`1px solid rgba(255,255,255,.15)`, color:C.white, width:38, height:38, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          <ChevronLeft size={18}/>
        </button>
        <button onClick={()=>{pause(true);goTo(idx+1);}}
          style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", zIndex:4, background:"rgba(0,0,0,.55)", border:`1px solid rgba(255,255,255,.15)`, color:C.white, width:38, height:38, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
          <ChevronRight size={18}/>
        </button>
      </>}

      <div style={{ position:"absolute", bottom:16, right:20, zIndex:4, display:"flex", gap:5, alignItems:"center" }}>
        {slides.map((_,i)=>(
          <span key={i} className="nb-dot" onClick={()=>{pause(true);goTo(i);}}
            style={{ height:4, width:i===idx?22:6, borderRadius:4, background:i===idx?C.cyan:"rgba(255,255,255,.3)" }}/>
        ))}
      </div>

      <div style={{ position:"absolute", top:16, right:16, zIndex:4, background:"rgba(0,0,0,.6)", border:`1px solid rgba(255,255,255,.12)`, color:C.textMid, fontSize:11, padding:"4px 10px", borderRadius:20 }}>
        {idx+1} / {slides.length}
      </div>
    </div>
  );
}

/* ── Breaking ticker ──────────────────────────────────── */
function BreakingTicker({ items }) {
  const breaking = items.filter(n=>n.isBreaking);
  if(!breaking.length) return null;
  const doubled = [...breaking,...breaking];
  return (
    <div style={{ background:"#0A0C10", borderBottom:`1px solid ${C.border}`, overflow:"hidden", display:"flex", alignItems:"center", height:38 }}>
      <div style={{ background:C.redSolid, padding:"0 16px", fontSize:10, fontWeight:900, color:"#fff", height:"100%", display:"flex", alignItems:"center", gap:6, flexShrink:0, letterSpacing:1.5 }}>
        <span className="nb-pulse" style={{ width:6,height:6,borderRadius:"50%",background:"#fff",display:"inline-block" }}/>
        BREAKING
      </div>
      <div style={{ width:1, height:"100%", background:C.border, flexShrink:0 }}/>
      <div style={{ flex:1, overflow:"hidden", display:"flex", alignItems:"center" }}>
        <div className="nb-ticker">
          {doubled.map((it,i)=>(
            <span key={i} style={{ padding:"0 32px", fontSize:12, color:C.text, fontWeight:500 }}>
              {it.title}
              <span style={{ marginLeft:32, color:C.textFaint }}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── WhatsApp channel banner ──────────────────────────── */
function WhatsAppBanner() {
  const [visible, setVisible] = useState(true);
  if(!visible) return null;
  return (
    <div style={{ background:"rgba(37,211,102,.08)", borderBottom:`1px solid rgba(37,211,102,.2)`, padding:"9px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <span style={{ fontSize:18 }}>💬</span>
        <span style={{ fontSize:13, color:"#86EFAC", fontWeight:500 }}>
          Get instant news updates — join the <strong style={{color:"#4ADE80"}}>NeriBuzz WhatsApp Channel</strong>
        </span>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="nb-btn"
          style={{ background:"#25D366", color:"#fff", fontSize:12, fontWeight:700, padding:"6px 16px", borderRadius:7, textDecoration:"none" }}>
          Join Channel
        </a>
        <button onClick={()=>setVisible(false)} style={{ background:"transparent", border:"none", color:"rgba(134,239,172,.5)", cursor:"pointer", padding:2, display:"flex" }}>
          <X size={16}/>
        </button>
      </div>
    </div>
  );
}

/* ── WhatsApp floating button ─────────────────────────── */
function WhatsAppFloat() {
  return (
    <a href={WA_URL} target="_blank" rel="noopener noreferrer"
      title="Join NeriBuzz on WhatsApp"
      style={{ position:"fixed", bottom:26, right:26, zIndex:100, background:"#25D366", color:"#fff", width:54, height:54, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 24px rgba(37,211,102,.4)", textDecoration:"none", fontSize:26, transition:"transform .2s, box-shadow .2s" }}
      onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.1)";e.currentTarget.style.boxShadow="0 6px 32px rgba(37,211,102,.6)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 24px rgba(37,211,102,.4)";}}>
      💬
    </a>
  );
}

/* ── Header ───────────────────────────────────────────── */
function Header({ categories, activeCat, onCat, onHome, mobileOpen, onMobile, onToggleAdmin, isAdmin, onToggleNotifications }) {
  return (
    <header style={{ background:C.nav, borderBottom:`1px solid ${C.navBorder}`, position:"sticky", top:0, zIndex:50 }}>
      <div style={{ maxWidth:1300, margin:"0 auto", padding:"0 20px", display:"flex", alignItems:"center", justifyContent:"space-between", height:58 }}>
        <div onClick={onHome} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:2, userSelect:"none" }}>
          <span style={{ fontSize:26, fontWeight:900, color:C.white, letterSpacing:-1, fontFamily:serif }}>Neri</span>
          <span style={{ fontSize:26, fontWeight:900, color:C.cyan,  letterSpacing:-1, fontFamily:serif }}>Buzz</span>
          <span style={{ marginLeft:10, fontSize:9, fontWeight:700, color:C.cyan, background:C.cyanGlow, border:`1px solid ${C.cyanBorder}`, padding:"2px 7px", borderRadius:4, letterSpacing:1.5, alignSelf:"center" }}>NIGERIA</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {/* Notification bell */}
          <button onClick={onToggleNotifications} className="nb-btn"
            style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.textMid, cursor:"pointer", padding:"7px 9px", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
            <Bell size={18}/>
          </button>
          
          {/* Admin toggle - double click logo or click this */}
          <button onClick={onToggleAdmin} className="nb-btn"
            style={{ background:isAdmin ? C.cyanGlow : "transparent", border:`1px solid ${isAdmin ? C.cyanBorder : C.border}`, color:isAdmin ? C.cyan : C.textMid, cursor:"pointer", padding:"7px 9px", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>
            {isAdmin ? "👑" : "⚙️"}
          </button>
          
          <button onClick={onMobile} className="nb-btn" aria-label="Menu"
            style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.text, cursor:"pointer", padding:"7px 9px", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {mobileOpen ? <X size={18}/> : <Menu size={18}/>}
          </button>
        </div>
      </div>

      <div style={{ borderTop:`1px solid ${C.navBorder}`, overflowX:"auto" }}>
        <div style={{ maxWidth:1300, margin:"0 auto", padding:"0 20px", display:"flex" }}>
          {["All",...categories].map(cat=>(
            <button key={cat} onClick={()=>onCat(cat)} className="nb-btn"
              style={{ padding:"10px 15px", background:"transparent", border:"none",
                borderBottom:activeCat===cat?`2px solid ${C.cyan}`:"2px solid transparent",
                color:activeCat===cat?C.cyan:C.textMid,
                fontSize:13, fontWeight:activeCat===cat?700:500, cursor:"pointer", whiteSpace:"nowrap" }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {mobileOpen && (
        <div className="nb-overlay" style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:C.nav, zIndex:200, display:"flex", flexDirection:"column", padding:"24px", overflowY:"auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32 }}>
            <div style={{ fontSize:22, fontFamily:serif, fontWeight:900 }}>
              <span style={{color:C.white}}>Neri</span><span style={{color:C.cyan}}>Buzz</span>
            </div>
            <button onClick={onMobile} style={{ background:C.cyanGlow, border:`1px solid ${C.cyanBorder}`, color:C.cyan, cursor:"pointer", padding:"8px", borderRadius:8, display:"flex" }}>
              <X size={20}/>
            </button>
          </div>
          {["All",...categories].map(cat=>(
            <button key={cat} onClick={()=>onCat(cat)} className="nb-btn"
              style={{ textAlign:"left", background:activeCat===cat?C.cyanGlow:"transparent", border:`1px solid ${activeCat===cat?C.cyanBorder:C.border}`, borderRadius:10, color:activeCat===cat?C.cyan:C.text, padding:"14px 18px", marginBottom:8, fontSize:15, fontWeight:activeCat===cat?700:500, cursor:"pointer" }}>
              {cat}
            </button>
          ))}
          <div style={{ marginTop:"auto", paddingTop:24, borderTop:`1px solid ${C.border}` }}>
            <a href={WA_URL} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex", alignItems:"center", gap:10, background:"rgba(37,211,102,.1)", border:"1px solid rgba(37,211,102,.25)", color:"#4ADE80", padding:"13px 18px", borderRadius:10, fontSize:14, fontWeight:600, textDecoration:"none", marginBottom:10 }}>
              💬 Join NeriBuzz WhatsApp Channel
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Section heading ──────────────────────────────────── */
function SectionHead({ title, count, onRefresh, loading }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
      <div style={{ display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ width:3, height:24, background:C.cyan, borderRadius:2, display:"inline-block" }}/>
        <h2 style={{ margin:0, fontSize:19, fontWeight:800, color:C.white, fontFamily:serif }}>{title}</h2>
        {count!=null && <span style={{ fontSize:11, color:C.textMid, background:"rgba(255,255,255,.04)", padding:"2px 9px", borderRadius:20, border:`1px solid ${C.border}` }}>{count}</span>}
      </div>
      {onRefresh && (
        <button onClick={onRefresh} disabled={loading} className="nb-btn"
          style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:`1px solid ${C.border}`, color:C.textMid, padding:"6px 14px", borderRadius:8, fontSize:12, cursor:loading?"not-allowed":"pointer", opacity:loading?.6:1 }}>
          <RefreshCw size={13} className={loading?"nb-spin":""}/> Refresh
        </button>
      )}
    </div>
  );
}

/* ── News grid ────────────────────────────────────────── */
function NewsGrid({ items, loading }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(295px,1fr))", gap:18 }}>
      {loading
        ? [1,2,3,4,5,6].map(i=><Skeleton key={i}/>)
        : items.map((it,i)=><NewsCard key={it.id||`b${i}`} item={it} blog={!!it.isBlog}/>)
      }
    </div>
  );
}

/* ── Category View with Admin Delete ──────────────────── */
function CategoryView({ cat, news, blogPosts, onBack, onRefresh, loading, lastRefresh, isAdmin = false, onDeleteNews }) {
  const blogs = blogPosts.map(p=>({...p,isBlog:true}));
  const items = cat==="All"
    ? [...news,...blogs]
    : [...news.filter(n=>n.category===cat),...blogs.filter(b=>b.category===cat)];

  const [showDelete, setShowDelete] = useState(null);

  return (
    <div style={{ maxWidth:1300, margin:"0 auto", padding:"28px 20px 60px" }}>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:14 }}>
        <div>
          <button onClick={onBack} className="nb-btn"
            style={{ background:"transparent", border:"none", color:C.textMid, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:4, marginBottom:8, padding:0 }}>
            ← Back to Home
          </button>
          <h1 style={{ margin:"0 0 6px", fontSize:30, fontWeight:900, color:C.white, fontFamily:serif }}>
            {cat} <span style={{color:C.cyan}}>News</span>
            {isAdmin && <span style={{ fontSize:14, color: C.textMid, fontWeight: 400, marginLeft: 12 }}>👑 Admin View</span>}
          </h1>
          <p style={{ margin:0, fontSize:13, color:C.textMid }}>
            {loading?"Fetching…":`${items.length} stories · ${lastRefresh.toLocaleTimeString()}`}
          </p>
        </div>
        <button onClick={onRefresh} disabled={loading} className="nb-btn"
          style={{ display:"flex", alignItems:"center", gap:7, background:C.cyanGlow, border:`1px solid ${C.cyanBorder}`, color:C.cyan, padding:"10px 20px", borderRadius:9, fontSize:13, fontWeight:600, cursor:loading?"not-allowed":"pointer", opacity:loading?.7:1 }}>
          <RefreshCw size={13} className={loading?"nb-spin":""}/> Refresh
        </button>
      </div>
      
      {!loading && items.length===0 ? (
        <div style={{ textAlign:"center", padding:"80px 20px", color:C.textMid }}>
          <Globe size={52} style={{marginBottom:18,opacity:.25}}/>
          <p style={{fontSize:16,margin:0}}>No stories in {cat} yet.</p>
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(295px,1fr))", gap:18 }}>
          {items.map((it,i) => (
            <div key={it.id||`b${i}`} style={{ position: "relative" }}>
              <NewsCard item={it} blog={!!it.isBlog} />
              {isAdmin && (
                <button
                  onClick={() => {
                    if (showDelete === it.id) {
                      onDeleteNews?.(it.id);
                      setShowDelete(null);
                    } else {
                      setShowDelete(it.id);
                      setTimeout(() => setShowDelete(null), 3000);
                    }
                  }}
                  style={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 5,
                    background: showDelete === it.id ? C.redSolid : "rgba(0,0,0,0.7)",
                    border: "none",
                    borderRadius: 6,
                    color: "#fff",
                    padding: "4px 10px",
                    fontSize: 10,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {showDelete === it.id ? "Confirm?" : "✕ Delete"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Home view ────────────────────────────────────────── */
function HomeView({ news, blogPosts, categories, onCatSelect, onRefresh, loading, lastRefresh, errorCount }) {
  const blogs = blogPosts.map(p=>({...p, isBlog:true}));
  const top   = [...news,...blogs].slice(0,6);

  return (
    <div style={{ maxWidth:1300, margin:"0 auto", padding:"28px 20px 60px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22, flexWrap:"wrap", gap:10 }}>
        <span style={{ fontSize:12, color:C.textMid, display:"flex", alignItems:"center", gap:6 }}>
          <Clock size={13}/>
          {loading ? "Fetching live headlines…" : `${news.length} live stories · ${lastRefresh.toLocaleTimeString()}`}
        </span>
        <button onClick={onRefresh} disabled={loading} className="nb-btn"
          style={{ display:"flex", alignItems:"center", gap:7, background:C.cyanGlow, border:`1px solid ${C.cyanBorder}`, color:C.cyan, padding:"8px 18px", borderRadius:8, fontSize:13, fontWeight:600, cursor:loading?"not-allowed":"pointer", opacity:loading?.7:1 }}>
          <RefreshCw size={13} className={loading?"nb-spin":""}/>{loading?"Loading…":"Refresh Feed"}
        </button>
      </div>

      {errorCount > 0 && !loading && (
        <div style={{ background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", borderRadius:8, padding:"10px 16px", marginBottom:22, fontSize:13, color:C.red, display:"flex", alignItems:"center", gap:8 }}>
          <AlertCircle size={14}/> {errorCount} feed{errorCount>1?"s":""} unavailable — some stories may be missing.
        </div>
      )}

      <TrendingSlideshow items={news} loading={loading}/>

      <div style={{marginBottom:48}}>
        <SectionHead title="Top Stories" count={loading?null:top.length}/>
        <NewsGrid items={top} loading={loading}/>
      </div>

      {!loading && categories.map(cat=>{
        const catItems = [
          ...news.filter(n=>n.category===cat).slice(0,3),
          ...blogs.filter(b=>b.category===cat).slice(0,1),
        ].slice(0,3);
        if(!catItems.length) return null;
        return (
          <div key={cat} style={{marginBottom:48}}>
            <SectionHead title={cat} count={catItems.length}/>
            <NewsGrid items={catItems}/>
            <button onClick={()=>onCatSelect(cat)} className="nb-btn"
              style={{ marginTop:14, display:"inline-flex", alignItems:"center", gap:6, background:"transparent", border:`1px solid ${C.border}`, color:C.textMid, padding:"9px 18px", borderRadius:8, fontSize:13, cursor:"pointer" }}>
              More {cat} stories <ChevronRight size={14}/>
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ── Footer ───────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{ background:C.nav, borderTop:`1px solid ${C.navBorder}`, padding:"36px 20px 28px" }}>
      <div style={{ maxWidth:1300, margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:28, marginBottom:28 }}>
          <div>
            <div style={{ display:"flex", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontSize:22, fontWeight:900, color:C.white, fontFamily:serif }}>Neri</span>
              <span style={{ fontSize:22, fontWeight:900, color:C.cyan,  fontFamily:serif }}>Buzz</span>
            </div>
            <p style={{ margin:"0 0 16px", fontSize:13, color:C.textMid, maxWidth:300, lineHeight:1.6 }}>
              Real-time Nigerian news from Punch, Vanguard, Channels TV, BBC Africa, Al Jazeera and more.
            </p>
            <a href={WA_URL} target="_blank" rel="noopener noreferrer"
              style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(37,211,102,.1)", border:"1px solid rgba(37,211,102,.25)", color:"#4ADE80", padding:"9px 18px", borderRadius:8, fontSize:13, fontWeight:600, textDecoration:"none" }}>
              💬 Join our WhatsApp Channel
            </a>
          </div>
          <div>
            <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:C.textMid, letterSpacing:1, textTransform:"uppercase" }}>News Sources</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {["Punch","Vanguard","Channels TV","The Cable","BBC Africa","Al Jazeera","TechCabal","ESPN"].map(s=>(
                <span key={s} style={{ fontSize:11, color:C.textMid, background:"rgba(255,255,255,.04)", border:`1px solid ${C.border}`, padding:"3px 9px", borderRadius:20 }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:20, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <p style={{ margin:0, fontSize:12, color:C.textFaint }}>
            © {new Date().getFullYear()} NeriBuzz · All headline rights belong to their respective publishers.
          </p>
          <Link href="/admin"
            style={{ display:"flex", alignItems:"center", gap:6, background:"transparent", border:`1px solid ${C.border}`, color:C.textMid, padding:"6px 14px", borderRadius:7, fontSize:12, textDecoration:"none" }}>
            ⚙ Admin Panel
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* ── Main App ─────────────────────────────────────────── */
export default function NeriBuzz() {
  const [page,       setPage]    = useState("home");
  const [activeCat,  setActive]  = useState("All");
  const [loading,    setLoading] = useState(true);
  const [firstLoad,  setFirst]   = useState(true);
  const [lastRefresh,setLR]      = useState(new Date());
  const [news,       setNews]    = useState([]);
  const [errorCount, setErrCnt]  = useState(0);
  const [mobileOpen, setMobile]  = useState(false);
  const [isAdmin,    setIsAdmin] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);

  const [posts, setPosts] = useState(()=>lsGet("nb_posts",[]));
  const [cats,  setCats]  = useState(()=>lsGet("nb_cats",DEF_CATS));
  useEffect(()=>lsSet("nb_posts",posts),[posts]);
  useEffect(()=>lsSet("nb_cats",cats),[cats]);

  // Toggle admin mode with double click on logo
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("admin") === "true") {
        setIsAdmin(true);
      }
    }
  }, []);

  const loadNews = useCallback(async()=>{
    setLoading(true);
    try {
      const r = await fetch("/api/news");
      if(!r.ok) throw new Error(`API ${r.status}`);
      const {news:n, feedLog:l} = await r.json();
      setErrCnt((l||[]).filter(f=>!f.ok).length);
      setNews(n||[]);
      setLR(new Date());
      
      // Check for breaking news and send notifications
      const breakingNews = (n||[]).filter(item => item.isBreaking);
      const notifEnabled = lsGet("nb_notifications_enabled", false);
      const notifCats = lsGet("nb_notification_cats", DEF_CATS);
      
      if (notifEnabled && breakingNews.length > 0 && typeof window !== "undefined" && "Notification" in window) {
        const recentBreaking = breakingNews.filter(n => {
          const stored = lsGet("nb_notified_ids", []);
          return !stored.includes(n.id) && notifCats.includes(n.category);
        });
        
        if (recentBreaking.length > 0) {
          const notifIds = lsGet("nb_notified_ids", []);
          recentBreaking.forEach(item => {
            if (notifCats.includes(item.category)) {
              try {
                new Notification("🔴 NeriBuzz Breaking News", {
                  body: `${item.title.substring(0, 80)}...`,
                  icon: item.image || "/favicon.ico",
                  data: { url: item.sourceUrl || `/blog/${item.id}` },
                });
                notifIds.push(item.id);
              } catch {}
            }
          });
          lsSet("nb_notified_ids", notifIds.slice(-50));
        }
      }
    } catch(e){ console.error(e); }
    finally { setLoading(false); setFirst(false); }
  },[]);

  useEffect(()=>{ loadNews(); },[loadNews]);
  useEffect(()=>{ const t=setInterval(loadNews,3600000); return()=>clearInterval(t); },[loadNews]);

  const navTo   = cat=>{setActive(cat);setPage(cat==="All"?"home":"category");setMobile(false);};
  const onGoHome= ()=>{setPage("home");setActive("All");};
  const deleteNews = (id) => {
    setNews(prev => prev.filter(n => n.id !== id));
  };

  // Toggle admin with double click
  const handleLogoDoubleClick = () => {
    setIsAdmin(!isAdmin);
  };

  // Listen for posts/cats changes from admin
  useEffect(()=>{
    const sync = ()=>{
      setPosts(lsGet("nb_posts",[]));
      setCats(lsGet("nb_cats",DEF_CATS));
    };
    window.addEventListener("storage", sync);
    return ()=>window.removeEventListener("storage", sync);
  },[]);

  if(firstLoad && loading) return <PageLoader/>;

  return (
    <div style={{ background:C.page, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      <BreakingTicker items={news}/>
      <WhatsAppBanner/>
      <Header 
        categories={cats} 
        activeCat={activeCat} 
        onCat={navTo} 
        onHome={onGoHome} 
        mobileOpen={mobileOpen} 
        onMobile={()=>setMobile(o=>!o)}
        onToggleAdmin={() => setIsAdmin(!isAdmin)}
        isAdmin={isAdmin}
        onToggleNotifications={() => setShowNotifSettings(!showNotifSettings)}
      />

      <div style={{flex:1}}>
        {/* Notification Settings - only shown when toggled */}
        {showNotifSettings && (
          <div style={{ maxWidth: 600, margin: "20px auto 0", padding: "0 20px" }}>
            <NotificationSettings categories={cats} onSave={(enabled, cats) => {
              if (enabled) {
                if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                  new Notification("✅ NeriBuzz Notifications Active", {
                    body: `You'll get alerts for: ${cats.join(", ")}`,
                    icon: "/favicon.ico",
                  });
                }
              }
            }} />
          </div>
        )}

        {page==="home" && (
          <HomeView 
            news={news} 
            blogPosts={posts} 
            categories={cats}
            onCatSelect={cat=>{setActive(cat);setPage("category");}}
            onRefresh={loadNews} 
            loading={loading} 
            lastRefresh={lastRefresh} 
            errorCount={errorCount}
          />
        )}
        {page==="category" && (
          <CategoryView 
            cat={activeCat} 
            news={news} 
            blogPosts={posts}
            onBack={onGoHome} 
            onRefresh={loadNews} 
            loading={loading} 
            lastRefresh={lastRefresh}
            isAdmin={isAdmin}
            onDeleteNews={deleteNews}
          />
        )}
      </div>

      <Footer/>
      <WhatsAppFloat/>
    </div>
  );
}