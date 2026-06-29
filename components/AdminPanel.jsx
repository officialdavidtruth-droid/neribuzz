import { useState, useEffect, useCallback, useRef } from "react";
import {
  Shield, LogOut, BarChart2, FileText, Plus, Tag, Edit3,
  Trash2, CheckCircle, AlertCircle, Wifi, WifiOff,
  RefreshCw, Globe, Image, ArrowLeft, Eye, EyeOff,
} from "lucide-react";

const C = {
  page:"#08090D", card:"#0A0E14", cardAlt:"#0D1117", nav:"#040507",
  navBorder:"#0F1520", cyan:"#22D3EE", cyanDim:"#0891B2",
  cyanGlow:"rgba(34,211,238,0.12)", cyanBorder:"rgba(34,211,238,0.22)",
  white:"#F1F5F9", text:"#CBD5E1", textMid:"#64748B", textFaint:"#1E2D3D",
  border:"#1A2535", borderHi:"#263548", red:"#F87171", redSolid:"#EF4444",
  green:"#34D399",
};
const serif = '"Playfair Display", Georgia, serif';
const SRC = {
  "Punch":"#E53935","Vanguard":"#1E88E5","Premium Times":"#1565C0",
  "Guardian Nigeria":"#43A047","Channels TV":"#FB8C00","The Cable":"#8E24AA",
  "BBC Africa":"#D32F2F","BBC World":"#D32F2F","BBC Business":"#D32F2F",
  "BBC Sport":"#C62828","BBC Entertainment":"#D32F2F","BBC Technology":"#D32F2F",
  "BBC Health":"#D32F2F","Al Jazeera":"#E64A19","TechCabal":"#00ACC1",
  "Punch Sports":"#E53935","Punch Politics":"#E53935","Punch Entertainment":"#E53935",
  "Vanguard Business":"#1E88E5","Vanguard Politics":"#1E88E5","NeriBuzz":"#22D3EE",
};

const lsGet = (k,fb) => { try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;} };
const lsSet = (k,v)  => { try{localStorage.setItem(k,JSON.stringify(v));}catch{} };
const DEF_CATS = ["Nigeria","International","Business","Sports","Entertainment","Technology","Health","Politics"];

/* ── Loading spinner ──────────────────────────────────── */
function Loader({ text = "Loading…" }) {
  return (
    <div style={{ minHeight:"100vh", background:C.page, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:22 }}>
      <div style={{ fontSize:30, fontFamily:serif, fontWeight:900 }}>
        <span style={{color:C.white}}>Neri</span><span style={{color:C.cyan}}>Buzz</span>
      </div>
      <div style={{ width:44, height:44, borderRadius:"50%", border:`3px solid ${C.cyanGlow}`, borderTopColor:C.cyan, animation:"nbspin .8s linear infinite" }} />
      <p style={{ color:C.textMid, fontSize:13, margin:0 }}>{text}</p>
    </div>
  );
}

