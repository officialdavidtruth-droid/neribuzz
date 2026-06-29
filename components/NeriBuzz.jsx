import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  ExternalLink, RefreshCw, X, Clock, ChevronRight, Globe,
  AlertCircle, ChevronLeft, Menu, Bell, BellOff, Home, Newspaper,
} from "lucide-react";

const C = {
  page:"#08090D", card:"#0D1117", nav:"#040507", navBorder:"#0F1520",
  cyan:"#22D3EE", cyanDim:"#0891B2", cyanGlow:"rgba(34,211,238,0.12)",
  cyanBorder:"rgba(34,211,238,0.22)", white:"#F1F5F9", text:"#CBD5E1",
  textMid:"#64748B", textFaint:"#1E2D3D", border:"#1A2535", borderHi:"#263548",
  red:"#F87171", redSolid:"#EF4444", green:"#34D399", wa:"#25D366",
};
const SRC = {
  "Punch":"#E53935","Vanguard":"#1E88E5","Premium Times":"#1565C0",
  "Guardian Nigeria":"#43A047","Channels TV":"#FB8C00","The Cable":"#8E24AA",
  "BBC Africa":"#D32F2F","BBC World":"#D32F2F","BBC Business":"#D32F2F",
  "BBC Sport":"#C62828","BBC Entertainment":"#D32F2F","BBC Technology":"#D32F2F",
  "BBC Health":"#D32F2F","Al Jazeera":"#E64A19","TechCabal":"#00ACC1",
  "The Guardian":"#0066CC","Guardian NG":"#0066CC","NeriBuzz":"#22D3EE",
};
const WA_URL  = "https://whatsapp.com/channel/0029Vb6xYzRFMqrRNDnpwm1V";
const serif   = '"Playfair Display", Georgia, serif';
const DEF_CATS = ["Nigeria","International","Business","Sports","Entertainment","Technology","Health","Politics"];
const lsGet = (k,fb)=>{ try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;} };
const lsSet = (k,v) =>{ try{localStorage.setItem(k,JSON.stringify(v));}catch{} };

/* ── Page loader ─────────────────────────────────────── */
function PageLoader() {
  return (
    <div style={{position:"fixed",inset:0,background:C.page,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:22,zIndex:9999}}>
      <div style={{fontSize:34,fontFamily:serif,fontWeight:900}}>
        <span style={{color:C.white}}>Neri</span><span style={{color:C.cyan}}>Buzz</span>
      </div>
      <div className="nb-ring"/>
      <p style={{color:C.textMid,fontSize:13,margin:0}}>Loading live headlines…</p>
    </div>
  );
}

/* ── Skeleton ────────────────────────────────────────── */
function Skeleton() {
  const s={background:"#1A2535",borderRadius:4};
  return (
    <div className="nb-shimmer" style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
      <div style={{height:160,background:"#0A0F18"}}/>
      <div style={{padding:18}}>
        <div style={{...s,height:10,width:"28%",marginBottom:14}}/>
        <div style={{...s,height:15,width:"95%",marginBottom:8}}/>
        <div style={{...s,height:15,width:"78%",marginBottom:20}}/>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div style={{...s,height:22,width:64,borderRadius:20}}/>
          <div style={{...s,height:30,width:96,borderRadius:8}}/>
        </div>
      </div>
    </div>
  );
}

/* ── Source badge ────────────────────────────────────── */
function SourceBadge({ source }) {
  return (
    <span style={{background:SRC[source]||"#334155",color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:4,letterSpacing:.7,textTransform:"uppercase",flexShrink:0}}>
      {source}
    </span>
  );
}

