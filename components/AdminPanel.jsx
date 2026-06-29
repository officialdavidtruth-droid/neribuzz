import { useState, useEffect, useCallback, useRef } from "react";
import {
  Shield, LogOut, BarChart2, FileText, Plus, Tag, Edit3, Trash2,
  CheckCircle, AlertCircle, Wifi, WifiOff, RefreshCw, Globe,
  ChevronDown, X, Link2, List, Bold, Italic, Underline,
  Strikethrough, Image as ImageIcon, Eye, EyeOff, ArrowLeft,
  Quote, ListOrdered, Minus, Scissors, Upload, ExternalLink,
} from "lucide-react";

/* ─── Tokens ──────────────────────────────────────────────── */
const C = {
  page:"#08090D", card:"#0A0E14", nav:"#040507", navBorder:"#0F1520",
  editorBg:"#0B0F17", sidebarBg:"#070A0F",
  cyan:"#22D3EE", cyanDim:"#0891B2",
  cyanGlow:"rgba(34,211,238,0.1)", cyanBorder:"rgba(34,211,238,0.2)",
  white:"#F1F5F9", text:"#CBD5E1", textMid:"#64748B", textFaint:"#1E2D3D",
  border:"#1A2535", red:"#F87171", redSolid:"#EF4444", green:"#34D399",
};
const serif = '"Playfair Display", Georgia, serif';
const DEF_CATS = ["Nigeria","International","Business","Sports","Entertainment","Technology","Health","Politics"];
const lsGet = (k,fb)=>{ try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;} };
const lsSet = (k,v) =>{ try{localStorage.setItem(k,JSON.stringify(v));}catch{} };

