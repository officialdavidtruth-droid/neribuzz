import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Link from "next/link";

const serif = '"Playfair Display", Georgia, serif';
const C = {
  page:"#08090D", card:"#0D1117", border:"#1A2535",
  cyan:"#22D3EE", white:"#F1F5F9", text:"#CBD5E1",
  textMid:"#64748B", red:"#F87171",
};

function Loader() {
  return (
    <div style={{ minHeight:"100vh", background:C.page, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:24 }}>
      <div style={{ fontSize:32, fontFamily:serif, fontWeight:900 }}>
        <span style={{color:C.white}}>Neri</span><span style={{color:C.cyan}}>Buzz</span>
      </div>
      <div style={{ width:44, height:44, borderRadius:"50%", border:`3px solid rgba(34,211,238,.15)`, borderTopColor:C.cyan, animation:"spin .8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

const ARTICLE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box} html,body{margin:0;background:#08090D;color:#CBD5E1;font-family:'Inter',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .nb-article-body h1,.nb-article-body h2{font-family:${serif};color:#F1F5F9;margin:32px 0 14px}
  .nb-article-body h2{font-size:26px;font-weight:800}
  .nb-article-body h3{font-size:20px;font-weight:700;color:#F1F5F9;font-family:${serif};margin:24px 0 10px}
  .nb-article-body p{margin:0 0 20px;line-height:1.85;font-size:17px;color:#CBD5E1}
  .nb-article-body ul,.nb-article-body ol{color:#CBD5E1;padding-left:24px;margin:0 0 20px;font-size:17px;line-height:1.85}
  .nb-article-body li{margin-bottom:8px}
  .nb-article-body blockquote{border-left:3px solid #22D3EE;margin:0 0 20px;padding:12px 20px;background:rgba(34,211,238,.06);border-radius:0 8px 8px 0;color:#94A3B8;font-style:italic;font-size:17px}
  .nb-article-body a{color:#22D3EE;text-decoration:underline}
  .nb-article-body strong,.nb-article-body b{color:#F1F5F9;font-weight:700}
  .nb-article-body hr{border:none;border-top:1px solid #1A2535;margin:28px 0}
  .nb-article-body img{max-width:100%;border-radius:10px;margin:12px 0;display:block}
  ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:#08090D} ::-webkit-scrollbar-thumb{background:#1E2D3D;border-radius:4px}
`;

export default function BlogPostPage() {
  const router  = useRouter();
  const { id }  = router.query;
  const [post,  setPost]  = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(()=>{
    if(!id) return;
    try {
      const posts = JSON.parse(localStorage.getItem("nb_posts")||"[]");
      setPost(posts.find(p=>String(p.id)===String(id))||null);
    } catch { setPost(null); }
    setReady(true);
  },[id]);

  if(!ready) return <><style>{ARTICLE_STYLES}</style><Loader/></>;

  if(!post) return (
    <>
      <style>{ARTICLE_STYLES}</style>
      <div style={{minHeight:"100vh",background:C.page,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16,padding:20}}>
        <div style={{fontSize:28,fontFamily:serif,fontWeight:900}}><span style={{color:C.white}}>Neri</span><span style={{color:C.cyan}}>Buzz</span></div>
        <p style={{color:C.textMid,fontSize:16,margin:0}}>Article not found.</p>
        <Link href="/" style={{color:C.cyan,fontSize:14,textDecoration:"none"}}>← Back to Home</Link>
      </div>
    </>
  );

  return (
    <>
      <style>{ARTICLE_STYLES}</style>
      <Head>
        <title>{post.title} — NeriBuzz</title>
        <meta name="description" content={post.excerpt}/>
        {post.coverImage&&<meta property="og:image" content={post.coverImage}/>}
        <meta property="og:title" content={`${post.title} — NeriBuzz`}/>
        <meta property="og:type" content="article"/>
      </Head>

      <div style={{background:C.page, minHeight:"100vh"}}>
        {/* Topbar */}
        <div style={{background:"#040507",borderBottom:`1px solid ${C.border}`,padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <Link href="/" style={{textDecoration:"none",display:"flex",alignItems:"center"}}>
            <span style={{fontSize:22,fontWeight:900,color:C.white,fontFamily:serif}}>Neri</span>
            <span style={{fontSize:22,fontWeight:900,color:C.cyan, fontFamily:serif}}>Buzz</span>
          </Link>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            {post.category&&<span style={{fontSize:11,fontWeight:700,color:C.cyan,background:"rgba(34,211,238,.1)",border:"1px solid rgba(34,211,238,.2)",padding:"3px 10px",borderRadius:20,letterSpacing:1}}>{post.category.toUpperCase()}</span>}
            <Link href="/" style={{fontSize:13,color:C.textMid,textDecoration:"none"}}>← All News</Link>
          </div>
        </div>

        <article style={{maxWidth:780,margin:"0 auto",padding:"48px 24px 80px"}}>
          {/* Meta */}
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20,flexWrap:"wrap"}}>
            <span style={{fontSize:12,color:C.textMid}}>{post.source||"NeriBuzz"} · {post.timeAgo||"Recently"}</span>
            {post.isBreaking&&<span style={{fontSize:10,fontWeight:800,color:C.red,border:`1px solid rgba(239,68,68,.35)`,padding:"2px 7px",borderRadius:3}}>● BREAKING</span>}
            {post.tags?.map(t=><span key={t} style={{fontSize:11,color:C.textMid,background:"rgba(255,255,255,.04)",border:`1px solid ${C.border}`,padding:"2px 9px",borderRadius:20}}>{t}</span>)}
          </div>

          {/* Title */}
          <h1 style={{margin:"0 0 32px",fontSize:"clamp(28px,5vw,44px)",fontWeight:900,color:C.white,lineHeight:1.2,fontFamily:serif}}>
            {post.title}
          </h1>

          {/* Cover image */}
          {post.coverImage&&(
            <div style={{borderRadius:12,overflow:"hidden",marginBottom:40}}>
              <img src={post.coverImage} alt={post.title} referrerPolicy="no-referrer"
                style={{width:"100%",maxHeight:500,objectFit:"cover",display:"block"}}
                onError={e=>e.target.parentElement.style.display="none"}/>
            </div>
          )}

          {/* Article body */}
          {post.content ? (
            <div className="nb-article-body" dangerouslySetInnerHTML={{__html:post.content}}/>
          ) : (
            <div className="nb-article-body"><p>{post.excerpt}</p></div>
          )}

          {/* Footer */}
          <div style={{marginTop:52,paddingTop:24,borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
            <Link href="/" style={{display:"flex",alignItems:"center",gap:6,color:C.cyan,fontSize:13,textDecoration:"none"}}>
              ← Back to NeriBuzz
            </Link>
            <a href={`https://wa.me/?text=${encodeURIComponent(post.title+" — NeriBuzz: https://neribuzz.vercel.app/blog/"+post.id)}`} target="_blank" rel="noopener noreferrer"
              style={{display:"flex",alignItems:"center",gap:7,background:"rgba(37,211,102,.1)",border:"1px solid rgba(37,211,102,.28)",color:"#4ADE80",padding:"9px 18px",borderRadius:8,fontSize:13,textDecoration:"none",fontWeight:600}}>
              💬 Share on WhatsApp
            </a>
          </div>
        </article>
      </div>
    </>
  );
}