/* ── News card ───────────────────────────────────────── */
function NewsCard({ item, blog=false }) {
  const url    = item.isBlog ? `/blog/${item.id}` : (item.sourceUrl||item.url||"#");
  const isExt  = !item.isBlog;
  const accent = blog ? C.cyan : (SRC[item.source]||"#334155");
  return (
    <div className="nb-card nb-fade" style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      {item.image&&(
        <div className="nb-img-wrap" style={{height:185,overflow:"hidden",position:"relative",background:"#040608",flexShrink:0}}>
          <img src={item.image} alt="" referrerPolicy="no-referrer" loading="lazy"
            style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}
            onError={e=>{e.target.parentElement.style.display="none";}}/>
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(13,17,23,.85) 0%,transparent 60%)"}}/>
          {item.isBreaking&&<span style={{position:"absolute",top:10,left:10,background:C.redSolid,color:"#fff",fontSize:9,fontWeight:800,padding:"3px 7px",borderRadius:3,letterSpacing:1}}>● BREAKING</span>}
          <span style={{position:"absolute",bottom:10,left:10,background:"rgba(0,0,0,.7)",color:C.text,fontSize:10,padding:"2px 8px",borderRadius:20}}>{item.category}</span>
        </div>
      )}
      <div style={{height:2,background:accent,flexShrink:0}}/>
      <div style={{padding:"15px 18px",flex:1,display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
          <SourceBadge source={item.source}/>
          {item.isBreaking&&!item.image&&<span style={{fontSize:9,fontWeight:800,color:C.red,border:`1px solid ${C.red}`,padding:"1px 6px",borderRadius:3}}>● BREAKING</span>}
          {blog&&<span style={{fontSize:9,fontWeight:800,color:C.cyan,border:`1px solid ${C.cyanBorder}`,padding:"1px 6px",borderRadius:3}}>✦ BLOG</span>}
          <span style={{fontSize:11,color:C.textMid,marginLeft:"auto",display:"flex",alignItems:"center",gap:4}}><Clock size={11}/>{item.timeAgo}</span>
        </div>
        <h3 style={{margin:0,fontSize:15,fontWeight:700,color:C.white,lineHeight:1.45,fontFamily:serif}}>{item.title}</h3>
        {!item.image&&<p style={{margin:0,fontSize:13,color:C.text,lineHeight:1.65,flex:1}}>{item.excerpt?.length>110?item.excerpt.slice(0,110)+"…":item.excerpt}</p>}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:item.image?4:8}}>
          {!item.image&&<span style={{fontSize:11,color:C.textMid,background:"rgba(255,255,255,.04)",padding:"3px 10px",borderRadius:20,border:`1px solid ${C.border}`}}>{item.category}</span>}
          {item.image&&<span/>}
          <a href={url} {...(isExt?{target:"_blank",rel:"noopener noreferrer"}:{})} className="nb-btn"
            style={{display:"flex",alignItems:"center",gap:5,fontSize:12,fontWeight:600,color:C.cyan,textDecoration:"none",padding:"6px 14px",borderRadius:7,border:`1px solid ${C.cyanBorder}`,background:C.cyanGlow}}
            onMouseEnter={e=>{e.currentTarget.style.background=C.cyan;e.currentTarget.style.color="#040507";e.currentTarget.style.borderColor=C.cyan;}}
            onMouseLeave={e=>{e.currentTarget.style.background=C.cyanGlow;e.currentTarget.style.color=C.cyan;e.currentTarget.style.borderColor=C.cyanBorder;}}>
            Read More {isExt&&<ExternalLink size={11}/>}
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Trending slideshow ──────────────────────────────── */
function TrendingSlideshow({ items, loading }) {
  const [idx,   setIdx]  = useState(0);
  const [paused,pause]   = useState(false);
  const [touchX,setTX]   = useState(null);
  const timerRef = useRef(null);
  const slides   = items.filter(n=>n.image||n.isBreaking).slice(0,8);

  const goTo = useCallback(i => setIdx((i+slides.length)%slides.length),[slides.length]);

  useEffect(()=>{
    if(paused||slides.length<2) return;
    timerRef.current=setInterval(()=>goTo(idx+1),5500);
    return()=>clearInterval(timerRef.current);
  },[idx,paused,slides.length,goTo]);

  if(loading) return <div className="nb-shimmer" style={{height:"clamp(280px,40vw,460px)",background:"#0A0F18",borderRadius:16,marginBottom:48}}/>;
  if(!slides.length) return null;

  const cur = slides[idx];
  const url = cur.isBlog ? `/blog/${cur.id}` : (cur.sourceUrl||cur.url||"#");

  return (
    <div style={{position:"relative",height:"clamp(280px,40vw,460px)",borderRadius:16,overflow:"hidden",marginBottom:48}}
      onMouseEnter={()=>pause(true)} onMouseLeave={()=>pause(false)}
      onTouchStart={e=>setTX(e.touches[0].clientX)}
      onTouchEnd={e=>{ if(touchX===null)return; const dx=e.changedTouches[0].clientX-touchX; if(Math.abs(dx)>50){dx<0?goTo(idx+1):goTo(idx-1);} setTX(null); }}>

      {slides.map((s,i)=>(
        <div key={s.id||i} style={{position:"absolute",inset:0,transition:"opacity .7s ease",opacity:i===idx?1:0,zIndex:i===idx?1:0}}>
          {s.image&&<img src={s.image} alt="" referrerPolicy="no-referrer" style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}} onError={e=>e.target.style.display="none"}/>}
          {!s.image&&<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#0A0F18,#061530)"}}/>}
        </div>
      ))}

      <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(4,5,7,.97) 0%,rgba(4,5,7,.5) 50%,rgba(4,5,7,.12) 100%)",zIndex:2}}/>

      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"clamp(18px,4vw,40px)",zIndex:3}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12,flexWrap:"wrap"}}>
          <span style={{background:C.cyan,color:"#040507",fontSize:10,fontWeight:900,padding:"4px 10px",borderRadius:4,letterSpacing:1}}>TRENDING</span>
          {cur.isBreaking&&<span style={{color:C.red,fontSize:11,fontWeight:700,display:"flex",alignItems:"center",gap:5}}><span className="nb-pulse" style={{width:7,height:7,borderRadius:"50%",background:C.red,display:"inline-block"}}/> BREAKING</span>}
          <SourceBadge source={cur.source}/>
          <span style={{color:"rgba(255,255,255,.45)",fontSize:12,display:"flex",alignItems:"center",gap:4}}><Clock size={11}/>{cur.timeAgo}</span>
        </div>
        <h2 style={{margin:"0 0 16px",fontSize:"clamp(16px,3vw,28px)",fontWeight:900,color:C.white,lineHeight:1.25,fontFamily:serif,maxWidth:700}}>{cur.title}</h2>
        <a href={url} {...(!cur.isBlog?{target:"_blank",rel:"noopener noreferrer"}:{})} className="nb-btn"
          style={{display:"inline-flex",alignItems:"center",gap:7,background:C.cyan,color:"#040507",padding:"10px 22px",borderRadius:8,fontWeight:700,fontSize:13,textDecoration:"none"}}
          onMouseEnter={e=>e.currentTarget.style.opacity=".88"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
          Read Story {!cur.isBlog&&<ExternalLink size={13}/>}
        </a>
      </div>

      {slides.length>1&&(
        <>
          <button onClick={()=>{pause(true);goTo(idx-1);}} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",zIndex:4,background:"rgba(0,0,0,.55)",border:"1px solid rgba(255,255,255,.15)",color:C.white,width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><ChevronLeft size={18}/></button>
          <button onClick={()=>{pause(true);goTo(idx+1);}} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",zIndex:4,background:"rgba(0,0,0,.55)",border:"1px solid rgba(255,255,255,.15)",color:C.white,width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><ChevronRight size={18}/></button>
        </>
      )}

      <div style={{position:"absolute",bottom:16,right:16,zIndex:4,display:"flex",gap:5,alignItems:"center"}}>
        {slides.map((_,i)=>(
          <span key={i} onClick={()=>{pause(true);goTo(i);}} style={{height:4,width:i===idx?22:6,borderRadius:4,background:i===idx?C.cyan:"rgba(255,255,255,.3)",cursor:"pointer",transition:"width .3s,background .3s"}}/>
        ))}
      </div>
      <div style={{position:"absolute",top:14,right:14,zIndex:4,background:"rgba(0,0,0,.6)",border:"1px solid rgba(255,255,255,.12)",color:C.textMid,fontSize:11,padding:"4px 10px",borderRadius:20}}>{idx+1}/{slides.length}</div>
    </div>
  );
}