/* ── Admin Login ──────────────────────────────────────── */
function LoginScreen({ onLogin }) {
  const [user, setUser]   = useState("");
  const [pass, setPass]   = useState("");
  const [show, setShow]   = useState(false);
  const [err,  setErr]    = useState("");
  const [busy, setBusy]   = useState(false);

  const attempt = () => {
    setBusy(true); setErr("");
    const pwd = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_ADMIN_PASSWORD) || "neribuzz2025";
    setTimeout(() => {
      if (user === "admin" && pass === pwd) {
        lsSet("nb_admin_auth", { time: Date.now() });
        onLogin();
      } else { setErr("Invalid username or password."); setBusy(false); }
    }, 700);
  };

  const inp = { width:"100%", padding:"11px 14px", background:"#070B10", border:`1px solid ${C.border}`, borderRadius:8, fontSize:14, outline:"none", color:C.white, fontFamily:"inherit" };

  return (
    <div style={{ minHeight:"100vh", background:C.page, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:18, padding:"44px 40px", width:"100%", maxWidth:420, boxShadow:"0 32px 80px rgba(0,0,0,.6)" }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:58, height:58, background:C.cyanGlow, border:`1px solid ${C.cyanBorder}`, borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px" }}>
            <Shield size={28} color={C.cyan} />
          </div>
          <div style={{ fontSize:24, fontFamily:serif, fontWeight:900, marginBottom:6 }}>
            <span style={{color:C.white}}>Neri</span><span style={{color:C.cyan}}>Buzz</span>
          </div>
          <p style={{ margin:0, fontSize:13, color:C.textMid }}>Admin Control Panel</p>
        </div>
        {err && (
          <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.25)", borderRadius:8, padding:"10px 14px", marginBottom:18, fontSize:13, color:C.red, display:"flex", alignItems:"center", gap:8 }}>
            <AlertCircle size={14}/> {err}
          </div>
        )}
        <div style={{marginBottom:16}}>
          <label style={{ fontSize:11, fontWeight:700, color:C.textMid, display:"block", marginBottom:7, letterSpacing:.8, textTransform:"uppercase" }}>Username</label>
          <input type="text" value={user} placeholder="admin" autoComplete="username"
            onChange={e=>setUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} style={inp} />
        </div>
        <div style={{marginBottom:28}}>
          <label style={{ fontSize:11, fontWeight:700, color:C.textMid, display:"block", marginBottom:7, letterSpacing:.8, textTransform:"uppercase" }}>Password</label>
          <div style={{position:"relative"}}>
            <input type={show?"text":"password"} value={pass} placeholder="••••••••••" autoComplete="current-password"
              onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()}
              style={{...inp, paddingRight:44}} />
            <button onClick={()=>setShow(!show)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:C.textMid,cursor:"pointer",padding:0,display:"flex"}}>
              {show?<EyeOff size={16}/>:<Eye size={16}/>}
            </button>
          </div>
        </div>
        <button onClick={attempt} disabled={busy}
          style={{ width:"100%", padding:14, background:busy?C.cyanDim:C.cyan, border:"none", borderRadius:9, color:"#040507", fontSize:15, fontWeight:700, cursor:busy?"not-allowed":"pointer" }}>
          {busy ? "Verifying…" : "Sign In"}
        </button>
        <a href="/" style={{ display:"block", textAlign:"center", marginTop:14, color:C.textMid, fontSize:13, textDecoration:"none" }}>← Back to NeriBuzz</a>
        <p style={{ textAlign:"center", fontSize:11, color:C.textFaint, margin:"20px 0 0" }}>
          admin / neribuzz2025 · change via Vercel env var
        </p>
      </div>
    </div>
  );
}

