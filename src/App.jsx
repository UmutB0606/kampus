import { useState, useEffect, useRef } from "react"
import { supabase } from "./supabase"

const CAT = {
  ev:   { label:"Ev & Arkadaş", emoji:"🏠", color:"#6366f1" },
  esya: { label:"Eşya",         emoji:"🪑", color:"#8b5cf6" },
  staj: { label:"Staj",         emoji:"💼", color:"#06b6d4" },
  ders: { label:"Ders",         emoji:"📚", color:"#10b981" },
}

function ago(ts) {
  const d = Date.now() - new Date(ts).getTime()
  if (d < 3600000)  return `${Math.floor(d/60000)} dk önce`
  if (d < 86400000) return `${Math.floor(d/3600000)} saat önce`
  return `${Math.floor(d/86400000)} gün önce`
}

const validBilkent = e => e.endsWith("@bilkent.edu.tr") || e.endsWith("@ug.bilkent.edu.tr")

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Sora:wght@400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#f5f4f0;color:#1a1a2e;font-family:'Plus Jakarta Sans',sans-serif;}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:#d1d5db;border-radius:4px}
.layout{display:flex;min-height:100vh;}
.sidebar{width:240px;background:#fff;border-right:1px solid #e8e6e0;position:fixed;top:0;left:0;height:100vh;display:flex;flex-direction:column;z-index:40;padding:24px 16px;}
.main-content{margin-left:240px;flex:1;min-height:100vh;}
.page{max-width:680px;margin:0 auto;padding:32px 24px 100px;}
.logo-area{display:flex;align-items:center;gap:10px;margin-bottom:32px;padding:0 8px;}
.logo-icon{width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;font-weight:700;font-size:16px;color:#fff;}
.logo-text{font-family:'Sora',sans-serif;font-weight:700;font-size:18px;color:#1a1a2e;}
.logo-sub{font-size:10px;color:#9ca3af;letter-spacing:1px;}
.nav-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;cursor:pointer;transition:all .2s;color:#6b7280;font-size:14px;font-weight:500;border:none;background:none;width:100%;text-align:left;}
.nav-item:hover{background:#f5f4f0;color:#1a1a2e;}
.nav-item.active{background:linear-gradient(135deg,#ede9fe,#ddd6fe);color:#6366f1;font-weight:600;}
.nav-icon{font-size:18px;width:24px;text-align:center;}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid #e8e6e0;z-index:40;padding:8px 0 20px;}
.bottom-nav-inner{display:flex;justify-content:space-around;}
.bnav-item{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 16px;cursor:pointer;color:#9ca3af;font-size:10px;font-weight:500;border:none;background:none;}
.bnav-item.active{color:#6366f1;}
.bnav-icon{font-size:20px;}
.card{background:#fff;border:1px solid #e8e6e0;border-radius:16px;padding:20px;transition:all .2s;}
.card:hover{border-color:#c4b5fd;box-shadow:0 4px 20px rgba(99,102,241,.08);transform:translateY(-1px);}
.pbtn{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:12px;padding:13px 24px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:14px;cursor:pointer;width:100%;}
.pbtn:disabled{opacity:.4;cursor:not-allowed;}
.gbtn{background:#fff;border:1px solid #e8e6e0;border-radius:12px;padding:13px 24px;color:#6b7280;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;width:100%;}
.gbtn:hover{border-color:#c4b5fd;color:#6366f1;}
.sbtn{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:100px;padding:8px 20px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;}
.inp{background:#f9f8f6;border:1px solid #e8e6e0;border-radius:12px;padding:12px 16px;color:#1a1a2e;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;width:100%;outline:none;transition:border .2s;}
.inp:focus{border-color:#6366f1;background:#fff;}
.inp::placeholder{color:#9ca3af;}
.sel{background:#f9f8f6;border:1px solid #e8e6e0;border-radius:12px;padding:12px 16px;color:#1a1a2e;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;width:100%;outline:none;cursor:pointer;}
.lbl{font-size:11px;color:#9ca3af;letter-spacing:.8px;font-weight:600;margin-bottom:6px;}
.bdg{display:inline-block;padding:4px 10px;border-radius:100px;font-size:11px;font-weight:600;}
.ovl{position:fixed;inset:0;background:rgba(26,26,46,.4);backdrop-filter:blur(8px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;}
.mdl{background:#fff;border-radius:24px;padding:32px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(26,26,46,.15);}
.tab{background:none;border:none;padding:10px 0;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:#9ca3af;border-bottom:2px solid transparent;white-space:nowrap;font-weight:500;}
.tab.on{color:#6366f1;border-bottom-color:#6366f1;font-weight:600;}
.catbtn{background:#fff;border:1px solid #e8e6e0;border-radius:100px;padding:7px 16px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:#6b7280;transition:all .2s;display:flex;align-items:center;gap:6px;white-space:nowrap;}
.catbtn:hover{border-color:#c4b5fd;color:#6366f1;}
.catbtn.on{background:linear-gradient(135deg,#ede9fe,#ddd6fe);border-color:#c4b5fd;color:#6366f1;font-weight:600;}
.likebtn{background:none;border:1px solid #e8e6e0;border-radius:100px;padding:5px 12px;cursor:pointer;font-size:12px;color:#9ca3af;transition:all .2s;display:flex;align-items:center;gap:5px;font-family:'Plus Jakarta Sans',sans-serif;}
.likebtn.on{border-color:#6366f1;color:#6366f1;background:#ede9fe;}
.srch{background:#fff;border:1px solid #e8e6e0;border-radius:100px;padding:10px 20px 10px 44px;color:#1a1a2e;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;width:100%;outline:none;transition:border .2s;}
.srch:focus{border-color:#6366f1;}
.srch::placeholder{color:#9ca3af;}
.err{color:#ef4444;font-size:12px;background:#fef2f2;padding:10px 14px;border-radius:10px;border:1px solid #fecaca;}
.ok{color:#059669;font-size:13px;background:#f0fdf4;padding:12px 14px;border-radius:10px;border:1px solid #bbf7d0;line-height:1.5;}
.avatar{border-radius:50%;object-fit:cover;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex-shrink:0;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fadeUp .3s ease forwards;}
@keyframes spin{to{transform:rotate(360deg)}}
.sp{animation:spin .8s linear infinite;display:inline-block;}
@media(max-width:768px){
  .sidebar{display:none;}
  .main-content{margin-left:0;}
  .bottom-nav{display:block;}
  .page{padding:20px 16px 100px;}
}
`

function Avatar({ name, src, size=36 }) {
  if (src) return <img src={src} alt={name} className="avatar" style={{width:size,height:size}}/>
  return <div className="avatar" style={{width:size,height:size,fontSize:size*.35}}>{name?.[0]?.toUpperCase()||"?"}</div>
}

function Auth({ onLogin }) {
  const [tab,setTab]=useState("login")
  const [name,setName]=useState("")
  const [email,setEmail]=useState("")
  const [pass,setPass]=useState("")
  const [err,setErr]=useState("")
  const [ok,setOk]=useState("")
  const [busy,setBusy]=useState(false)

  async function register() {
    setErr("");setOk("")
    if(!name.trim()) return setErr("İsim giriniz.")
    if(!validBilkent(email)) return setErr("Sadece @bilkent.edu.tr uzantılı e-posta kabul edilir.")
    if(pass.length<6) return setErr("Şifre en az 6 karakter olmalı.")
    setBusy(true)
    const {error}=await supabase.auth.signUp({email,password:pass,options:{data:{name}}})
    setBusy(false)
    if(error) return setErr(error.message)
    setOk("✅ Doğrulama e-postası gönderildi! Bilkent e-postanı kontrol et ve linke tıkla, sonra giriş yap.")
  }

  async function login() {
    setErr("");setOk("")
    if(!validBilkent(email)) return setErr("Sadece @bilkent.edu.tr uzantılı e-posta kabul edilir.")
    setBusy(true)
    const {data,error}=await supabase.auth.signInWithPassword({email,password:pass})
    setBusy(false)
    if(error) return setErr(error.message==="Invalid login credentials"?"E-posta veya şifre hatalı.":error.message)
    const {data:profile}=await supabase.from("profiles").select("*").eq("id",data.user.id).single()
    if(!profile) await supabase.from("profiles").insert({id:data.user.id,name:data.user.user_metadata?.name||email.split("@")[0],email})
    onLogin({id:data.user.id,name:profile?.name||data.user.user_metadata?.name||email.split("@")[0],email,avatar:profile?.avatar_url||null})
  }

  async function resetPassword() {
    setErr("");setOk("")
    if(!validBilkent(email)) return setErr("Önce e-posta adresini yaz.")
    setBusy(true)
    await supabase.auth.resetPasswordForEmail(email,{redirectTo:"https://kampus-gold.vercel.app"})
    setBusy(false)
    setOk("✅ Şifre sıfırlama maili gönderildi!")
  }

  return (
    <div style={{minHeight:"100vh",background:"#f5f4f0",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:400}} className="fu">
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:56,height:56,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:16,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
            <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:24,color:"#fff"}}>K</span>
          </div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:24,color:"#1a1a2e"}}>Kampüs</div>
          <div style={{fontSize:11,color:"#9ca3af",letterSpacing:1.5,marginTop:3}}>BİLKENT ÜNİVERSİTESİ</div>
        </div>
        <div style={{background:"#fff",borderRadius:24,padding:28,boxShadow:"0 4px 24px rgba(26,26,46,.08)"}}>
          <div style={{display:"flex",gap:20,marginBottom:24,borderBottom:"1px solid #f3f4f6",paddingBottom:12}}>
            {[["login","Giriş Yap"],["register","Kayıt Ol"]].map(([k,l])=>(
              <button key={k} className={`tab ${tab===k?"on":""}`} onClick={()=>{setTab(k);setErr("");setOk("")}}>{l}</button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {tab==="register"&&<div><div className="lbl">ADIN SOYADIN</div><input className="inp" placeholder="Ali Yılmaz" value={name} onChange={e=>setName(e.target.value)}/></div>}
            <div><div className="lbl">BİLKENT E-POSTA</div><input className="inp" type="email" placeholder="ad.soyad@bilkent.edu.tr" value={email} onChange={e=>setEmail(e.target.value)}/></div>
            <div>
              <div className="lbl">ŞİFRE</div>
              <input className="inp" type="password" placeholder={tab==="register"?"En az 6 karakter":"••••••••"} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(tab==="login"?login():register())}/>
              {tab==="login"&&<button onClick={resetPassword} style={{background:"none",border:"none",color:"#6366f1",fontSize:12,cursor:"pointer",marginTop:6,padding:0,fontFamily:"'Plus Jakarta Sans'"}}>Şifremi unuttum</button>}
            </div>
            {err&&<div className="err">{err}</div>}
            {ok&&<div className="ok">{ok}</div>}
            <button className="pbtn" disabled={busy} onClick={tab==="login"?login:register}>
              {busy?<span className="sp">⟳</span>:tab==="login"?"Giriş Yap":"Kayıt Ol"}
            </button>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:14,fontSize:11,color:"#9ca3af"}}>Sadece @bilkent.edu.tr e-postaları kabul edilir</div>
      </div>
    </div>
  )
}

const NAV=[
  {key:"feed",icon:"🏠",label:"Ana Sayfa"},
  {key:"staj",icon:"💼",label:"Staj"},
  {key:"kesfet",icon:"🔍",label:"Keşfet"},
  {key:"profil",icon:"👤",label:"Profil"},
]

function Sidebar({active,setActive,user,onLogout}) {
  return (
    <div className="sidebar">
      <div className="logo-area">
        <div className="logo-icon">K</div>
        <div><div className="logo-text">Kampüs</div><div className="logo-sub">BİLKENT</div></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4,flex:1}}>
        {NAV.map(n=>(
          <button key={n.key} className={`nav-item ${active===n.key?"active":""}`} onClick={()=>setActive(n.key)}>
            <span className="nav-icon">{n.icon}</span>{n.label}
          </button>
        ))}
      </div>
      <div style={{borderTop:"1px solid #e8e6e0",paddingTop:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",marginBottom:8}}>
          <Avatar name={user.name} src={user.avatar} size={32}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:"#1a1a2e",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
            <div style={{fontSize:11,color:"#9ca3af",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</div>
          </div>
        </div>
        <button className="nav-item" onClick={onLogout} style={{color:"#ef4444"}}><span className="nav-icon">🚪</span>Çıkış Yap</button>
      </div>
    </div>
  )
}

function BottomNav({active,setActive}) {
  return (
    <div className="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV.map(n=>(
          <button key={n.key} className={`bnav-item ${active===n.key?"active":""}`} onClick={()=>setActive(n.key)}>
            <span className="bnav-icon">{n.icon}</span>{n.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function FeedPage({user}) {
  const [posts,setPosts]=useState([])
  const [filter,setFilter]=useState("all")
  const [search,setSearch]=useState("")
  const [myTab,setMyTab]=useState(false)
  const [modal,setModal]=useState(false)
  const [form,setForm]=useState({category:"ev",title:"",desc:""})
  const [loading,setLoading]=useState(true)
  const [posting,setPosting]=useState(false)

  useEffect(()=>{load()},[])

  async function load() {
    setLoading(true)
    const {data}=await supabase.from("posts").select("*").neq("category","staj").order("created_at",{ascending:false})
    setPosts(data||[]);setLoading(false)
  }

  async function toggleLike(post) {
    const likes=post.likes||[]
    const nl=likes.includes(user.email)?likes.filter(e=>e!==user.email):[...likes,user.email]
    await supabase.from("posts").update({likes:nl}).eq("id",post.id)
    setPosts(prev=>prev.map(p=>p.id===post.id?{...p,likes:nl}:p))
  }

  async function addPost() {
    if(!form.title.trim()||!form.desc.trim()) return
    setPosting(true)
    const {data,error}=await supabase.from("posts").insert({user_id:user.id,user_name:user.name,user_email:user.email,category:form.category,title:form.title,description:form.desc,likes:[]}).select().single()
    if(!error) setPosts(prev=>[data,...prev])
    setForm({category:"ev",title:"",desc:""});setModal(false);setPosting(false)
  }

  async function del(id) {
    if(!confirm("Bu ilanı silmek istiyor musun?")) return
    await supabase.from("posts").delete().eq("id",id)
    setPosts(prev=>prev.filter(p=>p.id!==id))
  }

  const shown=posts.filter(p=>
    (filter==="all"||p.category===filter)&&
    (p.title.toLowerCase().includes(search.toLowerCase())||(p.description||"").toLowerCase().includes(search.toLowerCase()))&&
    (!myTab||p.user_email===user.email)
  )

  return (
    <div className="page">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,color:"#1a1a2e"}}>Merhaba, {user.name.split(" ")[0]} 👋</div>
          <div style={{fontSize:13,color:"#9ca3af",marginTop:2}}>Bugün ne arıyorsun?</div>
        </div>
        <button className="sbtn" onClick={()=>setModal(true)}>+ İlan Ver</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:24}}>
        {["ev","esya","ders"].map(k=>(
          <div key={k} onClick={()=>setFilter(k)} style={{background:"#fff",border:`2px solid ${filter===k?"#6366f1":"#e8e6e0"}`,borderRadius:14,padding:"14px 10px",textAlign:"center",cursor:"pointer",transition:"all .2s"}}>
            <div style={{fontSize:22,marginBottom:4}}>{CAT[k].emoji}</div>
            <div style={{fontSize:11,color:"#6b7280",fontWeight:500}}>{CAT[k].label}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:20,borderBottom:"1px solid #e8e6e0",marginBottom:16}}>
        {[["Tüm İlanlar",false],["İlanlarım",true]].map(([l,v])=>(
          <button key={l} className={`tab ${myTab===v?"on":""}`} onClick={()=>setMyTab(v)}>{l}</button>
        ))}
      </div>

      <div style={{position:"relative",marginBottom:14}}>
        <span style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:"#9ca3af",pointerEvents:"none"}}>🔍</span>
        <input className="srch" placeholder="İlan ara..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div style={{display:"flex",gap:8,marginBottom:20,overflowX:"auto",paddingBottom:4}}>
        <button className={`catbtn ${filter==="all"?"on":""}`} onClick={()=>setFilter("all")}>✦ Tümü</button>
        {Object.entries(CAT).filter(([k])=>k!=="staj").map(([k,v])=>(
          <button key={k} className={`catbtn ${filter===k?"on":""}`} onClick={()=>setFilter(k)}>{v.emoji} {v.label}</button>
        ))}
      </div>

      {loading?(
        <div style={{textAlign:"center",padding:60}}><span className="sp" style={{fontSize:28,color:"#6366f1"}}>⟳</span></div>
      ):shown.length===0?(
        <div style={{textAlign:"center",padding:60,color:"#9ca3af",background:"#fff",borderRadius:16,border:"1px solid #e8e6e0"}}>
          <div style={{fontSize:40,marginBottom:12}}>{myTab?"📭":"🔍"}</div>
          <div style={{fontSize:14}}>{myTab?"Henüz ilan vermedin.":"Sonuç bulunamadı."}</div>
          {myTab&&<button className="sbtn" style={{margin:"16px auto 0"}} onClick={()=>setModal(true)}>İlk İlanını Ver</button>}
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {shown.map((p,i)=>{
            const m=CAT[p.category];const liked=(p.likes||[]).includes(user.email);const mine=p.user_email===user.email
            return (
              <div key={p.id} className="card fu" style={{animationDelay:`${i*.04}s`}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                  <span className="bdg" style={{background:m.color+"18",color:m.color}}>{m.emoji} {m.label}</span>
                  <span style={{fontSize:11,color:"#9ca3af"}}>{ago(p.created_at)}</span>
                  {mine&&<span className="bdg" style={{background:"#ede9fe",color:"#6366f1"}}>Senin ilanın</span>}
                </div>
                <div style={{fontWeight:600,fontSize:15,color:"#1a1a2e",marginBottom:6}}>{p.title}</div>
                <div style={{fontSize:13,color:"#6b7280",lineHeight:1.65,marginBottom:14}}>{p.description}</div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Avatar name={p.user_name} size={24}/><span style={{fontSize:12,color:"#6b7280"}}>{p.user_name}</span>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button className={`likebtn ${liked?"on":""}`} onClick={()=>toggleLike(p)}>{liked?"♥":"♡"} {(p.likes||[]).length}</button>
                    {mine&&<button onClick={()=>del(p.id)} style={{background:"none",border:"none",color:"#d1d5db",cursor:"pointer",fontSize:15,padding:4}} onMouseOver={e=>e.target.style.color="#ef4444"} onMouseOut={e=>e.target.style.color="#d1d5db"}>🗑</button>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal&&(
        <div className="ovl" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="mdl fu">
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:4,color:"#1a1a2e"}}>Yeni İlan</div>
            <div style={{fontSize:13,color:"#9ca3af",marginBottom:24}}>Bilkent öğrencileriyle paylaş</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><div className="lbl">KATEGORİ</div>
                <select className="sel" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                  {Object.entries(CAT).filter(([k])=>k!=="staj").map(([k,v])=><option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
              </div>
              <div><div className="lbl">BAŞLIK</div><input className="inp" placeholder="Örn: Ev arkadaşı arıyorum" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
              <div><div className="lbl">AÇIKLAMA</div><textarea className="inp" placeholder="Detayları buraya yaz..." rows={4} style={{resize:"vertical"}} value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))}/></div>
              <div style={{display:"flex",gap:10}}>
                <button className="gbtn" style={{flex:1}} onClick={()=>setModal(false)}>İptal</button>
                <button className="pbtn" style={{flex:2}} disabled={posting||!form.title.trim()||!form.desc.trim()} onClick={addPost}>{posting?<span className="sp">⟳</span>:"İlan Ver"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StajPage({user}) {
  const [posts,setPosts]=useState([])
  const [loading,setLoading]=useState(true)
  const [modal,setModal]=useState(false)
  const [applyModal,setApplyModal]=useState(null)
  const [form,setForm]=useState({title:"",desc:"",sirket:"",lokasyon:""})
  const [applyMsg,setApplyMsg]=useState("")
  const [posting,setPosting]=useState(false)
  const [applying,setApplying]=useState(false)
  const [ok,setOk]=useState("")

  useEffect(()=>{load()},[])

  async function load() {
    setLoading(true)
    const {data}=await supabase.from("posts").select("*").eq("category","staj").order("created_at",{ascending:false})
    setPosts(data||[]);setLoading(false)
  }

  async function addStaj() {
    if(!form.title.trim()||!form.desc.trim()) return
    setPosting(true)
    const {data,error}=await supabase.from("posts").insert({user_id:user.id,user_name:form.sirket||user.name,user_email:user.email,category:"staj",title:form.title,description:`${form.desc}${form.lokasyon?"\n\n📍 "+form.lokasyon:""}`,likes:[]}).select().single()
    if(!error) setPosts(prev=>[data,...prev])
    setForm({title:"",desc:"",sirket:"",lokasyon:""});setModal(false);setPosting(false)
  }

  async function apply() {
    setApplying(true)
    await new Promise(r=>setTimeout(r,1000))
    setApplying(false);setApplyModal(null);setApplyMsg("")
    setOk("✅ Başvurun alındı! Şirket seninle iletişime geçecek.")
    setTimeout(()=>setOk(""),4000)
  }

  return (
    <div className="page">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,color:"#1a1a2e"}}>Staj İlanları 💼</div>
          <div style={{fontSize:13,color:"#9ca3af",marginTop:2}}>Bilkent öğrencilerine özel fırsatlar</div>
        </div>
        <button className="sbtn" onClick={()=>setModal(true)}>+ İlan Ver</button>
      </div>

      {ok&&<div className="ok" style={{marginBottom:16}}>{ok}</div>}

      {loading?(
        <div style={{textAlign:"center",padding:60}}><span className="sp" style={{fontSize:28,color:"#6366f1"}}>⟳</span></div>
      ):posts.length===0?(
        <div style={{textAlign:"center",padding:60,color:"#9ca3af",background:"#fff",borderRadius:16,border:"1px solid #e8e6e0"}}>
          <div style={{fontSize:40,marginBottom:12}}>💼</div>
          <div>Henüz staj ilanı yok.</div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {posts.map((p,i)=>(
            <div key={p.id} className="card fu" style={{animationDelay:`${i*.04}s`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span className="bdg" style={{background:"#e0f2fe",color:"#0284c7"}}>💼 Staj</span>
                <span style={{fontSize:11,color:"#9ca3af"}}>{ago(p.created_at)}</span>
              </div>
              <div style={{fontWeight:700,fontSize:16,color:"#1a1a2e",marginBottom:4}}>{p.title}</div>
              <div style={{fontSize:13,fontWeight:600,color:"#6366f1",marginBottom:8}}>{p.user_name}</div>
              <div style={{fontSize:13,color:"#6b7280",lineHeight:1.65,marginBottom:16}}>{p.description}</div>
              <button onClick={()=>setApplyModal(p)} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:100,padding:"8px 20px",fontFamily:"'Plus Jakarta Sans'",fontWeight:600,fontSize:13,cursor:"pointer"}}>
                Başvur →
              </button>
            </div>
          ))}
        </div>
      )}

      {modal&&(
        <div className="ovl" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="mdl fu">
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:4,color:"#1a1a2e"}}>Staj İlanı Ver</div>
            <div style={{fontSize:13,color:"#9ca3af",marginBottom:24}}>Bilkent öğrencilerine duyur</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><div className="lbl">ŞİRKET ADI</div><input className="inp" placeholder="Şirket adı" value={form.sirket} onChange={e=>setForm(p=>({...p,sirket:e.target.value}))}/></div>
              <div><div className="lbl">POZİSYON</div><input className="inp" placeholder="Örn: Yazılım Stajyeri" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
              <div><div className="lbl">AÇIKLAMA</div><textarea className="inp" placeholder="Staj detayları, gereksinimler..." rows={4} style={{resize:"vertical"}} value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))}/></div>
              <div><div className="lbl">LOKASYON</div><input className="inp" placeholder="Örn: Ankara (Hibrit)" value={form.lokasyon} onChange={e=>setForm(p=>({...p,lokasyon:e.target.value}))}/></div>
              <div style={{display:"flex",gap:10}}>
                <button className="gbtn" style={{flex:1}} onClick={()=>setModal(false)}>İptal</button>
                <button className="pbtn" style={{flex:2}} disabled={posting||!form.title.trim()||!form.desc.trim()} onClick={addStaj}>{posting?<span className="sp">⟳</span>:"İlanı Yayınla"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {applyModal&&(
        <div className="ovl" onClick={e=>e.target===e.currentTarget&&setApplyModal(null)}>
          <div className="mdl fu">
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:20,marginBottom:4,color:"#1a1a2e"}}>{applyModal.title}</div>
            <div style={{fontSize:13,color:"#6366f1",fontWeight:600,marginBottom:20}}>{applyModal.user_name}</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><div className="lbl">BAŞVURU MESAJI</div><textarea className="inp" placeholder="Kendinizi kısaca tanıtın..." rows={5} style={{resize:"vertical"}} value={applyMsg} onChange={e=>setApplyMsg(e.target.value)}/></div>
              <div style={{background:"#f9f8f6",borderRadius:12,padding:"12px 16px",fontSize:13,color:"#6b7280"}}>📧 Başvurunuz <strong>{user.email}</strong> adresiyle gönderilecek.</div>
              <div style={{display:"flex",gap:10}}>
                <button className="gbtn" style={{flex:1}} onClick={()=>setApplyModal(null)}>İptal</button>
                <button className="pbtn" style={{flex:2}} disabled={applying||!applyMsg.trim()} onClick={apply}>{applying?<span className="sp">⟳</span>:"Başvur →"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function KesfetPage({user}) {
  const [posts,setPosts]=useState([])
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    (async()=>{
      setLoading(true)
      const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false}).limit(30)
      setPosts(data||[]);setLoading(false)
    })()
  },[])

  const popular=[...posts].sort((a,b)=>(b.likes||[]).length-(a.likes||[]).length).slice(0,10)

  return (
    <div className="page">
      <div style={{marginBottom:24}}>
        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,color:"#1a1a2e"}}>Keşfet 🔍</div>
        <div style={{fontSize:13,color:"#9ca3af",marginTop:2}}>Kampüste neler oluyor?</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10,marginBottom:28}}>
        {Object.entries(CAT).map(([k,v])=>(
          <div key={k} style={{background:"#fff",border:"1px solid #e8e6e0",borderRadius:16,padding:16,display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:44,height:44,background:v.color+"18",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{v.emoji}</div>
            <div>
              <div style={{fontWeight:600,fontSize:14,color:"#1a1a2e"}}>{v.label}</div>
              <div style={{fontSize:12,color:"#9ca3af"}}>{posts.filter(p=>p.category===k).length} ilan</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:"#1a1a2e",marginBottom:14}}>🔥 En Popüler</div>
      {loading?(
        <div style={{textAlign:"center",padding:40}}><span className="sp" style={{fontSize:24,color:"#6366f1"}}>⟳</span></div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {popular.map((p,i)=>{
            const m=CAT[p.category]
            return (
              <div key={p.id} className="card" style={{display:"flex",alignItems:"center",gap:14}}>
                <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:20,color:"#e8e6e0",width:28,textAlign:"center"}}>{i+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                    <span className="bdg" style={{background:m.color+"18",color:m.color}}>{m.emoji}</span>
                    <span style={{fontSize:13,fontWeight:600,color:"#1a1a2e",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</span>
                  </div>
                  <div style={{fontSize:11,color:"#9ca3af"}}>{p.user_name} · ♥ {(p.likes||[]).length}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function ProfilPage({user,setUser}) {
  const [profile,setProfile]=useState(null)
  const [editing,setEditing]=useState(false)
  const [form,setForm]=useState({name:"",bio:"",bolum:"",sinif:""})
  const [saving,setSaving]=useState(false)
  const [uploading,setUploading]=useState(false)
  const [myPosts,setMyPosts]=useState([])
  const fileRef=useRef()

  useEffect(()=>{loadProfile()},[])

  async function loadProfile() {
    const {data}=await supabase.from("profiles").select("*").eq("id",user.id).single()
    if(data){setProfile(data);setForm({name:data.name||"",bio:data.bio||"",bolum:data.bolum||"",sinif:data.sinif||""})}
    const {data:posts}=await supabase.from("posts").select("*").eq("user_email",user.email).order("created_at",{ascending:false})
    setMyPosts(posts||[])
  }

  async function saveProfile() {
    setSaving(true)
    await supabase.from("profiles").upsert({id:user.id,email:user.email,...form})
    setProfile(prev=>({...prev,...form}));setUser(prev=>({...prev,name:form.name}))
    setSaving(false);setEditing(false)
  }

  async function uploadAvatar(e) {
    const file=e.target.files?.[0];if(!file) return
    setUploading(true)
    const ext=file.name.split(".").pop()
    const path=`${user.id}.${ext}`
    await supabase.storage.from("avatars").upload(path,file,{upsert:true})
    const {data}=supabase.storage.from("avatars").getPublicUrl(path)
    await supabase.from("profiles").upsert({id:user.id,email:user.email,avatar_url:data.publicUrl})
    setProfile(prev=>({...prev,avatar_url:data.publicUrl}));setUser(prev=>({...prev,avatar:data.publicUrl}))
    setUploading(false)
  }

  if(!profile) return <div style={{textAlign:"center",padding:60}}><span className="sp" style={{fontSize:28,color:"#6366f1"}}>⟳</span></div>

  return (
    <div className="page">
      <div style={{background:"#fff",border:"1px solid #e8e6e0",borderRadius:20,padding:24,marginBottom:20}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:16}}>
          <div style={{position:"relative",cursor:"pointer"}} onClick={()=>fileRef.current?.click()}>
            <Avatar name={profile.name} src={profile.avatar_url} size={72}/>
            <div style={{position:"absolute",bottom:0,right:0,width:22,height:22,background:"#6366f1",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>
              {uploading?<span className="sp" style={{fontSize:9}}>⟳</span>:"📷"}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={uploadAvatar}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:"#1a1a2e"}}>{profile.name}</div>
            <div style={{fontSize:12,color:"#9ca3af",marginTop:2}}>{profile.email}</div>
            {profile.bolum&&<div style={{fontSize:13,color:"#6366f1",fontWeight:500,marginTop:4}}>{profile.bolum}{profile.sinif&&` · ${profile.sinif}. Sınıf`}</div>}
          </div>
          <button onClick={()=>setEditing(!editing)} style={{background:"none",border:"1px solid #e8e6e0",borderRadius:100,padding:"6px 14px",fontSize:12,color:"#6b7280",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontWeight:500}}>
            {editing?"İptal":"Düzenle"}
          </button>
        </div>
        {profile.bio&&!editing&&<div style={{fontSize:13,color:"#6b7280",lineHeight:1.6,padding:"12px 0",borderTop:"1px solid #f3f4f6"}}>{profile.bio}</div>}
        {editing&&(
          <div style={{display:"flex",flexDirection:"column",gap:12,borderTop:"1px solid #f3f4f6",paddingTop:16}}>
            <div><div className="lbl">İSİM</div><input className="inp" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
            <div><div className="lbl">BÖLÜM</div><input className="inp" placeholder="Bilgisayar Mühendisliği" value={form.bolum} onChange={e=>setForm(p=>({...p,bolum:e.target.value}))}/></div>
            <div><div className="lbl">SINIF</div>
              <select className="sel" value={form.sinif} onChange={e=>setForm(p=>({...p,sinif:e.target.value}))}>
                <option value="">Seç</option>
                {[1,2,3,4].map(n=><option key={n} value={n}>{n}. Sınıf</option>)}
                <option value="Yüksek Lisans">Yüksek Lisans</option>
              </select>
            </div>
            <div><div className="lbl">BIO</div><textarea className="inp" placeholder="Kendini kısaca tanıt..." rows={3} style={{resize:"vertical"}} value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))}/></div>
            <button className="pbtn" disabled={saving} onClick={saveProfile}>{saving?<span className="sp">⟳</span>:"Kaydet"}</button>
          </div>
        )}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
        {[["İlan",myPosts.length],["Beğeni",myPosts.reduce((a,p)=>a+(p.likes||[]).length,0)],["Üye","2025"]].map(([l,v])=>(
          <div key={l} style={{background:"#fff",border:"1px solid #e8e6e0",borderRadius:14,padding:"14px 10px",textAlign:"center"}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,color:"#6366f1"}}>{v}</div>
            <div style={{fontSize:11,color:"#9ca3af"}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:"#1a1a2e",marginBottom:14}}>İlanlarım</div>
      {myPosts.length===0?(
        <div style={{textAlign:"center",padding:40,color:"#9ca3af",background:"#fff",borderRadius:16,border:"1px solid #e8e6e0"}}>
          <div style={{fontSize:32,marginBottom:8}}>📭</div>
          <div style={{fontSize:13}}>Henüz ilan vermedin.</div>
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {myPosts.map(p=>{
            const m=CAT[p.category]
            return (
              <div key={p.id} className="card">
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span className="bdg" style={{background:m.color+"18",color:m.color}}>{m.emoji} {m.label}</span>
                  <span style={{fontSize:11,color:"#9ca3af"}}>{ago(p.created_at)}</span>
                </div>
                <div style={{fontWeight:600,fontSize:14,color:"#1a1a2e",marginBottom:4}}>{p.title}</div>
                <div style={{fontSize:12,color:"#9ca3af"}}>♥ {(p.likes||[]).length} beğeni</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function App() {
  const [user,setUser]=useState(null)
  const [ready,setReady]=useState(false)
  const [page,setPage]=useState("feed")

  useEffect(()=>{
    supabase.auth.getSession().then(async({data:{session}})=>{
      if(session){
        const u=session.user
        const {data:profile}=await supabase.from("profiles").select("*").eq("id",u.id).single()
        setUser({id:u.id,name:profile?.name||u.user_metadata?.name||u.email.split("@")[0],email:u.email,avatar:profile?.avatar_url||null})
      }
      setReady(true)
    })
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,session)=>{if(!session)setUser(null)})
    return ()=>subscription.unsubscribe()
  },[])

  const logout=async()=>{await supabase.auth.signOut();setUser(null)}

  if(!ready) return (
    <div style={{minHeight:"100vh",background:"#f5f4f0",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={{color:"#6366f1",fontSize:32,animation:"spin .8s linear infinite",display:"inline-block"}}>⟳</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if(!user) return <><style>{CSS}</style><Auth onLogin={setUser}/></>

  const pages={
    feed:<FeedPage user={user}/>,
    staj:<StajPage user={user}/>,
    kesfet:<KesfetPage user={user}/>,
    profil:<ProfilPage user={user} setUser={setUser}/>,
  }

  return (
    <>
      <style>{CSS}</style>
      <div className="layout">
        <Sidebar active={page} setActive={setPage} user={user} onLogout={logout}/>
        <div className="main-content">{pages[page]}</div>
        <BottomNav active={page} setActive={setPage}/>
      </div>
    </>
  )
}