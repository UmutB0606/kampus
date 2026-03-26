import { useState, useEffect, useRef } from "react"
import { supabase } from "./supabase"

const CAT = {
  ev:   { label:"Ev & Arkadaş", emoji:"🏠", color:"#6366f1" },
  esya: { label:"Eşya",         emoji:"🪑", color:"#8b5cf6" },
  staj: { label:"Staj",         emoji:"💼", color:"#06b6d4" },
  ders: { label:"Ders",         emoji:"📚", color:"#10b981" },
}
const LOCATIONS = ["Tümü","Bilkent Kampüs","Çankaya","Kızılay","Eryaman","Ankara Geneli","Diğer"]
const CLUB_CATS = ["Spor","Müzik","Teknoloji","Sanat","Bilim","Sosyal","Diğer"]
const DEPTS = ["Bilgisayar Mühendisliği","Elektrik-Elektronik Müh.","Endüstri Mühendisliği","Makine Mühendisliği","İşletme","Ekonomi","Psikoloji","Uluslararası İlişkiler","Hukuk","Tıp","Mimarlık","Grafik Tasarım","Müzik","Matematik","Fizik","Kimya","Biyoloji","CTIS","Diğer"]

function ago(ts) {
  const d = Date.now() - new Date(ts).getTime()
  if (d < 3600000) return `${Math.floor(d/60000)} dk önce`
  if (d < 86400000) return `${Math.floor(d/3600000)} saat önce`
  return `${Math.floor(d/86400000)} gün önce`
}
function fmtDate(ts) {
  const d = new Date(ts)
  return d.toLocaleDateString("tr-TR",{day:"numeric",month:"long",hour:"2-digit",minute:"2-digit"})
}
function joinYear(ts) { return ts ? new Date(ts).getFullYear() : new Date().getFullYear() }
const validBilkent = e => e.endsWith("@bilkent.edu.tr") || e.endsWith("@ug.bilkent.edu.tr")

function getCSS(dark) {
  return `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Sora:wght@400;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:${dark?"#0f0f13":"#f5f4f0"};
  --card:${dark?"#1a1a24":"#ffffff"};
  --border:${dark?"#2a2a38":"#e8e6e0"};
  --text:${dark?"#e8e6f0":"#1a1a2e"};
  --sub:${dark?"#6b7280":"#9ca3af"};
  --inp:${dark?"#13131a":"#f9f8f6"};
  --hover:${dark?"#1f1f2e":"#f5f4f0"};
}
body{background:var(--bg);color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;transition:background .25s,color .25s;}
::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}
.layout{display:flex;min-height:100vh;}
.sidebar{width:240px;background:var(--card);border-right:1px solid var(--border);position:fixed;top:0;left:0;height:100vh;display:flex;flex-direction:column;z-index:40;padding:24px 16px;transition:background .25s;}
.main-content{margin-left:240px;flex:1;min-height:100vh;}
.page{max-width:700px;margin:0 auto;padding:32px 24px 100px;}
.logo-area{display:flex;align-items:center;gap:10px;margin-bottom:28px;padding:0 8px;}
.logo-icon{width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;font-weight:700;font-size:16px;color:#fff;}
.logo-text{font-family:'Sora',sans-serif;font-weight:700;font-size:18px;color:var(--text);}
.logo-sub{font-size:10px;color:var(--sub);letter-spacing:1px;}
.nav-section{font-size:10px;color:var(--sub);letter-spacing:1px;font-weight:600;padding:8px 12px 4px;margin-top:8px;}
.nav-item{display:flex;align-items:center;gap:12px;padding:9px 12px;border-radius:12px;cursor:pointer;transition:all .2s;color:var(--sub);font-size:14px;font-weight:500;border:none;background:none;width:100%;text-align:left;}
.nav-item:hover{background:var(--hover);color:var(--text);}
.nav-item.active{background:linear-gradient(135deg,#6366f111,#8b5cf611);color:#6366f1;font-weight:600;}
.nav-icon{font-size:16px;width:22px;text-align:center;}
.nav-badge{margin-left:auto;background:#ef4444;color:#fff;font-size:10px;padding:2px 7px;border-radius:100px;font-weight:700;}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--card);border-top:1px solid var(--border);z-index:40;padding:8px 0 20px;}
.bottom-nav-inner{display:flex;justify-content:space-around;}
.bnav-item{display:flex;flex-direction:column;align-items:center;gap:2px;padding:6px 10px;cursor:pointer;color:var(--sub);font-size:9px;font-weight:500;border:none;background:none;}
.bnav-item.active{color:#6366f1;}
.bnav-icon{font-size:20px;position:relative;}
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;transition:all .2s;}
.card:hover{border-color:#6366f133;}
.pbtn{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:12px;padding:13px 24px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:14px;cursor:pointer;width:100%;transition:opacity .2s;}
.pbtn:hover{opacity:.9;}
.pbtn:disabled{opacity:.4;cursor:not-allowed;}
.gbtn{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:13px 24px;color:var(--sub);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;width:100%;transition:all .2s;}
.gbtn:hover{border-color:#c4b5fd;color:#6366f1;}
.sbtn{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:100px;padding:8px 20px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;}
.sbtn:disabled{opacity:.4;cursor:not-allowed;}
.obtn{background:var(--card);border:2px solid #6366f1;border-radius:100px;padding:7px 18px;color:#6366f1;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:13px;}
.inp{background:var(--inp);border:1px solid var(--border);border-radius:12px;padding:12px 16px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;width:100%;outline:none;transition:border .2s;}
.inp:focus{border-color:#6366f1;background:var(--card);}
.inp::placeholder{color:var(--sub);}
.sel{background:var(--inp);border:1px solid var(--border);border-radius:12px;padding:12px 16px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;width:100%;outline:none;cursor:pointer;}
.lbl{font-size:11px;color:var(--sub);letter-spacing:.8px;font-weight:600;margin-bottom:6px;}
.bdg{display:inline-block;padding:4px 10px;border-radius:100px;font-size:11px;font-weight:600;}
.tag{display:inline-block;padding:3px 10px;border-radius:100px;font-size:11px;background:#6366f111;color:#6366f1;cursor:pointer;border:1px solid #6366f122;}
.ovl{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(8px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;}
.mdl{background:var(--card);border:1px solid var(--border);border-radius:24px;padding:32px;width:100%;max-width:520px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2);}
.tab{background:none;border:none;padding:10px 0;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:var(--sub);border-bottom:2px solid transparent;white-space:nowrap;font-weight:500;}
.tab.on{color:#6366f1;border-bottom-color:#6366f1;font-weight:600;}
.catbtn{background:var(--card);border:1px solid var(--border);border-radius:100px;padding:7px 16px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--sub);transition:all .2s;display:flex;align-items:center;gap:6px;white-space:nowrap;}
.catbtn.on{background:#6366f111;border-color:#c4b5fd;color:#6366f1;font-weight:600;}
.likebtn{background:none;border:1px solid var(--border);border-radius:100px;padding:5px 12px;cursor:pointer;font-size:12px;color:var(--sub);transition:all .2s;display:flex;align-items:center;gap:5px;font-family:'Plus Jakarta Sans',sans-serif;}
.likebtn.on{border-color:#ef4444;color:#ef4444;background:#ef444411;}
.favbtn{background:none;border:1px solid var(--border);border-radius:100px;padding:5px 10px;cursor:pointer;font-size:14px;color:var(--sub);transition:all .2s;}
.favbtn.on{border-color:#ef4444;color:#ef4444;}
.copybtn{background:none;border:1px solid var(--border);border-radius:100px;padding:5px 10px;cursor:pointer;font-size:12px;color:var(--sub);font-family:'Plus Jakarta Sans',sans-serif;display:flex;align-items:center;gap:4px;}
.srch{background:var(--card);border:1px solid var(--border);border-radius:100px;padding:10px 20px 10px 44px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;width:100%;outline:none;transition:border .2s;}
.srch:focus{border-color:#6366f1;}
.srch::placeholder{color:var(--sub);}
.err{color:#ef4444;font-size:12px;background:#fef2f2;padding:10px 14px;border-radius:10px;border:1px solid #fecaca;}
.ok{color:#059669;font-size:13px;background:#f0fdf4;padding:12px 14px;border-radius:10px;border:1px solid #bbf7d0;line-height:1.5;}
.avatar{border-radius:50%;object-fit:cover;background:linear-gradient(135deg,#6366f1,#8b5cf6);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;flex-shrink:0;}
.toggle{position:relative;width:44px;height:24px;background:var(--border);border-radius:100px;cursor:pointer;border:none;transition:background .2s;}
.toggle.on{background:#6366f1;}
.toggle::after{content:'';position:absolute;width:18px;height:18px;background:#fff;border-radius:50%;top:3px;left:3px;transition:left .2s;}
.toggle.on::after{left:23px;}
.msg-bubble{padding:10px 14px;border-radius:16px;max-width:75%;font-size:13px;line-height:1.5;}
.msg-bubble.mine{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;align-self:flex-end;border-bottom-right-radius:4px;}
.msg-bubble.theirs{background:var(--inp);color:var(--text);align-self:flex-start;border-bottom-left-radius:4px;}
.user-row{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--card);border:1px solid var(--border);border-radius:14px;transition:all .2s;cursor:pointer;}
.user-row:hover{border-color:#6366f144;transform:translateY(-1px);}
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px 10px;text-align:center;}
.post-img{width:100%;max-height:360px;object-fit:cover;border-radius:14px;margin:10px 0;cursor:pointer;}
.img-upload-area{border:2px dashed var(--border);border-radius:12px;padding:20px;text-align:center;cursor:pointer;transition:border .2s;}
.img-upload-area:hover{border-color:#6366f1;}
.club-card{background:var(--card);border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:all .2s;cursor:pointer;}
.club-card:hover{border-color:#6366f144;transform:translateY(-2px);box-shadow:0 8px 24px rgba(99,102,241,.1);}
.event-card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;transition:all .2s;}
.event-card:hover{border-color:#6366f133;}
.comment-inp{background:var(--inp);border:1px solid var(--border);border-radius:100px;padding:8px 16px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;flex:1;outline:none;}
.comment-inp:focus{border-color:#6366f1;}
.dept-chip{display:inline-flex;align-items:center;gap:4px;padding:4px 12px;background:#6366f111;color:#6366f1;border-radius:100px;font-size:12px;font-weight:500;cursor:pointer;border:1px solid #6366f122;}
.dept-chip:hover{background:#6366f122;}
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
}

function Avatar({ name, src, size=36 }) {
  if (src) return <img src={src} alt={name} className="avatar" style={{width:size,height:size}}/>
  return <div className="avatar" style={{width:size,height:size,fontSize:size*.38}}>{name?.[0]?.toUpperCase()||"?"}</div>
}
function Spinner({ size=28 }) { return <span className="sp" style={{fontSize:size,color:"#6366f1"}}>⟳</span> }
function Empty({ icon, text }) {
  return <div style={{textAlign:"center",padding:60,color:"var(--sub)"}}>
    <div style={{fontSize:40,marginBottom:12}}>{icon}</div>
    <div style={{fontSize:14}}>{text}</div>
  </div>
}
function Lightbox({ src, onClose }) {
  return <div className="ovl" onClick={onClose} style={{zIndex:200}}>
    <img src={src} alt="" style={{maxWidth:"90vw",maxHeight:"90vh",objectFit:"contain",borderRadius:12}}/>
  </div>
}

// ── AUTH ─────────────────────────────────────────────────────────────────────
function Auth({ onLogin }) {
  const [tab,setTab]=useState("login"),[name,setName]=useState(""),[email,setEmail]=useState("")
  const [pass,setPass]=useState(""),[dept,setDept]=useState(""),[accType,setAccType]=useState("ogrenci")
  const [err,setErr]=useState(""),[ok,setOk]=useState(""),[busy,setBusy]=useState(false)

  async function register() {
    setErr("");setOk("")
    if(!name.trim()) return setErr("İsim giriniz.")
    if(accType==="ogrenci"&&!validBilkent(email)) return setErr("Öğrenci hesabı için sadece @bilkent.edu.tr uzantılı e-posta kabul edilir.")
    if(pass.length<6) return setErr("Şifre en az 6 karakter olmalı.")
    setBusy(true)
    const {error}=await supabase.auth.signUp({email,password:pass,options:{data:{name,account_type:accType,bolum:dept}}})
    setBusy(false)
    if(error) return setErr(error.message)
    setOk("✅ Doğrulama e-postası gönderildi! Bilkent e-postanı kontrol et ve linke tıkla, sonra giriş yap.")
  }

  async function login() {
    setErr("");setOk("");setBusy(true)
    const {data,error}=await supabase.auth.signInWithPassword({email,password:pass})
    setBusy(false)
    if(error) return setErr(error.message==="Invalid login credentials"?"E-posta veya şifre hatalı.":error.message)
    const {data:profile}=await supabase.from("profiles").select("*").eq("id",data.user.id).single()
    if(!profile) await supabase.from("profiles").insert({id:data.user.id,name:data.user.user_metadata?.name||email.split("@")[0],email,account_type:data.user.user_metadata?.account_type||"ogrenci",bolum:data.user.user_metadata?.bolum||""})
    onLogin({id:data.user.id,name:profile?.name||data.user.user_metadata?.name||email.split("@")[0],email,avatar:profile?.avatar_url||null,account_type:profile?.account_type||"ogrenci",bolum:profile?.bolum||""})
  }

  async function resetPassword() {
    setErr("");setOk("")
    if(!email) return setErr("Önce e-posta adresini yaz.")
    setBusy(true)
    await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/reset-password`})
    setBusy(false)
    setOk("✅ Şifre sıfırlama maili gönderildi!")
  }

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:440}} className="fu">
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:60,height:60,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:18,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
            <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:28,color:"#fff"}}>K</span>
          </div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:26,color:"var(--text)"}}>Kampüs</div>
          <div style={{fontSize:11,color:"var(--sub)",letterSpacing:1.5,marginTop:3}}>BİLKENT ÜNİVERSİTESİ</div>
        </div>
        <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:24,padding:28,boxShadow:"0 4px 24px rgba(0,0,0,.08)"}}>
          <div style={{display:"flex",gap:20,marginBottom:24,borderBottom:"1px solid var(--border)",paddingBottom:12}}>
            {[["login","Giriş Yap"],["register","Kayıt Ol"]].map(([k,l])=>(
              <button key={k} className={`tab ${tab===k?"on":""}`} onClick={()=>{setTab(k);setErr("");setOk("")}}>{l}</button>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            {tab==="register"&&<>
              <div><div className="lbl">ADIN SOYADIN / ŞİRKET ADI</div><input className="inp" placeholder="Ali Yılmaz" value={name} onChange={e=>setName(e.target.value)}/></div>
              <div>
                <div className="lbl">HESAP TÜRÜ</div>
                <div style={{display:"flex",gap:10}}>
                  {[["ogrenci","🎓 Öğrenci"],["sirket","🏢 Şirket"]].map(([k,l])=>(
                    <button key={k} onClick={()=>setAccType(k)} style={{flex:1,padding:10,borderRadius:12,border:`2px solid ${accType===k?"#6366f1":"var(--border)"}`,background:accType===k?"#6366f111":"var(--card)",color:accType===k?"#6366f1":"var(--sub)",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontWeight:600,fontSize:13}}>{l}</button>
                  ))}
                </div>
              </div>
              {accType==="ogrenci"&&(
                <div>
                  <div className="lbl">BÖLÜM (opsiyonel)</div>
                  <select className="sel" value={dept} onChange={e=>setDept(e.target.value)}>
                    <option value="">Seç</option>
                    {DEPTS.map(d=><option key={d}>{d}</option>)}
                  </select>
                </div>
              )}
            </>}
            <div>
              <div className="lbl">{tab==="register"&&accType==="ogrenci"?"BİLKENT E-POSTA":"E-POSTA"}</div>
              <input className="inp" type="email" placeholder={tab==="register"&&accType==="ogrenci"?"ad.soyad@bilkent.edu.tr":"ornek@sirket.com"} value={email} onChange={e=>setEmail(e.target.value)}/>
            </div>
            <div>
              <div className="lbl">ŞİFRE</div>
              <input className="inp" type="password" placeholder={tab==="register"?"En az 6 karakter":"••••••••"} value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(tab==="login"?login():register())}/>
              {tab==="login"&&<button onClick={resetPassword} style={{background:"none",border:"none",color:"#6366f1",fontSize:12,cursor:"pointer",marginTop:6,padding:0,fontFamily:"'Plus Jakarta Sans'"}}>Şifremi unuttum</button>}
            </div>
            {err&&<div className="err">{err}</div>}
            {ok&&<div className="ok">{ok}</div>}
            <button className="pbtn" disabled={busy} onClick={tab==="login"?login:register}>{busy?<Spinner size={16}/>:tab==="login"?"Giriş Yap":"Kayıt Ol"}</button>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:14,fontSize:11,color:"var(--sub)"}}>Öğrenci hesabı için sadece @bilkent.edu.tr e-postası kabul edilir</div>
      </div>
    </div>
  )
}

