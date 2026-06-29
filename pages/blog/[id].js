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
        <span style={{ color:C.white }}>Neri</span><span style={{ color:C.cyan }}>Buzz</span>
      </div>
      <div style={{ width:44, height:44, borderRadius:"50%", border:`3px solid rgba(34,211,238,.15)`, borderTopColor:C.cyan, animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function NotFound() {
  return (
    <div style={{ minHeight:"100vh", background:C.page, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, padding:20 }}>
      <div style={{ fontSize:28, fontFamily:serif, fontWeight:900 }}>
        <span style={{ color:C.white }}>Neri</span><span style={{ color:C.cyan }}>Buzz</span>
      </div>
      <p style={{ color:C.textMid, fontSize:16, margin:0 }}>Article not found.</p>
      <Link href="/" style={{ color:C.cyan, fontSize:14, textDecoration:"none" }}>← Back to Home</Link>
    </div>
  );
}

export default function BlogPostPage() {
  const router  = useRouter();
  const { id }  = router.query;
  const [post,  setPost]  = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!id) return;
    try {
      const posts = JSON.parse(localStorage.getItem("nb_posts") || "[]");
      setPost(posts.find(p => String(p.id) === String(id)) || null);
    } catch { setPost(null); }
    setReady(true);
  }, [id]);

  if (!ready) return <Loader />;
  if (!post)  return <NotFound />;

  const paragraphs = (post.content || post.excerpt || "").split(/\n\n+/).filter(Boolean);

  return (
    <>
      <Head>
        <title>{post.title} — NeriBuzz</title>
        <meta name="description" content={post.excerpt} />
        {post.coverImage && <meta property="og:image" content={post.coverImage} />}
      </Head>

      <div style={{ background:C.page, minHeight:"100vh" }}>
        {/* Top bar */}
        <div style={{ background:"#040507", borderBottom:`1px solid ${C.border}`, padding:"14px 24px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <Link href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center" }}>
            <span style={{ fontSize:22, fontWeight:900, color:C.white, fontFamily:serif }}>Neri</span>
            <span style={{ fontSize:22, fontWeight:900, color:C.cyan,  fontFamily:serif }}>Buzz</span>
          </Link>
          <Link href="/" style={{ fontSize:13, color:C.textMid, textDecoration:"none" }}>← All News</Link>
        </div>

        <article style={{ maxWidth:780, margin:"0 auto", padding:"40px 24px 80px" }}>
          {/* Category + date */}
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <span style={{ background:"rgba(34,211,238,.12)", border:"1px solid rgba(34,211,238,.25)", color:C.cyan, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, letterSpacing:1 }}>
              {post.category?.toUpperCase()}
            </span>
            <span style={{ fontSize:12, color:C.textMid }}>
              {post.source || "NeriBuzz"} · {post.timeAgo || "Recently"}
            </span>
            {post.isBreaking && (
              <span style={{ fontSize:10, fontWeight:800, color:C.red, border:`1px solid ${C.red}`, padding:"2px 7px", borderRadius:3 }}>● BREAKING</span>
            )}
          </div>

          {/* Title */}
          <h1 style={{ margin:"0 0 28px", fontSize:"clamp(26px,5vw,42px)", fontWeight:900, color:C.white, lineHeight:1.2, fontFamily:serif }}>
            {post.title}
          </h1>

          {/* Cover image */}
          {post.coverImage && (
            <div style={{ borderRadius:12, overflow:"hidden", marginBottom:36 }}>
              <img src={post.coverImage} alt={post.title}
                referrerPolicy="no-referrer"
                style={{ width:"100%", maxHeight:480, objectFit:"cover", display:"block" }}
                onError={e=>e.target.parentElement.style.display="none"}
              />
            </div>
          )}

          {/* Article body */}
          <div style={{ fontSize:"clamp(15px,2vw,17px)", color:C.text, lineHeight:1.85 }}>
            {paragraphs.map((para, i) => (
              <p key={i} style={{ margin:"0 0 22px" }}>{para}</p>
            ))}
          </div>

          {/* Footer */}
          <div style={{ marginTop:48, paddingTop:24, borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
            <Link href="/" style={{ display:"flex", alignItems:"center", gap:6, color:C.cyan, fontSize:13, textDecoration:"none" }}>
              ← Back to NeriBuzz
            </Link>
            <a href={`https://wa.me/?text=${encodeURIComponent(post.title+" - NeriBuzz")}`} target="_blank" rel="noopener noreferrer"
              style={{ display:"flex", alignItems:"center", gap:7, background:"rgba(37,211,102,.12)", border:"1px solid rgba(37,211,102,.3)", color:"#25D366", padding:"8px 16px", borderRadius:8, fontSize:13, textDecoration:"none" }}>
              Share on WhatsApp
            </a>
          </div>
        </article>
      </div>
    </>
  );
}