/* ─── CSS injected into <head> ────────────────────────────── */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap');
*{box-sizing:border-box} html,body{margin:0;padding:0;font-family:'Inter',system-ui,sans-serif;background:#08090D;color:#CBD5E1;-webkit-font-smoothing:antialiased}
@keyframes nbspin{to{transform:rotate(360deg)}}
@keyframes nbfade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes nbpulse{0%,100%{opacity:1}50%{opacity:.4}}
.nb-fade{animation:nbfade .3s ease}
.nb-btn{transition:background .14s,color .14s,border-color .14s,opacity .14s}
::-webkit-scrollbar{width:4px;height:4px}
::-webkit-scrollbar-track{background:#08090D}
::-webkit-scrollbar-thumb{background:#1E2D3D;border-radius:4px}
/* Rich-text editor */
.nb-editor{outline:none;min-height:460px;font-size:16px;line-height:1.85;color:#CBD5E1;font-family:'Inter',system-ui,sans-serif;word-break:break-word}
.nb-editor:empty:before{content:attr(data-placeholder);color:#2A3A4E;pointer-events:none;display:block}
.nb-editor p{margin:0 0 18px}
.nb-editor h2{font-family:${serif};font-size:26px;font-weight:800;color:#F1F5F9;margin:32px 0 14px}
.nb-editor h3{font-family:${serif};font-size:20px;font-weight:700;color:#F1F5F9;margin:24px 0 10px}
.nb-editor ul,.nb-editor ol{color:#CBD5E1;padding-left:24px;margin:0 0 18px}
.nb-editor li{margin-bottom:6px}
.nb-editor blockquote{border-left:3px solid #22D3EE;margin:0 0 18px;padding:10px 18px;background:rgba(34,211,238,.06);border-radius:0 6px 6px 0;color:#94A3B8;font-style:italic}
.nb-editor a{color:#22D3EE;text-decoration:underline}
.nb-editor strong,.nb-editor b{color:#F1F5F9;font-weight:700}
.nb-editor hr{border:none;border-top:1px solid #1A2535;margin:24px 0}
.nb-editor img{max-width:100%;border-radius:8px;margin:10px 0;display:block;cursor:pointer}
.nb-editor img:hover{outline:2px solid #22D3EE;outline-offset:2px}
/* Toolbar */
.nb-tool{display:flex;align-items:center;justify-content:center;padding:5px 8px;background:transparent;border:1px solid #1A2535;border-radius:5px;color:#64748B;cursor:pointer;font-size:12px;font-weight:700;min-width:28px;gap:3px;font-family:'Inter',system-ui,sans-serif;transition:background .12s,color .12s,border-color .12s}
.nb-tool:hover{background:rgba(255,255,255,.06);color:#CBD5E1}
.nb-tool-active{background:rgba(34,211,238,.16)!important;color:#22D3EE!important;border-color:rgba(34,211,238,.3)!important}
/* Sidebar panels */
.nb-panel-hdr{width:100%;display:flex;align-items:center;justify-content:space-between;padding:11px 16px;background:transparent;border:none;border-bottom:1px solid #1A2535;color:#64748B;font-size:11px;font-weight:700;letter-spacing:.9px;text-transform:uppercase;cursor:pointer;font-family:'Inter',system-ui,sans-serif;transition:color .12s,background .12s}
.nb-panel-hdr:hover{background:rgba(255,255,255,.03);color:#F1F5F9}
/* Drop zone */
.nb-dz{border:2px dashed #1A2535;border-radius:10px;padding:22px 16px;text-align:center;cursor:pointer;transition:border-color .2s,background .2s}
.nb-dz:hover,.nb-dz-over{border-color:#22D3EE!important;background:rgba(34,211,238,.06)!important}
input[type=checkbox]{accent-color:#22D3EE;width:15px;height:15px;cursor:pointer}
`;

/* ──────────────────────────────────────────────────────────
   IMAGE UTILITIES
   ─────────────────────────────────────────────────────── */

/** Canvas-compress a File → base64 JPEG string */
async function compressImage(file, maxW = 1200, quality = 0.78) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) { reject(new Error("Not an image")); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Read failed"));
    reader.onload = e => {
      const img = new Image();
      img.onerror = () => reject(new Error("Decode failed"));
      img.onload = () => {
        let { width: w, height: h } = img;
        if (w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

/** Format bytes for UI */
function fmtBytes(b) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b/1024).toFixed(0)} KB`;
  return `${(b/1048576).toFixed(1)} MB`;
}

/* ──────────────────────────────────────────────────────────
   DROP ZONE  — drag-drop + click-to-browse, auto-compress
   ─────────────────────────────────────────────────────── */
function DropZone({ onImage, compact = false, label = "Drag & drop image here" }) {
  const [over,       setOver]   = useState(false);
  const [processing, setProc]   = useState(false);
  const [err,        setErr]    = useState("");
  const [info,       setInfo]   = useState("");
  const fileRef = useRef(null);

  const process = async file => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErr("Please select an image file (JPEG, PNG, WebP, GIF)."); return; }
    setProc(true); setErr(""); setInfo("");
    try {
      const origSize = file.size;
      const b64 = await compressImage(file);
      // b64 is "data:image/jpeg;base64,..." — calc compressed size
      const compSize = Math.round((b64.length * 3) / 4);
      setInfo(`Compressed: ${fmtBytes(origSize)} → ${fmtBytes(compSize)}`);
      onImage(b64);
    } catch(e) { setErr(`Failed to process image: ${e.message}`); }
    finally    { setProc(false); }
  };

  const onDrop = e => {
    e.preventDefault(); setOver(false);
    process(e.dataTransfer.files[0]);
  };
  const onFile = e => {
    process(e.target.files[0]);
    e.target.value = "";
  };

  return (
    <div>
      <div
        className={`nb-dz${over?" nb-dz-over":""}`}
        style={{ padding: compact ? "16px 12px" : "28px 16px" }}
        onDragOver={e=>{ e.preventDefault(); setOver(true); }}
        onDragLeave={()=>setOver(false)}
        onDrop={onDrop}
        onClick={()=>fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{display:"none"}}/>
        {processing ? (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
            <div style={{width:24,height:24,borderRadius:"50%",border:`3px solid ${C.cyanGlow}`,borderTopColor:C.cyan,animation:"nbspin .7s linear infinite"}}/>
            <p style={{margin:0,fontSize:12,color:C.textMid}}>Compressing image…</p>
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap: compact?6:10}}>
            <div style={{width:compact?36:48,height:compact?36:48,borderRadius:12,background:over?C.cyanGlow:"rgba(255,255,255,.04)",border:`1px solid ${over?C.cyanBorder:C.border}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .2s"}}>
              <Upload size={compact?16:22} style={{color:over?C.cyan:C.textMid}}/>
            </div>
            <p style={{margin:0,fontSize:compact?12:13,fontWeight:600,color:over?C.cyan:C.text}}>
              {over?"Release to upload":label}
            </p>
            {!compact&&<p style={{margin:0,fontSize:11,color:C.textMid}}>or <span style={{color:C.cyan,textDecoration:"underline"}}>click to browse</span> · JPEG, PNG, WebP, GIF · auto-compressed</p>}
            {compact&&<p style={{margin:0,fontSize:10,color:C.textMid}}>Click or drop to replace</p>}
          </div>
        )}
      </div>
      {info&&<p style={{margin:"5px 0 0",fontSize:11,color:C.green}}>✓ {info}</p>}
      {err &&<p style={{margin:"5px 0 0",fontSize:11,color:C.red}}>⚠ {err}</p>}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   INSERT IMAGE MODAL  (for inline content images)
   ─────────────────────────────────────────────────────── */
function InsertImageModal({ editorRef, onClose }) {
  const [mode,    setMode]   = useState("upload"); // "upload" | "url"
  const [url,     setUrl]    = useState("");
  const [preview, setPreview]= useState(null);
  const [imgErr,  setImgErr] = useState(false);
  const [altText, setAlt]    = useState("");

  const handleUpload = b64 => { setPreview(b64); setUrl(b64); setMode("url"); };

  const insert = () => {
    const src = url || preview;
    if (!src) return;
    editorRef.current?.focus();
    // Build img tag with optional alt
    const alt = altText || "image";
    document.execCommand("insertHTML", false, `<img src="${src}" alt="${alt}" />`);
    onClose();
  };

  const inp = { width:"100%", padding:"10px 14px", background:"#060A0F", border:`1px solid ${C.border}`, borderRadius:8, fontSize:14, outline:"none", color:C.white, fontFamily:"inherit" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(4,5,7,.88)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:300, padding:20 }}>
      <div style={{ background:"#0D1117", border:`1px solid ${C.border}`, borderRadius:14, width:"100%", maxWidth:500, boxShadow:"0 28px 70px rgba(0,0,0,.6)", overflow:"hidden" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 22px", borderBottom:`1px solid ${C.border}` }}>
          <h3 style={{ margin:0, fontSize:16, fontWeight:800, color:C.white, fontFamily:serif }}>Insert Image</h3>
          <button onClick={onClose} className="nb-btn" style={{ background:"transparent", border:"none", color:C.textMid, cursor:"pointer", padding:4, display:"flex" }}><X size={18}/></button>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", borderBottom:`1px solid ${C.border}` }}>
          {[["upload","Upload File"],["url","Paste URL"]].map(([id,label])=>(
            <button key={id} onClick={()=>setMode(id)} className="nb-btn"
              style={{ flex:1, padding:"11px", background:"transparent", border:"none", borderBottom:mode===id?`2px solid ${C.cyan}`:"2px solid transparent", color:mode===id?C.cyan:C.textMid, fontSize:13, fontWeight:mode===id?700:500, cursor:"pointer" }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ padding:"20px 22px" }}>
          {mode==="upload" ? (
            <DropZone onImage={handleUpload} label="Drag & drop or click to upload"/>
          ) : (
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:C.textMid, display:"block", marginBottom:8, letterSpacing:.8, textTransform:"uppercase" }}>Image URL</label>
              <input type="url" value={url} placeholder="https://example.com/photo.jpg"
                onChange={e=>{ setUrl(e.target.value); setImgErr(false); setPreview(null); }}
                style={inp}/>
            </div>
          )}

          {/* Preview */}
          {(url||preview)&&!imgErr&&(
            <div style={{ marginTop:14, borderRadius:9, overflow:"hidden", maxHeight:220, background:"#040608", position:"relative" }}>
              <img src={url||preview} alt="preview" referrerPolicy="no-referrer"
                style={{ width:"100%", maxHeight:220, objectFit:"cover", display:"block" }}
                onError={()=>setImgErr(true)}/>
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(4,5,7,.6),transparent)" }}/>
              <span style={{ position:"absolute", bottom:10, left:10, fontSize:11, color:"rgba(255,255,255,.6)" }}>Preview</span>
            </div>
          )}
          {imgErr&&<p style={{margin:"8px 0 0",fontSize:12,color:C.red}}>⚠ Image failed to load — check the URL</p>}

          {/* Alt text */}
          {(url||preview)&&!imgErr&&(
            <div style={{ marginTop:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.textMid, display:"block", marginBottom:7, letterSpacing:.8, textTransform:"uppercase" }}>Alt Text (optional)</label>
              <input type="text" value={altText} placeholder="Describe the image for accessibility…"
                onChange={e=>setAlt(e.target.value)} style={{...inp,fontSize:13}}/>
            </div>
          )}

          {/* Actions */}
          <div style={{ display:"flex", gap:10, marginTop:18 }}>
            <button onClick={onClose} className="nb-btn"
              style={{ flex:1, padding:"10px", border:`1px solid ${C.border}`, borderRadius:8, background:"transparent", color:C.textMid, fontSize:13, cursor:"pointer" }}>
              Cancel
            </button>
            <button onClick={insert} disabled={!url&&!preview} className="nb-btn"
              style={{ flex:2, padding:"10px", background:(url||preview)?C.cyan:"#1A2535", border:"none", borderRadius:8, color:(url||preview)?"#040507":C.textMid, fontSize:13, fontWeight:700, cursor:(url||preview)?"pointer":"not-allowed" }}>
              Insert into Article
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   SIDEBAR PANEL  (collapsible)
   ─────────────────────────────────────────────────────── */
function SidebarPanel({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom:`1px solid ${C.border}` }}>
      <button className="nb-panel-hdr" onClick={()=>setOpen(!open)}>
        {title}
        <ChevronDown size={12} style={{ transform:open?"rotate(180deg)":"none", transition:".2s", flexShrink:0 }}/>
      </button>
      {open && <div style={{ padding:"14px 16px" }}>{children}</div>}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   FEATURED IMAGE PANEL
   ─────────────────────────────────────────────────────── */
function FeaturedImagePanel({ coverImg, setCoverImg }) {
  const [useUrl, setUseUrl] = useState(false);
  const [urlVal, setUrlVal] = useState("");
  const [imgErr, setImgErr] = useState(false);

  const applyUrl = () => {
    if (urlVal.trim()) { setCoverImg(urlVal.trim()); setUrlVal(""); setUseUrl(false); setImgErr(false); }
  };

  return (
    <SidebarPanel title="Featured Image" defaultOpen={true}>
      {coverImg ? (
        /* ── Image set — show preview ── */
        <div>
          <div style={{ borderRadius:8, overflow:"hidden", marginBottom:10, position:"relative", background:"#040608" }}>
            {!imgErr ? (
              <img src={coverImg} alt="cover" referrerPolicy="no-referrer"
                style={{ width:"100%", height:140, objectFit:"cover", display:"block" }}
                onError={()=>setImgErr(true)}/>
            ) : (
              <div style={{ height:80, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ fontSize:11, color:C.red }}>⚠ Image failed to load</span>
              </div>
            )}
            {!imgErr&&<div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(4,5,7,.5),transparent)" }}/>}
          </div>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <button onClick={()=>{ setCoverImg(""); setImgErr(false); }} className="nb-btn"
              style={{ flex:1, padding:"7px", border:"1px solid rgba(239,68,68,.25)", borderRadius:7, background:"transparent", color:C.red, fontSize:12, cursor:"pointer" }}>
              Remove
            </button>
            <button onClick={()=>setUseUrl(v=>!v)} className="nb-btn"
              style={{ flex:1, padding:"7px", border:`1px solid ${C.border}`, borderRadius:7, background:"transparent", color:C.textMid, fontSize:12, cursor:"pointer" }}>
              Change URL
            </button>
          </div>
          {useUrl&&(
            <div style={{ display:"flex", gap:6 }}>
              <input type="url" value={urlVal} placeholder="https://…" autoFocus
                onChange={e=>setUrlVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&applyUrl()}
                style={{ flex:1, padding:"8px 10px", background:"#060A0F", border:`1px solid ${C.border}`, borderRadius:7, fontSize:12, outline:"none", color:C.white, fontFamily:"inherit" }}/>
              <button onClick={applyUrl} className="nb-btn" style={{ padding:"8px 12px", background:C.cyanGlow, border:`1px solid ${C.cyanBorder}`, borderRadius:7, color:C.cyan, fontSize:12, cursor:"pointer" }}>OK</button>
            </div>
          )}
          {/* Replace by dragging new image */}
          <div style={{ marginTop:10 }}>
            <DropZone onImage={src=>{ setCoverImg(src); setImgErr(false); }} compact={true}/>
          </div>
        </div>
      ) : (
        /* ── No image — show upload + URL ── */
        <div>
          <DropZone onImage={setCoverImg} label="Drag & drop cover image"/>
          <div style={{ display:"flex", alignItems:"center", gap:8, margin:"14px 0" }}>
            <div style={{ flex:1, height:1, background:C.border }}/>
            <span style={{ fontSize:10, color:C.textMid, letterSpacing:.8 }}>OR PASTE URL</span>
            <div style={{ flex:1, height:1, background:C.border }}/>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            <input type="url" value={urlVal} placeholder="https://example.com/image.jpg"
              onChange={e=>setUrlVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&applyUrl()}
              style={{ flex:1, padding:"9px 12px", background:"#060A0F", border:`1px solid ${C.border}`, borderRadius:7, fontSize:12, outline:"none", color:C.white, fontFamily:"inherit" }}/>
            <button onClick={applyUrl} className="nb-btn"
              style={{ padding:"9px 14px", background:urlVal?C.cyanGlow:"transparent", border:`1px solid ${urlVal?C.cyanBorder:C.border}`, borderRadius:7, color:urlVal?C.cyan:C.textMid, fontSize:12, cursor:"pointer" }}>
              Set
            </button>
          </div>
        </div>
      )}
    </SidebarPanel>
  );
}

/* ──────────────────────────────────────────────────────────
   WRITE ARTICLE  (WordPress-style two-column editor)
   ─────────────────────────────────────────────────────── */
function WriteArticle({ editing, categories, onSave, onCancel }) {
  const [title,      setTitle]    = useState(editing?.title||"");
  const [coverImg,   setCoverImg] = useState(editing?.coverImage||editing?.image||"");
  const [selCats,    setSelCats]  = useState(()=>{
    if(editing?.categories?.length) return editing.categories;
    if(editing?.category)           return [editing.category];
    return [categories[0]||"Nigeria"];
  });
  const [tags,       setTags]     = useState(editing?.tags||[]);
  const [tagInput,   setTagInput] = useState("");
  const [isBreaking, setBrk]      = useState(editing?.isBreaking||false);
  const [excerpt,    setExcerpt]  = useState(editing?.excerpt||"");
  const [customEx,   setCustomEx] = useState(false);
  const [msg,        setMsg]      = useState({text:"",ok:false});
  const [fmts,       setFmts]     = useState({});
  const [showImgModal, setImgModal] = useState(false);
  const [saved,      setSaved]    = useState(false);
  const editorRef = useRef(null);

  /* Slug from title */
  const slug = title.toLowerCase().replace(/[^a-z0-9\s-]/g,"").replace(/\s+/g,"-").replace(/-+/g,"-").slice(0,60)||"your-article-title";

  /* Init editor content */
  useEffect(()=>{
    if(editorRef.current){
      editorRef.current.innerHTML = editing?.content||"";
      document.execCommand("defaultParagraphSeparator",false,"p");
    }
  },[]);

  /* Auto-excerpt */
  const refreshExcerpt = useCallback(()=>{
    if(!customEx&&editorRef.current){
      const text=(editorRef.current.innerText||"").trim();
      setExcerpt(text.slice(0,240));
    }
  },[customEx]);

  /* Track active formats */
  const checkFmts = ()=>{
    const f={};
    ["bold","italic","underline","strikeThrough"].forEach(k=>{ try{f[k]=document.queryCommandState(k);}catch{f[k]=false;} });
    setFmts(f);
  };

  /* execCommand shortcut */
  const exec = (cmd,val=null)=>{
    editorRef.current?.focus();
    document.execCommand(cmd,false,val);
    checkFmts();
    refreshExcerpt();
  };

  /* Insert link */
  const insertLink = ()=>{
    const url=prompt("Enter URL (include https://):");
    if(url){ exec("createLink",url); }
  };

  /* Keyboard shortcuts */
  const handleKeyDown = e=>{
    if(e.ctrlKey||e.metaKey){
      if(e.key==="b"){e.preventDefault();exec("bold");}
      if(e.key==="i"){e.preventDefault();exec("italic");}
      if(e.key==="u"){e.preventDefault();exec("underline");}
      if(e.key==="k"){e.preventDefault();insertLink();}
    }
  };

  /* Clipboard paste — handles image paste from clipboard / screenshots */
  const handlePaste = async e=>{
    const items = Array.from(e.clipboardData?.items||[]);
    const imgItem = items.find(i=>i.type.startsWith("image/"));
    if(imgItem){
      e.preventDefault();
      const file = imgItem.getAsFile();
      if(file){
        try{
          const b64 = await compressImage(file);
          document.execCommand("insertHTML",false,`<img src="${b64}" alt="pasted image"/>`);
          refreshExcerpt();
        }catch(err){ console.error(err); }
      }
    }
  };

  /* Drop image onto editor area */
  const handleEditorDrop = async e=>{
    const file = e.dataTransfer.files[0];
    if(file?.type.startsWith("image/")){
      e.preventDefault();
      try{
        const b64 = await compressImage(file);
        // Try to position at drop point
        const range = document.caretRangeFromPoint?.(e.clientX,e.clientY);
        if(range){const sel=window.getSelection();sel.removeAllRanges();sel.addRange(range);}
        document.execCommand("insertHTML",false,`<img src="${b64}" alt="dropped image"/>`);
        refreshExcerpt();
      }catch(err){ console.error(err); }
    }
  };

  /* Tags */
  const addTag = ()=>{
    const t=tagInput.trim().toLowerCase();
    if(t&&!tags.includes(t)) setTags(v=>[...v,t]);
    setTagInput("");
  };

  /* Save */
  const handleSave = (draft=false)=>{
    if(!title.trim()){setMsg({text:"Headline is required.",ok:false});return;}
    const content=editorRef.current?.innerHTML||"";
    if(!content.replace(/<[^>]+>/g,"").trim()){setMsg({text:"Article content is required.",ok:false});return;}
    const id=editing?.id||Date.now();
    const plainText=(editorRef.current?.innerText||"").trim();
    const post={
      id, title:title.trim(), content,
      excerpt:customEx?excerpt:plainText.slice(0,240),
      coverImage:coverImg, image:coverImg||null,
      category:selCats[0]||categories[0], categories:selCats,
      tags, source:"NeriBuzz", author:"NeriBuzz Staff", isBreaking,
      status:draft?"draft":"published",
      timeAgo:"Just now", pubDate:new Date().toISOString(),
      isBlog:true, url:`/blog/${id}`, sourceUrl:`/blog/${id}`,
    };
    setSaved(true);
    setMsg({text:draft?"Saved as draft!":editing?"Article updated!":"Article published!",ok:true});
    setTimeout(()=>onSave(post,!!editing),700);
  };

  /* Toolbar button component */
  const TB = ({cmd,val,label,Icon,title:tt,active,onClick,wide})=>(
    <button title={tt} onClick={onClick||(e=>{e.preventDefault();exec(cmd,val);})}
      className={`nb-tool${active?" nb-tool-active":""}`}
      style={wide?{minWidth:36}:{}}>
      {Icon&&<Icon size={13}/>}{label}
    </button>
  );
  const Sep = ()=><div style={{width:1,height:20,background:C.border,margin:"0 2px",alignSelf:"center"}}/>;

  const inp = { width:"100%", padding:"10px 14px", background:"#060A0F", border:`1px solid ${C.border}`, borderRadius:8, fontSize:14, outline:"none", color:C.white, fontFamily:"inherit" };

  return (
    <>
      {showImgModal && <InsertImageModal editorRef={editorRef} onClose={()=>setImgModal(false)}/>}

      <div style={{ display:"flex", height:"calc(100vh - 58px)", margin:"-28px", overflow:"hidden" }}>

        {/* ── MAIN EDITOR COLUMN ──────────────────────────── */}
        <div style={{ flex:1, overflowY:"auto", background:C.editorBg, minWidth:0, display:"flex", flexDirection:"column" }}>

          {/* Sticky top bar */}
          <div style={{ position:"sticky", top:0, zIndex:10, background:C.editorBg, borderBottom:`1px solid ${C.border}`, padding:"9px 24px", display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
            <button onClick={onCancel} className="nb-btn"
              style={{ display:"flex",alignItems:"center",gap:6,background:"transparent",border:`1px solid ${C.border}`,color:C.textMid,padding:"6px 12px",borderRadius:7,fontSize:12,cursor:"pointer" }}>
              <ArrowLeft size={13}/> Dashboard
            </button>
            <span style={{ fontSize:13, color:C.textMid }}>{editing?"Edit Article":"New Article"}</span>
            {msg.text&&(
              <span style={{ fontSize:12, color:msg.ok?C.green:C.red, display:"flex",alignItems:"center",gap:5 }}>
                {msg.ok?<CheckCircle size={13}/>:<AlertCircle size={13}/>} {msg.text}
              </span>
            )}
            <div style={{flex:1}}/>
            <button onClick={()=>handleSave(true)} className="nb-btn"
              style={{ padding:"6px 14px",border:`1px solid ${C.border}`,borderRadius:7,background:"transparent",color:C.textMid,fontSize:12,cursor:"pointer" }}>
              Save Draft
            </button>
            <button onClick={()=>handleSave(false)} className="nb-btn"
              style={{ padding:"7px 18px",background:C.cyan,border:"none",borderRadius:7,color:"#040507",fontSize:13,fontWeight:700,cursor:"pointer" }}>
              {editing?"Update":"Publish"}
            </button>
          </div>

          {/* Title + permalink */}
          <div style={{ padding:"28px 36px 0" }}>
            <input type="text" value={title} onChange={e=>setTitle(e.target.value)}
              placeholder="Add title"
              style={{ width:"100%",background:"transparent",border:"none",borderBottom:`2px solid ${title?C.border:C.textFaint}`,outline:"none",fontSize:32,fontWeight:900,fontFamily:serif,color:C.white,padding:"0 0 12px",marginBottom:12,transition:"border-color .2s",fontFamily:serif }}
              onFocus={e=>e.target.style.borderColor=C.cyan}
              onBlur={e=>e.target.style.borderColor=title?C.border:C.textFaint}/>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:24,fontSize:12,color:C.textMid }}>
              <span style={{fontWeight:600}}>Permalink:</span>
              <span style={{ color:C.cyan,background:C.cyanGlow,border:`1px solid ${C.cyanBorder}`,padding:"2px 10px",borderRadius:4,fontFamily:"monospace",fontSize:11 }}>
                /blog/<span style={{color:C.white}}>{slug}</span>
              </span>
              {editing&&<a href={`/blog/${editing.id}`} target="_blank" rel="noopener noreferrer" style={{color:C.textMid,display:"flex",alignItems:"center",gap:3,textDecoration:"none",fontSize:11}}><ExternalLink size={11}/> View</a>}
            </div>
          </div>

          {/* Toolbar */}
          <div style={{ padding:"0 36px 0" }}>
            <div style={{ display:"flex",alignItems:"center",flexWrap:"wrap",gap:3,padding:"8px 12px",background:C.nav,border:`1px solid ${C.border}`,borderRadius:"8px 8px 0 0" }}>
              <TB cmd="formatBlock" val="p"  label="¶"  tt="Paragraph"/>
              <TB cmd="formatBlock" val="h2" label="H2" tt="Heading 2" wide/>
              <TB cmd="formatBlock" val="h3" label="H3" tt="Heading 3" wide/>
              <Sep/>
              <TB cmd="bold"          Icon={Bold}         tt="Bold (Ctrl+B)"      active={fmts.bold}/>
              <TB cmd="italic"        Icon={Italic}       tt="Italic (Ctrl+I)"    active={fmts.italic}/>
              <TB cmd="underline"     Icon={Underline}    tt="Underline (Ctrl+U)" active={fmts.underline}/>
              <TB cmd="strikeThrough" Icon={Strikethrough}tt="Strikethrough"      active={fmts.strikeThrough}/>
              <Sep/>
              <TB cmd="insertUnorderedList" Icon={List}        tt="Bullet List"/>
              <TB cmd="insertOrderedList"   Icon={ListOrdered} tt="Numbered List"/>
              <TB cmd="formatBlock" val="blockquote" Icon={Quote} tt="Blockquote"/>
              <TB cmd="insertHorizontalRule" Icon={Minus} tt="Horizontal Rule"/>
              <Sep/>
              <TB onClick={insertLink}     Icon={Link2}     tt="Insert Link (Ctrl+K)"/>
              <TB onClick={()=>setImgModal(true)} Icon={ImageIcon} tt="Insert Image — upload or URL"/>
              <Sep/>
              <TB cmd="removeFormat" Icon={Scissors} tt="Clear Formatting"/>
            </div>

            {/* Image upload hint bar */}
            <div style={{ background:"rgba(34,211,238,.04)", border:`1px solid ${C.border}`, borderTop:"none", padding:"7px 14px", display:"flex", alignItems:"center", gap:8 }}>
              <ImageIcon size={13} style={{color:C.cyanDim,flexShrink:0}}/>
              <span style={{fontSize:11,color:C.textMid}}>
                You can also <strong style={{color:C.text}}>drag & drop</strong> images directly into the editor, or <strong style={{color:C.text}}>paste</strong> screenshots with Ctrl+V
              </span>
            </div>
          </div>

          {/* Content editable */}
          <div style={{ flex:1, padding:"0 36px 40px" }}>
            <div
              ref={editorRef}
              contentEditable suppressContentEditableWarning
              className="nb-editor"
              data-placeholder={"Start writing your article here…\n\nTip: drag & drop or paste images directly. Use the toolbar for formatting. Ctrl+B bold · Ctrl+I italic · Ctrl+K link."}
              onInput={()=>{ checkFmts(); refreshExcerpt(); }}
              onKeyDown={handleKeyDown}
              onMouseUp={checkFmts} onKeyUp={checkFmts}
              onPaste={handlePaste}
              onDrop={handleEditorDrop}
              style={{ padding:"24px", background:C.card, border:`1px solid ${C.border}`, borderTop:"none", borderRadius:"0 0 8px 8px", minHeight:480 }}
            />
            <p style={{ margin:"8px 0 0", fontSize:11, color:C.textFaint }}>
              Ctrl+B bold · Ctrl+I italic · Ctrl+U underline · Ctrl+K link · Ctrl+V paste image
            </p>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ────────────────────────────────── */}
        <div style={{ width:272, flexShrink:0, background:C.sidebarBg, borderLeft:`1px solid ${C.border}`, overflowY:"auto", display:"flex", flexDirection:"column" }}>

          {/* PUBLISH */}
          <SidebarPanel title="Publish" defaultOpen={true}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,fontSize:13 }}>
              <span style={{color:C.textMid}}>Status</span>
              <span style={{ color:C.green,fontWeight:600,fontSize:12 }}>● {editing?"Published":"Draft"}</span>
            </div>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16,fontSize:13 }}>
              <span style={{color:C.textMid}}>Visibility</span>
              <span style={{color:C.text,fontSize:12}}>🌐 Public</span>
            </div>
            <div style={{ borderTop:`1px solid ${C.border}`,paddingTop:12,display:"flex",gap:8,marginBottom:10 }}>
              <button onClick={()=>handleSave(true)} className="nb-btn"
                style={{ flex:1,padding:"8px",border:`1px solid ${C.border}`,borderRadius:7,background:"transparent",color:C.textMid,fontSize:12,cursor:"pointer" }}>
                Save Draft
              </button>
              {editing&&<a href={`/blog/${editing.id}`} target="_blank" rel="noopener noreferrer"
                style={{ flex:1,padding:"8px",border:`1px solid ${C.border}`,borderRadius:7,background:"transparent",color:C.textMid,fontSize:12,cursor:"pointer",textDecoration:"none",textAlign:"center" }}>
                Preview
              </a>}
            </div>
            <button onClick={()=>handleSave(false)} className="nb-btn"
              style={{ width:"100%",padding:"11px",background:saved?C.cyanDim:C.cyan,border:"none",borderRadius:8,color:"#040507",fontSize:14,fontWeight:700,cursor:"pointer" }}>
              {saved?"✓ Saved!":editing?"Update Article":"Publish Article"}
            </button>
          </SidebarPanel>

          {/* FEATURED IMAGE */}
          <FeaturedImagePanel coverImg={coverImg} setCoverImg={setCoverImg}/>

          {/* CATEGORIES */}
          <SidebarPanel title="Categories" defaultOpen={true}>
            <div style={{ maxHeight:180,overflowY:"auto",display:"flex",flexDirection:"column",gap:7 }}>
              {categories.map(cat=>(
                <label key={cat} style={{ display:"flex",alignItems:"center",gap:9,cursor:"pointer",fontSize:13,padding:"2px 0" }}>
                  <input type="checkbox" checked={selCats.includes(cat)}
                    onChange={e=>{ if(e.target.checked)setSelCats(v=>[...v,cat]); else setSelCats(v=>v.filter(c=>c!==cat)); }}/>
                  <span style={{color:C.text}}>{cat}</span>
                </label>
              ))}
            </div>
          </SidebarPanel>

          {/* TAGS */}
          <SidebarPanel title="Tags" defaultOpen={false}>
            {tags.length>0&&(
              <div style={{ display:"flex",flexWrap:"wrap",gap:5,marginBottom:10 }}>
                {tags.map(t=>(
                  <span key={t} style={{ display:"flex",alignItems:"center",gap:4,background:C.cyanGlow,border:`1px solid ${C.cyanBorder}`,color:C.cyan,fontSize:11,padding:"2px 9px",borderRadius:20 }}>
                    {t}
                    <button onClick={()=>setTags(v=>v.filter(x=>x!==t))} style={{background:"transparent",border:"none",color:C.cyanDim,cursor:"pointer",padding:0,display:"flex"}}><X size={10}/></button>
                  </span>
                ))}
              </div>
            )}
            <div style={{display:"flex",gap:6}}>
              <input type="text" value={tagInput} placeholder="Add tag…"
                onChange={e=>setTagInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"||e.key===","){e.preventDefault();addTag();}}}
                style={{ flex:1,padding:"8px 10px",background:"#060A0F",border:`1px solid ${C.border}`,borderRadius:7,fontSize:12,outline:"none",color:C.white,fontFamily:"inherit" }}/>
              <button onClick={addTag} className="nb-btn"
                style={{ padding:"8px 12px",background:C.cyanGlow,border:`1px solid ${C.cyanBorder}`,borderRadius:7,color:C.cyan,fontSize:12,cursor:"pointer" }}>
                Add
              </button>
            </div>
            <p style={{margin:"7px 0 0",fontSize:10,color:C.textMid}}>Separate with comma or Enter</p>
          </SidebarPanel>

          {/* EXCERPT */}
          <SidebarPanel title="Excerpt" defaultOpen={false}>
            <p style={{margin:"0 0 8px",fontSize:11,color:C.textMid,lineHeight:1.5}}>
              {customEx?"Custom excerpt:":"Auto-generated from first paragraph:"}
            </p>
            <textarea value={excerpt} rows={4}
              onChange={e=>{setExcerpt(e.target.value);setCustomEx(true);}}
              placeholder="Write a custom excerpt…"
              style={{...inp,resize:"vertical",fontSize:12,lineHeight:1.6}}/>
            {customEx&&(
              <button onClick={()=>setCustomEx(false)} className="nb-btn"
                style={{marginTop:6,fontSize:11,color:C.cyan,background:"transparent",border:"none",cursor:"pointer",padding:0}}>
                ↺ Reset to auto-generated
              </button>
            )}
          </SidebarPanel>

          {/* ATTRIBUTES */}
          <SidebarPanel title="Post Attributes" defaultOpen={true}>
            <label style={{ display:"flex",alignItems:"flex-start",gap:10,cursor:"pointer" }}>
              <input type="checkbox" checked={isBreaking} onChange={e=>setBrk(e.target.checked)} style={{marginTop:2}}/>
              <div>
                <p style={{margin:0,fontSize:13,fontWeight:600,color:C.white}}>Breaking News</p>
                <p style={{margin:"3px 0 0",fontSize:11,color:C.textMid}}>Adds red badge + includes in live ticker</p>
              </div>
            </label>
          </SidebarPanel>

          <div style={{flex:1,minHeight:32}}/>
        </div>
      </div>
    </>
  );

/* ──────────────────────────────────────────────────────────
   ANALYTICS TAB
   ─────────────────────────────────────────────────────── */
function AnalyticsTab({ analytics, analyticsLoading }) {
  const last7    = analytics?.last7Days  || [];
  const cats     = analytics?.byCategory || {};
  const articles = analytics?.topArticles|| [];
  const maxBar   = Math.max(...last7.map(([,v])=>v), 1);
  const maxCat   = Math.max(...Object.values(cats), 1);
  const p        = { background:C.card, border:`1px solid ${C.border}`, borderRadius:12, padding:"20px 22px", marginBottom:16 };

  const fmtDay = d => { const [,m,dy]=d.split("-"); return `${m}/${dy}`; };

  return (
    <div className="nb-fade">
      <h2 style={{ margin:"0 0 22px", fontSize:21, fontWeight:800, color:C.white, fontFamily:serif }}>Analytics</h2>

      {analyticsLoading ? (
        <div style={{ display:"flex", alignItems:"center", gap:12, color:C.textMid, marginBottom:20 }}>
          <div style={{ width:20, height:20, borderRadius:"50%", border:`3px solid ${C.cyanGlow}`, borderTopColor:C.cyan, animation:"nbspin .8s linear infinite" }}/>
          Loading analytics…
        </div>
      ) : null}

      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))", gap:12, marginBottom:20 }}>
        {[
          { label:"Today",        val: analytics?.todayViews?.toLocaleString() || "0", icon:"👁", col:"#38BDF8" },
          { label:"Total Views",  val:(analytics?.totalViews||0).toLocaleString(),      icon:"📊", col:C.cyan    },
          { label:"Top Category", val:Object.entries(cats).sort(([,a],[,b])=>b-a)[0]?.[0]||"—",icon:"🏆",col:C.green },
          { label:"Top Articles", val:articles.length||"0",                             icon:"📝", col:"#F59E0B" },
        ].map(s=>(
          <div key={s.label} style={{...p,marginBottom:0}}>
            <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontSize:28, fontWeight:900, color:C.white, lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:11, color:C.textMid, marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 7-day bar chart */}
      <div style={p}>
        <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:C.white }}>Last 7 Days</h3>
        {last7.length === 0 ? (
          <p style={{ margin:0, fontSize:13, color:C.textMid }}>No data yet — views accumulate as visitors arrive.</p>
        ) : (
          <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:100 }}>
            {last7.map(([date,views])=>(
              <div key={date} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                <span style={{ fontSize:10, color:C.textMid }}>{views||""}</span>
                <div style={{ width:"100%", background:C.cyan, borderRadius:"4px 4px 0 0", height:`${Math.max((views/maxBar)*88,4)}px`, transition:"height .4s ease", minHeight:4 }}/>
                <span style={{ fontSize:10, color:C.textMid, whiteSpace:"nowrap" }}>{fmtDay(date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Views by category */}
      {Object.keys(cats).length > 0 && (
        <div style={p}>
          <h3 style={{ margin:"0 0 14px", fontSize:14, fontWeight:700, color:C.white }}>Views by Category</h3>
          {Object.entries(cats).sort(([,a],[,b])=>b-a).map(([cat,views])=>(
            <div key={cat} style={{ marginBottom:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                <span style={{ fontSize:13, color:C.text }}>{cat}</span>
                <span style={{ fontSize:12, color:C.textMid }}>{views.toLocaleString()}</span>
              </div>
              <div style={{ height:6, background:C.border, borderRadius:3 }}>
                <div style={{ height:"100%", width:`${(views/maxCat)*100}%`, background:C.cyan, borderRadius:3, transition:"width .4s ease" }}/>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Top articles */}
      {articles.length > 0 && (
        <div style={p}>
          <h3 style={{ margin:"0 0 14px", fontSize:14, fontWeight:700, color:C.white }}>Top Articles</h3>
          {articles.map((a,i)=>(
            <div key={a.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 0", borderBottom:i<articles.length-1?`1px solid ${C.border}`:"none" }}>
              <span style={{ fontSize:16, fontWeight:900, color:C.cyanDim, width:20, flexShrink:0 }}>{i+1}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontSize:13, color:C.white, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.title||`Article ${a.id}`}</p>
              </div>
              <span style={{ fontSize:12, color:C.cyan, fontWeight:700, flexShrink:0 }}>{a.views} views</span>
            </div>
          ))}
        </div>
      )}

      {/* Vercel Analytics note */}
      <div style={{ background:"rgba(34,211,238,.04)", border:`1px solid ${C.cyanBorder}`, borderRadius:12, padding:18 }}>
        <p style={{ margin:0, fontSize:13, color:C.textMid, lineHeight:1.6 }}>
          📈 <strong style={{ color:C.text }}>View counts reset on server restart.</strong> For persistent, real-time analytics,{" "}
          <a href="https://vercel.com/analytics" target="_blank" rel="noopener noreferrer" style={{ color:C.cyan }}>
            enable Vercel Analytics
          </a>{" "}
          in your dashboard — it's free, privacy-friendly, and gives you real visitor graphs.
        </p>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   NEWS MANAGEMENT TAB  — see, search, and hide RSS stories
   ─────────────────────────────────────────────────────── */
function NewsManageTab({ news, hidden, onToggle }) {
  const [search,   setSearch]  = useState("");
  const [filterCat,setFilter]  = useState("All");
  const [showHide, setShowHide]= useState(false);

  const cats = ["All", ...new Set(news.map(n=>n.category))].filter(Boolean);

  const items = news.filter(n=>{
    const isHid = hidden.includes(n.id);
    if(showHide  && !isHid) return false;
    if(!showHide &&  isHid) return false;
    if(filterCat !== "All" && n.category !== filterCat) return false;
    if(search && !n.title.toLowerCase().includes(search.toLowerCase()) &&
       !n.source.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const p = { background:C.card, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 18px", marginBottom:10 };

  return (
    <div className="nb-fade">
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22, flexWrap:"wrap", gap:12 }}>
        <h2 style={{ margin:0, fontSize:21, fontWeight:800, color:C.white, fontFamily:serif }}>News Feed</h2>
        <button onClick={()=>setShowHide(!showHide)} className="nb-btn"
          style={{ padding:"8px 16px", border:`1px solid ${showHide?"rgba(239,68,68,.3)":C.border}`, borderRadius:8, background:"transparent", color:showHide?C.red:C.textMid, fontSize:13, cursor:"pointer" }}>
          {showHide ? `← Show Active` : `👁 Hidden (${hidden.length})`}
        </button>
      </div>

      {/* Search */}
      <div style={{ position:"relative", marginBottom:14 }}>
        <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
          placeholder="Search by title or source…"
          style={{ width:"100%", padding:"10px 14px", background:"#060A0F", border:`1px solid ${C.border}`, borderRadius:8, fontSize:14, outline:"none", color:C.white, fontFamily:"inherit" }}/>
        {search&&<button onClick={()=>setSearch("")} style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", color:C.textMid, cursor:"pointer", padding:0, display:"flex" }}><X size={16}/></button>}
      </div>

      {/* Category tabs */}
      <div style={{ display:"flex", gap:6, overflowX:"auto", marginBottom:18, scrollbarWidth:"none", paddingBottom:2 }}>
        {cats.map(cat=>(
          <button key={cat} onClick={()=>setFilter(cat)} className="nb-btn"
            style={{ padding:"6px 14px", border:`1px solid ${filterCat===cat?C.cyanBorder:C.border}`, borderRadius:20, background:filterCat===cat?C.cyanGlow:"transparent", color:filterCat===cat?C.cyan:C.textMid, fontSize:12, fontWeight:filterCat===cat?700:500, cursor:"pointer", whiteSpace:"nowrap" }}>
            {cat}
          </button>
        ))}
      </div>

      <p style={{ margin:"0 0 16px", fontSize:12, color:C.textMid }}>
        {items.length} {showHide?"hidden":"active"} stories{search?` matching "${search}"`:""}
        {!showHide&&" · Hidden stories won't appear on the public site"}
      </p>

      {items.length===0 ? (
        <div style={{...p, textAlign:"center", padding:"40px", color:C.textMid}}>
          {search ? `No stories matching "${search}"` : showHide ? "No hidden stories." : "No stories loaded yet — refresh feeds."}
        </div>
      ) : items.map(story=>(
        <div key={story.id} style={p}>
          <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:14 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", gap:8, marginBottom:6, flexWrap:"wrap" }}>
                <span style={{ background:SRC_COLORS[story.source]||"#334155", color:"#fff", fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:4, letterSpacing:.6, textTransform:"uppercase" }}>{story.source}</span>
                <span style={{ fontSize:11, color:C.textMid }}>{story.category}</span>
                <span style={{ fontSize:11, color:C.textMid }}>· {story.timeAgo}</span>
                {story.isBreaking&&<span style={{ fontSize:10, fontWeight:700, color:C.red, border:"1px solid rgba(239,68,68,.3)", padding:"1px 5px", borderRadius:3 }}>BREAKING</span>}
              </div>
              <p style={{ margin:"0 0 6px", fontSize:14, fontWeight:600, color:C.white, lineHeight:1.4 }}>{story.title}</p>
              <a href={story.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:C.cyanDim, textDecoration:"none" }}>
                View original →
              </a>
            </div>
            <button onClick={()=>onToggle(story.id)} className="nb-btn"
              style={{ padding:"7px 14px", border:`1px solid ${hidden.includes(story.id)?"rgba(52,211,153,.3)":"rgba(239,68,68,.3)"}`, borderRadius:7, background:hidden.includes(story.id)?"rgba(52,211,153,.08)":"rgba(239,68,68,.06)", color:hidden.includes(story.id)?C.green:C.red, fontSize:12, cursor:"pointer", flexShrink:0, fontWeight:600 }}>
              {hidden.includes(story.id) ? "Unhide" : "Hide"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function DashboardTab({ posts, feedLog, news, loading, lastRefresh, onRefresh, onEdit, onDelete, onWrite }) {
  const [del,setDel]=useState(null);
  const cfm=id=>{ if(del===id){onDelete(id);setDel(null);}else{setDel(id);setTimeout(()=>setDel(null),3000);} };
  const p={background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"18px 22px",marginBottom:16};
  return (
    <div className="nb-fade">
      <h2 style={{margin:"0 0 22px",fontSize:21,fontWeight:800,color:C.white,fontFamily:serif}}>Dashboard</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(165px,1fr))",gap:12,marginBottom:20}}>
        {[
          {label:"Live Stories",val:news.length,                     Icon:Globe,   col:"#38BDF8"},
          {label:"Blog Posts",  val:posts.length,                    Icon:FileText,col:C.cyan   },
          {label:"Feeds Online",val:feedLog.filter(f=>f.ok).length, Icon:Wifi,    col:C.green  },
          {label:"Feeds Failed",val:feedLog.filter(f=>!f.ok).length,Icon:WifiOff, col:C.red    },
        ].map(s=>(
          <div key={s.label} style={{...p,marginBottom:0}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:11,color:C.textMid,fontWeight:600}}>{s.label}</span>
              <div style={{width:30,height:30,borderRadius:7,background:s.col+"18",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <s.Icon size={14} color={s.col}/>
              </div>
            </div>
            <div style={{fontSize:34,fontWeight:900,color:C.white}}>{s.val}</div>
          </div>
        ))}
      </div>
      <div style={{...p,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:14}}>
        <div>
          <p style={{margin:0,fontSize:14,fontWeight:700,color:C.white}}>RSS Feed Status</p>
          <p style={{margin:"4px 0 0",fontSize:12,color:C.textMid}}>Last refreshed: {lastRefresh.toLocaleTimeString()} · Auto-refreshes hourly</p>
        </div>
        <button onClick={onRefresh} disabled={loading} className="nb-btn"
          style={{display:"flex",alignItems:"center",gap:8,background:C.cyan,border:"none",color:"#040507",padding:"10px 20px",borderRadius:9,fontSize:13,fontWeight:700,cursor:loading?"not-allowed":"pointer",opacity:loading?.75:1}}>
          <RefreshCw size={13} style={{animation:loading?"nbspin .8s linear infinite":"none"}}/> Refresh Now
        </button>
      </div>
      {feedLog.length>0&&(
        <div style={p}>
          <h3 style={{margin:"0 0 12px",fontSize:13,fontWeight:700,color:C.white}}>Feed Log ({feedLog.filter(f=>f.ok).length}/{feedLog.length} online)</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(185px,1fr))",gap:2}}>
            {feedLog.map(f=>(
              <div key={f.source} style={{display:"flex",alignItems:"center",gap:8,fontSize:11,padding:"6px 4px",borderBottom:`1px solid ${C.border}`}}>
                {f.ok?<CheckCircle size={12} color={C.green} style={{flexShrink:0}}/>:<AlertCircle size={12} color={C.red} style={{flexShrink:0}}/>}
                <span style={{color:f.ok?C.text:C.textMid}}>{f.source}</span>
                <span style={{color:C.textMid,marginLeft:"auto"}}>{f.ok?f.count:"–"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{...p,background:"rgba(34,211,238,.04)",borderColor:C.cyanBorder,display:"flex",alignItems:"center",justifyContent:"space-between",gap:14}}>
        <div>
          <p style={{margin:0,fontSize:14,fontWeight:700,color:C.white}}>Write a News Article</p>
          <p style={{margin:"4px 0 0",fontSize:12,color:C.textMid}}>Publish your own stories to NeriBuzz</p>
        </div>
        <button onClick={onWrite} className="nb-btn"
          style={{display:"flex",alignItems:"center",gap:7,background:C.cyan,border:"none",color:"#040507",padding:"10px 22px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer"}}>
          <Plus size={14}/> Write Article
        </button>
      </div>
      {posts.length>0&&(
        <div>
          <h3 style={{margin:"0 0 12px",fontSize:13,fontWeight:700,color:C.white}}>Recent Articles</h3>
          {posts.slice(0,5).map(pp=>(
            <div key={pp.id} style={{...p,display:"flex",alignItems:"center",justifyContent:"space-between",gap:14}}>
              <div style={{flex:1,minWidth:0,display:"flex",gap:12}}>
                {pp.coverImage&&<div style={{width:54,height:54,borderRadius:7,overflow:"hidden",flexShrink:0}}><img src={pp.coverImage} alt="" referrerPolicy="no-referrer" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.parentElement.style.display="none"}/></div>}
                <div style={{flex:1,minWidth:0}}>
                  <p style={{margin:"0 0 3px",fontSize:13,fontWeight:600,color:C.white,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{pp.title}</p>
                  <span style={{fontSize:11,color:C.textMid}}>{pp.category} · {pp.timeAgo}</span>
                </div>
              </div>
              <div style={{display:"flex",gap:8,flexShrink:0}}>
                <button onClick={()=>onEdit(pp)} style={{padding:"5px 11px",border:`1px solid ${C.border}`,borderRadius:6,background:"transparent",cursor:"pointer",color:C.textMid,fontSize:12}}>Edit</button>
                <button onClick={()=>cfm(pp.id)} style={{padding:"5px 11px",border:"1px solid rgba(239,68,68,.3)",borderRadius:6,background:del===pp.id?"rgba(239,68,68,.15)":"transparent",cursor:"pointer",color:C.red,fontSize:12,fontWeight:del===pp.id?700:400}}>
                  {del===pp.id?"Confirm?":"Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PostsTab({ posts, onEdit, onDelete, onWrite }) {
  const [del,setDel]=useState(null);
  const cfm=id=>{ if(del===id){onDelete(id);setDel(null);}else{setDel(id);setTimeout(()=>setDel(null),3000);} };
  const p={background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 20px",marginBottom:12};
  return (
    <div className="nb-fade">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}>
        <h2 style={{margin:0,fontSize:21,fontWeight:800,color:C.white,fontFamily:serif}}>All Articles</h2>
        <button onClick={onWrite} className="nb-btn" style={{display:"flex",alignItems:"center",gap:6,background:C.cyan,border:"none",color:"#040507",padding:"9px 20px",borderRadius:8,fontSize:13,fontWeight:700,cursor:"pointer"}}>
          <Plus size={14}/> New Article
        </button>
      </div>
      {posts.length===0?(
        <div style={{...p,textAlign:"center",padding:"70px 20px",color:C.textMid}}>
          <FileText size={48} style={{marginBottom:16,opacity:.3}}/>
          <p style={{margin:"0 0 20px",fontSize:15}}>No articles yet.</p>
          <button onClick={onWrite} className="nb-btn" style={{background:C.cyan,border:"none",color:"#040507",padding:"11px 24px",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:14}}>Write First Article</button>
        </div>
      ):posts.map(pp=>(
        <div key={pp.id} style={p}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
            <div style={{flex:1,minWidth:0,display:"flex",gap:14}}>
              {pp.coverImage&&<div style={{width:80,height:80,borderRadius:8,overflow:"hidden",flexShrink:0}}><img src={pp.coverImage} alt="" referrerPolicy="no-referrer" style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>e.target.parentElement.style.display="none"}/></div>}
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",gap:8,marginBottom:6,flexWrap:"wrap"}}>
                  <span style={{background:C.cyanGlow,border:`1px solid ${C.cyanBorder}`,color:C.cyan,fontSize:10,fontWeight:800,padding:"2px 8px",borderRadius:4}}>BLOG</span>
                  <span style={{fontSize:12,color:C.textMid}}>{pp.category} · {pp.timeAgo}</span>
                  {pp.isBreaking&&<span style={{fontSize:10,fontWeight:700,color:C.red,border:"1px solid rgba(239,68,68,.3)",padding:"1px 6px",borderRadius:3}}>BREAKING</span>}
                  {pp.status==="draft"&&<span style={{fontSize:10,color:C.textMid,border:`1px solid ${C.border}`,padding:"1px 6px",borderRadius:3}}>DRAFT</span>}
                </div>
                <h3 style={{margin:"0 0 5px",fontSize:15,fontWeight:700,color:C.white}}>{pp.title}</h3>
                <p style={{margin:"0 0 6px",fontSize:12,color:C.text,lineHeight:1.5}}>{pp.excerpt?.slice(0,100)}…</p>
                <a href={pp.url||`/blog/${pp.id}`} target="_blank" rel="noopener noreferrer" style={{fontSize:11,color:C.cyan,textDecoration:"none"}}>View article →</a>
              </div>
            </div>
            <div style={{display:"flex",gap:8,flexShrink:0}}>
              <button onClick={()=>onEdit(pp)} className="nb-btn" style={{display:"flex",alignItems:"center",gap:5,padding:"7px 13px",border:`1px solid ${C.border}`,borderRadius:7,background:"transparent",cursor:"pointer",color:C.textMid,fontSize:12}}>
                <Edit3 size={12}/> Edit
              </button>
              <button onClick={()=>cfm(pp.id)} className="nb-btn" style={{display:"flex",alignItems:"center",gap:5,padding:"7px 13px",border:"1px solid rgba(239,68,68,.3)",borderRadius:7,background:del===pp.id?"rgba(239,68,68,.15)":"transparent",cursor:"pointer",color:C.red,fontSize:12,fontWeight:del===pp.id?700:400}}>
                <Trash2 size={12}/> {del===pp.id?"Confirm?":"Delete"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoriesTab({ categories, news, onAdd, onRemove }) {
  const [ncat,setNcat]=useState(""); const [msg,setMsg]=useState("");
  const p={background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:"20px 22px",marginBottom:16};
  const add=()=>{ const c=ncat.trim(); if(!c)return; if(categories.includes(c)){setMsg("Already exists.");return;} onAdd(c);setNcat("");setMsg(`"${c}" added!`);setTimeout(()=>setMsg(""),3000); };
  return (
    <div className="nb-fade" style={{maxWidth:560}}>
      <h2 style={{margin:"0 0 22px",fontSize:21,fontWeight:800,color:C.white,fontFamily:serif}}>Categories</h2>
      {msg&&<div style={{background:"rgba(52,211,153,.1)",border:"1px solid rgba(52,211,153,.3)",borderRadius:8,padding:"10px 16px",marginBottom:16,fontSize:13,color:C.green}}>✓ {msg}</div>}
      <div style={p}>
        <h3 style={{margin:"0 0 12px",fontSize:13,fontWeight:700,color:C.white}}>Add Category</h3>
        <div style={{display:"flex",gap:10}}>
          <input type="text" value={ncat} placeholder="e.g. Opinion, Diaspora…" onChange={e=>setNcat(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}
            style={{flex:1,padding:"11px 14px",background:"#060A0F",border:`1px solid ${C.border}`,borderRadius:8,fontSize:14,outline:"none",color:C.white,fontFamily:"inherit"}}/>
          <button onClick={add} className="nb-btn" style={{padding:"11px 22px",background:C.cyan,border:"none",borderRadius:8,color:"#040507",fontWeight:700,fontSize:14,cursor:"pointer"}}>Add</button>
        </div>
      </div>
      <div style={p}>
        <h3 style={{margin:"0 0 14px",fontSize:13,fontWeight:700,color:C.white}}>Active Categories ({categories.length})</h3>
        {categories.map((cat,i)=>(
          <div key={cat} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 0",borderBottom:i<categories.length-1?`1px solid ${C.border}`:"none"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <Tag size={13} color={C.cyan}/>
              <span style={{fontSize:14,fontWeight:600,color:C.white}}>{cat}</span>
              <span style={{fontSize:12,color:C.textMid}}>{news.filter(n=>n.category===cat).length} stories</span>
            </div>
            <button onClick={()=>onRemove(cat)} className="nb-btn" style={{display:"flex",alignItems:"center",gap:4,padding:"5px 11px",border:"1px solid rgba(239,68,68,.25)",borderRadius:6,background:"transparent",cursor:"pointer",color:C.red,fontSize:12}}>
              <Trash2 size={11}/> Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   MAIN AdminPanel
   ─────────────────────────────────────────────────────── */
function Loader({ text="Loading…" }) {
  return (
    <div style={{minHeight:"100vh",background:C.page,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:22}}>
      <div style={{fontSize:30,fontFamily:serif,fontWeight:900}}><span style={{color:C.white}}>Neri</span><span style={{color:C.cyan}}>Buzz</span></div>
      <div style={{width:44,height:44,borderRadius:"50%",border:`3px solid ${C.cyanGlow}`,borderTopColor:C.cyan,animation:"nbspin .8s linear infinite"}}/>
      <p style={{color:C.textMid,fontSize:13,margin:0}}>{text}</p>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [user,setUser]=useState(""); const [pass,setPass]=useState(""); const [show,setShow]=useState(false);
  const [err,setErr]=useState(""); const [busy,setBusy]=useState(false);
  const attempt=()=>{
    setBusy(true);setErr("");
    const pwd=(typeof process!=="undefined"&&process.env?.NEXT_PUBLIC_ADMIN_PASSWORD)||"neribuzz2025";
    setTimeout(()=>{ if(user==="admin"&&pass===pwd){lsSet("nb_admin_auth",{time:Date.now()});onLogin();}else{setErr("Invalid username or password.");setBusy(false);} },700);
  };
  const inp={width:"100%",padding:"11px 14px",background:"#070B10",border:`1px solid ${C.border}`,borderRadius:8,fontSize:14,outline:"none",color:C.white,fontFamily:"inherit"};
  return (
    <div style={{minHeight:"100vh",background:C.page,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:18,padding:"44px 40px",width:"100%",maxWidth:420,boxShadow:"0 32px 80px rgba(0,0,0,.6)"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{width:58,height:58,background:C.cyanGlow,border:`1px solid ${C.cyanBorder}`,borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px"}}><Shield size={28} color={C.cyan}/></div>
          <div style={{fontSize:24,fontFamily:serif,fontWeight:900,marginBottom:6}}><span style={{color:C.white}}>Neri</span><span style={{color:C.cyan}}>Buzz</span></div>
          <p style={{margin:0,fontSize:13,color:C.textMid}}>Admin Control Panel</p>
        </div>
        {err&&<div style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",borderRadius:8,padding:"10px 14px",marginBottom:18,fontSize:13,color:C.red,display:"flex",alignItems:"center",gap:8}}><AlertCircle size={14}/>{err}</div>}
        <div style={{marginBottom:16}}>
          <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:7,letterSpacing:.8,textTransform:"uppercase"}}>Username</label>
          <input type="text" value={user} placeholder="admin" autoComplete="username" onChange={e=>setUser(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} style={inp}/>
        </div>
        <div style={{marginBottom:28}}>
          <label style={{fontSize:11,fontWeight:700,color:C.textMid,display:"block",marginBottom:7,letterSpacing:.8,textTransform:"uppercase"}}>Password</label>
          <div style={{position:"relative"}}>
            <input type={show?"text":"password"} value={pass} placeholder="••••••••••" autoComplete="current-password" onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} style={{...inp,paddingRight:44}}/>
            <button onClick={()=>setShow(!show)} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",color:C.textMid,cursor:"pointer",padding:0,display:"flex"}}>
              {show?<EyeOff size={16}/>:<Eye size={16}/>}
            </button>
          </div>
        </div>
        <button onClick={attempt} disabled={busy} style={{width:"100%",padding:14,background:busy?C.cyanDim:C.cyan,border:"none",borderRadius:9,color:"#040507",fontSize:15,fontWeight:700,cursor:busy?"not-allowed":"pointer"}}>{busy?"Verifying…":"Sign In"}</button>
        <a href="/" style={{display:"block",textAlign:"center",marginTop:14,color:C.textMid,fontSize:13,textDecoration:"none"}}>← Back to NeriBuzz</a>
        <p style={{textAlign:"center",fontSize:11,color:C.textFaint,margin:"20px 0 0"}}>admin / neribuzz2025 · change via Vercel env var</p>
      </div>
    </div>
  );
}

export default function AdminPanel() {
  const [authed,  setAuthed]  = useState(false);
  const [initDone,setInit]    = useState(false);
  const [tab,     setTab]     = useState("dashboard");
  const [writing, setWriting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRefresh,setLR]   = useState(new Date());
  const [news,    setNews]    = useState([]);
  const [feedLog, setFeedLog] = useState([]);
  const [posts, setPosts] = useState([]);
  const [cats,  setCats]  = useState(DEF_CATS);

  useEffect(()=>{
    const auth=lsGet("nb_admin_auth",null);
    if(auth&&Date.now()-auth.time<8*3600000) setAuthed(true);
    setPosts(lsGet("nb_posts",[])); setCats(lsGet("nb_cats",DEF_CATS)); setInit(true);
  },[]);

  useEffect(()=>lsSet("nb_posts",posts),[posts]);
  useEffect(()=>lsSet("nb_cats",cats),[cats]);

  const loadNews=useCallback(async()=>{
    setLoading(true);
    try{const r=await fetch("/api/news");if(!r.ok)throw new Error();const{news:n,feedLog:l}=await r.json();setNews(n||[]);setFeedLog(l||[]);setLR(new Date());}
    catch(e){console.error(e);}finally{setLoading(false);}
  },[]);

  useEffect(()=>{ if(authed) loadNews(); },[authed,loadNews]);
  const logout=()=>{ lsSet("nb_admin_auth",null); setAuthed(false); };
  const savePost=(post,isEdit)=>{ if(isEdit)setPosts(v=>v.map(p=>p.id===post.id?post:p));else setPosts(v=>[post,...v]); setWriting(null);setTab("posts"); };

  if(!initDone) return <><style>{STYLES}</style><Loader text="Starting…"/></>;
  if(!authed)   return <><style>{STYLES}</style><LoginScreen onLogin={()=>setAuthed(true)}/></>;

  const TABS=[{id:"dashboard",label:"Dashboard",Icon:BarChart2},{id:"posts",label:"Articles",Icon:FileText},{id:"write",label:"Write",Icon:Plus},{id:"categories",label:"Categories",Icon:Tag}];
  const showWrite=writing!==null;

  return (
    <>
      <style>{STYLES}</style>
      <div style={{minHeight:"100vh",background:C.page,display:"flex",flexDirection:"column"}}>
        {/* Topbar */}
        <div style={{background:C.nav,borderBottom:`1px solid ${C.navBorder}`,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:58,flexShrink:0,zIndex:20,position:"relative"}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{fontSize:19,fontFamily:serif,fontWeight:900}}><span style={{color:C.white}}>Neri</span><span style={{color:C.cyan}}>Buzz</span></div>
            <span style={{background:C.cyanGlow,border:`1px solid ${C.cyanBorder}`,color:C.cyan,fontSize:10,padding:"3px 10px",borderRadius:4,fontWeight:700,letterSpacing:1}}>ADMIN</span>
            {!showWrite&&TABS.map(t=>(
              <button key={t.id} className="nb-btn"
                onClick={()=>{ if(t.id==="write"){setWriting("new");setTab("write");}else{setWriting(null);setTab(t.id);} }}
                style={{display:"flex",alignItems:"center",gap:7,padding:"7px 14px",background:"transparent",border:"none",
                  color:tab===t.id&&!showWrite?C.cyan:C.textMid,
                  borderBottom:tab===t.id&&!showWrite?`2px solid ${C.cyan}`:"2px solid transparent",
                  fontSize:13,fontWeight:tab===t.id?600:400,cursor:"pointer",height:58}}>
                <t.Icon size={14}/> {t.label}
              </button>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <a href="/" className="nb-btn" style={{display:"flex",alignItems:"center",gap:6,background:"transparent",border:`1px solid ${C.border}`,color:C.textMid,padding:"7px 14px",borderRadius:8,fontSize:12,textDecoration:"none"}}>← Live Site</a>
            <button onClick={loadNews} disabled={loading} className="nb-btn"
              style={{display:"flex",alignItems:"center",gap:6,background:C.cyanGlow,border:`1px solid ${C.cyanBorder}`,color:C.cyan,padding:"7px 14px",borderRadius:8,fontSize:12,cursor:loading?"not-allowed":"pointer",opacity:loading?.7:1}}>
              <RefreshCw size={13} style={{animation:loading?"nbspin .8s linear infinite":"none"}}/>{loading?"Loading…":"Refresh"}
            </button>
            <button onClick={logout} className="nb-btn"
              style={{display:"flex",alignItems:"center",gap:6,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.25)",color:C.red,padding:"7px 14px",borderRadius:8,fontSize:12,cursor:"pointer"}}>
              <LogOut size={13}/> Sign Out
            </button>
          </div>
        </div>
        {/* Body */}
        <div style={{flex:1,overflow:"hidden",display:"flex"}}>
          {showWrite ? (
            <WriteArticle editing={writing!=="new"?writing:null} categories={cats} onSave={savePost} onCancel={()=>{setWriting(null);setTab("posts");}}/>
          ) : (
            <div style={{flex:1,padding:"28px",overflowY:"auto"}}>
              {tab==="dashboard"&&<DashboardTab posts={posts} feedLog={feedLog} news={news} loading={loading} lastRefresh={lastRefresh} onRefresh={loadNews} onEdit={pp=>{setWriting(pp);setTab("write");}} onDelete={id=>setPosts(v=>v.filter(p=>p.id!==id))} onWrite={()=>{setWriting("new");setTab("write");}}/>}
              {tab==="posts"&&<PostsTab posts={posts} onEdit={pp=>{setWriting(pp);setTab("write");}} onDelete={id=>setPosts(v=>v.filter(p=>p.id!==id))} onWrite={()=>{setWriting("new");setTab("write");}}/>}
              {tab==="categories"&&<CategoriesTab categories={cats} news={news} onAdd={c=>setCats(v=>[...v,c])} onRemove={c=>setCats(v=>v.filter(x=>x!==c))}/>}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   ANALYTICS TAB  (appended to AdminPanel.jsx exports above)
   These replace the export in the existing file — see README.
   ══════════════════════════════════════════════════════════ */
