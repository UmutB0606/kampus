import { useState, useEffect, useRef } from "react"
import { supabase } from "./supabase"

const CAT = {
  ev:   { label:"Ev & Arkadaş", emoji:"🏠", color:"#6366f1" },
  esya: { label:"Eşya",         emoji:"🪑", color:"#8b5cf6" },
  staj: { label:"Staj",         emoji:"💼", color:"#06b6d4" },
  ders: { label:"Ders",         emoji:"📚", color:"#10b981" },
}

const LOCATIONS = ["Tümü","Bilkent Kampüs","Çankaya","Kızılay","Eryaman","Ankara Geneli","Diğer"]

const TR = {
  hello:"Merhaba", looking:"Bugün ne arıyorsun?", newPost:"+ İlan Ver",
  allPosts:"Tüm İlanlar", myPosts:"İlanlarım", search:"İlan, etiket ara...",
  internships:"Staj İlanları 💼", internshipSub:"Bilkent öğrencilerine özel fırsatlar",
  apply:"Başvur →", discover:"Keşfet & Ara 🔍", discoverSub:"İlan veya kullanıcı ara",
  popular:"🔥 En Popüler", profile:"Profil", settings:"Ayarlar ⚙️",
  messages:"Mesajlar 💬", notifications:"Bildirimler 🔔", favorites:"Favoriler ❤️",
  logout:"Çıkış Yap", save:"Kaydet", cancel:"İptal", edit:"Düzenle",
  login:"Giriş Yap", register:"Kayıt Ol", forgotPass:"Şifremi unuttum",
  darkMode:"Koyu Tema", language:"Dil", noFav:"Henüz favori eklemedin.",
  send:"Gönder", newMsg:"Yeni Mesaj", noMsg:"Henüz mesaj yok.",
  posts:"İlanlar", users:"Kullanıcılar", followReq:"Takip İstekleri",
  accept:"Kabul", reject:"Reddet", noNotif:"Bekleyen takip isteği yok.",
  follow:"Takip Et", following:"✓ Takip Ediliyor", pending:"⏳ İstek Gönderildi",
  sendMsg:"💬 Mesaj", memberSince:"'den beri üye", post:"İlan", like:"Beğeni",
  follower:"Takipçi", followingLbl:"Takip", department:"Bölüm", grade:"Sınıf",
  darkModeSub:"Koyu tema kullan", langSub:"Uygulama dili",
  select:"Seç", year1:"1. Sınıf", year2:"2. Sınıf", year3:"3. Sınıf", year4:"4. Sınıf", masters:"Yüksek Lisans",
  bio:"Bio", name:"İsim", cancel2:"İptal", close:"Kapat", appearance:"Görünüm",
  about:"Hakkında", companyHint:"💡 Staj ilanı vermek için şirket hesabı gereklidir.",
  postInternship:"+ İlan Ver", position:"Pozisyon", company:"Şirket Adı",
  description:"Açıklama", location:"Konum", tags:"Etiketler (max 5)",
  category:"Kategori", title:"Başlık", applyMsg:"Başvuru Mesajı",
  emailNote:"Başvurunuz ile gönderilecek.", publish:"Yayınla",
  searchPlaceholder:"İlan, kullanıcı, etiket ara...", typeToSearch:"Aramak istediğini yaz...",
  noResult:"Sonuç bulunamadı.", noPost:"Henüz ilan vermedin.",
  internshipNote:"Staj İlanı", yourPost:"Senin ilanın",
}

const EN = {
  hello:"Hello", looking:"What are you looking for?", newPost:"+ Post",
  allPosts:"All Posts", myPosts:"My Posts", search:"Search posts, tags...",
  internships:"Internships 💼", internshipSub:"Exclusive opportunities for Bilkent students",
  apply:"Apply →", discover:"Discover & Search 🔍", discoverSub:"Search posts or users",
  popular:"🔥 Most Popular", profile:"Profile", settings:"Settings ⚙️",
  messages:"Messages 💬", notifications:"Notifications 🔔", favorites:"Favorites ❤️",
  logout:"Logout", save:"Save", cancel:"Cancel", edit:"Edit",
  login:"Login", register:"Sign Up", forgotPass:"Forgot password",
  darkMode:"Dark Mode", language:"Language", noFav:"No favorites yet.",
  send:"Send", newMsg:"New Message", noMsg:"No messages yet.",
  posts:"Posts", users:"Users", followReq:"Follow Requests",
  accept:"Accept", reject:"Reject", noNotif:"No pending follow requests.",
  follow:"Follow", following:"✓ Following", pending:"⏳ Request Sent",
  sendMsg:"💬 Message", memberSince:" member since", post:"Post", like:"Like",
  follower:"Followers", followingLbl:"Following", department:"Department", grade:"Year",
  darkModeSub:"Use dark theme", langSub:"App language",
  select:"Select", year1:"1st Year", year2:"2nd Year", year3:"3rd Year", year4:"4th Year", masters:"Masters",
  bio:"Bio", name:"Name", cancel2:"Cancel", close:"Close", appearance:"Appearance",
  about:"About", companyHint:"💡 Company account required to post internships.",
  postInternship:"+ Post", position:"Position", company:"Company Name",
  description:"Description", location:"Location", tags:"Tags (max 5)",
  category:"Category", title:"Title", applyMsg:"Application Message",
  emailNote:"Your application will be sent from", publish:"Publish",
  searchPlaceholder:"Search posts, users, tags...", typeToSearch:"Start typing to search...",
  noResult:"No results found.", noPost:"No posts yet.",
  internshipNote:"Internship", yourPost:"Your post",
}

function ago(ts) {
  const d = Date.now() - new Date(ts).getTime()
  if (d < 3600000)  return `${Math.floor(d/60000)} dk önce`
  if (d < 86400000) return `${Math.floor(d/3600000)} saat önce`
  return `${Math.floor(d/86400000)} gün önce`
}

function joinYear(ts) { return ts ? new Date(ts).getFullYear() : new Date().getFullYear() }
const validBilkent = e => e.endsWith("@bilkent.edu.tr") || e.endsWith("@ug.bilkent.edu.tr")

