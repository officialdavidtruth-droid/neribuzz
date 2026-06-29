import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";

const serif = '"Playfair Display", Georgia, serif';
const C = { page:"#08090D", card:"#0D1117", border:"#1A2535", cyan:"#22D3EE",
  white:"#F1F5F9", text:"#CBD5E1", textMid:"#64748B", red:"#F87171" };

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
*{box-sizing:border-box}html,body{margin:0;background:#08090D;color:#CBD5E1;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
@keyframes spin{to{transform:rotate(360deg)}}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#08090D}::-webkit-scrollbar-thumb{background:#1E2D3D;border-radius:4px}
.nb-share-btn{display:inline-flex;align-items:center;gap:7px;padding:10px 18px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;border:none;cursor:pointer;transition:opacity .15s,transform .15s;white-space:nowrap}
.nb-share-btn:hover{opacity:.88;transform:translateY(-1px)}
.nb-article h2{font-family:${serif};font-size:26px;font-weight:800;color:#F1F5F9;margin:32px 0 14px}
.nb-article h3{font-family:${serif};font-size:20px;font-weight:700;color:#F1F5F9;margin:24px 0 10px}
.nb-article p{margin:0 0 20px;line-height:1.85;font-size:17px;color:#CBD5E1}
.nb-article ul,.nb-article ol{color:#CBD5E1;padding-left:24px;margin:0 0 20px;font-size:17px;line-height:1.85}
.nb-article li{margin-bottom:8px}
.nb-article blockquote{border-left:3px solid #22D3EE;margin:0 0 20px;padding:12px 20px;background:rgba(34,211,238,.06);border-radius:0 8px 8px 0;color:#94A3B8;font-style:italic;font-size:17px}
.nb-article a{color:#22D3EE;text-decoration:underline}
.nb-article strong,.nb-article b{color:#F1F5F9;font-weight:700}
.nb-article hr{border:none;border-top:1px solid #1A2535;margin:28px 0}
.nb-article img{max-width:100%;border-radius:10px;margin:12px 0;display:block}
`;

function Loader(){
  return(
    <div style={{minHeight:"100vh",background:C.page,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:22}}>
      <style>{STYLES}</style>
      <div style={{fontSize:30,fontFamily:serif,fontWeight:900}}><span style={{color:C.white}}>Neri</span><span style={{color:C.cyan}}>Buzz</span></div>
      <div style={{width:44,height:44,borderRadius:"50%",border:`3px solid rgba(34,211,238,.15)`,borderTopColor:C.cyan,animation:"spin .8s linear infinite"}}/>
    </div>
  );
}

/* ── Social share strip ──────────────────────────────── */
function SocialShare({ post }) {
  const [copied, setCopied]   = useState(false);
  const [canNative, setNative]= useState(false);
  const [shareUrl, setUrl]    = useState("");

  useEffect(()=>{
    setUrl(window.location.href);
    setNative(!!navigator.share);
  },[]);

  const enc  = s => encodeURIComponent(s);
  const text = enc(`${post.title} — NeriBuzz`);
  const eUrl = enc(shareUrl);

  const nativeShare = async ()=>{
    try{ await navigator.share({ title:post.title, text:post.excerpt, url:shareUrl }); }catch{}
  };
  const copyLink = async ()=>{
    try{ await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(()=>setCopied(false),2500); }catch{}
  };

  const socials=[
    { name:"WhatsApp",   bg:"#25D366", color:"#fff", href:`https://wa.me/?text=${text}%20${eUrl}` },
    { name:"Facebook",   bg:"#1877F2", color:"#fff", href:`https://www.facebook.com/sharer/sharer.php?u=${eUrl}` },
    { name:"X / Twitter",bg:"#000000", color:"#fff", href:`https://x.com/intent/tweet?text=${text}&url=${eUrl}` },
    { name:"Telegram",   bg:"#0088CC", color:"#fff", href:`https://t.me/share/url?url=${eUrl}&text=${text}` },
    { name:"LinkedIn",   bg:"#0A66C2", color:"#fff", href:`https://linkedin.com/sharing/share-offsite/?url=${eUrl}` },
  ];

  return (
    <div style={{ marginTop:48, paddingTop:32, borderTop:`1px solid ${C.border}` }}>
      <h3 style={{ margin:"0 0 16px", fontSize:17, fontWeight:700, color:C.white, fontFamily:serif }}>Share this article</h3>

      {/* Native share — shows on mobile */}
      {canNative&&(
        <button onClick={nativeShare} className="nb-share-btn"
          style={{ background:"rgba(34,211,238,.12)", border:"1px solid rgba(34,211,238,.25)", color:C.cyan, marginBottom:14 }}>
          📤 Share via…
        </button>
      )}

      {/* Platform buttons */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:16 }}>
        {socials.map(s=>(
          <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer"
            className="nb-share-btn" style={{ background:s.bg, color:s.color }}>
            {s.name}
          </a>
        ))}
        <button onClick={copyLink} className="nb-share-btn"
          style={{ background:copied?"rgba(52,211,153,.15)":"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.12)", color:copied?"#34D399":C.text }}>
          {copied ? "✓ Copied!" : "Copy Link"}
        </button>
      </div>

      {/* Shareable URL box */}
      <div style={{ display:"flex", alignItems:"center", gap:8, background:"#060A0F", border:`1px solid ${C.border}`, borderRadius:8, padding:"10px 14px" }}>
        <span style={{ fontSize:11, color:C.textMid, flexShrink:0 }}>Link:</span>
        <input readOnly value={shareUrl} onClick={e=>e.target.select()}
          style={{ flex:1, background:"transparent", border:"none", outline:"none", fontSize:12, color:C.cyan, fontFamily:"monospace" }}/>
        <button onClick={copyLink}
          style={{ background:C.cyanGlow, border:"1px solid rgba(34,211,238,.2)", color:C.cyan, borderRadius:6, padding:"5px 12px", fontSize:12, cursor:"pointer" }}>
          Copy
        </button>
      </div>

      {/* WhatsApp channel */}
      <a href="https://whatsapp.com/channel/0029Vb6xYzRFMqrRNDnpwm1V" target="_blank" rel="noopener noreferrer"
        style={{ display:"inline-flex", alignItems:"center", gap:8, marginTop:16, background:"rgba(37,211,102,.1)", border:"1px solid rgba(37,211,102,.25)", color:"#4ADE80", padding:"9px 18px", borderRadius:8, fontSize:13, textDecoration:"none", fontWeight:600 }}>
        💬 Follow NeriBuzz on WhatsApp for daily news
      </a>
    </div>
  );
}

export default function BlogPostPage() {
  const router  = useRouter();
  const { id }  = router.query;
  const [post,  setPost]  = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(()=>{
    if(!id) return;
    // Track article view
    try{
      const posts=JSON.parse(localStorage.getItem("nb_posts")||"[]");
      const found=posts.find(p=>String(p.id)===String(id))||null;
      setPost(found);
      if(found) fetch("/api/analytics",{ method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ type:"article", articleId:id, articleTitle:found.title, category:found.category }) }).catch(()=>{});
    }catch{ setPost(null); }
    setReady(true);
  },[id]);

  if(!ready) return <Loader/>;

  if(!post) return(
    <><style>{STYLES}</style>
    <div style={{minHeight:"100vh",background:C.page,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:20}}>
      <div style={{fontSize:28,fontFamily:serif,fontWeight:900}}><span style={{color:C.white}}>Neri</span><span style={{color:C.cyan}}>Buzz</span></div>
      <p style={{color:C.textMid,fontSize:16,margin:0}}>Article not found.</p>
      <Link href="/" style={{color:C.cyan,fontSize:14,textDecoration:"none"}}>← Back to Home</Link>
    </div></>
  );

  return(
    <>
      <style>{STYLES}</style>
      <Head>
        <title>{post.title} — NeriBuzz</title>
        <meta name="description" content={post.excerpt}/>
        {post.coverImage&&<meta property="og:image" content={post.coverImage}/>}
        <meta property="og:title" content={`${post.title} — NeriBuzz`}/>
        <meta property="og:description" content={post.excerpt}/>
        <meta property="og:type" content="article"/>
        <meta name="twitter:card" content="summary_large_image"/>
      </Head>

      <div style={{background:C.page,minHeight:"100vh"}}>
        {/* Topbar */}
        <div style={{background:"#040507",borderBottom:`1px solid ${C.border}`,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
          <Link href="/" style={{textDecoration:"none",display:"flex",alignItems:"center"}}>
            <span style={{fontSize:22,fontWeight:900,color:C.white,fontFamily:serif}}>Neri</span>
            <span style={{fontSize:22,fontWeight:900,color:C.cyan, fontFamily:serif}}>Buzz</span>
          </Link>
          <div style={{display:"flex",gap:12,alignItems:"center"}}>
            {post.category&&<span style={{fontSize:11,fontWeight:700,color:C.cyan,background:"rgba(34,211,238,.1)",border:"1px solid rgba(34,211,238,.2)",padding:"3px 10px",borderRadius:20,letterSpacing:1}}>{post.category.toUpperCase()}</span>}
            <Link href="/" style={{fontSize:13,color:C.textMid,textDecoration:"none"}}>← All News</Link>
          </div>
        </div>

        <article style={{maxWidth:780,margin:"0 auto",padding:"48px 20px 80px"}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap"}}>
            <span style={{fontSize:12,color:C.textMid}}>{post.source||"NeriBuzz"} · {post.timeAgo||"Recently"}</span>
            {post.isBreaking&&<span style={{fontSize:10,fontWeight:800,color:C.red,border:"1px solid rgba(239,68,68,.35)",padding:"2px 7px",borderRadius:3}}>● BREAKING</span>}
            {post.tags?.map(t=><span key={t} style={{fontSize:11,color:C.textMid,background:"rgba(255,255,255,.04)",border:`1px solid ${C.border}`,padding:"2px 9px",borderRadius:20}}>{t}</span>)}
          </div>

          <h1 style={{margin:"0 0 32px",fontSize:"clamp(26px,5vw,44px)",fontWeight:900,color:C.white,lineHeight:1.2,fontFamily:serif}}>
            {post.title}
          </h1>

          {post.coverImage&&(
            <div style={{borderRadius:12,overflow:"hidden",marginBottom:40}}>
              <img src={post.coverImage} alt={post.title} referrerPolicy="no-referrer"
                style={{width:"100%",maxHeight:500,objectFit:"cover",display:"block"}}
                onError={e=>e.target.parentElement.style.display="none"}/>
            </div>
          )}

          {post.content
            ? <div className="nb-article" dangerouslySetInnerHTML={{__html:post.content}}/>
            : <div className="nb-article"><p>{post.excerpt}</p></div>
          }

          {/* Social sharing */}
          <SocialShare post={post}/>
        </article>
      </div>
    </>
  );
}