// ── RESET PASSWORD ────────────────────────────────────────────────────────────
function ResetPassword({ onDone }) {
  const [pass,setPass]=useState(""),[confirm,setConfirm]=useState("")
  const [busy,setBusy]=useState(false),[err,setErr]=useState(""),[ok,setOk]=useState("")
  async function reset() {
    setErr("")
    if(pass.length<6) return setErr("Şifre en az 6 karakter olmalı.")
    if(pass!==confirm) return setErr("Şifreler eşleşmiyor.")
    setBusy(true)
    const {error}=await supabase.auth.updateUser({password:pass})
    setBusy(false)
    if(error) return setErr(error.message)
    setOk("✅ Şifren güncellendi!")
    setTimeout(()=>onDone(),2000)
  }
  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:400}} className="fu">
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{width:60,height:60,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:18,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
            <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:28,color:"#fff"}}>K</span>
          </div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,color:"var(--text)"}}>Yeni Şifre Belirle</div>
        </div>
        <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:24,padding:28}}>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div><div className="lbl">YENİ ŞİFRE</div><input className="inp" type="password" placeholder="En az 6 karakter" value={pass} onChange={e=>setPass(e.target.value)}/></div>
            <div><div className="lbl">ŞİFRE TEKRAR</div><input className="inp" type="password" placeholder="Tekrar gir" value={confirm} onChange={e=>setConfirm(e.target.value)} onKeyDown={e=>e.key==="Enter"&&reset()}/></div>
            {err&&<div className="err">{err}</div>}
            {ok&&<div className="ok">{ok}</div>}
            <button className="pbtn" disabled={busy} onClick={reset}>{busy?<Spinner size={16}/>:"Şifreyi Güncelle"}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
const NAV=[
  {section:"SOSYAL"},
  {key:"feed",icon:"🏠",label:"Ana Akış"},
  {key:"clubs",icon:"🎭",label:"Kulüpler"},
  {key:"events",icon:"📅",label:"Etkinlikler"},
  {section:"KİŞİSEL"},
  {key:"messages",icon:"💬",label:"Mesajlar"},
  {key:"notifications",icon:"🔔",label:"Bildirimler"},
  {key:"favorites",icon:"❤️",label:"Favoriler"},
  {section:"DİĞER"},
  {key:"listings",icon:"📋",label:"İlanlar"},
  {key:"search",icon:"🔍",label:"Keşfet & Ara"},
  {key:"profil",icon:"👤",label:"Profil"},
  {key:"settings",icon:"⚙️",label:"Ayarlar"},
]

function Sidebar({active,setActive,user,onLogout,unread,notifCount}) {
  return (
    <div className="sidebar">
      <div className="logo-area">
        <div className="logo-icon">K</div>
        <div><div className="logo-text">Kampüs</div><div className="logo-sub">BİLKENT</div></div>
      </div>
      <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:2}}>
        {NAV.map((n,i)=>n.section?(
          <div key={i} className="nav-section">{n.section}</div>
        ):(
          <button key={n.key} className={`nav-item ${active===n.key?"active":""}`} onClick={()=>setActive(n.key)}>
            <span className="nav-icon">{n.icon}</span>{n.label}
            {n.key==="messages"&&unread>0&&<span className="nav-badge">{unread}</span>}
            {n.key==="notifications"&&notifCount>0&&<span className="nav-badge">{notifCount}</span>}
          </button>
        ))}
      </div>
      <div style={{borderTop:"1px solid var(--border)",paddingTop:16}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",marginBottom:8}}>
          <Avatar name={user.name} src={user.avatar} size={32}/>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
            <div style={{fontSize:10,color:"var(--sub)"}}>{user.bolum||"Bilkent"}</div>
          </div>
        </div>
        <button className="nav-item" onClick={onLogout} style={{color:"#ef4444"}}><span className="nav-icon">🚪</span>Çıkış Yap</button>
      </div>
    </div>
  )
}