/* ── Breaking ticker ─────────────────────────────────── */
function BreakingTicker({ items }) {
  const breaking=items.filter(n=>n.isBreaking);
  if(!breaking.length) return null;
  const doubled=[...breaking,...breaking];
  return (
    <div style={{background:"#0A0C10",borderBottom:`1px solid ${C.border}`,overflow:"hidden",display:"flex",alignItems:"center",height:38}}>
      <div style={{background:C.redSolid,padding:"0 16px",fontSize:10,fontWeight:900,color:"#fff",height:"100%",display:"flex",alignItems:"center",gap:6,flexShrink:0,letterSpacing:1.5}}>
        <span className="nb-pulse" style={{width:6,height:6,borderRadius:"50%",background:"#fff",display:"inline-block"}}/>BREAKING
      </div>
      <div style={{width:1,height:"100%",background:C.border,flexShrink:0}}/>
      <div style={{flex:1,overflow:"hidden",display:"flex",alignItems:"center"}}>
        <div className="nb-ticker">
          {doubled.map((it,i)=>(
            <span key={i} style={{padding:"0 32px",fontSize:12,color:C.text,fontWeight:500}}>
              {it.title}<span style={{marginLeft:32,color:C.textFaint}}>◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── WhatsApp banner ─────────────────────────────────── */
function WhatsAppBanner() {
  const [v,setV]=useState(true);
  if(!v) return null;
  return (
    <div style={{background:"rgba(37,211,102,.08)",borderBottom:"1px solid rgba(37,211,102,.2)",padding:"9px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap"}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:17}}>💬</span>
        <span style={{fontSize:13,color:"#86EFAC",fontWeight:500}}>Get instant updates — join the <strong style={{color:"#4ADE80"}}>NeriBuzz WhatsApp Channel</strong></span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <a href={WA_URL} target="_blank" rel="noopener noreferrer" style={{background:"#25D366",color:"#fff",fontSize:12,fontWeight:700,padding:"6px 16px",borderRadius:7,textDecoration:"none"}}>Join Channel</a>
        <button onClick={()=>setV(false)} style={{background:"transparent",border:"none",color:"rgba(134,239,172,.5)",cursor:"pointer",padding:2,display:"flex"}}><X size={16}/></button>
      </div>
    </div>
  );
}

/* ── Notification bell + panel ───────────────────────── */
function NotificationBell({ categories }) {
  const [open,     setOpen]     = useState(false);
  const [perm,     setPerm]     = useState("default");
  const [prefs,    setPrefs]    = useState(()=>lsGet("nb_notif_cats",[]));
  const [saving,   setSaving]   = useState(false);
  const [msg,      setMsg]      = useState("");
  const panelRef = useRef(null);

  useEffect(()=>{
    if("Notification" in window) setPerm(Notification.permission);
    const handleClick = e => { if(panelRef.current&&!panelRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown",handleClick);
    return()=>document.removeEventListener("mousedown",handleClick);
  },[]);

  const save = async () => {
    setSaving(true); setMsg("");
    lsSet("nb_notif_cats", prefs);
    if(perm!=="granted") {
      const p = await Notification.requestPermission().catch(()=>"denied");
      setPerm(p);
      if(p==="granted") {
        // Register SW
        if("serviceWorker" in navigator){
          await navigator.serviceWorker.register("/sw.js").catch(()=>{});
        }
        setMsg("✓ Notifications enabled!");
      } else {
        setMsg("Notifications blocked in browser settings.");
      }
    } else {
      setMsg("✓ Preferences saved!");
    }
    setSaving(false);
    setTimeout(()=>{ setMsg(""); setOpen(false); },2000);
  };

  const active = perm==="granted"&&prefs.length>0;

  return (
    <div ref={panelRef} style={{position:"relative"}}>
      <button onClick={()=>setOpen(!open)} className="nb-btn" title="Notification preferences"
        style={{display:"flex",alignItems:"center",gap:6,background:active?"rgba(34,211,238,.12)":"transparent",border:`1px solid ${active?C.cyanBorder:C.border}`,color:active?C.cyan:C.textMid,padding:"7px 10px",borderRadius:8,cursor:"pointer",position:"relative"}}>
        {active ? <Bell size={16}/> : <BellOff size={16}/>}
        {active&&<span style={{position:"absolute",top:5,right:5,width:7,height:7,borderRadius:"50%",background:C.cyan}}/>}
      </button>

      {open&&(
        <div style={{position:"absolute",right:0,top:"calc(100% + 8px)",width:300,background:"#0D1117",border:`1px solid ${C.border}`,borderRadius:12,padding:18,boxShadow:"0 20px 50px rgba(0,0,0,.6)",zIndex:200}}>
          <h3 style={{margin:"0 0 6px",fontSize:15,fontWeight:700,color:C.white}}>🔔 Notifications</h3>
          <p style={{margin:"0 0 14px",fontSize:12,color:C.textMid,lineHeight:1.5}}>
            Choose categories. We'll notify you when new stories arrive.
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
            {categories.map(cat=>(
              <label key={cat} style={{display:"flex",alignItems:"center",gap:9,cursor:"pointer",fontSize:13,padding:"4px 0"}}>
                <input type="checkbox" checked={prefs.includes(cat)}
                  onChange={e=>{ if(e.target.checked)setPrefs(v=>[...v,cat]); else setPrefs(v=>v.filter(c=>c!==cat)); }}
                  style={{accentColor:C.cyan,width:15,height:15,cursor:"pointer"}}/>
                <span style={{color:C.text}}>{cat}</span>
              </label>
            ))}
          </div>
          {msg&&<p style={{margin:"0 0 10px",fontSize:12,color:msg.includes("✓")?C.green:C.red}}>{msg}</p>}
          <button onClick={save} disabled={saving} style={{width:"100%",padding:11,background:saving?C.cyanDim:C.cyan,border:"none",borderRadius:8,color:"#040507",fontSize:13,fontWeight:700,cursor:saving?"not-allowed":"pointer"}}>
            {saving?"Saving…":perm==="granted"?"Save Preferences":"Enable Notifications"}
          </button>
          {perm==="denied"&&<p style={{margin:"8px 0 0",fontSize:11,color:C.red}}>Notifications are blocked — allow them in browser settings first.</p>}
        </div>
      )}
    </div>
  );
}

/* ── Header ──────────────────────────────────────────── */
function Header({ categories, activeCat, onCat, onHome, mobileOpen, onMobile }) {
  return (
    <header style={{background:C.nav,borderBottom:`1px solid ${C.navBorder}`,position:"sticky",top:0,zIndex:50}}>
      <div style={{maxWidth:1300,margin:"0 auto",padding:"0 16px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56}}>
        <div onClick={onHome} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:2,userSelect:"none"}}>
          <span style={{fontSize:24,fontWeight:900,color:C.white,letterSpacing:-1,fontFamily:serif}}>Neri</span>
          <span style={{fontSize:24,fontWeight:900,color:C.cyan, letterSpacing:-1,fontFamily:serif}}>Buzz</span>
          <span style={{marginLeft:8,fontSize:9,fontWeight:700,color:C.cyan,background:C.cyanGlow,border:`1px solid ${C.cyanBorder}`,padding:"2px 7px",borderRadius:4,letterSpacing:1.5,alignSelf:"center"}}>NG</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <NotificationBell categories={categories}/>
          <button onClick={onMobile} className="nb-btn" aria-label="Menu"
            style={{background:"transparent",border:`1px solid ${C.border}`,color:C.text,cursor:"pointer",padding:"7px 9px",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center"}}>
            {mobileOpen?<X size={18}/>:<Menu size={18}/>}
          </button>
        </div>
      </div>

      {/* Category nav — horizontal scroll */}
      <div style={{borderTop:`1px solid ${C.navBorder}`,overflowX:"auto",scrollbarWidth:"none"}}>
        <div style={{maxWidth:1300,margin:"0 auto",padding:"0 16px",display:"flex"}}>
          {["All",...categories].map(cat=>(
            <button key={cat} onClick={()=>onCat(cat)} className="nb-btn"
              style={{padding:"9px 14px",background:"transparent",border:"none",borderBottom:activeCat===cat?`2px solid ${C.cyan}`:"2px solid transparent",color:activeCat===cat?C.cyan:C.textMid,fontSize:13,fontWeight:activeCat===cat?700:500,cursor:"pointer",whiteSpace:"nowrap"}}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile fullscreen overlay */}
      {mobileOpen&&(
        <div className="nb-overlay" style={{position:"fixed",inset:0,background:C.nav,zIndex:200,display:"flex",flexDirection:"column",padding:"20px 20px 32px",overflowY:"auto"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:28}}>
            <div style={{fontSize:22,fontFamily:serif,fontWeight:900}}><span style={{color:C.white}}>Neri</span><span style={{color:C.cyan}}>Buzz</span></div>
            <button onClick={onMobile} style={{background:C.cyanGlow,border:`1px solid ${C.cyanBorder}`,color:C.cyan,cursor:"pointer",padding:"8px",borderRadius:8,display:"flex"}}><X size={20}/></button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
            {["All",...categories].map(cat=>(
              <button key={cat} onClick={()=>onCat(cat)} className="nb-btn"
                style={{textAlign:"left",background:activeCat===cat?C.cyanGlow:"rgba(255,255,255,.03)",border:`1px solid ${activeCat===cat?C.cyanBorder:C.border}`,borderRadius:10,color:activeCat===cat?C.cyan:C.text,padding:"13px 16px",fontSize:14,fontWeight:activeCat===cat?700:500,cursor:"pointer"}}>
                {cat}
              </button>
            ))}
          </div>
          <div style={{marginTop:"auto",borderTop:`1px solid ${C.border}`,paddingTop:20,display:"flex",flexDirection:"column",gap:10}}>
            <a href={WA_URL} target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"center",gap:10,background:"rgba(37,211,102,.1)",border:"1px solid rgba(37,211,102,.25)",color:"#4ADE80",padding:"13px 16px",borderRadius:10,fontSize:14,fontWeight:600,textDecoration:"none"}}>
              💬 Join NeriBuzz WhatsApp Channel
            </a>
            <Link href="/admin" style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.03)",border:`1px solid ${C.border}`,color:C.textMid,padding:"13px 16px",borderRadius:10,fontSize:14,textDecoration:"none"}}>
              ⚙ Admin Panel
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ── Section heading ─────────────────────────────────── */
function SectionHead({ title, count, onRefresh, loading }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
      <div style={{display:"flex",alignItems:"center",gap:10}}>
        <span style={{width:3,height:24,background:C.cyan,borderRadius:2,display:"inline-block"}}/>
        <h2 style={{margin:0,fontSize:19,fontWeight:800,color:C.white,fontFamily:serif}}>{title}</h2>
        {count!=null&&<span style={{fontSize:11,color:C.textMid,background:"rgba(255,255,255,.04)",padding:"2px 9px",borderRadius:20,border:`1px solid ${C.border}`}}>{count}</span>}
      </div>
      {onRefresh&&(
        <button onClick={onRefresh} disabled={loading} className="nb-btn"
          style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:`1px solid ${C.border}`,color:C.textMid,padding:"6px 14px",borderRadius:8,fontSize:12,cursor:loading?"not-allowed":"pointer",opacity:loading?.6:1}}>
          <RefreshCw size={13} className={loading?"nb-spin":""}/> Refresh
        </button>
      )}
    </div>
  );
}

/* ── News grid ───────────────────────────────────────── */
function NewsGrid({ items, loading }) {
  return (
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:18}}>
      {loading ? [1,2,3,4,5,6].map(i=><Skeleton key={i}/>) : items.map((it,i)=><NewsCard key={it.id||`b${i}`} item={it} blog={!!it.isBlog}/>)}
    </div>
  );
}

/* ── Home view ───────────────────────────────────────── */
function HomeView({ news, blogPosts, categories, onCatSelect, onRefresh, loading, lastRefresh, errorCount }) {
  const blogs = blogPosts.map(p=>({...p,isBlog:true}));
  const hero  = news.find(n=>n.isBreaking)||news[0];
  const rest  = news.filter(n=>n!==hero);
  const top   = [...rest,...blogs].slice(0,6);

  return (
    <div style={{maxWidth:1300,margin:"0 auto",padding:"24px 16px 80px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <span style={{fontSize:12,color:C.textMid,display:"flex",alignItems:"center",gap:6}}>
          <Clock size={13}/>{loading?"Fetching live headlines…":`${news.length} stories · ${lastRefresh.toLocaleTimeString()}`}
        </span>
        <button onClick={onRefresh} disabled={loading} className="nb-btn"
          style={{display:"flex",alignItems:"center",gap:7,background:C.cyanGlow,border:`1px solid ${C.cyanBorder}`,color:C.cyan,padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:600,cursor:loading?"not-allowed":"pointer",opacity:loading?.7:1}}>
          <RefreshCw size={13} className={loading?"nb-spin":""}/>{loading?"Loading…":"Refresh Feed"}
        </button>
      </div>

      {errorCount>0&&!loading&&(
        <div style={{background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)",borderRadius:8,padding:"10px 16px",marginBottom:22,fontSize:13,color:C.red,display:"flex",alignItems:"center",gap:8}}>
          <AlertCircle size={14}/> {errorCount} feed{errorCount>1?"s":""} unavailable — some stories may be missing.
        </div>
      )}

      <TrendingSlideshow items={news} loading={loading}/>

      <div style={{marginBottom:48}}>
        <SectionHead title="Top Stories" count={loading?null:top.length}/>
        <NewsGrid items={top} loading={loading}/>
      </div>

      {!loading&&categories.map(cat=>{
        const ci=[...news.filter(n=>n.category===cat).slice(0,3),...blogs.filter(b=>b.category===cat).slice(0,1)].slice(0,3);
        if(!ci.length) return null;
        return (
          <div key={cat} style={{marginBottom:48}}>
            <SectionHead title={cat} count={ci.length}/>
            <NewsGrid items={ci}/>
            <button onClick={()=>onCatSelect(cat)} className="nb-btn"
              style={{marginTop:14,display:"inline-flex",alignItems:"center",gap:6,background:"transparent",border:`1px solid ${C.border}`,color:C.textMid,padding:"9px 18px",borderRadius:8,fontSize:13,cursor:"pointer"}}>
              More {cat} stories <ChevronRight size={14}/>
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ── Category view ───────────────────────────────────── */
function CategoryView({ cat, news, blogPosts, onBack, onRefresh, loading, lastRefresh }) {
  const blogs=blogPosts.map(p=>({...p,isBlog:true}));
  const items=cat==="All"?[...news,...blogs]:[...news.filter(n=>n.category===cat),...blogs.filter(b=>b.category===cat)];
  return (
    <div style={{maxWidth:1300,margin:"0 auto",padding:"24px 16px 80px"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:28,flexWrap:"wrap",gap:14}}>
        <div>
          <button onClick={onBack} style={{background:"transparent",border:"none",color:C.textMid,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:4,marginBottom:8,padding:0}}>← Back</button>
          <h1 style={{margin:"0 0 4px",fontSize:28,fontWeight:900,color:C.white,fontFamily:serif}}>{cat} <span style={{color:C.cyan}}>News</span></h1>
          <p style={{margin:0,fontSize:13,color:C.textMid}}>{loading?"Fetching…":`${items.length} stories · ${lastRefresh.toLocaleTimeString()}`}</p>
        </div>
        <button onClick={onRefresh} disabled={loading} className="nb-btn"
          style={{display:"flex",alignItems:"center",gap:7,background:C.cyanGlow,border:`1px solid ${C.cyanBorder}`,color:C.cyan,padding:"10px 20px",borderRadius:9,fontSize:13,fontWeight:600,cursor:loading?"not-allowed":"pointer",opacity:loading?.7:1}}>
          <RefreshCw size={13} className={loading?"nb-spin":""}/> Refresh
        </button>
      </div>
      {!loading&&items.length===0 ? (
        <div style={{textAlign:"center",padding:"80px 20px",color:C.textMid}}><Globe size={52} style={{marginBottom:18,opacity:.25}}/><p style={{fontSize:16,margin:0}}>No stories in {cat} yet.</p></div>
      ) : (
        <NewsGrid items={items} loading={loading}/>
      )}
    </div>
  );
}

/* ── Footer ──────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{background:C.nav,borderTop:`1px solid ${C.navBorder}`,padding:"32px 16px 80px"}}>
      <div style={{maxWidth:1300,margin:"0 auto"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:24,marginBottom:24}}>
          <div>
            <div style={{display:"flex",alignItems:"center",marginBottom:10}}>
              <span style={{fontSize:20,fontWeight:900,color:C.white,fontFamily:serif}}>Neri</span>
              <span style={{fontSize:20,fontWeight:900,color:C.cyan, fontFamily:serif}}>Buzz</span>
            </div>
            <p style={{margin:"0 0 16px",fontSize:13,color:C.textMid,maxWidth:300,lineHeight:1.6}}>Real-time Nigerian news from Punch, Vanguard, Channels TV, BBC Africa, Al Jazeera and more.</p>
            <a href={WA_URL} target="_blank" rel="noopener noreferrer"
              style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(37,211,102,.1)",border:"1px solid rgba(37,211,102,.25)",color:"#4ADE80",padding:"9px 18px",borderRadius:8,fontSize:13,fontWeight:600,textDecoration:"none"}}>
              💬 Join our WhatsApp Channel
            </a>
          </div>
          <div>
            <p style={{margin:"0 0 10px",fontSize:11,fontWeight:700,color:C.textMid,letterSpacing:1,textTransform:"uppercase"}}>Sources</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {["Punch","Vanguard","Channels TV","The Cable","BBC Africa","Al Jazeera","The Guardian","TechCabal"].map(s=>(
                <span key={s} style={{fontSize:11,color:C.textMid,background:"rgba(255,255,255,.04)",border:`1px solid ${C.border}`,padding:"3px 9px",borderRadius:20}}>{s}</span>
              ))}
            </div>
          </div>
        </div>
        <div style={{borderTop:`1px solid ${C.border}`,paddingTop:18,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12}}>
          <p style={{margin:0,fontSize:12,color:C.textFaint}}>© {new Date().getFullYear()} NeriBuzz · All headline rights belong to respective publishers.</p>
          <Link href="/admin" style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:`1px solid ${C.border}`,color:C.textMid,padding:"6px 14px",borderRadius:7,fontSize:12,textDecoration:"none"}}>⚙ Admin Panel</Link>
        </div>
      </div>
    </footer>
  );
}

/* ── Mobile bottom nav ───────────────────────────────── */
function MobileBottomNav({ activeCat, onCat, onHome }) {
  return (
    <nav style={{position:"fixed",bottom:0,left:0,right:0,background:C.nav,borderTop:`1px solid ${C.border}`,display:"flex",zIndex:90,paddingBottom:"env(safe-area-inset-bottom)"}}>
      {[
        { label:"Home",          Icon:Home,      action:onHome,         active:activeCat==="All" },
        { label:"Nigeria",       Icon:Newspaper, action:()=>onCat("Nigeria"),     active:activeCat==="Nigeria"       },
        { label:"Sports",        Icon:Newspaper, action:()=>onCat("Sports"),      active:activeCat==="Sports"        },
        { label:"Entertainment", Icon:Newspaper, action:()=>onCat("Entertainment"),active:activeCat==="Entertainment" },
        { label:"WhatsApp",      Icon:null,      action:()=>window.open(WA_URL,"_blank"), active:false },
      ].map(({ label,Icon,action,active })=>(
        <button key={label} onClick={action}
          style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"10px 4px",background:"transparent",border:"none",cursor:"pointer",color:active?C.cyan:C.textMid,fontSize:10,gap:4,fontFamily:"inherit"}}>
          {label==="WhatsApp" ? <span style={{fontSize:20}}>💬</span> : Icon && <Icon size={18}/>}
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

/* ── WhatsApp float ──────────────────────────────────── */
function WhatsAppFloat() {
  return (
    <a href={WA_URL} target="_blank" rel="noopener noreferrer" title="Join NeriBuzz on WhatsApp"
      style={{position:"fixed",bottom:80,right:18,zIndex:100,background:"#25D366",color:"#fff",width:50,height:50,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 20px rgba(37,211,102,.4)",textDecoration:"none",fontSize:24,transition:"transform .2s,box-shadow .2s"}}
      onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.1)";e.currentTarget.style.boxShadow="0 6px 28px rgba(37,211,102,.6)";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 4px 20px rgba(37,211,102,.4)";}}>
      💬
    </a>
  );
}

/* ── Main App ────────────────────────────────────────── */
export default function NeriBuzz() {
  const [page,       setPage]    = useState("home");
  const [activeCat,  setActive]  = useState("All");
  const [loading,    setLoading] = useState(true);
  const [firstLoad,  setFirst]   = useState(true);
  const [lastRefresh,setLR]      = useState(new Date());
  const [news,       setNews]    = useState([]);
  const [errorCount, setErrCnt]  = useState(0);
  const [mobileOpen, setMobile]  = useState(false);
  const prevIds = useRef(new Set());

  const [posts,  setPosts]  = useState(()=>lsGet("nb_posts",[]));
  const [cats,   setCats]   = useState(()=>lsGet("nb_cats",DEF_CATS));
  const [hidden, setHidden] = useState(()=>lsGet("nb_hidden",[]));

  useEffect(()=>lsSet("nb_posts",posts),[posts]);
  useEffect(()=>lsSet("nb_cats",cats),[cats]);

  /* Register service worker */
  useEffect(()=>{
    if("serviceWorker" in navigator){
      navigator.serviceWorker.register("/sw.js").catch(()=>{});
    }
    // Track page view
    fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:"pageview"})}).catch(()=>{});
  },[]);

  /* Sync hidden list + posts from admin (cross-tab) */
  useEffect(()=>{
    const sync=()=>{
      setHidden(lsGet("nb_hidden",[]));
      setPosts(lsGet("nb_posts",[]));
      setCats(lsGet("nb_cats",DEF_CATS));
    };
    window.addEventListener("storage",sync);
    return()=>window.removeEventListener("storage",sync);
  },[]);

  const loadNews = useCallback(async()=>{
    setLoading(true);
    try{
      const r=await fetch("/api/news");
      if(!r.ok) throw new Error(`API ${r.status}`);
      const{news:n,feedLog:l}=await r.json();
      setErrCnt((l||[]).filter(f=>!f.ok).length);

      // In-browser notification for new stories in subscribed categories
      const notifCats = lsGet("nb_notif_cats",[]);
      if(notifCats.length&&Notification.permission==="granted"&&prevIds.current.size>0){
        const newOnes=(n||[]).filter(s=>!prevIds.current.has(s.id)&&notifCats.includes(s.category));
        if(newOnes.length){
          new Notification("NeriBuzz",{
            body:`${newOnes.length} new ${newOnes.length===1?"story":"stories"} in ${[...new Set(newOnes.map(s=>s.category))].join(", ")}`,
            icon:"/icon-192.png",
            tag:"neribuzz-update",
          });
        }
      }
      prevIds.current = new Set((n||[]).map(s=>s.id));
      setNews(n||[]);
      setLR(new Date());
    }catch(e){console.error(e);}
    finally{setLoading(false);setFirst(false);}
  },[]);

  useEffect(()=>{loadNews();},[loadNews]);
  useEffect(()=>{const t=setInterval(loadNews,3600000);return()=>clearInterval(t);},[loadNews]);

  /* Filter hidden stories */
  const visibleNews = news.filter(n=>!hidden.includes(n.id));

  const navTo   = cat=>{setActive(cat);setPage(cat==="All"?"home":"category");setMobile(false);};
  const onGoHome= ()=>{setPage("home");setActive("All");};

  if(firstLoad&&loading) return <PageLoader/>;

  return (
    <div style={{background:C.page,minHeight:"100vh",display:"flex",flexDirection:"column"}}>
      <BreakingTicker items={visibleNews}/>
      <WhatsAppBanner/>
      <Header categories={cats} activeCat={activeCat} onCat={navTo} onHome={onGoHome} mobileOpen={mobileOpen} onMobile={()=>setMobile(o=>!o)}/>

      <div style={{flex:1}}>
        {page==="home"&&(
          <HomeView news={visibleNews} blogPosts={posts} categories={cats}
            onCatSelect={cat=>{setActive(cat);setPage("category");}}
            onRefresh={loadNews} loading={loading} lastRefresh={lastRefresh} errorCount={errorCount}/>
        )}
        {page==="category"&&(
          <CategoryView cat={activeCat} news={visibleNews} blogPosts={posts}
            onBack={onGoHome} onRefresh={loadNews} loading={loading} lastRefresh={lastRefresh}/>
        )}
      </div>

      <Footer/>
      <MobileBottomNav activeCat={activeCat} onCat={navTo} onHome={onGoHome}/>
      <WhatsAppFloat/>
    </div>
  );
}