// CSS uses CSS custom properties so dark mode works everywhere instantly
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
.sidebar{width:240px;background:var(--card);border-right:1px solid var(--border);position:fixed;top:0;left:0;height:100vh;display:flex;flex-direction:column;z-index:40;padding:24px 16px;transition:background .25s,border .25s;}
.main-content{margin-left:240px;flex:1;min-height:100vh;}
.page{max-width:680px;margin:0 auto;padding:32px 24px 100px;}
.logo-area{display:flex;align-items:center;gap:10px;margin-bottom:32px;padding:0 8px;}
.logo-icon{width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'Sora',sans-serif;font-weight:700;font-size:16px;color:#fff;}
.logo-text{font-family:'Sora',sans-serif;font-weight:700;font-size:18px;color:var(--text);}
.logo-sub{font-size:10px;color:var(--sub);letter-spacing:1px;}
.nav-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;cursor:pointer;transition:all .2s;color:var(--sub);font-size:14px;font-weight:500;border:none;background:none;width:100%;text-align:left;}
.nav-item:hover{background:var(--hover);color:var(--text);}
.nav-item.active{background:linear-gradient(135deg,#6366f111,#8b5cf611);color:#6366f1;font-weight:600;}
.nav-icon{font-size:18px;width:24px;text-align:center;}
.nav-badge{margin-left:auto;background:#ef4444;color:#fff;font-size:10px;padding:2px 7px;border-radius:100px;font-weight:700;}
.bottom-nav{display:none;position:fixed;bottom:0;left:0;right:0;background:var(--card);border-top:1px solid var(--border);z-index:40;padding:8px 0 20px;transition:background .25s;}
.bottom-nav-inner{display:flex;justify-content:space-around;}
.bnav-item{display:flex;flex-direction:column;align-items:center;gap:3px;padding:6px 12px;cursor:pointer;color:var(--sub);font-size:10px;font-weight:500;border:none;background:none;}
.bnav-item.active{color:#6366f1;}
.bnav-icon{font-size:20px;}
.card{background:var(--card);border:1px solid var(--border);border-radius:16px;padding:20px;transition:all .2s;}
.card:hover{border-color:#6366f144;box-shadow:0 4px 20px rgba(99,102,241,.08);transform:translateY(-1px);}
.pbtn{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:12px;padding:13px 24px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:14px;cursor:pointer;width:100%;transition:opacity .2s;}
.pbtn:hover{opacity:.9;}
.pbtn:disabled{opacity:.4;cursor:not-allowed;}
.gbtn{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:13px 24px;color:var(--sub);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;width:100%;transition:all .2s;}
.gbtn:hover{border-color:#c4b5fd;color:#6366f1;}
.sbtn{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;border:none;border-radius:100px;padding:8px 20px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:6px;}
.obtn{background:var(--card);border:2px solid #6366f1;border-radius:100px;padding:7px 18px;color:#6366f1;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:13px;transition:all .2s;}
.obtn:hover{background:#6366f111;}
.inp{background:var(--inp);border:1px solid var(--border);border-radius:12px;padding:12px 16px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;width:100%;outline:none;transition:border .2s,background .25s;}
.inp:focus{border-color:#6366f1;background:var(--card);}
.inp::placeholder{color:var(--sub);}
.sel{background:var(--inp);border:1px solid var(--border);border-radius:12px;padding:12px 16px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;width:100%;outline:none;cursor:pointer;transition:background .25s;}
.lbl{font-size:11px;color:var(--sub);letter-spacing:.8px;font-weight:600;margin-bottom:6px;}
.bdg{display:inline-block;padding:4px 10px;border-radius:100px;font-size:11px;font-weight:600;}
.tag{display:inline-block;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:500;background:#6366f111;color:#6366f1;cursor:pointer;border:1px solid #6366f122;transition:all .2s;}
.tag:hover{background:#6366f122;}
.ovl{position:fixed;inset:0;background:rgba(0,0,0,.5);backdrop-filter:blur(8px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;}
.mdl{background:var(--card);border:1px solid var(--border);border-radius:24px;padding:32px;width:100%;max-width:480px;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.2);}
.tab{background:none;border:none;padding:10px 0;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:var(--sub);border-bottom:2px solid transparent;white-space:nowrap;font-weight:500;}
.tab.on{color:#6366f1;border-bottom-color:#6366f1;font-weight:600;}
.catbtn{background:var(--card);border:1px solid var(--border);border-radius:100px;padding:7px 16px;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;color:var(--sub);transition:all .2s;display:flex;align-items:center;gap:6px;white-space:nowrap;}
.catbtn:hover{border-color:#c4b5fd;color:#6366f1;}
.catbtn.on{background:#6366f111;border-color:#c4b5fd;color:#6366f1;font-weight:600;}
.likebtn{background:none;border:1px solid var(--border);border-radius:100px;padding:5px 12px;cursor:pointer;font-size:12px;color:var(--sub);transition:all .2s;display:flex;align-items:center;gap:5px;font-family:'Plus Jakarta Sans',sans-serif;}
.likebtn.on{border-color:#6366f1;color:#6366f1;background:#6366f111;}
.favbtn{background:none;border:1px solid var(--border);border-radius:100px;padding:5px 10px;cursor:pointer;font-size:14px;color:var(--sub);transition:all .2s;}
.favbtn.on{border-color:#ef4444;color:#ef4444;}
.srch{background:var(--card);border:1px solid var(--border);border-radius:100px;padding:10px 20px 10px 44px;color:var(--text);font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;width:100%;outline:none;transition:border .2s,background .25s;}
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
.stat-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:14px 10px;text-align:center;transition:background .25s,border .25s;}
.section-title{font-family:'Sora',sans-serif;font-weight:700;font-size:16px;color:var(--text);margin-bottom:14px;}
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
  return <div className="avatar" style={{width:size,height:size,fontSize:size*.35}}>{name?.[0]?.toUpperCase()||"?"}</div>
}

function Spinner({ size=28 }) {
  return <span className="sp" style={{fontSize:size,color:"#6366f1"}}>⟳</span>
}

function Empty({ icon, text }) {
  return (
    <div style={{textAlign:"center",padding:60,color:"var(--sub)"}}>
      <div style={{fontSize:40,marginBottom:12}}>{icon}</div>
      <div style={{fontSize:14}}>{text}</div>
    </div>
  )
}

// ── USER PROFILE MODAL ────────────────────────────────────────────────────────
function UserProfileModal({ email, currentUser, onClose, onMessage, t }) {
  const [profile,setProfile]=useState(null), [posts,setPosts]=useState([])
  const [followStatus,setFollowStatus]=useState(null)
  const [followerCount,setFollowerCount]=useState(0), [followingCount,setFollowingCount]=useState(0)
  const [loading,setLoading]=useState(true)
  const isOwn = email===currentUser.email

  useEffect(()=>{ load() },[email])

  async function load() {
    setLoading(true)
    const [{ data:p },{ data:ps },{ data:myFollow },{ data:followers },{ data:following }]=await Promise.all([
      supabase.from("profiles").select("*").eq("email",email).single(),
      supabase.from("posts").select("*").eq("user_email",email).order("created_at",{ascending:false}),
      supabase.from("follows").select("*").eq("follower_email",currentUser.email).eq("following_email",email).maybeSingle(),
      supabase.from("follows").select("id").eq("following_email",email).eq("status","accepted"),
      supabase.from("follows").select("id").eq("follower_email",email).eq("status","accepted"),
    ])
    setProfile(p||{name:email.split("@")[0],email})
    setPosts(ps||[])
    setFollowStatus(myFollow?.status||null)
    setFollowerCount(followers?.length||0)
    setFollowingCount(following?.length||0)
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

  const followLabel = followStatus==="accepted"?t.following:followStatus==="pending"?t.pending:t.follow

  return (
    <div className="ovl" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mdl fu" style={{maxWidth:420}}>
        {loading?<div style={{textAlign:"center",padding:40}}><Spinner/></div>:(
          <>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:20}}>
              <Avatar name={profile.name} src={profile.avatar_url} size={80}/>
              <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:20,marginTop:12,color:"var(--text)"}}>{profile.name}</div>
              <div style={{fontSize:12,color:"var(--sub)",marginTop:3}}>{profile.email}</div>
              {profile.bolum&&<div style={{fontSize:13,color:"#6366f1",fontWeight:500,marginTop:6}}>{profile.bolum}{profile.sinif?` · ${profile.sinif}. Sınıf`:""}</div>}
              <div style={{fontSize:11,color:"var(--sub)",marginTop:4}}>{profile.account_type==="sirket"?"🏢 Şirket":"🎓 Öğrenci"} · {joinYear(profile.created_at)}{t.memberSince}</div>
              {profile.bio&&<div style={{fontSize:13,color:"var(--sub)",textAlign:"center",lineHeight:1.6,marginTop:10,padding:"0 8px"}}>{profile.bio}</div>}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:20}}>
              {[[t.post,posts.length],[t.follower,followerCount],[t.followingLbl,followingCount]].map(([l,v])=>(
                <div key={l} className="stat-card">
                  <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:20,color:"#6366f1"}}>{v}</div>
                  <div style={{fontSize:11,color:"var(--sub)"}}>{l}</div>
                </div>
              ))}
            </div>

            {!isOwn&&(
              <div style={{display:"flex",gap:10,marginBottom:20}}>
                <button className="pbtn" style={{flex:1,opacity:followStatus==="pending"?.6:1}} onClick={handleFollow} disabled={followStatus==="pending"}>{followLabel}</button>
                <button className="obtn" style={{flex:1}} onClick={()=>{onMessage(profile);onClose()}}>{t.sendMsg}</button>
              </div>
            )}

            {posts.length>0&&(
              <>
                <div style={{fontSize:11,color:"var(--sub)",letterSpacing:.8,fontWeight:600,marginBottom:10}}>SON İLANLAR</div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {posts.slice(0,3).map(p=>{
                    const m=CAT[p.category]
                    return (
                      <div key={p.id} style={{padding:12,background:"#6366f108",border:"1px solid #6366f122",borderRadius:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                          <span className="bdg" style={{background:m.color+"18",color:m.color,fontSize:10}}>{m.emoji} {m.label}</span>
                          <span style={{fontSize:10,color:"var(--sub)"}}>{ago(p.created_at)}</span>
                        </div>
                        <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{p.title}</div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
            <button className="gbtn" style={{marginTop:16}} onClick={onClose}>{t.close}</button>
          </>
        )}
      </div>
    </div>
  )
}

// ── AUTH ─────────────────────────────────────────────────────────────────────
function Auth({ onLogin }) {
  const [tab,setTab]=useState("login"), [name,setName]=useState(""), [email,setEmail]=useState("")
  const [pass,setPass]=useState(""), [accType,setAccType]=useState("ogrenci")
  const [err,setErr]=useState(""), [ok,setOk]=useState(""), [busy,setBusy]=useState(false)

  async function register() {
    setErr("");setOk("")
    if(!name.trim()) return setErr("İsim giriniz.")
    if(accType==="ogrenci"&&!validBilkent(email)) return setErr("Öğrenci hesabı için sadece @bilkent.edu.tr uzantılı e-posta kabul edilir.")
    if(pass.length<6) return setErr("Şifre en az 6 karakter olmalı.")
    setBusy(true)
    const {error}=await supabase.auth.signUp({email,password:pass,options:{data:{name,account_type:accType}}})
    setBusy(false)
    if(error) return setErr(error.message)
    setOk("✅ Doğrulama e-postası gönderildi! E-postanı kontrol et ve linke tıkla, sonra giriş yap.")
  }

  async function login() {
    setErr("");setOk("");setBusy(true)
    const {data,error}=await supabase.auth.signInWithPassword({email,password:pass})
    setBusy(false)
    if(error) return setErr(error.message==="Invalid login credentials"?"E-posta veya şifre hatalı.":error.message)
    const {data:profile}=await supabase.from("profiles").select("*").eq("id",data.user.id).single()
    if(!profile) await supabase.from("profiles").insert({id:data.user.id,name:data.user.user_metadata?.name||email.split("@")[0],email,account_type:data.user.user_metadata?.account_type||"ogrenci"})
    onLogin({id:data.user.id,name:profile?.name||data.user.user_metadata?.name||email.split("@")[0],email,avatar:profile?.avatar_url||null,account_type:profile?.account_type||data.user.user_metadata?.account_type||"ogrenci"})
  }

  async function resetPassword() {
    setErr("");setOk("")
    if(!email) return setErr("Önce e-posta adresini yaz.")
    setBusy(true)
    await supabase.auth.resetPasswordForEmail(email,{redirectTo:"https://kampus-gold.vercel.app"})
    setBusy(false)
    setOk("✅ Şifre sıfırlama maili gönderildi!")
  }

  return (
    <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:420}} className="fu">
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:56,height:56,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:16,display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>
            <span style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:24,color:"#fff"}}>K</span>
          </div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:24,color:"var(--text)"}}>Kampüs</div>
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

// ── NAV ───────────────────────────────────────────────────────────────────────
const NAV=[
  {key:"feed",icon:"🏠",labelKey:"allPosts"},
  {key:"staj",icon:"💼",labelKey:"internships"},
  {key:"search",icon:"🔍",labelKey:"discover"},
  {key:"messages",icon:"💬",labelKey:"messages"},
  {key:"notifications",icon:"🔔",labelKey:"notifications"},
  {key:"favorites",icon:"❤️",labelKey:"favorites"},
  {key:"profil",icon:"👤",labelKey:"profile"},
  {key:"settings",icon:"⚙️",labelKey:"settings"},
]

function Sidebar({active,setActive,user,onLogout,unread,notifCount,t}) {
  return (
    <div className="sidebar">
      <div className="logo-area">
        <div className="logo-icon">K</div>
        <div><div className="logo-text">Kampüs</div><div className="logo-sub">BİLKENT</div></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:4,flex:1,overflowY:"auto"}}>
        {NAV.map(n=>(
          <button key={n.key} className={`nav-item ${active===n.key?"active":""}`} onClick={()=>setActive(n.key)}>
            <span className="nav-icon">{n.icon}</span>
            {t[n.labelKey]?.split(" ")[0]||t[n.labelKey]}
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
            <div style={{fontSize:10,color:"var(--sub)"}}>{user.account_type==="sirket"?"🏢 Şirket":"🎓 Öğrenci"}</div>
          </div>
        </div>
        <button className="nav-item" onClick={onLogout} style={{color:"#ef4444"}}><span className="nav-icon">🚪</span>{t.logout}</button>
      </div>
    </div>
  )
}

function BottomNav({active,setActive,unread,notifCount}) {
  const items=[
    {key:"feed",icon:"🏠"},{key:"search",icon:"🔍"},{key:"messages",icon:"💬",badge:unread},
    {key:"notifications",icon:"🔔",badge:notifCount},{key:"profil",icon:"👤"},
  ]
  return (
    <div className="bottom-nav">
      <div className="bottom-nav-inner">
        {items.map(n=>(
          <button key={n.key} className={`bnav-item ${active===n.key?"active":""}`} onClick={()=>setActive(n.key)}>
            <span className="bnav-icon" style={{position:"relative"}}>
              {n.icon}
              {n.badge>0&&<span style={{position:"absolute",top:-4,right:-6,background:"#ef4444",color:"#fff",fontSize:9,padding:"1px 4px",borderRadius:100,fontWeight:700}}>{n.badge}</span>}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── POST CARD ─────────────────────────────────────────────────────────────────
function PostCard({p,user,onUserClick,onTagClick,onLike,onFav,onDelete,i=0,t}) {
  const m=CAT[p.category]
  const liked=(p.likes||[]).includes(user.email)
  const faved=(p.favorited_by||[]).includes(user.email)
  const mine=p.user_email===user.email
  return (
    <div className="card fu" style={{animationDelay:`${i*.04}s`}}>
      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
        <span className="bdg" style={{background:m.color+"18",color:m.color}}>{m.emoji} {m.label}</span>
        {p.location&&<span style={{fontSize:11,color:"var(--sub)"}}>📍 {p.location}</span>}
        <span style={{fontSize:11,color:"var(--sub)"}}>{ago(p.created_at)}</span>
        {mine&&<span className="bdg" style={{background:"#6366f111",color:"#6366f1"}}>{t.yourPost}</span>}
      </div>
      <div style={{fontWeight:600,fontSize:15,marginBottom:6,color:"var(--text)"}}>{p.title}</div>
      <div style={{fontSize:13,color:"var(--sub)",lineHeight:1.65,marginBottom:10}}>{p.description}</div>
      {(p.tags||[]).length>0&&(
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {(p.tags||[]).map(tag=>(
            <span key={tag} className="tag" onClick={()=>onTagClick&&onTagClick(tag)}>#{tag}</span>
          ))}
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}} onClick={()=>onUserClick(p.user_email)}>
          <Avatar name={p.user_name} size={24}/>
          <span style={{fontSize:12,color:"var(--sub)"}}>{p.user_name}</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <button className={`likebtn ${liked?"on":""}`} onClick={()=>onLike(p)}>{liked?"♥":"♡"} {(p.likes||[]).length}</button>
          <button className={`favbtn ${faved?"on":""}`} onClick={()=>onFav(p)}>{faved?"❤️":"🤍"}</button>
          {mine&&<button onClick={()=>onDelete(p.id)} style={{background:"none",border:"none",color:"var(--border)",cursor:"pointer",fontSize:15,padding:4,transition:"color .2s"}} onMouseOver={e=>e.target.style.color="#ef4444"} onMouseOut={e=>e.target.style.color="var(--border)"}>🗑</button>}
        </div>
      </div>
    </div>
  )
}

// ── FEED PAGE ─────────────────────────────────────────────────────────────────
function FeedPage({user,onUserClick,t}) {
  const [posts,setPosts]=useState([]), [filter,setFilter]=useState("all")
  const [search,setSearch]=useState(""), [location,setLocation]=useState("Tümü")
  const [tagFilter,setTagFilter]=useState(""), [myTab,setMyTab]=useState(false)
  const [modal,setModal]=useState(false)
  const [form,setForm]=useState({category:"ev",title:"",desc:"",location:"",tagInput:"",tags:[]})
  const [loading,setLoading]=useState(true), [posting,setPosting]=useState(false)

  useEffect(()=>{load()},[])

  async function load() {
    setLoading(true)
    const {data}=await supabase.from("posts").select("*").neq("category","staj").order("created_at",{ascending:false})
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
    const {data,error}=await supabase.from("posts").insert({user_id:user.id,user_name:user.name,user_email:user.email,category:form.category,title:form.title,description:form.desc,location:form.location,tags:form.tags,likes:[],favorited_by:[]}).select().single()
    if(!error) setPosts(prev=>[data,...prev])
    setForm({category:"ev",title:"",desc:"",location:"",tagInput:"",tags:[]})
    setModal(false);setPosting(false)
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

  const shown=posts.filter(p=>
    (filter==="all"||p.category===filter)&&
    (location==="Tümü"||p.location===location)&&
    (!tagFilter||(p.tags||[]).includes(tagFilter))&&
    (p.title.toLowerCase().includes(search.toLowerCase())||(p.description||"").toLowerCase().includes(search.toLowerCase())||(p.tags||[]).some(t=>t.includes(search.toLowerCase())))&&
    (!myTab||p.user_email===user.email)
  )

  return (
    <div className="page">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,color:"var(--text)"}}>{t.hello}, {user.name.split(" ")[0]} 👋</div>
          <div style={{fontSize:13,color:"var(--sub)",marginTop:2}}>{t.looking}</div>
        </div>
        {user.account_type!=="sirket"&&<button className="sbtn" onClick={()=>setModal(true)}>{t.newPost}</button>}
      </div>

      <div style={{position:"relative",marginBottom:14}}>
        <span style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:"var(--sub)",pointerEvents:"none"}}>🔍</span>
        <input className="srch" placeholder={t.search} value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>

      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
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

      <div style={{display:"flex",gap:20,borderBottom:"1px solid var(--border)",marginBottom:16}}>
        {[[t.allPosts,false],[t.myPosts,true]].map(([l,v])=>(
          <button key={String(v)} className={`tab ${myTab===v?"on":""}`} onClick={()=>setMyTab(v)}>{l}</button>
        ))}
      </div>

      <div style={{display:"flex",gap:8,marginBottom:20,overflowX:"auto",paddingBottom:4}}>
        <button className={`catbtn ${filter==="all"?"on":""}`} onClick={()=>setFilter("all")}>✦ Tümü</button>
        {Object.entries(CAT).filter(([k])=>k!=="staj").map(([k,v])=>(
          <button key={k} className={`catbtn ${filter===k?"on":""}`} onClick={()=>setFilter(k)}>{v.emoji} {v.label}</button>
        ))}
      </div>

      {loading?<div style={{textAlign:"center",padding:60}}><Spinner/></div>
      :shown.length===0?<Empty icon={myTab?"📭":"🔍"} text={myTab?t.noPost:t.noResult}/>
      :(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {shown.map((p,i)=><PostCard key={p.id} p={p} user={user} i={i} t={t} onUserClick={onUserClick} onTagClick={setTagFilter} onLike={toggleLike} onFav={toggleFav} onDelete={del}/>)}
        </div>
      )}

      {modal&&(
        <div className="ovl" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="mdl fu">
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:4,color:"var(--text)"}}>Yeni İlan</div>
            <div style={{fontSize:13,color:"var(--sub)",marginBottom:24}}>Bilkent öğrencileriyle paylaş</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><div className="lbl">{t.category.toUpperCase()}</div>
                <select className="sel" value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))}>
                  {Object.entries(CAT).filter(([k])=>k!=="staj").map(([k,v])=><option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
              </div>
              <div><div className="lbl">{t.title.toUpperCase()}</div><input className="inp" placeholder="Örn: Ev arkadaşı arıyorum" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
              <div><div className="lbl">{t.description.toUpperCase()}</div><textarea className="inp" placeholder="Detayları buraya yaz..." rows={4} style={{resize:"vertical"}} value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))}/></div>
              <div><div className="lbl">{t.location.toUpperCase()}</div>
                <select className="sel" value={form.location} onChange={e=>setForm(p=>({...p,location:e.target.value}))}>
                  <option value="">Seç (opsiyonel)</option>
                  {LOCATIONS.filter(l=>l!=="Tümü").map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <div className="lbl">{t.tags.toUpperCase()}</div>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <input className="inp" placeholder="etiket..." value={form.tagInput} onChange={e=>setForm(p=>({...p,tagInput:e.target.value}))} onKeyDown={e=>{if(e.key==="Enter"||e.key===","||e.key===" "){e.preventDefault();addTag()}}} style={{flex:1}}/>
                  <button onClick={addTag} style={{background:"#6366f1",color:"#fff",border:"none",borderRadius:10,padding:"0 14px",cursor:"pointer",fontWeight:600,fontSize:13}}>+</button>
                </div>
                {form.tags.length>0&&(
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {form.tags.map(t=>(
                      <span key={t} style={{display:"flex",alignItems:"center",gap:4,background:"#6366f111",border:"1px solid #6366f133",borderRadius:100,padding:"3px 10px",fontSize:12,color:"#6366f1"}}>
                        #{t}<button onClick={()=>setForm(p=>({...p,tags:p.tags.filter(x=>x!==t)}))} style={{background:"none",border:"none",color:"#6366f1",cursor:"pointer",fontSize:12,padding:0}}>✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{display:"flex",gap:10}}>
                <button className="gbtn" style={{flex:1}} onClick={()=>setModal(false)}>{t.cancel}</button>
                <button className="pbtn" style={{flex:2}} disabled={posting||!form.title.trim()||!form.desc.trim()} onClick={addPost}>{posting?<Spinner size={16}/>:t.newPost}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── SEARCH PAGE ───────────────────────────────────────────────────────────────
function SearchPage({user,onUserClick,onStartMessage,t}) {
  const [query,setQuery]=useState(""), [tab,setTab]=useState("posts")
  const [posts,setPosts]=useState([]), [users,setUsers]=useState([])
  const [loading,setLoading]=useState(false)

  useEffect(()=>{if(query.length>1)doSearch()},[query,tab])

  async function doSearch() {
    setLoading(true)
    if(tab==="posts"){
      const {data}=await supabase.from("posts").select("*").or(`title.ilike.%${query}%,description.ilike.%${query}%`).order("created_at",{ascending:false}).limit(20)
      setPosts(data||[])
    } else {
      const {data}=await supabase.from("profiles").select("*").or(`name.ilike.%${query}%,email.ilike.%${query}%,bolum.ilike.%${query}%`).limit(20)
      setUsers(data||[])
    }
    setLoading(false)
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

  return (
    <div className="page">
      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:20,color:"var(--text)"}}>{t.discover}</div>

      <div style={{position:"relative",marginBottom:16}}>
        <span style={{position:"absolute",left:16,top:"50%",transform:"translateY(-50%)",color:"var(--sub)",pointerEvents:"none"}}>🔍</span>
        <input className="srch" placeholder={t.searchPlaceholder} value={query} onChange={e=>setQuery(e.target.value)} autoFocus/>
      </div>

      <div style={{display:"flex",gap:16,borderBottom:"1px solid var(--border)",marginBottom:20}}>
        {[["posts",t.posts],["users",t.users]].map(([k,l])=>(
          <button key={k} className={`tab ${tab===k?"on":""}`} onClick={()=>setTab(k)}>{l}</button>
        ))}
      </div>

      {query.length<2?<Empty icon="🔍" text={t.typeToSearch}/>
      :loading?<div style={{textAlign:"center",padding:60}}><Spinner/></div>
      :tab==="posts"?(
        posts.length===0?<Empty icon="😕" text={t.noResult}/>:(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {posts.map((p,i)=><PostCard key={p.id} p={p} user={user} i={i} t={t} onUserClick={onUserClick} onLike={toggleLike} onFav={toggleFav} onDelete={async()=>{}}/>)}
          </div>
        )
      ):(
        users.length===0?<Empty icon="😕" text={t.noResult}/>:(
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {users.map(u=>(
              <div key={u.id} className="user-row" onClick={()=>onUserClick(u.email)}>
                <Avatar name={u.name} src={u.avatar_url} size={48}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:600,fontSize:15,color:"var(--text)"}}>{u.name}</div>
                  <div style={{fontSize:12,color:"var(--sub)"}}>{u.bolum||""}{u.sinif?` · ${u.sinif}. Sınıf`:""}</div>
                  <div style={{fontSize:11,color:"var(--sub)",marginTop:2}}>{u.account_type==="sirket"?"🏢 Şirket":"🎓 Öğrenci"}</div>
                </div>
                <button className="sbtn" style={{fontSize:12,padding:"6px 14px"}} onClick={e=>{e.stopPropagation();onStartMessage(u)}}>💬</button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}

// ── NOTIFICATIONS PAGE ────────────────────────────────────────────────────────
function NotificationsPage({user,onUpdate,t}) {
  const [requests,setRequests]=useState([]), [loading,setLoading]=useState(true)

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
      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:20,color:"var(--text)"}}>{t.notifications}</div>
      {loading?<div style={{textAlign:"center",padding:60}}><Spinner/></div>
      :requests.length===0?<Empty icon="🔔" text={t.noNotif}/>
      :(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          <div style={{fontSize:13,color:"var(--sub)",marginBottom:4}}>{t.followReq} ({requests.length})</div>
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
                  <button onClick={()=>accept(r.id)} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:100,padding:"7px 16px",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontWeight:600,fontSize:12}}>{t.accept}</button>
                  <button onClick={()=>reject(r.id)} style={{background:"none",border:"1px solid var(--border)",borderRadius:100,padding:"7px 14px",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontSize:12,color:"var(--sub)"}}>{t.reject}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── MESSAGES PAGE ─────────────────────────────────────────────────────────────
function MessagesPage({user,onUnreadChange,startWith,t}) {
  const [convos,setConvos]=useState([]), [active,setActive]=useState(null)
  const [msgs,setMsgs]=useState([]), [newMsg,setNewMsg]=useState("")
  const [loading,setLoading]=useState(true), [sending,setSending]=useState(false)
  const bottomRef=useRef()

  useEffect(()=>{loadConvos()},[])
  useEffect(()=>{
    if(startWith){
      setActive(startWith.email)
      setConvos(prev=>prev.find(c=>c.email===startWith.email)?prev:[{email:startWith.email,name:startWith.name,last:null,unread:0},...prev])
    }
  },[startWith])
  useEffect(()=>{if(active)loadMsgs(active)},[active])
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"})},[msgs])

  async function loadConvos() {
    setLoading(true)
    const {data}=await supabase.from("messages").select("*").or(`from_email.eq.${user.email},to_email.eq.${user.email}`).order("created_at",{ascending:false})
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
    await supabase.from("messages").insert({from_email:user.email,from_name:user.name,to_email:active,to_name:convo?.name||active,content:newMsg})
    setNewMsg("");await loadMsgs(active);setSending(false)
  }

  return (
    <div style={{maxWidth:900,margin:"0 auto",padding:"32px 24px 40px"}}>
      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:20,color:"var(--text)"}}>{t.messages}</div>
      <div style={{display:"grid",gridTemplateColumns:active?"280px 1fr":"1fr",gap:16,height:"calc(100vh-200px)",minHeight:400}}>
        <div style={{display:"flex",flexDirection:"column",gap:8,overflowY:"auto"}}>
          {loading?<div style={{textAlign:"center",padding:40}}><Spinner/></div>
          :convos.length===0?<Empty icon="💬" text={t.noMsg}/>
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
          <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,display:"flex",flexDirection:"column",overflow:"hidden",minHeight:400}}>
            <div style={{padding:"14px 16px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10}}>
              <Avatar name={convos.find(c=>c.email===active)?.name||active} size={32}/>
              <div style={{fontWeight:600,fontSize:14,color:"var(--text)"}}>{convos.find(c=>c.email===active)?.name||active}</div>
            </div>
            <div style={{flex:1,overflowY:"auto",padding:16,display:"flex",flexDirection:"column",gap:8}}>
              {msgs.map(m=>(
                <div key={m.id} className={`msg-bubble ${m.from_email===user.email?"mine":"theirs"}`}>
                  {m.content}
                  <div style={{fontSize:10,opacity:.6,marginTop:4}}>{ago(m.created_at)}</div>
                </div>
              ))}
              <div ref={bottomRef}/>
            </div>
            <div style={{padding:12,borderTop:"1px solid var(--border)",display:"flex",gap:8}}>
              <input className="inp" placeholder="Mesaj yaz..." value={newMsg} onChange={e=>setNewMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} style={{flex:1}}/>
              <button onClick={send} disabled={sending||!newMsg.trim()} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:12,padding:"0 18px",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontWeight:600,fontSize:13,minWidth:72}}>
                {sending?<Spinner size={14}/>:t.send}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── FAVORİLER PAGE ────────────────────────────────────────────────────────────
function FavoritesPage({user,onUserClick,t}) {
  const [posts,setPosts]=useState([]), [loading,setLoading]=useState(true)

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

  async function toggleLike(post) {
    const nl=(post.likes||[]).includes(user.email)?(post.likes||[]).filter(e=>e!==user.email):[...(post.likes||[]),user.email]
    await supabase.from("posts").update({likes:nl}).eq("id",post.id)
    setPosts(prev=>prev.map(p=>p.id===post.id?{...p,likes:nl}:p))
  }

  return (
    <div className="page">
      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:20,color:"var(--text)"}}>{t.favorites}</div>
      {loading?<div style={{textAlign:"center",padding:60}}><Spinner/></div>
      :posts.length===0?<Empty icon="❤️" text={t.noFav}/>
      :<div style={{display:"flex",flexDirection:"column",gap:10}}>{posts.map((p,i)=><PostCard key={p.id} p={p} user={user} i={i} t={t} onUserClick={onUserClick} onLike={toggleLike} onFav={toggleFav} onDelete={async()=>{}}/>)}</div>}
    </div>
  )
}

// ── STAJ PAGE ─────────────────────────────────────────────────────────────────
function StajPage({user,t}) {
  const [posts,setPosts]=useState([]), [loading,setLoading]=useState(true)
  const [modal,setModal]=useState(false), [applyModal,setApplyModal]=useState(null)
  const [form,setForm]=useState({title:"",desc:"",sirket:"",lokasyon:""}), [applyMsg,setApplyMsg]=useState("")
  const [posting,setPosting]=useState(false), [applying,setApplying]=useState(false), [ok,setOk]=useState("")
  const isSirket=user.account_type==="sirket"

  useEffect(()=>{
    (async()=>{
      setLoading(true)
      const {data}=await supabase.from("posts").select("*").eq("category","staj").order("created_at",{ascending:false})
      setPosts(data||[]);setLoading(false)
    })()
  },[])

  async function addStaj() {
    if(!form.title.trim()||!form.desc.trim()) return
    setPosting(true)
    const {data,error}=await supabase.from("posts").insert({user_id:user.id,user_name:form.sirket||user.name,user_email:user.email,category:"staj",title:form.title,description:`${form.desc}${form.lokasyon?"\n\n📍 "+form.lokasyon:""}`,likes:[],favorited_by:[],tags:[],location:form.lokasyon}).select().single()
    if(!error) setPosts(prev=>[data,...prev])
    setForm({title:"",desc:"",sirket:"",lokasyon:""});setModal(false);setPosting(false)
  }

  async function apply() {
    setApplying(true);await new Promise(r=>setTimeout(r,1000))
    setApplying(false);setApplyModal(null);setApplyMsg("")
    setOk("✅ Başvurun alındı! Şirket seninle iletişime geçecek.")
    setTimeout(()=>setOk(""),4000)
  }

  return (
    <div className="page">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,color:"var(--text)"}}>{t.internships}</div>
          <div style={{fontSize:13,color:"var(--sub)",marginTop:2}}>{t.internshipSub}</div>
        </div>
        {isSirket&&<button className="sbtn" onClick={()=>setModal(true)}>{t.postInternship}</button>}
      </div>
      {!isSirket&&<div style={{background:"#6366f111",border:"1px solid #6366f133",borderRadius:14,padding:"12px 16px",fontSize:13,color:"#6366f1",marginBottom:20,fontWeight:500}}>{t.companyHint}</div>}
      {ok&&<div className="ok" style={{marginBottom:16}}>{ok}</div>}

      {loading?<div style={{textAlign:"center",padding:60}}><Spinner/></div>
      :posts.length===0?<Empty icon="💼" text="Henüz staj ilanı yok."/>
      :(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {posts.map((p,i)=>(
            <div key={p.id} className="card fu" style={{animationDelay:`${i*.04}s`}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <span className="bdg" style={{background:"#e0f2fe",color:"#0284c7"}}>💼 {t.internshipNote}</span>
                <span style={{fontSize:11,color:"var(--sub)"}}>{ago(p.created_at)}</span>
              </div>
              <div style={{fontWeight:700,fontSize:16,color:"var(--text)",marginBottom:4}}>{p.title}</div>
              <div style={{fontSize:13,fontWeight:600,color:"#6366f1",marginBottom:8}}>{p.user_name}</div>
              <div style={{fontSize:13,color:"var(--sub)",lineHeight:1.65,marginBottom:16,whiteSpace:"pre-line"}}>{p.description}</div>
              {!isSirket&&<button onClick={()=>setApplyModal(p)} style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",color:"#fff",border:"none",borderRadius:100,padding:"8px 20px",fontFamily:"'Plus Jakarta Sans'",fontWeight:600,fontSize:13,cursor:"pointer"}}>{t.apply}</button>}
            </div>
          ))}
        </div>
      )}

      {modal&&isSirket&&(
        <div className="ovl" onClick={e=>e.target===e.currentTarget&&setModal(false)}>
          <div className="mdl fu">
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:4,color:"var(--text)"}}>Staj İlanı Ver</div>
            <div style={{fontSize:13,color:"var(--sub)",marginBottom:24}}>Bilkent öğrencilerine duyur</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><div className="lbl">{t.company.toUpperCase()}</div><input className="inp" placeholder="Şirket adı" value={form.sirket} onChange={e=>setForm(p=>({...p,sirket:e.target.value}))}/></div>
              <div><div className="lbl">{t.position.toUpperCase()}</div><input className="inp" placeholder="Örn: Yazılım Stajyeri" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))}/></div>
              <div><div className="lbl">{t.description.toUpperCase()}</div><textarea className="inp" placeholder="Staj detayları..." rows={4} style={{resize:"vertical"}} value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))}/></div>
              <div><div className="lbl">{t.location.toUpperCase()}</div><input className="inp" placeholder="Örn: Ankara (Hibrit)" value={form.lokasyon} onChange={e=>setForm(p=>({...p,lokasyon:e.target.value}))}/></div>
              <div style={{display:"flex",gap:10}}>
                <button className="gbtn" style={{flex:1}} onClick={()=>setModal(false)}>{t.cancel}</button>
                <button className="pbtn" style={{flex:2}} disabled={posting||!form.title.trim()||!form.desc.trim()} onClick={addStaj}>{posting?<Spinner size={16}/>:t.publish}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {applyModal&&!isSirket&&(
        <div className="ovl" onClick={e=>e.target===e.currentTarget&&setApplyModal(null)}>
          <div className="mdl fu">
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:20,marginBottom:4,color:"var(--text)"}}>{applyModal.title}</div>
            <div style={{fontSize:13,color:"#6366f1",fontWeight:600,marginBottom:20}}>{applyModal.user_name}</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              <div><div className="lbl">{t.applyMsg.toUpperCase()}</div><textarea className="inp" placeholder="Kendinizi kısaca tanıtın..." rows={5} style={{resize:"vertical"}} value={applyMsg} onChange={e=>setApplyMsg(e.target.value)}/></div>
              <div style={{background:"#6366f108",borderRadius:12,padding:"12px 16px",fontSize:13,color:"var(--sub)"}}>📧 {t.emailNote} <strong>{user.email}</strong></div>
              <div style={{display:"flex",gap:10}}>
                <button className="gbtn" style={{flex:1}} onClick={()=>setApplyModal(null)}>{t.cancel}</button>
                <button className="pbtn" style={{flex:2}} disabled={applying||!applyMsg.trim()} onClick={apply}>{applying?<Spinner size={16}/>:t.apply}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── PROFİL PAGE ───────────────────────────────────────────────────────────────
function ProfilPage({user,setUser,t}) {
  const [profile,setProfile]=useState(null), [editing,setEditing]=useState(false)
  const [form,setForm]=useState({name:"",bio:"",bolum:"",sinif:""})
  const [saving,setSaving]=useState(false), [uploading,setUploading]=useState(false)
  const [myPosts,setMyPosts]=useState([]), [loaded,setLoaded]=useState(false)
  const [followers,setFollowers]=useState(0), [following,setFollowing]=useState(0)
  const fileRef=useRef()

  useEffect(()=>{loadProfile()},[])

  async function loadProfile() {
    const [{data:p},{data:ps},{data:frs},{data:fng}]=await Promise.all([
      supabase.from("profiles").select("*").eq("id",user.id).single(),
      supabase.from("posts").select("*").eq("user_email",user.email).order("created_at",{ascending:false}),
      supabase.from("follows").select("id").eq("following_email",user.email).eq("status","accepted"),
      supabase.from("follows").select("id").eq("follower_email",user.email).eq("status","accepted"),
    ])
    const prof=p||{id:user.id,email:user.email,name:user.name,bio:"",bolum:"",sinif:"",avatar_url:null}
    setProfile(prof);setForm({name:prof.name||"",bio:prof.bio||"",bolum:prof.bolum||"",sinif:prof.sinif||""})
    setMyPosts(ps||[]);setFollowers(frs?.length||0);setFollowing(fng?.length||0);setLoaded(true)
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
            <div style={{fontSize:12,color:"var(--sub)",marginTop:2}}>{profile.email}</div>
            <div style={{fontSize:12,color:"#6366f1",marginTop:3,fontWeight:500}}>{user.account_type==="sirket"?"🏢 Şirket":"🎓 Öğrenci"}</div>
            {profile.bolum&&<div style={{fontSize:13,color:"#6366f1",fontWeight:500,marginTop:4}}>{profile.bolum}{profile.sinif&&` · ${profile.sinif}. Sınıf`}</div>}
            <div style={{fontSize:11,color:"var(--sub)",marginTop:4}}>{joinYear(profile.created_at)}{t.memberSince}</div>
          </div>
          <button onClick={()=>setEditing(!editing)} style={{background:"none",border:"1px solid var(--border)",borderRadius:100,padding:"6px 14px",fontSize:12,color:"var(--sub)",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontWeight:500}}>
            {editing?t.cancel:t.edit}
          </button>
        </div>

        {profile.bio&&!editing&&<div style={{fontSize:13,color:"var(--sub)",lineHeight:1.6,padding:"12px 0",borderTop:"1px solid var(--border)"}}>{profile.bio}</div>}

        {editing&&(
          <div style={{display:"flex",flexDirection:"column",gap:12,borderTop:"1px solid var(--border)",paddingTop:16}}>
            <div><div className="lbl">{t.name.toUpperCase()}</div><input className="inp" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
            {user.account_type!=="sirket"&&<>
              <div><div className="lbl">{t.department.toUpperCase()}</div><input className="inp" placeholder="Bilgisayar Mühendisliği" value={form.bolum} onChange={e=>setForm(p=>({...p,bolum:e.target.value}))}/></div>
              <div><div className="lbl">{t.grade.toUpperCase()}</div>
                <select className="sel" value={form.sinif} onChange={e=>setForm(p=>({...p,sinif:e.target.value}))}>
                  <option value="">{t.select}</option>
                  {[[1,t.year1],[2,t.year2],[3,t.year3],[4,t.year4]].map(([n,l])=><option key={n} value={n}>{l}</option>)}
                  <option value="Yüksek Lisans">{t.masters}</option>
                </select>
              </div>
            </>}
            <div><div className="lbl">{t.bio.toUpperCase()}</div><textarea className="inp" placeholder="Kendini kısaca tanıt..." rows={3} style={{resize:"vertical"}} value={form.bio} onChange={e=>setForm(p=>({...p,bio:e.target.value}))}/></div>
            <button className="pbtn" disabled={saving} onClick={saveProfile}>{saving?<Spinner size={16}/>:t.save}</button>
          </div>
        )}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[[t.post,myPosts.length],[t.like,myPosts.reduce((a,p)=>a+(p.likes||[]).length,0)],[t.follower,followers],[t.followingLbl,following]].map(([l,v])=>(
          <div key={l} className="stat-card">
            <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:20,color:"#6366f1"}}>{v}</div>
            <div style={{fontSize:11,color:"var(--sub)"}}>{l}</div>
          </div>
        ))}
      </div>

      <div className="section-title">{t.myPosts}</div>
      {myPosts.length===0?<Empty icon="📭" text={t.noPost}/>:(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {myPosts.map(p=>{
            const m=CAT[p.category]
            return (
              <div key={p.id} className="card">
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span className="bdg" style={{background:m.color+"18",color:m.color}}>{m.emoji} {m.label}</span>
                  {p.location&&<span style={{fontSize:11,color:"var(--sub)"}}>📍 {p.location}</span>}
                  <span style={{fontSize:11,color:"var(--sub)"}}>{ago(p.created_at)}</span>
                </div>
                <div style={{fontWeight:600,fontSize:14,color:"var(--text)",marginBottom:4}}>{p.title}</div>
                {(p.tags||[]).length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>{(p.tags||[]).map(tag=><span key={tag} className="tag">#{tag}</span>)}</div>}
                <div style={{fontSize:12,color:"var(--sub)"}}>♥ {(p.likes||[]).length} {t.like.toLowerCase()}</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── SETTINGS PAGE ─────────────────────────────────────────────────────────────
function SettingsPage({dark,setDark,lang,setLang,t}) {
  return (
    <div className="page">
      <div style={{fontFamily:"'Sora',sans-serif",fontWeight:700,fontSize:22,marginBottom:24,color:"var(--text)"}}>{t.settings}</div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:20}}>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:15,marginBottom:16,color:"var(--text)"}}>{t.appearance}</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
            <div>
              <div style={{fontSize:14,fontWeight:500,color:"var(--text)"}}>🌙 {t.darkMode}</div>
              <div style={{fontSize:12,color:"var(--sub)",marginTop:2}}>{t.darkModeSub}</div>
            </div>
            <button className={`toggle ${dark?"on":""}`} onClick={()=>setDark(!dark)}/>
          </div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0"}}>
            <div>
              <div style={{fontSize:14,fontWeight:500,color:"var(--text)"}}>🌐 {t.language}</div>
              <div style={{fontSize:12,color:"var(--sub)",marginTop:2}}>{t.langSub}</div>
            </div>
            <div style={{display:"flex",gap:8}}>
              {[["tr","🇹🇷 TR"],["en","🇬🇧 EN"]].map(([k,l])=>(
                <button key={k} onClick={()=>setLang(k)} style={{padding:"6px 14px",borderRadius:100,border:`2px solid ${lang===k?"#6366f1":"var(--border)"}`,background:lang===k?"#6366f111":"transparent",color:lang===k?"#6366f1":"var(--sub)",cursor:"pointer",fontFamily:"'Plus Jakarta Sans'",fontWeight:600,fontSize:12}}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{background:"var(--card)",border:"1px solid var(--border)",borderRadius:16,padding:20}}>
          <div style={{fontFamily:"'Sora',sans-serif",fontWeight:600,fontSize:15,marginBottom:12,color:"var(--text)"}}>{t.about}</div>
          <div style={{fontSize:13,color:"var(--sub)",lineHeight:1.7}}>Kampüs, Bilkent Üniversitesi öğrencileri için geliştirilmiş sosyal platform ve ilan ağıdır.</div>
          <div style={{marginTop:10,fontSize:12,color:"#6366f1",fontWeight:500}}>v4.0.0 · Bilkent Exclusive</div>
        </div>
      </div>
    </div>
  )
}

// ── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(null), [ready,setReady]=useState(false)
  const [page,setPage]=useState("feed"), [dark,setDark]=useState(false), [lang,setLang]=useState("tr")
  const [unread,setUnread]=useState(0), [notifCount,setNotifCount]=useState(0)
  const [viewingUser,setViewingUser]=useState(null), [startMsgWith,setStartMsgWith]=useState(null)

  const t = lang==="tr" ? TR : EN

  useEffect(()=>{
    supabase.auth.getSession().then(async({data:{session}})=>{
      if(session){
        const u=session.user
        const {data:profile}=await supabase.from("profiles").select("*").eq("id",u.id).single()
        setUser({id:u.id,name:profile?.name||u.user_metadata?.name||u.email.split("@")[0],email:u.email,avatar:profile?.avatar_url||null,account_type:profile?.account_type||u.user_metadata?.account_type||"ogrenci"})
      }
      setReady(true)
    })
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_e,session)=>{if(!session)setUser(null)})
    return ()=>subscription.unsubscribe()
  },[])

  function handleStartMessage(profile) {
    setStartMsgWith(profile);setPage("messages")
  }

  const logout=async()=>{await supabase.auth.signOut();setUser(null)}

  if(!ready) return (
    <div style={{minHeight:"100vh",background:"#f5f4f0",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <span style={{color:"#6366f1",fontSize:32,animation:"spin .8s linear infinite",display:"inline-block"}}>⟳</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if(!user) return <><style>{getCSS(false)}</style><Auth onLogin={setUser}/></>

  const pages={
    feed:          <FeedPage user={user} onUserClick={setViewingUser} t={t}/>,
    staj:          <StajPage user={user} t={t}/>,
    search:        <SearchPage user={user} onUserClick={setViewingUser} onStartMessage={handleStartMessage} t={t}/>,
    messages:      <MessagesPage user={user} onUnreadChange={setUnread} startWith={startMsgWith} t={t}/>,
    notifications: <NotificationsPage user={user} onUpdate={setNotifCount} t={t}/>,
    favorites:     <FavoritesPage user={user} onUserClick={setViewingUser} t={t}/>,
    profil:        <ProfilPage user={user} setUser={setUser} t={t}/>,
    settings:      <SettingsPage dark={dark} setDark={setDark} lang={lang} setLang={setLang} t={t}/>,
  }

  return (
    <>
      <style>{getCSS(dark)}</style>
      <div className="layout">
        <Sidebar active={page} setActive={setPage} user={user} onLogout={logout} unread={unread} notifCount={notifCount} t={t}/>
        <div className="main-content">{pages[page]}</div>
        <BottomNav active={page} setActive={setPage} unread={unread} notifCount={notifCount}/>
      </div>
      {viewingUser&&(
        <UserProfileModal email={viewingUser} currentUser={user} onClose={()=>setViewingUser(null)} onMessage={handleStartMessage} t={t}/>
      )}
    </>
  )
}