/* ── Write / Edit Article ─────────────────────────────── */
function WriteArticle({ editing, categories, onSave, onCancel }) {
  const isEdit = !!editing;
  const [title,       setTitle]       = useState(editing?.title || "");
  const [content,     setContent]     = useState(editing?.content || editing?.excerpt || "");
  const [coverImage,  setCoverImage]  = useState(editing?.coverImage || editing?.image || "");
  const [category,    setCategory]    = useState(editing?.category || categories[0] || "Nigeria");
  const [isBreaking,  setIsBreaking]  = useState(editing?.isBreaking || false);
  const [excerpt,     setExcerpt]     = useState("");
  const [imgErr,      setImgErr]      = useState(false);
  const [msg,         setMsg]         = useState({ text:"", ok:false });
  const contentRef = useRef(null);

  /* Auto-generate excerpt from first paragraph */
  useEffect(() => {
    const first = content.split(/\n\n+/).find(p=>p.trim()) || content;
    setExcerpt(first.replace(/#+\s*/g,"").trim().slice(0, 240));
  }, [content]);

  const handleSave = () => {
    if (!title.trim())   { setMsg({text:"Headline is required.", ok:false}); return; }
    if (!content.trim()) { setMsg({text:"Article content is required.", ok:false}); return; }

    const id  = editing?.id || Date.now();
    const post = {
      id, title:title.trim(), content:content.trim(), excerpt,
      coverImage:coverImage.trim(), image:coverImage.trim()||null,
      category, source:"NeriBuzz", author:"NeriBuzz Staff",
      timeAgo:"Just now", pubDate:new Date().toISOString(),
      isBlog:true, isBreaking,
      url:`/blog/${id}`, sourceUrl:`/blog/${id}`,
    };
    onSave(post, isEdit);
  };

  const inp = { width:"100%", padding:"12px 14px", background:"#060A0F", border:`1px solid ${C.border}`, borderRadius:8, fontSize:14, outline:"none", color:C.white, fontFamily:"inherit" };

  return (
    <div style={{ maxWidth:860, margin:"0 auto" }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <button onClick={onCancel} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.textMid, padding:"7px 14px", borderRadius:8, fontSize:13, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}>
            <ArrowLeft size={14}/> Back
          </button>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:C.white, fontFamily:serif }}>
            {isEdit ? "Edit Article" : "Write New Article"}
          </h2>
        </div>
        <button onClick={handleSave}
          style={{ display:"flex", alignItems:"center", gap:7, background:C.cyan, border:"none", color:"#040507", padding:"10px 24px", borderRadius:9, fontSize:14, fontWeight:700, cursor:"pointer" }}>
          <CheckCircle size={15}/> {isEdit ? "Update Article" : "Publish Article"}
        </button>
      </div>

      {msg.text && (
        <div style={{ background:msg.ok?"rgba(52,211,153,.1)":"rgba(239,68,68,.1)", border:`1px solid ${msg.ok?"rgba(52,211,153,.3)":"rgba(239,68,68,.3)"}`, borderRadius:9, padding:"11px 16px", marginBottom:20, fontSize:13, color:msg.ok?C.green:C.red, display:"flex", alignItems:"center", gap:8 }}>
          {msg.ok?<CheckCircle size={14}/>:<AlertCircle size={14}/>} {msg.text}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        {/* Cover image */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.textMid, display:"block", marginBottom:8, letterSpacing:.8, textTransform:"uppercase" }}>Cover Image URL</label>
          <input type="url" value={coverImage} placeholder="https://example.com/image.jpg"
            onChange={e=>{setCoverImage(e.target.value);setImgErr(false);}} style={inp} />
          {coverImage && !imgErr && (
            <div style={{ marginTop:12, borderRadius:8, overflow:"hidden", height:130, background:"#040608" }}>
              <img src={coverImage} alt="preview" referrerPolicy="no-referrer"
                style={{ width:"100%", height:"100%", objectFit:"cover" }}
                onError={()=>setImgErr(true)} />
            </div>
          )}
          {imgErr && <p style={{ margin:"8px 0 0", fontSize:12, color:C.red }}>⚠ Image failed to load — check the URL</p>}
        </div>

        {/* Category + Breaking */}
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20 }}>
          <div style={{ marginBottom:18 }}>
            <label style={{ fontSize:11, fontWeight:700, color:C.textMid, display:"block", marginBottom:8, letterSpacing:.8, textTransform:"uppercase" }}>Category</label>
            <select value={category} onChange={e=>setCategory(e.target.value)}
              style={{...inp, background:"#060A0F"}}>
              {categories.map(c=><option key={c} value={c} style={{background:"#060A0F"}}>{c}</option>)}
            </select>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", background:"#060A0F", border:`1px solid ${C.border}`, borderRadius:8, cursor:"pointer" }}
            onClick={()=>setIsBreaking(!isBreaking)}>
            <div style={{ width:20, height:20, borderRadius:4, background:isBreaking?"#EF4444":"transparent", border:isBreaking?"1px solid #EF4444":`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              {isBreaking && <CheckCircle size={12} color="#fff"/>}
            </div>
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:600, color:C.white }}>Mark as Breaking News</p>
              <p style={{ margin:0, fontSize:11, color:C.textMid }}>Adds red breaking badge + ticker</p>
            </div>
          </div>

          {/* Excerpt preview */}
          <div style={{ marginTop:16 }}>
            <label style={{ fontSize:11, fontWeight:700, color:C.textMid, display:"block", marginBottom:6, letterSpacing:.8, textTransform:"uppercase" }}>
              Auto-generated Excerpt
            </label>
            <p style={{ margin:0, fontSize:12, color:C.text, lineHeight:1.6, background:"#060A0F", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 12px", minHeight:60 }}>
              {excerpt || <span style={{color:C.textMid}}>Start writing to auto-generate…</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Headline */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:16 }}>
        <label style={{ fontSize:11, fontWeight:700, color:C.textMid, display:"block", marginBottom:8, letterSpacing:.8, textTransform:"uppercase" }}>
          Headline *
        </label>
        <input type="text" value={title} placeholder="Write a compelling headline…"
          onChange={e=>setTitle(e.target.value)}
          style={{...inp, fontSize:18, fontWeight:700, fontFamily:serif, color:C.white}} />
      </div>

      {/* Content */}
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:20, marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <label style={{ fontSize:11, fontWeight:700, color:C.textMid, letterSpacing:.8, textTransform:"uppercase" }}>
            Article Content *
          </label>
          <span style={{ fontSize:11, color:C.textMid }}>{content.length} characters · Separate paragraphs with a blank line</span>
        </div>
        <textarea
          ref={contentRef}
          value={content}
          onChange={e=>setContent(e.target.value)}
          placeholder={"Start writing your article here…\n\nAdd a blank line between paragraphs.\n\nThe first paragraph will be used as the excerpt automatically."}
          style={{...inp, resize:"vertical", minHeight:380, lineHeight:1.8, fontSize:15}}
        />
      </div>

      {/* Bottom save */}
      <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
        <button onClick={onCancel} style={{ padding:"11px 22px", border:`1px solid ${C.border}`, borderRadius:9, background:"transparent", color:C.textMid, fontSize:14, cursor:"pointer" }}>
          Cancel
        </button>
        <button onClick={handleSave}
          style={{ display:"flex", alignItems:"center", gap:7, background:C.cyan, border:"none", color:"#040507", padding:"11px 28px", borderRadius:9, fontSize:15, fontWeight:700, cursor:"pointer" }}>
          <CheckCircle size={15}/> {isEdit ? "Update Article" : "Publish Article"}
        </button>
      </div>
    </div>
  );
}

/* ── Dashboard tab ────────────────────────────────────── */
function DashboardTab({ posts, feedLog, news, loading, lastRefresh, onRefresh, onEdit, onDelete, onWrite }) {
  const [delConfirm, setDelConfirm] = useState(null);

  const confirmDel = id => {
    if (delConfirm === id) { onDelete(id); setDelConfirm(null); }
    else { setDelConfirm(id); setTimeout(()=>setDelConfirm(null), 3000); }
  };

  const panel = { background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"18px 22px", marginBottom:16 };

  return (
    <div>
      <h2 style={{ margin:"0 0 22px", fontSize:21, fontWeight:800, color:C.white, fontFamily:serif }}>Dashboard</h2>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(175px,1fr))", gap:12, marginBottom:20 }}>
        {[
          { label:"Live Stories",  val:news.length,                       Icon:Globe,    col:"#38BDF8" },
          { label:"Blog Posts",    val:posts.length,                      Icon:FileText, col:C.cyan    },
          { label:"Feeds Online",  val:feedLog.filter(f=>f.ok).length,   Icon:Wifi,     col:C.green   },
          { label:"Feeds Failed",  val:feedLog.filter(f=>!f.ok).length,  Icon:WifiOff,  col:C.red     },
        ].map(s=>(
          <div key={s.label} style={{...panel, marginBottom:0}}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:12, color:C.textMid, fontWeight:600 }}>{s.label}</span>
              <div style={{ width:32, height:32, borderRadius:8, background:s.col+"18", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <s.Icon size={15} color={s.col}/>
              </div>
            </div>
            <div style={{ fontSize:34, fontWeight:900, color:C.white }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Feed status */}
      <div style={{...panel, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14}}>
        <div>
          <p style={{ margin:0, fontSize:14, fontWeight:700, color:C.white }}>RSS Feed Status</p>
          <p style={{ margin:"4px 0 0", fontSize:12, color:C.textMid }}>
            Last refreshed: {lastRefresh.toLocaleTimeString()} · Auto-refreshes every hour
          </p>
        </div>
        <button onClick={onRefresh} disabled={loading}
          style={{ display:"flex", alignItems:"center", gap:8, background:C.cyan, border:"none", color:"#040507", padding:"10px 20px", borderRadius:9, fontSize:13, fontWeight:700, cursor:loading?"not-allowed":"pointer", opacity:loading?.75:1 }}>
          <RefreshCw size={13} style={{animation:loading?"nbspin .8s linear infinite":"none"}}/> Refresh Now
        </button>
      </div>

      {/* Feed log */}
      {feedLog.length > 0 && (
        <div style={panel}>
          <h3 style={{ margin:"0 0 12px", fontSize:13, fontWeight:700, color:C.white }}>
            Feed Log ({feedLog.filter(f=>f.ok).length}/{feedLog.length} online)
          </h3>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:2 }}>
            {feedLog.map(f=>(
              <div key={f.source} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, padding:"6px 4px", borderBottom:`1px solid ${C.border}` }}>
                {f.ok?<CheckCircle size={12} color={C.green} style={{flexShrink:0}}/>:<AlertCircle size={12} color={C.red} style={{flexShrink:0}}/>}
                <span style={{color:f.ok?C.text:C.textMid,fontSize:11}}>{f.source}</span>
                <span style={{color:C.textMid,marginLeft:"auto",fontSize:11}}>{f.ok?f.count:"–"}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick write */}
      <div style={{...panel, background:"rgba(34,211,238,.04)", borderColor:C.cyanBorder, display:"flex", alignItems:"center", justifyContent:"space-between", gap:14}}>
        <div>
          <p style={{ margin:0, fontSize:14, fontWeight:700, color:C.white }}>Write a News Article</p>
          <p style={{ margin:"4px 0 0", fontSize:12, color:C.textMid }}>Publish your own news reports to NeriBuzz</p>
        </div>
        <button onClick={onWrite}
          style={{ display:"flex", alignItems:"center", gap:7, background:C.cyan, border:"none", color:"#040507", padding:"10px 22px", borderRadius:9, fontSize:13, fontWeight:700, cursor:"pointer" }}>
          <Plus size={14}/> Write Article
        </button>
      </div>

      {/* Recent posts */}
      {posts.length > 0 && (
        <div>
          <h3 style={{ margin:"0 0 12px", fontSize:13, fontWeight:700, color:C.white }}>Recent Articles</h3>
          {posts.slice(0,5).map(p=>(
            <div key={p.id} style={{...panel, display:"flex", alignItems:"center", justifyContent:"space-between", gap:14}}>
              <div style={{flex:1,minWidth:0}}>
                <p style={{ margin:"0 0 4px", fontSize:14, fontWeight:600, color:C.white, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.title}</p>
                <span style={{fontSize:12,color:C.textMid}}>{p.category} · {p.timeAgo}</span>
              </div>
              <div style={{display:"flex",gap:8,flexShrink:0}}>
                <button onClick={()=>onEdit(p)} style={{ padding:"5px 12px", border:`1px solid ${C.border}`, borderRadius:6, background:"transparent", cursor:"pointer", color:C.textMid, fontSize:12 }}>Edit</button>
                <button onClick={()=>confirmDel(p.id)} style={{ padding:"5px 12px", border:"1px solid rgba(239,68,68,.3)", borderRadius:6, background:delConfirm===p.id?"rgba(239,68,68,.15)":"transparent", cursor:"pointer", color:C.red, fontSize:12, fontWeight:delConfirm===p.id?700:400 }}>
                  {delConfirm===p.id?"Confirm?":"Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Posts list tab ───────────────────────────────────── */
function PostsTab({ posts, onEdit, onDelete, onWrite }) {
  const [delConfirm, setDelConfirm] = useState(null);
  const confirmDel = id => {
    if (delConfirm===id){onDelete(id);setDelConfirm(null);}
    else{setDelConfirm(id);setTimeout(()=>setDelConfirm(null),3000);}
  };
  const panel = {background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 20px",marginBottom:12};

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
        <h2 style={{ margin:0, fontSize:21, fontWeight:800, color:C.white, fontFamily:serif }}>All Articles</h2>
        <button onClick={onWrite}
          style={{ display:"flex", alignItems:"center", gap:6, background:C.cyan, border:"none", color:"#040507", padding:"9px 20px", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>
          <Plus size={14}/> New Article
        </button>
      </div>
      {posts.length===0 ? (
        <div style={{...panel, textAlign:"center", padding:"70px 20px", color:C.textMid}}>
          <FileText size={48} style={{marginBottom:16, opacity:.3}}/>
          <p style={{margin:"0 0 20px", fontSize:15}}>No articles yet. Write your first one!</p>
          <button onClick={onWrite} style={{ background:C.cyan, border:"none", color:"#040507", padding:"11px 24px", borderRadius:8, fontWeight:700, cursor:"pointer", fontSize:14 }}>
            Write First Article
          </button>
        </div>
      ) : posts.map(p=>(
        <div key={p.id} style={panel}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:0,display:"flex",gap:14}}>
              {p.coverImage && (
                <div style={{width:72,height:72,borderRadius:8,overflow:"hidden",flexShrink:0}}>
                  <img src={p.coverImage} alt="" referrerPolicy="no-referrer"
                    style={{width:"100%",height:"100%",objectFit:"cover"}}
                    onError={e=>e.target.parentElement.style.display="none"}/>
                </div>
              )}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{background:C.cyanGlow,border:`1px solid ${C.cyanBorder}`,color:C.cyan,fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:4,letterSpacing:.5}}>BLOG</span>
                  <span style={{fontSize:12,color:C.textMid}}>{p.category} · {p.timeAgo}</span>
                  {p.isBreaking && <span style={{fontSize:10,fontWeight:700,color:C.red,border:`1px solid rgba(239,68,68,.3)`,padding:"1px 6px",borderRadius:3}}>BREAKING</span>}
                </div>
                <h3 style={{margin:"0 0 5px",fontSize:15,fontWeight:700,color:C.white}}>{p.title}</h3>
                <p style={{margin:"0 0 6px",fontSize:12,color:C.text,lineHeight:1.5}}>{p.excerpt?.slice(0,120)}…</p>
                <a href={p.url||`/blog/${p.id}`} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:C.cyan,textDecoration:"none"}}>View article →</a>
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexShrink:0}}>
              <button onClick={()=>onEdit(p)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 13px",border:`1px solid ${C.border}`,borderRadius:7,background:"transparent",cursor:"pointer",color:C.textMid,fontSize:12}}>
                <Edit3 size={12}/> Edit
              </button>
              <button onClick={()=>confirmDel(p.id)} style={{display:"flex",alignItems:"center",gap:5,padding:"7px 13px",border:"1px solid rgba(239,68,68,.3)",borderRadius:7,background:delConfirm===p.id?"rgba(239,68,68,.15)":"transparent",cursor:"pointer",color:C.red,fontSize:12,fontWeight:delConfirm===p.id?700:400}}>
                <Trash2 size={12}/> {delConfirm===p.id?"Confirm?":"Delete"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Categories tab ───────────────────────────────────── */
function CategoriesTab({ categories, news, onAdd, onRemove }) {
  const [newCat, setNewCat] = useState("");
  const [msg,    setMsg]    = useState("");
  const panel = {background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px",marginBottom:16};

  const add = () => {
    const c = newCat.trim(); if(!c) return;
    if(categories.includes(c)){setMsg("Already exists.");return;}
    onAdd(c); setNewCat(""); setMsg(`"${c}" added!`); setTimeout(()=>setMsg(""),3000);
  };

  return (
    <div style={{maxWidth:560}}>
      <h2 style={{margin:"0 0 22px",fontSize:21,fontWeight:800,color:C.white,fontFamily:serif}}>Categories</h2>
      {msg && <div style={{background:"rgba(52,211,153,.1)",border:"1px solid rgba(52,211,153,.3)",borderRadius:8,padding:"10px 16px",marginBottom:16,fontSize:13,color:C.green}}>✓ {msg}</div>}
      <div style={panel}>
        <h3 style={{margin:"0 0 12px",fontSize:13,fontWeight:700,color:C.white}}>Add Category</h3>
        <div style={{display:"flex",gap:10}}>
          <input type="text" value={newCat} placeholder="e.g. Opinion, Diaspora…"
            onChange={e=>setNewCat(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}
            style={{flex:1,padding:"11px 14px",background:"#060A0F",border:`1px solid ${C.border}`,borderRadius:8,fontSize:14,outline:"none",color:C.white,fontFamily:"inherit"}}/>
          <button onClick={add} style={{padding:"11px 22px",background:C.cyan,border:"none",borderRadius:8,color:"#040507",fontWeight:700,fontSize:14,cursor:"pointer"}}>Add</button>
        </div>
      </div>
      <div style={panel}>
        <h3 style={{margin:"0 0 14px",fontSize:13,fontWeight:700,color:C.white}}>Active Categories ({categories.length})</h3>
        {categories.map((cat,i)=>(
          <div key={cat} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:i<categories.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Tag size={13} color={C.cyan}/>
              <span style={{fontSize:14,fontWeight:600,color:C.white}}>{cat}</span>
              <span style={{fontSize:12,color:C.textMid}}>{news.filter(n=>n.category===cat).length} stories</span>
            </div>
            <button onClick={()=>onRemove(cat)} style={{display:"flex",alignItems:"center",gap:4,padding:"5px 11px",border:"1px solid rgba(239,68,68,.25)",borderRadius:6,background:"transparent",cursor:"pointer",color:C.red,fontSize:12}}>
              <Trash2 size={11}/> Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Main AdminPanel ─────────────────────────────────── */
export default function AdminPanel() {
  const [authed,   setAuthed]  = useState(false);
  const [initDone, setInitDone]= useState(false);
  const [tab,      setTab]     = useState("dashboard");
  const [writing,  setWriting] = useState(null); // null | "new" | post-object
  const [loading,  setLoading] = useState(false);
  const [lastRefresh, setLR]   = useState(new Date());
  const [news,     setNews]    = useState([]);
  const [feedLog,  setFeedLog] = useState([]);
  const [posts, setPosts] = useState([]);
  const [cats,  setCats]  = useState(DEF_CATS);

  /* Check auth + load data on mount */
  useEffect(() => {
    const auth = lsGet("nb_admin_auth", null);
    // Session expires after 8 hours
    if (auth && Date.now() - auth.time < 8 * 3600000) setAuthed(true);
    setPosts(lsGet("nb_posts", []));
    setCats(lsGet("nb_cats", DEF_CATS));
    setInitDone(true);
  }, []);

  useEffect(()=>lsSet("nb_posts",posts),[posts]);
  useEffect(()=>lsSet("nb_cats",cats),[cats]);

  const loadNews = useCallback(async()=>{
    setLoading(true);
    try {
      const r = await fetch("/api/news");
      if(!r.ok) throw new Error();
      const {news:n,feedLog:l} = await r.json();
      setNews(n||[]); setFeedLog(l||[]); setLR(new Date());
    } catch(e){ console.error(e); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{ if(authed) loadNews(); },[authed, loadNews]);

  const logout = () => { lsSet("nb_admin_auth",null); setAuthed(false); };

  const savePost = (post, isEdit) => {
    if(isEdit) setPosts(v=>v.map(p=>p.id===post.id?post:p));
    else       setPosts(v=>[post,...v]);
    setWriting(null);
    setTab("posts");
  };

  if (!initDone) return <Loader text="Starting…"/>;
  if (!authed)   return <LoginScreen onLogin={()=>setAuthed(true)}/>;

  const TABS = [
    {id:"dashboard",label:"Dashboard",Icon:BarChart2},
    {id:"posts",    label:"Articles",  Icon:FileText },
    {id:"write",    label:"Write",     Icon:Plus     },
    {id:"categories",label:"Categories",Icon:Tag    },
  ];

  const showWrite = writing !== null;

  return (
    <div style={{minHeight:"100vh",background:C.page,display:"flex",flexDirection:"column"}}>
      <style>{`
        @keyframes nbspin{to{transform:rotate(360deg)}}
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box} body{font-family:'Inter',system-ui,sans-serif;margin:0;background:#08090D;color:#CBD5E1}
        .nb-btn{transition:background .14s,color .14s,border-color .14s,opacity .14s}
        ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#08090D} ::-webkit-scrollbar-thumb{background:#1E2D3D;border-radius:4px}
      `}</style>

      {/* Topbar */}
      <div style={{background:C.nav,borderBottom:`1px solid ${C.navBorder}`,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:58,flexShrink:0}}>
        <div style={{display:"flex",alignItems:"center",gap:14}}>
          <div style={{fontSize:19,fontFamily:serif,fontWeight:900}}>
            <span style={{color:C.white}}>Neri</span><span style={{color:C.cyan}}>Buzz</span>
          </div>
          <span style={{background:C.cyanGlow,border:`1px solid ${C.cyanBorder}`,color:C.cyan,fontSize:10,padding:"3px 10px",borderRadius:4,fontWeight:700,letterSpacing:1}}>ADMIN</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <a href="/" className="nb-btn"
            style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:`1px solid ${C.border}`,color:C.textMid,padding:"7px 14px",borderRadius:8,fontSize:12,textDecoration:"none"}}>
            ← Live Site
          </a>
          <button onClick={loadNews} disabled={loading} className="nb-btn"
            style={{display:"flex",alignItems:"center",gap:6,background:C.cyanGlow,border:`1px solid ${C.cyanBorder}`,color:C.cyan,padding:"7px 14px",borderRadius:8,fontSize:12,cursor:loading?"not-allowed":"pointer",opacity:loading?.7:1}}>
            <RefreshCw size={13} style={{animation:loading?"nbspin .8s linear infinite":"none"}}/> {loading?"Loading…":"Refresh"}
          </button>
          <button onClick={logout} className="nb-btn"
            style={{display:"flex",alignItems:"center",gap:6,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",color:C.red,padding:"7px 14px",borderRadius:8,fontSize:12,cursor:"pointer"}}>
            <LogOut size={13}/> Sign Out
          </button>
        </div>
      </div>

      <div style={{flex:1,display:"flex",overflow:"hidden"}}>
        {/* Sidebar */}
        <div style={{width:210,background:C.nav,borderRight:`1px solid ${C.navBorder}`,padding:"22px 0",flexShrink:0}}>
          {TABS.map(t=>(
            <button key={t.id} className="nb-btn"
              onClick={()=>{
                if(t.id==="write"){setWriting("new");setTab("write");}
                else{setWriting(null);setTab(t.id);}
              }}
              style={{width:"100%",textAlign:"left",display:"flex",alignItems:"center",gap:11,padding:"12px 20px",border:"none",cursor:"pointer",
                background:(tab===t.id&&!showWrite)||(t.id==="write"&&showWrite)?"rgba(34,211,238,.1)":"transparent",
                borderLeft:(tab===t.id&&!showWrite)||(t.id==="write"&&showWrite)?`3px solid ${C.cyan}`:"3px solid transparent",
                color:(tab===t.id&&!showWrite)||(t.id==="write"&&showWrite)?C.cyan:C.textMid,
                fontSize:14,fontWeight:(tab===t.id&&!showWrite)||(t.id==="write"&&showWrite)?700:500}}>
              <t.Icon size={16}/> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{flex:1,padding:"28px",overflowY:"auto"}}>
          {/* Writing mode */}
          {showWrite && (
            <WriteArticle
              editing={writing !== "new" ? writing : null}
              categories={cats}
              onSave={savePost}
              onCancel={()=>{setWriting(null);setTab("posts");}}
            />
          )}

          {!showWrite && tab==="dashboard" && (
            <DashboardTab
              posts={posts} feedLog={feedLog} news={news}
              loading={loading} lastRefresh={lastRefresh}
              onRefresh={loadNews}
              onEdit={p=>{setWriting(p);setTab("write");}}
              onDelete={id=>setPosts(v=>v.filter(p=>p.id!==id))}
              onWrite={()=>{setWriting("new");setTab("write");}}
            />
          )}

          {!showWrite && tab==="posts" && (
            <PostsTab
              posts={posts}
              onEdit={p=>{setWriting(p);setTab("write");}}
              onDelete={id=>setPosts(v=>v.filter(p=>p.id!==id))}
              onWrite={()=>{setWriting("new");setTab("write");}}
            />
          )}

          {!showWrite && tab==="categories" && (
            <CategoriesTab
              categories={cats} news={news}
              onAdd={c=>setCats(v=>[...v,c])}
              onRemove={c=>setCats(v=>v.filter(x=>x!==c))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