function BottomNav({active,setActive,unread,notifCount}) {
  const items=[
    {key:"feed",icon:"🏠"},{key:"clubs",icon:"🎭"},{key:"events",icon:"📅"},
    {key:"messages",icon:"💬",badge:unread},{key:"profil",icon:"👤"},
  ]
  return (
    <div className="bottom-nav">
      <div className="bottom-nav-inner">
        {items.map(n=>(
          <button key={n.key} className={`bnav-item ${active===n.key?"active":""}`} onClick={()=>setActive(n.key)}>
            <span className="bnav-icon">
              {n.icon}
              {n.badge>0&&<span style={{position:"absolute",top:-4,right:-6,background:"#ef4444",color:"#fff",fontSize:9,padding:"1px 4px",borderRadius:100,fontWeight:700}}>{n.badge}</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── USER PROFILE MODAL ────────────────────────────────────────────────────────
function UserProfileModal({ email, currentUser, onClose, onMessage }) {
  const [profile,setProfile]=useState(null),[posts,setPosts]=useState([])
  const [followStatus,setFollowStatus]=useState(null)
  const [followerCount,setFollowerCount]=useState(0),[followingCount,setFollowingCount]=useState(0)
  const [loading,setLoading]=useState(true)
  const isOwn=email===currentUser.email

  useEffect(()=>{load()},[email])

  async function load() {
    setLoading(true)
    const [{data:p},{data:ps},{data:myFollow},{data:followers},{data:following}]=await Promise.all([
      supabase.from("profiles").select("*").eq("email",email).single(),
      supabase.from("social_posts").select("*").eq("user_email",email).order("created_at",{ascending:false}).limit(3),
      supabase.from("follows").select("*").eq("follower_email",currentUser.email).eq("following_email",email).maybeSingle(),
      supabase.from("follows").select("id").eq("following_email",email).eq("status","accepted"),
      supabase.from("follows").select("id").eq("follower_email",email).eq("status","accepted"),
    ])
    setProfile(p||{name:email.split("@")[0],email})
    setPosts(ps||[]);setFollowStatus(myFollow?.status||null)
    setFollowerCount(followers?.length||0);setFollowingCount(following?.length||0)
    setLoading(false)
  }

  async function handleFollow() {
    if(followStatus==="accepted"){
      await supabase.from("follows").delete().eq("follower_email",currentUser.email).eq("following_email",email)
      setFollowStatus(null);setFollowerCount(c=>c-1)
    } else if(!followStatus){
      await supabase.from("follows").insert({follower_email:currentUser.email,follower_name:currentUser.name,following_email:email,following_name:profile.name,status:"pending"})
      setFollowStatus("pending")
    }
  }

  return (
    <div className="ovl" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mdl fu" style={{maxWidth:420}}>
        {loading?<div style={{textAlign:"center",padding:40}}><Spinner/></div>:(
          <>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:20}}>
              <Avatar name={profile.name} src={profile.avatar_url} size={80}/>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:20,marginTop:12,color:"var(--text)"}}>{profile.name}</div>
              {profile.username&&<div style={{fontSize:12,color:"#6366f1",marginTop:2}}>@{profile.username}</div>}
              {profile.bolum&&<div style={{fontSize:13,color:"#6366f1",fontWeight:500,marginTop:4}}>{profile.bolum}{profile.sinif?` · ${profile.sinif}. Sınıf`:""}</div>}
              <div style={{fontSize:11,color:"var(--sub)",marginTop:4}}>{profile.account_type==="sirket"?"🏢 Şirket":"🎓 Öğrenci"} · {joinYear(profile.created_at)}'den beri üye</div>
              {profile.bio&&<div style={{fontSize:13,color:"var(--sub)",textAlign:"center",lineHeight:1.6,marginTop:10,padding:"0 8px"}}>{profile.bio}</div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
              {[["Gönderi",posts.length],["Takipçi",followerCount],["Takip",followingCount]].map(([l,v])=>(
                <div key={l} className="stat-card"><div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:20,color:"#6366f1"}}>{v}</div><div style={{fontSize:11,color:"var(--sub)"}}>{l}</div></div>
              ))}
            </div>
            {!isOwn&&(
              <div style={{display:"flex",gap:10,marginBottom:16}}>
                <button className="pbtn" style={{flex:1,opacity:followStatus==="pending"?.6:1}} onClick={handleFollow} disabled={followStatus==="pending"}>
                  {followStatus==="accepted"?"✓ Takip Ediliyor":followStatus==="pending"?"⏳ İstek Gönderildi":"Takip Et"}
                </button>
                <button className="obtn" style={{flex:1}} onClick={()=>{onMessage(profile);onClose()}}>💬 Mesaj</button>
              </div>
            )}
            <button className="gbtn" onClick={onClose}>Kapat</button>
          </>
        )}
      </div>
    </div>
  )
}

// ── SOCIAL POST CARD ──────────────────────────────────────────────────────────
function SocialPostCard({p,user,onUserClick,i=0,onDelete}) {
  const [liked,setLiked]=useState((p.likes||[]).includes(user.email))
  const [likeCount,setLikeCount]=useState((p.likes||[]).length)
  const [showComments,setShowComments]=useState(false)
  const [comments,setComments]=useState([])
  const [commentText,setCommentText]=useState("")
  const [commentCount,setCommentCount]=useState(p.comment_count||0)
  const [loadingComments,setLoadingComments]=useState(false)
  const [lightbox,setLightbox]=useState(false)
  const [copied,setCopied]=useState(false)
  const mine=p.user_email===user.email

  async function toggleLike() {
    const likes=p.likes||[]
    const nl=likes.includes(user.email)?likes.filter(e=>e!==user.email):[...likes,user.email]
    setLiked(!liked);setLikeCount(nl.length)
    await supabase.from("social_posts").update({likes:nl}).eq("id",p.id)
  }

  async function loadComments() {
    setLoadingComments(true)
    const {data}=await supabase.from("comments").select("*").eq("post_id",p.id).order("created_at",{ascending:true})
    setComments(data||[]);setLoadingComments(false)
  }

  async function addComment() {
    if(!commentText.trim()) return
    await supabase.from("comments").insert({post_id:p.id,user_email:user.email,user_name:user.name,content:commentText})
    await supabase.from("social_posts").update({comment_count:commentCount+1}).eq("id",p.id)
    setCommentCount(c=>c+1);setCommentText("")
    loadComments()
  }

  function toggleComments() {
    setShowComments(!showComments)
    if(!showComments&&comments.length===0) loadComments()
  }

  function copyLink() {
    navigator.clipboard.writeText(`${window.location.origin}?post=${p.id}`)
    setCopied(true);setTimeout(()=>setCopied(false),2000)
  }

  return (
    <div className="card fu" style={{animationDelay:`${i*.04}s`,marginBottom:2}}>
      {lightbox&&<Lightbox src={p.image_url} onClose={()=>setLightbox(false)}/>}
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
        <div style={{cursor:"pointer"}} onClick={()=>onUserClick(p.user_email)}>
          <Avatar name={p.user_name} src={p.avatar_url} size={40}/>
        </div>
        <div style={{flex:1,cursor:"pointer"}} onClick={()=>onUserClick(p.user_email)}>
          <div style={{fontWeight:600,fontSize:14,color:"var(--text)"}}>{p.user_name}</div>
          <div style={{fontSize:11,color:"var(--sub)"}}>{p.dept&&`${p.dept} · `}{ago(p.created_at)}</div>
        </div>
        {mine&&<button onClick={()=>onDelete(p.id)} style={{background:"none",border:"none",color:"var(--sub)",cursor:"pointer",fontSize:16,padding:4,transition:"color .2s"}} onMouseOver={e=>e.target.style.color="#ef4444"} onMouseOut={e=>e.target.style.color="var(--sub)"}>🗑</button>}
      </div>
      {/* Content */}
      <div style={{fontSize:14,color:"var(--text)",lineHeight:1.7,marginBottom:p.image_url?0:12,whiteSpace:"pre-wrap"}}>{p.content}</div>
      {p.image_url&&<img src={p.image_url} alt="" className="post-img" onClick={()=>setLightbox(true)}/>}
      {/* Actions */}
      <div style={{display:"flex",gap:8,alignItems:"center",paddingTop:10,borderTop:"1px solid var(--border)",marginTop:4}}>
        <button className={`likebtn ${liked?"on":""}`} onClick={toggleLike}>
          {liked?"❤️":"🤍"} {likeCount}
        </button>
        <button className="likebtn" onClick={toggleComments}>
          💬 {commentCount}
        </button>
        <button className="copybtn" onClick={copyLink}>{copied?"✅":"🔗"}</button>
      </div>
      {/* Comments */}
      {showComments&&(
        <div style={{marginTop:12,borderTop:"1px solid var(--border)",paddingTop:12}}>
          {loadingComments?<div style={{textAlign:"center",padding:20}}><Spinner size={20}/></div>:(
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:12}}>
              {comments.length===0&&<div style={{fontSize:13,color:"var(--sub)",textAlign:"center"}}>Henüz yorum yok.</div>}
              {comments.map(c=>(
                <div key={c.id} style={{display:"flex",gap:8}}>
                  <Avatar name={c.user_name} size={28}/>
                  <div style={{background:"var(--inp)",borderRadius:12,padding:"8px 12px",flex:1}}>
                    <div style={{fontSize:12,fontWeight:600,color:"var(--text)",marginBottom:2}}>{c.user_name}</div>
                    <div style={{fontSize:13,color:"var(--text)"}}>{c.content}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{display:"flex",gap:8}}>
            <Avatar name={user.name} src={user.avatar} size={32}/>
            <input className="comment-inp" placeholder="Yorum yaz..." value={commentText} onChange={e=>setCommentText(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addComment()}/>
            <button onClick={addComment} disabled={!commentText.trim()} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:100,padding:"0 16px",cursor:"pointer",fontWeight:600,fontSize:13}}>→</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── FEED PAGE ─────────────────────────────────────────────────────────────────
function FeedPage({user,onUserClick}) {
  const [posts,setPosts]=useState([]),[loading,setLoading]=useState(true)
  const [modal,setModal]=useState(false),[posting,setPosting]=useState(false)
  const [content,setContent]=useState(""),[imageFile,setImageFile]=useState(null),[imagePreview,setImagePreview]=useState(null)
  const [deptFilter,setDeptFilter]=useState(""),[tab,setTab]=useState("all")
  const imgRef=useRef()

  useEffect(()=>{load()},[])

  async function load() {
    setLoading(true)
    const {data}=await supabase.from("social_posts").select("*").order("created_at",{ascending:false}).limit(40)
    setPosts(data||[]);setLoading(false)
  }

  async function addPost() {
    if(!content.trim()) return
    setPosting(true)
    let image_url=null
    if(imageFile){
      const path=`${user.id}_${Date.now()}.${imageFile.name.split(".").pop()}`
      await supabase.storage.from("post-images").upload(path,imageFile)
      const {data}=supabase.storage.from("post-images").getPublicUrl(path)
      image_url=data.publicUrl
    }
    const {data:profile}=await supabase.from("profiles").select("bolum").eq("id",user.id).single()
    const {data,error}=await supabase.from("social_posts").insert({
      user_id:user.id,user_email:user.email,user_name:user.name,
      content,image_url,likes:[],comment_count:0,dept:profile?.bolum||""
    }).select().single()
    if(!error) setPosts(prev=>[data,...prev])
    setContent("");setImageFile(null);setImagePreview(null);setModal(false);setPosting(false)
  }

  async function deletePost(id) {
    if(!confirm("Bu gönderiyi silmek istiyor musun?")) return
    await supabase.from("social_posts").delete().eq("id",id)
    setPosts(prev=>prev.filter(p=>p.id!==id))
  }

  function handleImage(e) {
    const file=e.target.files?.[0];if(!file) return
    setImageFile(file)
    const reader=new FileReader()
    reader.onload=ev=>setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const shown=posts.filter(p=>
    (tab==="all"||(tab==="following"&&true))&&
    (!deptFilter||p.dept===deptFilter)
  )

  return (
    <div className="page">
      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,color:"var(--text)"}}>Merhaba, {user.name.split(" ")[0]} 👋</div>
          <div style={{fontSize:13,color:"var(--sub)",marginTop:2}}>Kampüste neler oluyor?</div>
        </div>
        <button className="sbtn" onClick={()=>setModal(true)}>+ Paylaş</button>
      </div>

      {/* Gönderi oluştur kutusu (hızlı) */}
      <div className="card" style={{marginBottom:20,cursor:"pointer"}} onClick={()=>setModal(true)}>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <Avatar name={user.name} src={user.avatar} size={40}/>
          <div style={{flex:1,background:"var(--inp)",borderRadius:100,padding:"10px 16px",fontSize:14,color:"var(--sub)"}}>
            Ne düşünüyorsun?
          </div>
          <label onClick={e=>e.stopPropagation()} style={{cursor:"pointer"}}>
            <input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{handleImage(e);setModal(true)}}/>
            <span style={{fontSize:20}}>📷</span>
          </label>
        </div>
      </div>

      {/* Bölüm filtresi */}
      <div style={{display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4}}>
        <button className={`catbtn ${!deptFilter?"on":""}`} onClick={()=>setDeptFilter("")}>✦ Hepsi</button>
        {DEPTS.slice(0,6).map(d=>(
          <button key={d} className={`catbtn ${deptFilter===d?"on":""}`} onClick={()=>setDeptFilter(deptFilter===d?"":d)}>
            {d.length>12?d.slice(0,12)+"...":d}
          </button>
        ))}
      </div>

      {loading?<div style={{textAlign:"center",padding:60}}><Spinner/></div>
      :shown.length===0?<Empty icon="🌟" text="Henüz gönderi yok. İlk paylaşımı sen yap!"/>
      :<div style={{display:"flex",flexDirection:"column",gap:12}}>
        {shown.map((p,i)=><SocialPostCard key={p.id} p={p} user={user} i={i} onUserClick={onUserClick} onDelete={deletePost}/>)}
      </div>}

      {/* Paylaşım modal */}
      {modal&&(
        <div className="ovl" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="mdl fu">
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:20,color:"var(--text)"}}>Yeni Gönderi</div>
            <div style={{display:"flex",gap:12,marginBottom:16}}>
              <Avatar name={user.name} src={user.avatar} size={44}/>
              <textarea className="inp" placeholder="Ne düşünüyorsun?" rows={5} style={{resize:"none",flex:1,borderRadius:16}} value={content} onChange={e=>setContent(e.target.value)} autoFocus/>
            </div>
            {imagePreview&&(
              <div style={{position:"relative",marginBottom:12}}>
                <img src={imagePreview} alt="" style={{width:"100%",maxHeight:200,objectFit:"cover",borderRadius:12}}/>
                <button onClick={()=>{setImageFile(null);setImagePreview(null)}} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.6)",color:"#fff",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer",fontSize:14}}>✕</button>
              </div>
            )}
            <div style={{display:"flex",gap:10,marginTop:4}}>
              <label style={{display:"flex",alignItems:"center",gap:6,padding:"10px 16px",border:"1px solid var(--border)",borderRadius:12,cursor:"pointer",color:"var(--sub)",fontSize:13}}>
                <input type="file" accept="image/*" style={{display:"none"}} onChange={handleImage}/>
                📷 Fotoğraf
              </label>
              <div style={{flex:1}}/>
              <button className="gbtn" style={{width:"auto",padding:"10px 20px"}} onClick={()=>setModal(false)}>İptal</button>
              <button className="pbtn" style={{width:"auto",padding:"10px 24px"}} disabled={posting||!content.trim()} onClick={addPost}>{posting?<Spinner size={16}/>:"Paylaş"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── CLUBS PAGE ────────────────────────────────────────────────────────────────
function ClubsPage({user}) {
  const [clubs,setClubs]=useState([]),[loading,setLoading]=useState(true)
  const [activeClub,setActiveClub]=useState(null)
  const [modal,setModal]=useState(false),[catFilter,setCatFilter]=useState("")
  const [form,setForm]=useState({name:"",desc:"",category:"Diğer"}),[posting,setPosting]=useState(false)

  useEffect(()=>{loadClubs()},[])

  async function loadClubs() {
    setLoading(true)
    const {data}=await supabase.from("communities").select("*, community_members(user_email)").order("member_count",{ascending:false})
    setClubs(data||[]);setLoading(false)
  }

  async function createClub() {
    if(!form.name.trim()) return
    setPosting(true)
    const {data,error}=await supabase.from("communities").insert({name:form.name,description:form.desc,category:form.category,created_by:user.email,member_count:1}).select().single()
    if(!error){
      await supabase.from("community_members").insert({community_id:data.id,user_email:user.email,role:"admin"})
      setClubs(prev=>[{...data,community_members:[{user_email:user.email}]},...prev])
    }
    setForm({name:"",desc:"",category:"Diğer"});setModal(false);setPosting(false)
  }

  const shown=clubs.filter(c=>!catFilter||c.category===catFilter)

  if(activeClub) return <ClubDetail club={activeClub} user={user} onBack={()=>{setActiveClub(null);loadClubs()}}/>

  return (
    <div className="page">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,color:"var(--text)"}}>Kulüpler 🎭</div>
          <div style={{fontSize:13,color:"var(--sub)",marginTop:2}}>Toplulukları keşfet, duyurulardan haberdar ol</div>
        </div>
        <button className="sbtn" onClick={()=>setModal(true)}>+ Kulüp Oluştur</button>
      </div>

      {/* Kategori filtre */}
      <div style={{display:"flex",gap:8,marginBottom:20,overflowX:"auto",paddingBottom:4}}>
        <button className={`catbtn ${!catFilter?"on":""}`} onClick={()=>setCatFilter("")}>✦ Tümü</button>
        {CLUB_CATS.map(c=><button key={c} className={`catbtn ${catFilter===c?"on":""}`} onClick={()=>setCatFilter(catFilter===c?"":c)}>{c}</button>)}
      </div>

      {loading?<div style={{textAlign:"center",padding:60}}><Spinner/></div>
      :shown.length===0?<Empty icon="🎭" text="Henüz kulüp yok."/>
      :(
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
          {shown.map(club=>{
            const isMember=(club.community_members||[]).some(m=>m.user_email===user.email)
            return (
              <div key={club.id} className="club-card" onClick={()=>setActiveClub(club)}>
                <div style={{height:80,background:`linear-gradient(135deg,#6366f1,#8b5cf6)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:36}}>
                  {club.category==="Spor"?"⚽":club.category==="Müzik"?"🎵":club.category==="Teknoloji"?"💻":club.category==="Sanat"?"🎨":club.category==="Bilim"?"🔬":"🎭"}
                </div>
                <div style={{padding:16}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:15,color:"var(--text)"}}>{club.name}</div>
                    {isMember&&<span className="bdg" style={{background:"#6366f111",color:"#6366f1",fontSize:10}}>✓ Üye</span>}
                  </div>
                  <div style={{fontSize:12,color:"var(--sub)",marginBottom:10,lineHeight:1.5}}>{club.description||"Kulüp açıklaması yok."}</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <span className="bdg" style={{background:"#f0fdf4",color:"#059669",fontSize:11}}>{club.category}</span>
                    <span style={{fontSize:12,color:"var(--sub)"}}>👥 {club.member_count||0} üye</span>
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
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:4,color:"var(--text)"}}>Kulüp Oluştur</div>
            <div style={{fontSize:13,color:"var(--sub)",marginBottom:24}}>Yeni bir topluluk başlat</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><div className="lbl">KULÜP ADI</div><input className="inp" placeholder="Örn: Bilkent Yazılım Topluluğu" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
              <div><div className="lbl">AÇIKLAMA</div><textarea className="inp" placeholder="Kulübünüz hakkında..." rows={3} style={{resize:"vertical"}} value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))}/></div>
              <div><div className="lbl">KATEGORİ</div>
                <select className="sel" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                  {CLUB_CATS.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button className="gbtn" style={{flex:1}} onClick={()=>setModal(false)}>İptal</button>
                <button className="pbtn" style={{flex:2}} disabled={posting||!form.name.trim()} onClick={createClub}>{posting?<Spinner size={16}/>:"Oluştur"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── CLUB DETAIL ───────────────────────────────────────────────────────────────
function ClubDetail({club,user,onBack}) {
  const [tab,setTab]=useState("announcements")
  const [members,setMembers]=useState([]),[announcements,setAnnouncements]=useState([])
  const [isMember,setIsMember]=useState(false),[isMuted,setIsMuted]=useState(false)
  const [isAdmin,setIsAdmin]=useState(false)
  const [loading,setLoading]=useState(true)
  const [postModal,setPostModal]=useState(false)
  const [postContent,setPostContent]=useState(""),[posting,setPosting]=useState(false)
  const [chatMsgs,setChatMsgs]=useState([]),[chatInput,setChatInput]=useState("")
  const chatRef=useRef(),channelRef=useRef()

  useEffect(()=>{loadAll()},[club.id])
  useEffect(()=>{
    if(tab==="chat"&&isMember){
      loadChat()
      channelRef.current=supabase.channel(`club-${club.id}`)
        .on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:`to_email=eq.club_${club.id}`},(payload)=>{
          setChatMsgs(prev=>[...prev,payload.new])
        }).subscribe()
      return ()=>supabase.removeChannel(channelRef.current)
    }
  },[tab,isMember])
  useEffect(()=>{chatRef.current?.scrollIntoView({behavior:"smooth"})},[chatMsgs])

  async function loadAll() {
    setLoading(true)
    const [{data:ms},{data:anns},{data:myMembership}]=await Promise.all([
      supabase.from("community_members").select("*").eq("community_id",club.id),
      supabase.from("social_posts").select("*").eq("community_id",club.id).order("created_at",{ascending:false}),
      supabase.from("community_members").select("*").eq("community_id",club.id).eq("user_email",user.email).maybeSingle(),
    ])
    setMembers(ms||[]);setAnnouncements(anns||[])
    setIsMember(!!myMembership);setIsAdmin(myMembership?.role==="admin")
    setIsMuted(myMembership?.muted||false)
    setLoading(false)
  }

  async function loadChat() {
    const {data}=await supabase.from("messages").select("*").eq("to_email",`club_${club.id}`).order("created_at",{ascending:true})
    setChatMsgs(data||[])
  }

  async function joinLeave() {
    if(isMember){
      await supabase.from("community_members").delete().eq("community_id",club.id).eq("user_email",user.email)
      await supabase.from("communities").update({member_count:Math.max(0,(club.member_count||1)-1)}).eq("id",club.id)
      setIsMember(false);setMembers(prev=>prev.filter(m=>m.user_email!==user.email))
    } else {
      await supabase.from("community_members").insert({community_id:club.id,user_email:user.email,role:"member"})
      await supabase.from("communities").update({member_count:(club.member_count||0)+1}).eq("id",club.id)
      setIsMember(true);setMembers(prev=>[...prev,{user_email:user.email,role:"member"}])
    }
  }

  async function toggleMute() {
    await supabase.from("community_members").update({muted:!isMuted}).eq("community_id",club.id).eq("user_email",user.email)
    setIsMuted(!isMuted)
  }

  async function postAnnouncement() {
    if(!postContent.trim()) return
    setPosting(true)
    const {data,error}=await supabase.from("social_posts").insert({
      user_id:user.id,user_email:user.email,user_name:user.name,
      content:postContent,community_id:club.id,likes:[],comment_count:0
    }).select().single()
    if(!error) setAnnouncements(prev=>[data,...prev])
    setPostContent("");setPostModal(false);setPosting(false)
  }

  async function sendChat() {
    if(!chatInput.trim()||!isMember) return
    await supabase.from("messages").insert({from_email:user.email,from_name:user.name,to_email:`club_${club.id}`,to_name:club.name,content:chatInput,read:true})
    setChatInput("")
  }

  return (
    <div className="page">
      {/* Back */}
      <button onClick={onBack} style={{background:"none",border:"none",color:"var(--sub)",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:6,marginBottom:16,fontFamily:"'Plus Jakarta Sans'"}}>← Kulüplere Dön</button>

      {/* Club header */}
      <div style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:20,padding:24,marginBottom:20,color:"#fff"}}>
        <div style={{fontSize:40,marginBottom:12}}>
          {club.category==="Spor"?"⚽":club.category==="Müzik"?"🎵":club.category==="Teknoloji"?"💻":club.category==="Sanat"?"🎨":club.category==="Bilim"?"🔬":"🎭"}
        </div>
        <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:24,marginBottom:6}}>{club.name}</div>
        <div style={{fontSize:13,opacity:.85,marginBottom:16}}>{club.description}</div>
        <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
          <span style={{fontSize:13,opacity:.8}}>👥 {members.length} üye</span>
          <span className="bdg" style={{background:"rgba(255,255,255,.2)",color:"#fff"}}>{club.category}</span>
          <div style={{flex:1}}/>
          <button onClick={joinLeave} style={{background:isMember?"rgba(255,255,255,.2)":"#fff",color:isMember?"#fff":"#6366f1",border:"2px solid rgba(255,255,255,.5)",borderRadius:100,padding:"7px 20px",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontWeight:600,fontSize:13}}>
            {isMember?"✓ Üyesin":"Katıl"}
          </button>
          {isMember&&(
            <button onClick={toggleMute} style={{background:"rgba(255,255,255,.15)",color:"#fff",border:"1px solid rgba(255,255,255,.3)",borderRadius:100,padding:"7px 14px",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontSize:12}}>
              {isMuted?"🔔 Aç":"🔕 Sustur"}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,marginBottom:20,background:"var(--inp)",borderRadius:12,padding:4}}>
        {[["announcements","📢 Duyurular"],["events","📅 Etkinlikler"],["chat","💬 Sohbet"],["members","👥 Üyeler"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{flex:1,background:tab===k?"var(--card)":"transparent",border:"none",borderRadius:10,padding:"8px 4px",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontSize:12,fontWeight:tab===k?600:400,color:tab===k?"#6366f1":"var(--sub)",transition:"all .2s"}}>
            {l}
          </button>
        ))}
      </div>

      {loading?<div style={{textAlign:"center",padding:60}}><Spinner/></div>:(
        <>
          {/* Duyurular */}
          {tab==="announcements"&&(
            <div>
              {(isAdmin)&&(
                <button className="pbtn" style={{marginBottom:16}} onClick={()=>setPostModal(true)}>📢 Duyuru Yap</button>
              )}
              {announcements.length===0?<Empty icon="📢" text="Henüz duyuru yok."/>:(
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {announcements.map((a,i)=>(
                    <div key={a.id} className="card">
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                        <Avatar name={a.user_name} size={36}/>
                        <div>
                          <div style={{fontWeight:600,fontSize:14,color:"var(--text)"}}>{a.user_name}</div>
                          <div style={{fontSize:11,color:"var(--sub)"}}>{ago(a.created_at)}</div>
                        </div>
                      </div>
                      <div style={{fontSize:14,color:"var(--text)",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{a.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Etkinlikler */}
          {tab==="events"&&<ClubEvents clubId={club.id} user={user} isAdmin={isAdmin} isMember={isMember}/>}

          {/* Sohbet */}
          {tab==="chat"&&(
            isMember?(
              <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,overflow:"hidden"}}>
                <div style={{height:400,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:8}}>
                  {chatMsgs.length===0&&<div style={{textAlign:"center",color:"var(--sub)",fontSize:13,padding:20}}>Sohbet başlamadı. İlk mesajı sen gönder!</div>}
                  {chatMsgs.map(m=>(
                    <div key={m.id} style={{display:"flex",gap:8,alignItems:"flex-start",flexDirection:m.from_email===user.email?"row-reverse":"row"}}>
                      <Avatar name={m.from_name} size={28}/>
                      <div>
                        {m.from_email!==user.email&&<div style={{fontSize:11,color:"var(--sub)",marginBottom:2}}>{m.from_name}</div>}
                        <div className={`msg-bubble ${m.from_email===user.email?"mine":"theirs"}`}>{m.content}</div>
                        <div style={{fontSize:10,color:"var(--sub)",marginTop:2,textAlign:m.from_email===user.email?"right":"left"}}>{ago(m.created_at)}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={chatRef}/>
                </div>
                <div style={{padding:12,borderTop:"1px solid var(--border)",display:"flex",gap:8}}>
                  <input className="comment-inp" style={{borderRadius:12,padding:"10px 16px"}} placeholder="Mesaj yaz..." value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()}/>
                  <button onClick={sendChat} disabled={!chatInput.trim()} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:12,padding:"0 20px",cursor:"pointer",fontWeight:600}}>→</button>
                </div>
              </div>
            ):<div style={{textAlign:"center",padding:40,color:"var(--sub)"}}>
              <div style={{fontSize:40,marginBottom:12}}>🔒</div>
              <div style={{fontSize:14,marginBottom:16}}>Sohbete katılmak için önce kulübe üye ol.</div>
              <button className="pbtn" style={{maxWidth:200,margin:"0 auto"}} onClick={joinLeave}>Katıl</button>
            </div>
          )}

          {/* Üyeler */}
          {tab==="members"&&(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {members.map(m=>(
                <div key={m.user_email} style={{display:"flex",alignItems:"center",gap:12,padding:14,background:"var(--card)",border:"1px solid var(--border)",borderRadius:14}}>
                  <Avatar name={m.user_email.split("@")[0]} size={40}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:500,fontSize:14,color:"var(--text)"}}>{m.user_email.split("@")[0]}</div>
                    <div style={{fontSize:11,color:"var(--sub)"}}>{m.user_email}</div>
                  </div>
                  {m.role==="admin"&&<span className="bdg" style={{background:"#fef3c7",color:"#d97706"}}>Admin</span>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Duyuru modal */}
      {postModal&&(
        <div className="ovl" onClick={e=>e.target===e.currentTarget&&setPostModal(false)}>
          <div className="mdl fu">
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:20,color:"var(--text)"}}>📢 Duyuru Yap</div>
            <textarea className="inp" placeholder="Duyurunuzu yazın..." rows={6} style={{resize:"vertical",marginBottom:16}} value={postContent} onChange={e=>setPostContent(e.target.value)} autoFocus/>
            <div style={{display:"flex",gap:10}}>
              <button className="gbtn" style={{flex:1}} onClick={()=>setPostModal(false)}>İptal</button>
              <button className="pbtn" style={{flex:2}} disabled={posting||!postContent.trim()} onClick={postAnnouncement}>{posting?<Spinner size={16}/>:"Yayınla"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── CLUB EVENTS ───────────────────────────────────────────────────────────────
function ClubEvents({clubId,user,isAdmin,isMember}) {
  const [events,setEvents]=useState([]),[loading,setLoading]=useState(true)
  const [modal,setModal]=useState(false),[posting,setPosting]=useState(false)
  const [form,setForm]=useState({title:"",desc:"",location:"",date:""})

  useEffect(()=>{
    (async()=>{
      setLoading(true)
      const {data}=await supabase.from("events").select("*").eq("community_id",clubId).order("event_date",{ascending:true})
      setEvents(data||[]);setLoading(false)
    })()
  },[clubId])

  async function createEvent() {
    if(!form.title.trim()||!form.date) return
    setPosting(true)
    const {data,error}=await supabase.from("events").insert({
      title:form.title,description:form.desc,location:form.location,
      event_date:form.date,created_by:user.email,created_by_name:user.name,
      community_id:clubId,attendees:[]
    }).select().single()
    if(!error) setEvents(prev=>[...prev,data].sort((a,b)=>new Date(a.event_date)-new Date(b.event_date)))
    setForm({title:"",desc:"",location:"",date:""});setModal(false);setPosting(false)
  }

  async function toggleAttend(event) {
    const att=event.attendees||[]
    const na=att.includes(user.email)?att.filter(e=>e!==user.email):[...att,user.email]
    await supabase.from("events").update({attendees:na}).eq("id",event.id)
    setEvents(prev=>prev.map(e=>e.id===event.id?{...e,attendees:na}:e))
  }

  return (
    <div>
      {isAdmin&&<button className="pbtn" style={{marginBottom:16}} onClick={()=>setModal(true)}>📅 Etkinlik Oluştur</button>}
      {loading?<div style={{textAlign:"center",padding:40}}><Spinner/></div>
      :events.length===0?<Empty icon="📅" text="Henüz etkinlik yok."/>:(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {events.map(ev=>{
            const attending=(ev.attendees||[]).includes(user.email)
            const isPast=new Date(ev.event_date)<new Date()
            return (
              <div key={ev.id} className="event-card" style={{opacity:isPast?.6:1}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:"var(--text)",marginBottom:4}}>{ev.title}</div>
                    <div style={{fontSize:13,color:"#6366f1",fontWeight:500,marginBottom:6}}>📅 {fmtDate(ev.event_date)}</div>
                    {ev.location&&<div style={{fontSize:13,color:"var(--sub)",marginBottom:6}}>📍 {ev.location}</div>}
                    {ev.description&&<div style={{fontSize:13,color:"var(--sub)",lineHeight:1.6,marginBottom:10}}>{ev.description}</div>}
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{fontSize:12,color:"var(--sub)"}}>👤 {(ev.attendees||[]).length} katılımcı</span>
                      {!isPast&&isMember&&(
                        <button onClick={()=>toggleAttend(ev)} style={{background:attending?"#6366f111":"linear-gradient(135deg,#6366f1,#8b5cf6)",color:attending?"#6366f1":"#fff",border:attending?"2px solid #6366f1":"none",borderRadius:100,padding:"6px 16px",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontWeight:600,fontSize:12}}>
                          {attending?"✓ Katılıyorum":"Katıl"}
                        </button>
                      )}
                    </div>
                  </div>
                  {isPast&&<span className="bdg" style={{background:"var(--inp)",color:"var(--sub)"}}>Geçti</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal&&(
        <div className="ovl" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="mdl fu">
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:4,color:"var(--text)"}}>Etkinlik Oluştur</div>
            <div style={{fontSize:13,color:"var(--sub)",marginBottom:20}}>Kulüp üyelerine duyur</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><div className="lbl">ETKİNLİK ADI</div><input className="inp" placeholder="Örn: Haftalık Toplantı" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
              <div><div className="lbl">TARİH & SAAT</div><input className="inp" type="datetime-local" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
              <div><div className="lbl">KONUM</div><input className="inp" placeholder="Örn: SA-Z01 Salonu" value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))}/></div>
              <div><div className="lbl">AÇIKLAMA</div><textarea className="inp" placeholder="Etkinlik detayları..." rows={3} style={{resize:"vertical"}} value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))}/></div>
              <div style={{display:"flex",gap:10}}>
                <button className="gbtn" style={{flex:1}} onClick={()=>setModal(false)}>İptal</button>
                <button className="pbtn" style={{flex:2}} disabled={posting||!form.title.trim()||!form.date} onClick={createEvent}>{posting?<Spinner size={16}/>:"Oluştur"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── EVENTS PAGE ───────────────────────────────────────────────────────────────
function EventsPage({user}) {
  const [events,setEvents]=useState([]),[loading,setLoading]=useState(true)
  const [modal,setModal]=useState(false),[posting,setPosting]=useState(false)
  const [form,setForm]=useState({title:"",desc:"",location:"",date:""})

  useEffect(()=>{
    (async()=>{
      setLoading(true)
      const {data}=await supabase.from("events").select("*,communities(name)").order("event_date",{ascending:true})
      setEvents(data||[]);setLoading(false)
    })()
  },[])

  async function createEvent() {
    if(!form.title.trim()||!form.date) return
    setPosting(true)
    const {data,error}=await supabase.from("events").insert({title:form.title,description:form.desc,location:form.location,event_date:form.date,created_by:user.email,created_by_name:user.name,attendees:[]}).select().single()
    if(!error) setEvents(prev=>[...prev,data].sort((a,b)=>new Date(a.event_date)-new Date(b.event_date)))
    setForm({title:"",desc:"",location:"",date:""});setModal(false);setPosting(false)
  }

  async function toggleAttend(event) {
    const att=event.attendees||[]
    const na=att.includes(user.email)?att.filter(e=>e!==user.email):[...att,user.email]
    await supabase.from("events").update({attendees:na}).eq("id",event.id)
    setEvents(prev=>prev.map(e=>e.id===event.id?{...e,attendees:na}:e))
  }

  const upcoming=events.filter(e=>new Date(e.event_date)>=new Date())
  const past=events.filter(e=>new Date(e.event_date)<new Date())

  return (
    <div className="page">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,color:"var(--text)"}}>Etkinlikler 📅</div>
          <div style={{fontSize:13,color:"var(--sub)",marginTop:2}}>Kampüste bu hafta ne var?</div>
        </div>
        <button className="sbtn" onClick={()=>setModal(true)}>+ Etkinlik</button>
      </div>

      {loading?<div style={{textAlign:"center",padding:60}}><Spinner/></div>:(
        <>
          {upcoming.length>0&&(
            <>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:15,color:"var(--text)",marginBottom:12}}>Yaklaşan Etkinlikler</div>
              <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
                {upcoming.map(ev=>{
                  const attending=(ev.attendees||[]).includes(user.email)
                  return (
                    <div key={ev.id} className="event-card">
                      <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>
                        <div style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:12,padding:"10px 14px",textAlign:"center",minWidth:56,color:"#fff"}}>
                          <div style={{fontSize:20,fontWeight:700}}>{new Date(ev.event_date).getDate()}</div>
                          <div style={{fontSize:10,opacity:.8}}>{new Date(ev.event_date).toLocaleString("tr-TR",{month:"short"}).toUpperCase()}</div>
                        </div>
                        <div style={{flex:1}}>
                          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:"var(--text)",marginBottom:4}}>{ev.title}</div>
                          {ev.communities?.name&&<div style={{fontSize:12,color:"#6366f1",marginBottom:4}}>🎭 {ev.communities.name}</div>}
                          <div style={{fontSize:13,color:"var(--sub)",marginBottom:4}}>🕐 {new Date(ev.event_date).toLocaleString("tr-TR",{hour:"2-digit",minute:"2-digit"})}</div>
                          {ev.location&&<div style={{fontSize:13,color:"var(--sub)",marginBottom:8}}>📍 {ev.location}</div>}
                          {ev.description&&<div style={{fontSize:13,color:"var(--sub)",lineHeight:1.6,marginBottom:10}}>{ev.description}</div>}
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <span style={{fontSize:12,color:"var(--sub)"}}>👤 {(ev.attendees||[]).length} katılımcı</span>
                            <button onClick={()=>toggleAttend(ev)} style={{background:attending?"#6366f111":"linear-gradient(135deg,#6366f1,#8b5cf6)",color:attending?"#6366f1":"#fff",border:attending?"2px solid #6366f1":"none",borderRadius:100,padding:"6px 16px",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontWeight:600,fontSize:12}}>
                              {attending?"✓ Katılıyorum":"Katıl"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
          {upcoming.length===0&&<Empty icon="📅" text="Yaklaşan etkinlik yok."/>}
          {past.length>0&&(
            <>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:14,color:"var(--sub)",marginBottom:12}}>Geçmiş Etkinlikler</div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {past.slice(0,5).map(ev=>(
                  <div key={ev.id} style={{padding:"12px 16px",background:"var(--card)",border:"1px solid var(--border)",borderRadius:12,opacity:.6}}>
                    <div style={{fontWeight:600,fontSize:14,color:"var(--text)"}}>{ev.title}</div>
                    <div style={{fontSize:12,color:"var(--sub)",marginTop:3}}>{fmtDate(ev.event_date)} · 👤 {(ev.attendees||[]).length} katılımcı</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {modal&&(
        <div className="ovl" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="mdl fu">
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:4,color:"var(--text)"}}>Etkinlik Oluştur</div>
            <div style={{fontSize:13,color:"var(--sub)",marginBottom:20}}>Kampüse duyur</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><div className="lbl">ETKİNLİK ADI</div><input className="inp" placeholder="Örn: Bahar Konseri" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
              <div><div className="lbl">TARİH & SAAT</div><input className="inp" type="datetime-local" value={form.date} onChange={e=>setForm(p=>({...p,date:e.target.value}))}/></div>
              <div><div className="lbl">KONUM</div><input className="inp" placeholder="Örn: Amfi Tiyatro" value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))}/></div>
              <div><div className="lbl">AÇIKLAMA</div><textarea className="inp" placeholder="Etkinlik detayları..." rows={3} style={{resize:"vertical"}} value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))}/></div>
              <div style={{display:"flex",gap:10}}>
                <button className="gbtn" style={{flex:1}} onClick={()=>setModal(false)}>İptal</button>
                <button className="pbtn" style={{flex:2}} disabled={posting||!form.title.trim()||!form.date} onClick={createEvent}>{posting?<Spinner size={16}/>:"Oluştur"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── LISTINGS PAGE (İlanlar) ───────────────────────────────────────────────────
function ListingsPage({user,onUserClick}) {
  const [posts,setPosts]=useState([]),[filter,setFilter]=useState("all")
  const [search,setSearch]=useState(""),[location,setLocation]=useState("Tümü")
  const [tagFilter,setTagFilter]=useState(""),[myTab,setMyTab]=useState(false)
  const [modal,setModal]=useState(false),[stajModal,setStajModal]=useState(false)
  const [form,setForm]=useState({category:"ev",title:"",desc:"",location:"",tagInput:"",tags:[],imageFile:null,imagePreview:null})
  const [stajForm,setStajForm]=useState({title:"",desc:"",sirket:"",lokasyon:""})
  const [loading,setLoading]=useState(true),[posting,setPosting]=useState(false)

  useEffect(()=>{load()},[])

  async function load() {
    setLoading(true)
    const {data}=await supabase.from("posts").select("*").order("created_at",{ascending:false})
    setPosts(data||[]);setLoading(false)
  }

  async function toggleLike(post) {
    const nl=(post.likes||[]).includes(user.email)?(post.likes||[]).filter(e=>e!==user.email):[...(post.likes||[]),user.email]
    await supabase.from("posts").update({likes:nl}).eq("id",post.id)
    setPosts(prev=>prev.map(p=>p.id===post.id?{...p,likes:nl}:p))
  }

  async function toggleFav(post) {
    const nf=(post.favorited_by||[]).includes(user.email)?(post.favorited_by||[]).filter(e=>e!==user.email):[...(post.favorited_by||[]),user.email]
    await supabase.from("posts").update({favorited_by:nf}).eq("id",post.id)
    setPosts(prev=>prev.map(p=>p.id===post.id?{...p,favorited_by:nf}:p))
  }

  async function addPost() {
    if(!form.title.trim()||!form.desc.trim()) return
    setPosting(true)
    let image_url=null
    if(form.imageFile){
      const path=`${user.id}_${Date.now()}.${form.imageFile.name.split(".").pop()}`
      await supabase.storage.from("post-images").upload(path,form.imageFile)
      const {data}=supabase.storage.from("post-images").getPublicUrl(path)
      image_url=data.publicUrl
    }
    const {data,error}=await supabase.from("posts").insert({user_id:user.id,user_name:user.name,user_email:user.email,category:form.category,title:form.title,description:form.desc,location:form.location,tags:form.tags,likes:[],favorited_by:[],image_url}).select().single()
    if(!error) setPosts(prev=>[data,...prev])
    setForm({category:"ev",title:"",desc:"",location:"",tagInput:"",tags:[],imageFile:null,imagePreview:null})
    setModal(false);setPosting(false)
  }

  async function addStaj() {
    if(!stajForm.title.trim()||!stajForm.desc.trim()) return
    setPosting(true)
    const {data,error}=await supabase.from("posts").insert({user_id:user.id,user_name:stajForm.sirket||user.name,user_email:user.email,category:"staj",title:stajForm.title,description:`${stajForm.desc}${stajForm.lokasyon?"\n\n📍 "+stajForm.lokasyon:""}`,likes:[],favorited_by:[],tags:[],location:stajForm.lokasyon}).select().single()
    if(!error) setPosts(prev=>[data,...prev])
    setStajForm({title:"",desc:"",sirket:"",lokasyon:""});setStajModal(false);setPosting(false)
  }

  async function del(id) {
    if(!confirm("Bu ilanı silmek istiyor musun?")) return
    await supabase.from("posts").delete().eq("id",id)
    setPosts(prev=>prev.filter(p=>p.id!==id))
  }

  function addTag() {
    const tag=form.tagInput.trim().toLowerCase()
    if(tag&&!form.tags.includes(tag)&&form.tags.length<5) setForm(p=>({...p,tags:[...p.tags,tag],tagInput:""}))
  }

  function handleImage(e) {
    const file=e.target.files?.[0];if(!file) return
    setImageFile&&setImageFile(file)
    const reader=new FileReader()
    reader.onload=ev=>setForm(p=>({...p,imageFile:file,imagePreview:ev.target.result}))
    reader.readAsDataURL(file)
  }

  const shown=posts.filter(p=>
    (filter==="all"||p.category===filter)&&
    (location==="Tümü"||p.location===location)&&
    (!tagFilter||(p.tags||[]).includes(tagFilter))&&
    (p.title.toLowerCase().includes(search.toLowerCase())||(p.description||"").toLowerCase().includes(search.toLowerCase()))&&
    (!myTab||p.user_email===user.email)
  )

  const isSirket=user.account_type==="sirket"

  return (
    <div className="page">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,color:"var(--text)"}}>İlanlar 📋</div>
          <div style={{fontSize:13,color:"var(--sub)",marginTop:2}}>Ev, eşya, ders ve staj ilanları</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {isSirket?<button className="sbtn" onClick={()=>setStajModal(true)}>💼 Staj İlanı</button>
          :<button className="sbtn" onClick={()=>setModal(true)}>+ İlan Ver</button>}
        </div>
      </div>

      <div style={{position:"relative",marginBottom:14}}>
        <span style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:"var(--sub)",pointerEvents:"none"}}>🔍</span>
        <input className="srch" placeholder="İlan ara..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
        <select className="sel" style={{flex:1,minWidth:140,padding:"8px 12px",fontSize:13}} value={location} onChange={e=>setLocation(e.target.value)}>
          {LOCATIONS.map(l=><option key={l}>{l}</option>)}
        </select>
        {tagFilter&&(
          <div style={{display:"flex",alignItems:"center",gap:6,background:"#6366f111",border:"1px solid #6366f133",borderRadius:100,padding:"6px 14px"}}>
            <span style={{fontSize:13,color:"#6366f1",fontWeight:500}}>#{tagFilter}</span>
            <button onClick={()=>setTagFilter("")} style={{background:"none",border:"none",color:"#6366f1",cursor:"pointer",fontSize:14,padding:0}}>✕</button>
          </div>
        )}
      </div>

      <div style={{display:"flex",gap:20,borderBottom:"1px solid var(--border)",marginBottom:14}}>
        {[["Tümü",false],["İlanlarım",true]].map(([l,v])=>(
          <button key={String(v)} className={`tab ${myTab===v?"on":""}`} onClick={()=>setMyTab(v)}>{l}</button>
        ))}
      </div>

      <div style={{display:"flex",gap:8,marginBottom:18,overflowX:"auto",paddingBottom:4}}>
        <button className={`catbtn ${filter==="all"?"on":""}`} onClick={()=>setFilter("all")}>✦ Tümü</button>
        {Object.entries(CAT).map(([k,v])=>(
          <button key={k} className={`catbtn ${filter===k?"on":""}`} onClick={()=>setFilter(k)}>{v.emoji} {v.label}</button>
        ))}
      </div>

      {loading?<div style={{textAlign:"center",padding:60}}><Spinner/></div>
      :shown.length===0?<Empty icon="📋" text="Sonuç bulunamadı."/>
      :(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {shown.map((p,i)=>{
            const m=CAT[p.category]
            const liked=(p.likes||[]).includes(user.email)
            const faved=(p.favorited_by||[]).includes(user.email)
            const mine=p.user_email===user.email
            const [lightbox,setLightbox]=useState(false)
            const [copied,setCopied]=useState(false)
            return (
              <div key={p.id} className="card fu" style={{animationDelay:`${i*.04}s`}}>
                {lightbox&&<Lightbox src={p.image_url} onClose={()=>setLightbox(false)}/>}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
                  <span className="bdg" style={{background:m.color+"18",color:m.color}}>{m.emoji} {m.label}</span>
                  {p.location&&<span style={{fontSize:11,color:"var(--sub)"}}>📍 {p.location}</span>}
                  <span style={{fontSize:11,color:"var(--sub)"}}>{ago(p.created_at)}</span>
                  {mine&&<span className="bdg" style={{background:"#6366f111",color:"#6366f1"}}>Senin ilanın</span>}
                </div>
                <div style={{fontWeight:600,fontSize:15,marginBottom:6,color:"var(--text)"}}>{p.title}</div>
                <div style={{fontSize:13,color:"var(--sub)",lineHeight:1.65,marginBottom:p.image_url?0:10}}>{p.description}</div>
                {p.image_url&&<img src={p.image_url} alt="" className="post-img" onClick={()=>setLightbox(true)}/>}
                {(p.tags||[]).length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10,marginTop:8}}>{(p.tags||[]).map(tag=><span key={tag} className="tag" onClick={()=>setTagFilter(tag)}>#{tag}</span>)}</div>}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>onUserClick(p.user_email)}>
                    <Avatar name={p.user_name} size={24}/>
                    <span style={{fontSize:12,color:"var(--sub)"}}>{p.user_name}</span>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button className={`likebtn ${liked?"on":""}`} onClick={()=>toggleLike(p)}>{liked?"❤️":"🤍"} {(p.likes||[]).length}</button>
                    <button className={`favbtn ${faved?"on":""}`} onClick={()=>toggleFav(p)}>{faved?"❤️":"🤍"}</button>
                    <button className="copybtn" onClick={()=>{navigator.clipboard.writeText(`${window.location.origin}?listing=${p.id}`);setCopied(true);setTimeout(()=>setCopied(false),2000)}}>{copied?"✅":"🔗"}</button>
                    {mine&&<button onClick={()=>del(p.id)} style={{background:"none",border:"none",color:"var(--sub)",cursor:"pointer",fontSize:15,padding:4}} onMouseOver={e=>e.target.style.color="#ef4444"} onMouseOut={e=>e.target.style.color="var(--sub)"}>🗑</button>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* İlan modal */}
      {modal&&(
        <div className="ovl" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="mdl fu">
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:4,color:"var(--text)"}}>Yeni İlan</div>
            <div style={{fontSize:13,color:"var(--sub)",marginBottom:20}}>Bilkent öğrencileriyle paylaş</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><div className="lbl">KATEGORİ</div>
                <select className="sel" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                  {Object.entries(CAT).filter(([k])=>k!=="staj").map(([k,v])=><option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
              </div>
              <div><div className="lbl">BAŞLIK</div><input className="inp" placeholder="Örn: Ev arkadaşı arıyorum" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
              <div><div className="lbl">AÇIKLAMA</div><textarea className="inp" placeholder="Detayları buraya yaz..." rows={4} style={{resize:"vertical"}} value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))}/></div>
              <div>
                <div className="lbl">FOTOĞRAF (opsiyonel)</div>
                {form.imagePreview?(
                  <div style={{position:"relative"}}>
                    <img src={form.imagePreview} alt="" style={{width:"100%",maxHeight:180,objectFit:"cover",borderRadius:12}}/>
                    <button onClick={()=>setForm(p=>({...p,imageFile:null,imagePreview:null}))} style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,.6)",color:"#fff",border:"none",borderRadius:"50%",width:28,height:28,cursor:"pointer"}}>✕</button>
                  </div>
                ):(
                  <label className="img-upload-area">
                    <input type="file" accept="image/*" style={{display:"none"}} onChange={handleImage}/>
                    <div style={{fontSize:24,marginBottom:6}}>📷</div>
                    <div style={{fontSize:13,color:"var(--sub)"}}>Fotoğraf ekle</div>
                  </label>
                )}
              </div>
              <div><div className="lbl">KONUM</div>
                <select className="sel" value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))}>
                  <option value="">Seç (opsiyonel)</option>
                  {LOCATIONS.filter(l=>l!=="Tümü").map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <div className="lbl">ETİKETLER (max 5)</div>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <input className="inp" placeholder="etiket..." value={form.tagInput} onChange={e=>setForm(p=>({...p,tagInput:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"||e.key===","||e.key===" "){e.preventDefault();addTag()}}} style={{flex:1}}/>
                  <button onClick={addTag} style={{background:"#6366f1",color:"#fff",border:"none",borderRadius:10,padding:"0 14px",cursor:"pointer",fontWeight:600}}>+</button>
                </div>
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {form.tags.map(tg=>(
                    <span key={tg} style={{display:"flex",alignItems:"center",gap:4,background:"#6366f111",border:"1px solid #6366f133",borderRadius:100,padding:"3px 10px",fontSize:12,color:"#6366f1"}}>
                      #{tg}<button onClick={()=>setForm(p=>({...p,tags:p.tags.filter(x=>x!==tg)}))} style={{background:"none",border:"none",color:"#6366f1",cursor:"pointer",fontSize:12,padding:0}}>✕</button>
                    </span>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button className="gbtn" style={{flex:1}} onClick={()=>setModal(false)}>İptal</button>
                <button className="pbtn" style={{flex:2}} disabled={posting||!form.title.trim()||!form.desc.trim()} onClick={addPost}>{posting?<Spinner size={16}/>:"İlan Ver"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Staj modal */}
      {stajModal&&(
        <div className="ovl" onClick={e=>e.target===e.currentTarget&&setStajModal(false)}>
          <div className="mdl fu">
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:4,color:"var(--text)"}}>Staj İlanı Ver</div>
            <div style={{fontSize:13,color:"var(--sub)",marginBottom:20}}>Bilkent öğrencilerine duyur</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><div className="lbl">ŞİRKET ADI</div><input className="inp" placeholder="Şirket adı" value={stajForm.sirket} onChange={e=>setStajForm(p=>({...p,sirket:e.target.value}))}/></div>
              <div><div className="lbl">POZİSYON</div><input className="inp" placeholder="Örn: Yazılım Stajyeri" value={stajForm.title} onChange={e=>setStajForm(p=>({...p,title:e.target.value}))}/></div>
              <div><div className="lbl">AÇIKLAMA</div><textarea className="inp" placeholder="Staj detayları..." rows={4} style={{resize:"vertical"}} value={stajForm.desc} onChange={e=>setStajForm(p=>({...p,desc:e.target.value}))}/></div>
              <div><div className="lbl">LOKASYON</div><input className="inp" placeholder="Örn: Ankara (Hibrit)" value={stajForm.lokasyon} onChange={e=>setStajForm(p=>({...p,lokasyon:e.target.value}))}/></div>
              <div style={{display:"flex",gap:10}}>
                <button className="gbtn" style={{flex:1}} onClick={()=>setStajModal(false)}>İptal</button>
                <button className="pbtn" style={{flex:2}} disabled={posting||!stajForm.title.trim()||!stajForm.desc.trim()} onClick={addStaj}>{posting?<Spinner size={16}/>:"Yayınla"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SEARCH PAGE ───────────────────────────────────────────────────────────────
function SearchPage({user,onUserClick,onStartMessage}) {
  const [query,setQuery]=useState(""),[tab,setTab]=useState("users")
  const [results,setResults]=useState([]),[loading,setLoading]=useState(false)
  const [deptFilter,setDeptFilter]=useState("")

  useEffect(()=>{if(query.length>1||deptFilter)doSearch()},[query,tab,deptFilter])

  async function doSearch() {
    setLoading(true)
    if(tab==="users"){
      let q=supabase.from("profiles").select("*")
      if(query.length>1) q=q.or(`name.ilike.%${query}%,email.ilike.%${query}%,username.ilike.%${query}%`)
      if(deptFilter) q=q.eq("bolum",deptFilter)
      const {data}=await q.limit(20)
      setResults(data||[])
    } else {
      const {data}=await supabase.from("social_posts").select("*").ilike("content",`%${query}%`).order("created_at",{ascending:false}).limit(20)
      setResults(data||[])
    }
    setLoading(false)
  }

  return (
    <div className="page">
      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:20,color:"var(--text)"}}>Keşfet & Ara 🔍</div>
      <div style={{position:"relative",marginBottom:16}}>
        <span style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:"var(--sub)",pointerEvents:"none"}}>🔍</span>
        <input className="srch" placeholder="İsim, @kullanıcıadı, bölüm ara..." value={query} onChange={e=>setQuery(e.target.value)} autoFocus/>
      </div>
      <div style={{display:"flex",gap:16,borderBottom:"1px solid var(--border)",marginBottom:16}}>
        {[["users","👤 Kullanıcılar"],["posts","💬 Gönderiler"]].map(([k,l])=>(
          <button key={k} className={`tab ${tab===k?"on":""}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>
      {tab==="users"&&(
        <>
          <div style={{marginBottom:14}}>
            <div className="lbl">BÖLÜME GÖRE FİLTRELE</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
              <button className={`catbtn ${!deptFilter?"on":""}`} onClick={()=>setDeptFilter("")}>Tümü</button>
              {DEPTS.slice(0,8).map(d=><button key={d} className={`catbtn ${deptFilter===d?"on":""}`} onClick={()=>setDeptFilter(deptFilter===d?"":d)} style={{fontSize:11}}>{d.length>14?d.slice(0,14)+"...":d}</button>)}
            </div>
          </div>
        </>
      )}
      {query.length<2&&!deptFilter?<Empty icon="🔍" text="Aramak istediğini yaz..."/>
      :loading?<div style={{textAlign:"center",padding:60}}><Spinner/></div>
      :results.length===0?<Empty icon="😕" text="Sonuç bulunamadı."/>
      :tab==="users"?(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {results.map(u=>(
            <div key={u.id} className="user-row" onClick={()=>onUserClick(u.email)}>
              <Avatar name={u.name} src={u.avatar_url} size={48}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:15,color:"var(--text)"}}>{u.name}</div>
                {u.username&&<div style={{fontSize:12,color:"#6366f1"}}>@{u.username}</div>}
                {u.bolum&&<span className="dept-chip" style={{marginTop:4}}>{u.bolum}{u.sinif?` · ${u.sinif}. Sınıf`:""}</span>}
              </div>
              <button className="sbtn" style={{fontSize:12,padding:"6px 14px"}} onClick={e=>{e.stopPropagation();onStartMessage(u)}}>💬</button>
            </div>
          ))}
        </div>
      ):(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {results.map((p,i)=><SocialPostCard key={p.id} p={p} user={user} i={i} onUserClick={onUserClick} onDelete={async()=>{}}/>)}
        </div>
      )}
    </div>
  )
}

// ── MESSAGES PAGE ─────────────────────────────────────────────────────────────
function MessagesPage({user,onUnreadChange,startWith}) {
  const [convos,setConvos]=useState([]),[active,setActive]=useState(null)
  const [msgs,setMsgs]=useState([]),[newMsg,setNewMsg]=useState("")
  const [loading,setLoading]=useState(true),[sending,setSending]=useState(false)
  const bottomRef=useRef(),channelRef=useRef()

  useEffect(()=>{loadConvos()},[])
  useEffect(()=>{
    if(startWith){
      setActive(startWith.email)
      setConvos(prev=>prev.find(c=>c.email===startWith.email)?prev:[{email:startWith.email,name:startWith.name,last:null,unread:0},...prev])
    }
  },[startWith])
  useEffect(()=>{
    if(!active) return
    loadMsgs(active)
    if(channelRef.current) supabase.removeChannel(channelRef.current)
    channelRef.current=supabase.channel(`dm-${user.email}-${active}`)
      .on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},(payload)=>{
        const m=payload.new
        if((m.from_email===user.email&&m.to_email===active)||(m.from_email===active&&m.to_email===user.email)){
          setMsgs(prev=>[...prev,m])
          if(m.to_email===user.email) supabase.from("messages").update({read:true}).eq("id",m.id)
        }
      }).subscribe()
    return ()=>{if(channelRef.current) supabase.removeChannel(channelRef.current)}
  },[active])
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"})},[msgs])

  async function loadConvos() {
    setLoading(true)
    const {data}=await supabase.from("messages").select("*").or(`from_email.eq.${user.email},to_email.eq.${user.email}`).not("to_email","like","club_%").order("created_at",{ascending:false})
    if(!data){setLoading(false);return}
    const map={}
    data.forEach(m=>{
      const other=m.from_email===user.email?{email:m.to_email,name:m.to_name}:{email:m.from_email,name:m.from_name}
      if(!map[other.email]){map[other.email]={...other,last:m,unread:0}}
      if(m.to_email===user.email&&!m.read) map[other.email].unread++
    })
    const list=Object.values(map)
    setConvos(list);onUnreadChange(list.reduce((a,c)=>a+c.unread,0));setLoading(false)
  }

  async function loadMsgs(email) {
    const {data}=await supabase.from("messages").select("*")
      .or(`and(from_email.eq.${user.email},to_email.eq.${email}),and(from_email.eq.${email},to_email.eq.${user.email})`)
      .order("created_at",{ascending:true})
    setMsgs(data||[])
    await supabase.from("messages").update({read:true}).eq("to_email",user.email).eq("from_email",email)
    loadConvos()
  }

  async function send() {
    if(!newMsg.trim()||!active) return
    setSending(true)
    const convo=convos.find(c=>c.email===active)
    await supabase.from("messages").insert({from_email:user.email,from_name:user.name,to_email:active,to_name:convo?.name||active,content:newMsg,read:false})
    setNewMsg("");setSending(false)
  }

  return (
    <div style={{maxWidth:900,margin:"0 auto",padding:"32px 24px 40px"}}>
      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:20,color:"var(--text)"}}>Mesajlar 💬</div>
      <div style={{display:"grid",gridTemplateColumns:active?"280px 1fr":"1fr",gap:16,minHeight:400}}>
        <div style={{display:"flex",flexDirection:"column",gap:8,overflowY:"auto",maxHeight:"72vh"}}>
          {loading?<div style={{textAlign:"center",padding:40}}><Spinner/></div>
          :convos.length===0?<Empty icon="💬" text="Henüz mesaj yok."/>
          :convos.map(c=>(
            <div key={c.email} onClick={()=>setActive(c.email)} style={{background:"var(--card)",border:`1px solid ${active===c.email?"#6366f1":"var(--border)"}`,borderRadius:14,padding:"12px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,transition:"all .2s"}}>
              <Avatar name={c.name} size={40}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:14,color:"var(--text)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.name}</div>
                <div style={{fontSize:12,color:"var(--sub)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.last?.content||"Yeni konuşma"}</div>
              </div>
              {c.unread>0&&<span style={{background:"#6366f1",color:"#fff",fontSize:10,padding:"2px 7px",borderRadius:100,fontWeight:700}}>{c.unread}</span>}
            </div>
          ))}
        </div>
        {active&&(
          <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:400,maxHeight:"72vh"}}>
            <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10}}>
              <Avatar name={convos.find(c=>c.email===active)?.name||active} size={32}/>
              <div style={{fontWeight:600,fontSize:14,color:"var(--text)"}}>{convos.find(c=>c.email===active)?.name||active}</div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:8}}>
              {msgs.map(m=>(
                <div key={m.id} style={{display:"flex",flexDirection:"column",alignItems:m.from_email===user.email?"flex-end":"flex-start"}}>
                  <div className={`msg-bubble ${m.from_email===user.email?"mine":"theirs"}`}>{m.content}</div>
                  <div style={{fontSize:10,color:"var(--sub)",marginTop:3,display:"flex",alignItems:"center",gap:4}}>
                    {ago(m.created_at)}{m.from_email===user.email&&<span style={{color:m.read?"#6366f1":"var(--sub)"}}>✓✓</span>}
                  </div>
                </div>
              ))}
              <div ref={bottomRef}/>
            </div>
            <div style={{padding:12,borderTop:"1px solid var(--border)",display:"flex",gap:8}}>
              <input className="inp" placeholder="Mesaj yaz..." value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} style={{flex:1}}/>
              <button onClick={send} disabled={sending||!newMsg.trim()} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:12,padding:"0 18px",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontWeight:600,fontSize:13,minWidth:72}}>
                {sending?<Spinner size={14}/>:"Gönder"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── NOTIFICATIONS PAGE ────────────────────────────────────────────────────────
function NotificationsPage({user,onUpdate}) {
  const [requests,setRequests]=useState([]),[loading,setLoading]=useState(true)

  useEffect(()=>{load()},[])

  async function load() {
    setLoading(true)
    const {data}=await supabase.from("follows").select("*").eq("following_email",user.email).eq("status","pending").order("created_at",{ascending:false})
    setRequests(data||[]);setLoading(false);onUpdate(data?.length||0)
  }

  async function accept(id) {
    await supabase.from("follows").update({status:"accepted"}).eq("id",id)
    setRequests(prev=>prev.filter(r=>r.id!==id));onUpdate(prev=>Math.max(0,prev-1))
  }

  async function reject(id) {
    await supabase.from("follows").update({status:"rejected"}).eq("id",id)
    setRequests(prev=>prev.filter(r=>r.id!==id));onUpdate(prev=>Math.max(0,prev-1))
  }

  return (
    <div className="page">
      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:20,color:"var(--text)"}}>Bildirimler 🔔</div>
      {loading?<div style={{textAlign:"center",padding:60}}><Spinner/></div>
      :requests.length===0?<Empty icon="🔔" text="Bildirim yok."/>
      :(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:13,color:"var(--sub)",marginBottom:4}}>Takip İstekleri ({requests.length})</div>
          {requests.map(r=>(
            <div key={r.id} className="card">
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <Avatar name={r.follower_name} size={44}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:14,color:"var(--text)"}}>{r.follower_name}</div>
                  <div style={{fontSize:12,color:"var(--sub)"}}>{r.follower_email}</div>
                  <div style={{fontSize:11,color:"var(--sub)",marginTop:2}}>{ago(r.created_at)} · Takip isteği gönderdi</div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>accept(r.id)} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:100,padding:"7px 16px",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontWeight:600,fontSize:12}}>Kabul</button>
                  <button onClick={()=>reject(r.id)} style={{background:"none",border:"1px solid var(--border)",borderRadius:100,padding:"7px 14px",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontSize:12,color:"var(--sub)"}}>Reddet</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── FAVORITES PAGE ────────────────────────────────────────────────────────────
function FavoritesPage({user,onUserClick}) {
  const [posts,setPosts]=useState([]),[loading,setLoading]=useState(true)

  useEffect(()=>{
    (async()=>{
      setLoading(true)
      const {data}=await supabase.from("posts").select("*").contains("favorited_by",[user.email]).order("created_at",{ascending:false})
      setPosts(data||[]);setLoading(false)
    })()
  },[])

  async function toggleFav(post) {
    const nf=(post.favorited_by||[]).filter(e=>e!==user.email)
    await supabase.from("posts").update({favorited_by:nf}).eq("id",post.id)
    setPosts(prev=>prev.filter(p=>p.id!==post.id))
  }

  return (
    <div className="page">
      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:20,color:"var(--text)"}}>Favoriler ❤️</div>
      {loading?<div style={{textAlign:"center",padding:60}}><Spinner/></div>
      :posts.length===0?<Empty icon="❤️" text="Henüz favori eklemedin."/>
      :(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {posts.map((p,i)=>{
            const m=CAT[p.category]
            return (
              <div key={p.id} className="card">
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  <span className="bdg" style={{background:m.color+"18",color:m.color}}>{m.emoji} {m.label}</span>
                  <span style={{fontSize:11,color:"var(--sub)"}}>{ago(p.created_at)}</span>
                </div>
                <div style={{fontWeight:600,fontSize:14,color:"var(--text)",marginBottom:4}}>{p.title}</div>
                <div style={{fontSize:13,color:"var(--sub)",lineHeight:1.6,marginBottom:10}}>{p.description}</div>
                <button onClick={()=>toggleFav(p)} style={{background:"none",border:"1px solid #fecaca",borderRadius:100,padding:"4px 12px",color:"#ef4444",cursor:"pointer",fontSize:12,fontFamily:"'Plus Jakarta Sans'"}}>❤️ Favoriden Kaldır</button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── PROFILE PAGE ──────────────────────────────────────────────────────────────
function ProfilPage({user,setUser}) {
  const [profile,setProfile]=useState(null),[editing,setEditing]=useState(false)
  const [form,setForm]=useState({name:"",bio:"",bolum:"",sinif:"",username:""})
  const [saving,setSaving]=useState(false),[uploading,setUploading]=useState(false)
  const [myPosts,setMyPosts]=useState([]),[loaded,setLoaded]=useState(false)
  const [followers,setFollowers]=useState(0),[following,setFollowing]=useState(0)
  const [myClubs,setMyClubs]=useState([]),[copied,setCopied]=useState(false)
  const fileRef=useRef()

  useEffect(()=>{loadProfile()},[])

  async function loadProfile() {
    const [{data:p},{data:ps},{data:frs},{data:fng},{data:clubs}]=await Promise.all([
      supabase.from("profiles").select("*").eq("id",user.id).single(),
      supabase.from("social_posts").select("*").eq("user_email",user.email).order("created_at",{ascending:false}).limit(10),
      supabase.from("follows").select("id").eq("following_email",user.email).eq("status","accepted"),
      supabase.from("follows").select("id").eq("follower_email",user.email).eq("status","accepted"),
      supabase.from("community_members").select("*,communities(id,name,category)").eq("user_email",user.email),
    ])
    const prof=p||{id:user.id,email:user.email,name:user.name,bio:"",bolum:"",sinif:"",avatar_url:null,username:""}
    setProfile(prof)
    setForm({name:prof.name||"",bio:prof.bio||"",bolum:prof.bolum||"",sinif:prof.sinif||"",username:prof.username||""})
    setMyPosts(ps||[]);setFollowers(frs?.length||0);setFollowing(fng?.length||0)
    setMyClubs(clubs?.map(c=>c.communities).filter(Boolean)||[])
    setLoaded(true)
  }

  async function saveProfile() {
    setSaving(true)
    await supabase.from("profiles").upsert({id:user.id,email:user.email,...form})
    setProfile(prev=>({...prev,...form}));setUser(prev=>({...prev,name:form.name,bolum:form.bolum}))
    setSaving(false);setEditing(false)
  }

  async function uploadAvatar(e) {
    const file=e.target.files?.[0];if(!file) return
    setUploading(true)
    const path=`${user.id}.${file.name.split(".").pop()}`
    await supabase.storage.from("avatars").upload(path,file,{upsert:true})
    const {data}=supabase.storage.from("avatars").getPublicUrl(path)
    await supabase.from("profiles").upsert({id:user.id,email:user.email,avatar_url:data.publicUrl})
    setProfile(prev=>({...prev,avatar_url:data.publicUrl}));setUser(prev=>({...prev,avatar:data.publicUrl}))
    setUploading(false)
  }

  if(!loaded) return <div style={{textAlign:"center",padding:60}}><Spinner/></div>

  return (
    <div className="page">
      {/* Profil kartı */}
      <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:20,padding:24,marginBottom:20}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:16,marginBottom:16}}>
          <div style={{position:"relative",cursor:"pointer"}} onClick={()=>fileRef.current?.click()}>
            <Avatar name={profile.name} src={profile.avatar_url} size={80}/>
            <div style={{position:"absolute",bottom:0,right:0,width:24,height:24,background:"#6366f1",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>
              {uploading?<Spinner size={10}/>:"📷"}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={uploadAvatar}/>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:18,color:"var(--text)"}}>{profile.name}</div>
            {profile.username&&<div style={{fontSize:12,color:"#6366f1",marginTop:2}}>@{profile.username}</div>}
            <div style={{fontSize:12,color:"var(--sub)",marginTop:2}}>{profile.email}</div>
            {profile.bolum&&<div style={{marginTop:6}}><span className="dept-chip">{profile.bolum}{profile.sinif?` · ${profile.sinif}. Sınıf`:""}</span></div>}
            <div style={{fontSize:11,color:"var(--sub)",marginTop:6}}>{joinYear(profile.created_at)}'den beri üye</div>
          </div>
          <button onClick={()=>setEditing(!editing)} style={{background:"none",border:"1px solid var(--border)",borderRadius:100,padding:"6px 14px",fontSize:12,color:"var(--sub)",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontWeight:500}}>
            {editing?"İptal":"Düzenle"}
          </button>
        </div>

        {profile.bio&&!editing&&<div style={{fontSize:13,color:"var(--sub)",lineHeight:1.6,padding:"12px 0",borderTop:"1px solid var(--border)",marginBottom:12}}>{profile.bio}</div>}

        {/* Üye olunan kulüpler */}
        {myClubs.length>0&&!editing&&(
          <div style={{borderTop:"1px solid var(--border)",paddingTop:12}}>
            <div style={{fontSize:11,color:"var(--sub)",marginBottom:8,letterSpacing:.5,fontWeight:600}}>ÜYE OLUNAN KULÜPLER</div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {myClubs.map(c=>(
                <span key={c.id} className="bdg" style={{background:"#6366f111",color:"#6366f1"}}>🎭 {c.name}</span>
              ))}
            </div>
          </div>
        )}

        <button onClick={()=>{navigator.clipboard.writeText(`kampus-gold.vercel.app/profile/${profile.username||user.email}`);setCopied(true);setTimeout(()=>setCopied(false),2000)}} style={{marginTop:12,background:"none",border:"1px solid var(--border)",borderRadius:100,padding:"6px 16px",fontSize:12,color:"var(--sub)",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",display:"flex",alignItems:"center",gap:6}}>
          {copied?"✅ Kopyalandı!":"🔗 Profili Paylaş"}
        </button>

        {editing&&(
          <div style={{display:"flex",flexDirection:"column",gap:12,borderTop:"1px solid var(--border)",paddingTop:16,marginTop:16}}>
            <div><div className="lbl">İSİM</div><input className="inp" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
            <div><div className="lbl">KULLANICI ADI</div>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",color:"var(--sub)"}}>@</span>
                <input className="inp" style={{paddingLeft:28}} placeholder="kullanici_adi" value={form.username} onChange={e=>setForm(p=>({...p,username:e.target.value.replace(/[^a-z0-9_]/gi,"").toLowerCase()}))}/>
              </div>
            </div>
            <div><div className="lbl">BÖLÜM</div>
              <select className="sel" value={form.bolum} onChange={e=>setForm(p=>({...p,bolum:e.target.value}))}>
                <option value="">Seç</option>
                {DEPTS.map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
            <div><div className="lbl">SINIF</div>
              <select className="sel" value={form.sinif} onChange={e=>setForm(p=>({...p,sinif:e.target.value}))}>
                <option value="">Seç</option>
                {[1,2,3,4].map(n=><option key={n} value={n}>{n}. Sınıf</option>)}
                <option value="Yüksek Lisans">Yüksek Lisans</option>
              </select>
            </div>
            <div><div className="lbl">BIO</div><textarea className="inp" placeholder="Kendini kısaca tanıt..." rows={3} style={{resize:"vertical"}} value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))}/></div>
            <button className="pbtn" disabled={saving} onClick={saveProfile}>{saving?<Spinner size={16}/>:"Kaydet"}</button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[["Gönderi",myPosts.length],["Beğeni",myPosts.reduce((a,p)=>a+(p.likes||[]).length,0)],["Takipçi",followers],["Takip",following]].map(([l,v])=>(
          <div key={l} className="stat-card">
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:20,color:"#6366f1"}}>{v}</div>
            <div style={{fontSize:11,color:"var(--sub)"}}>{l}</div>
          </div>
        ))}
      </div>

      {/* Son gönderiler */}
      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:16,color:"var(--text)",marginBottom:14}}>Gönderileri</div>
      {myPosts.length===0?<Empty icon="📭" text="Henüz gönderi yok."/>:(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {myPosts.map((p,i)=><SocialPostCard key={p.id} p={p} user={user} i={i} onUserClick={()=>{}} onDelete={async()=>{}}/>)}
        </div>
      )}
    </div>
  )
}

// ── SETTINGS PAGE ─────────────────────────────────────────────────────────────
function SettingsPage({dark,setDark}) {
  return (
    <div className="page">
      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:24,color:"var(--text)"}}>Ayarlar ⚙️</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:20}}>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:15,marginBottom:16,color:"var(--text)"}}>Görünüm</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0"}}>
            <div>
              <div style={{fontSize:14,fontWeight:500,color:"var(--text)"}}>🌙 Koyu Tema</div>
              <div style={{fontSize:12,color:"var(--sub)",marginTop:2}}>Koyu tema kullan</div>
            </div>
            <button className={`toggle ${dark?"on":""}`} onClick={()=>setDark(!dark)}/>
          </div>
        </div>
        <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:20}}>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:15,marginBottom:12,color:"var(--text)"}}>Hakkında</div>
          <div style={{fontSize:13,color:"var(--sub)",lineHeight:1.7}}>Kampüs, Bilkent Üniversitesi öğrencileri için geliştirilmiş sosyal platform.</div>
          <div style={{marginTop:10,fontSize:12,color:"#6366f1",fontWeight:500}}>v6.0.0 · Bilkent Exclusive 🎓</div>
        </div>
      </div>
    </div>
  )
}

// ── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(null),[ready,setReady]=useState(false)
  const [page,setPage]=useState("feed"),[dark,setDark]=useState(false)
  const [unread,setUnread]=useState(0),[notifCount,setNotifCount]=useState(0)
  const [viewingUser,setViewingUser]=useState(null),[startMsgWith,setStartMsgWith]=useState(null)
  const [isPasswordReset,setIsPasswordReset]=useState(false)

  useEffect(()=>{
    const hash=window.location.hash
    if(hash.includes("type=recovery")) setIsPasswordReset(true)
    supabase.auth.getSession().then(async({data:{session}})=>{
      if(session){
        const u=session.user
        const {data:profile}=await supabase.from("profiles").select("*").eq("id",u.id).single()
        setUser({id:u.id,name:profile?.name||u.user_metadata?.name||u.email.split("@")[0],email:u.email,avatar:profile?.avatar_url||null,account_type:profile?.account_type||"ogrenci",bolum:profile?.bolum||""})
      }
      setReady(true)
    })
    const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
      if(event==="PASSWORD_RECOVERY") setIsPasswordReset(true)
      if(!session) setUser(null)
    })
    return ()=>subscription.unsubscribe()
  },[])

  function handleStartMessage(profile) { setStartMsgWith(profile);setPage("messages") }
  const logout=async()=>{await supabase.auth.signOut();setUser(null)}

  if(!ready) return (
    <div style={{minHeight:"100vh",background:"#f5f4f0",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={{color:"#6366f1",fontSize:32,animation:"spin .8s linear infinite",display:"inline-block"}}>⟳</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if(isPasswordReset) return <><style>{getCSS(dark)}</style><ResetPassword onDone={()=>{setIsPasswordReset(false);setUser(null)}}/></>
  if(!user) return <><style>{getCSS(dark)}</style><Auth onLogin={setUser}/></>

  const pages={
    feed:          <FeedPage user={user} onUserClick={setViewingUser}/>,
    clubs:         <ClubsPage user={user}/>,
    events:        <EventsPage user={user}/>,
    messages:      <MessagesPage user={user} onUnreadChange={setUnread} startWith={startMsgWith}/>,
    notifications: <NotificationsPage user={user} onUpdate={setNotifCount}/>,
    favorites:     <FavoritesPage user={user} onUserClick={setViewingUser}/>,
    listings:      <ListingsPage user={user} onUserClick={setViewingUser}/>,
    search:        <SearchPage user={user} onUserClick={setViewingUser} onStartMessage={handleStartMessage}/>,
    profil:        <ProfilPage user={user} setUser={setUser}/>,
    settings:      <SettingsPage dark={dark} setDark={setDark}/>,
  }

  return (
    <>
      <style>{getCSS(dark)}</style>
      <div className="layout">
        <Sidebar active={page} setActive={setPage} user={user} onLogout={logout} unread={unread} notifCount={notifCount}/>
        <div className="main-content">{pages[page]||pages.feed}</div>
        <BottomNav active={page} setActive={setPage} unread={unread} notifCount={notifCount}/>
      </div>
      {viewingUser&&<UserProfileModal email={viewingUser} currentUser={user} onClose={()=>setViewingUser(null)} onMessage={handleStartMessage}/>}
    </>
  )
}