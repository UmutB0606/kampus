import { useState, useEffect } from "react"
import { supabase } from "./supabase"

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const CAT = {
  ev:   { label:"Ev & Arkadaş", emoji:"🏠", color:"#4ade80" },
  esya: { label:"Eşya",         emoji:"🪑", color:"#60a5fa" },
  staj: { label:"Staj",         emoji:"💼", color:"#f472b6" },
  ders: { label:"Ders",         emoji:"📚", color:"#a78bfa" },
}

function ago(ts) {
  const d = Date.now() - new Date(ts).getTime()
  if (d < 3600000)  return `${Math.floor(d/60000)} dk önce`
  if (d < 86400000) return `${Math.floor(d/3600000)} saat önce`
  return `${Math.floor(d/86400000)} gün önce`
}

const validEmail = e => e.endsWith("@bilkent.edu.tr") || e.endsWith("@ug.bilkent.edu.tr")

// ── STYLES ───────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Bebas+Neue&display=swap');
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#0d0d0d;color:#f0ede8;}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:#f0a500;border-radius:2px}
.card{background:#161616;border:1px solid #222;border-radius:16px;padding:20px;transition:all .2s;}
.card:hover{border-color:#f0a500;transform:translateY(-2px);box-shadow:0 8px 32px rgba(240,165,0,.08);}
.catbtn{background:#161616;border:1px solid #2a2a2a;border-radius:100px;padding:8px 18px;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;color:#888;transition:all .2s;display:flex;align-items:center;gap:6px;white-space:nowrap;}
.catbtn:hover{border-color:#444;color:#f0ede8;}
.catbtn.on{background:#f0a500;border-color:#f0a500;color:#0d0d0d;font-weight:600;}
.likebtn{background:none;border:1px solid #2a2a2a;border-radius:100px;padding:5px 12px;cursor:pointer;font-size:12px;color:#888;transition:all .2s;display:flex;align-items:center;gap:5px;font-family:'DM Sans',sans-serif;}
.likebtn:hover,.likebtn.on{border-color:#f0a500;color:#f0a500;}
.likebtn.on{background:rgba(240,165,0,.1);}
.pbtn{background:#f0a500;color:#0d0d0d;border:none;border-radius:12px;padding:13px 24px;font-family:'DM Sans',sans-serif;font-weight:600;font-size:14px;cursor:pointer;transition:all .2s;width:100%;}
.pbtn:hover{background:#ffc433;}
.pbtn:disabled{opacity:.4;cursor:not-allowed;}
.gbtn{background:none;border:1px solid #2a2a2a;border-radius:12px;padding:13px 24px;color:#888;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:14px;transition:all .2s;width:100%;}
.gbtn:hover{border-color:#444;color:#f0ede8;}
.inp{background:#0d0d0d;border:1px solid #2a2a2a;border-radius:12px;padding:12px 16px;color:#f0ede8;font-family:'DM Sans',sans-serif;font-size:14px;width:100%;outline:none;transition:border .2s;}
.inp:focus{border-color:#f0a500;}
.inp::placeholder{color:#444;}
.sel{background:#0d0d0d;border:1px solid #2a2a2a;border-radius:12px;padding:12px 16px;color:#f0ede8;font-family:'DM Sans',sans-serif;font-size:14px;width:100%;outline:none;cursor:pointer;}
.ovl{position:fixed;inset:0;background:rgba(0,0,0,.85);backdrop-filter:blur(8px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;}
.mdl{background:#161616;border:1px solid #2a2a2a;border-radius:24px;padding:32px;width:100%;max-width:440px;max-height:90vh;overflow-y:auto;}
.lbl{font-size:11px;color:#666;letter-spacing:.8px;font-weight:500;margin-bottom:6px;}
.bdg{display:inline-block;padding:3px 10px;border-radius:100px;font-size:11px;font-weight:600;}
.tab{background:none;border:none;padding:8px 0;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;color:#555;border-bottom:2px solid transparent;white-space:nowrap;}
.tab.on{color:#f0a500;border-bottom-color:#f0a500;}
.srch{background:#161616;border:1px solid #222;border-radius:100px;padding:10px 20px 10px 44px;color:#f0ede8;font-family:'DM Sans',sans-serif;font-size:14px;width:100%;outline:none;transition:border .2s;}
.srch:focus{border-color:#f0a500;}
.srch::placeholder{color:#444;}
.err{color:#ef4444;font-size:12px;background:rgba(239,68,68,.08);padding:10px 14px;border-radius:10px;border:1px solid rgba(239,68,68,.2);}
.ok{color:#4ade80;font-size:13px;background:rgba(74,222,128,.08);padding:12px 14px;border-radius:10px;border:1px solid rgba(74,222,128,.2);line-height:1.5;}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fadeUp .3s ease forwards;}
@keyframes spin{to{transform:rotate(360deg)}}
.sp{animation:spin .8s linear infinite;display:inline-block;}
`

// ── AUTH SCREEN ───────────────────────────────────────────────────────────────
function Auth({ onLogin }) {
  const [tab, setTab]     = useState("login")
  const [name, setName]   = useState("")
  const [email, setEmail] = useState("")
  const [pass, setPass]   = useState("")
  const [err, setErr]     = useState("")
  const [ok, setOk]       = useState("")
  const [busy, setBusy]   = useState(false)

  async function register() {
    setErr(""); setOk("")
    if (!name.trim())       return setErr("İsim giriniz.")
    if (!validEmail(email)) return setErr("Sadece @bilkent.edu.tr uzantılı e-posta kabul edilir.")
    if (pass.length < 6)    return setErr("Şifre en az 6 karakter olmalı.")
    setBusy(true)
    const { error } = await supabase.auth.signUp({
      email, password: pass,
      options: { data: { name } }
    })
    setBusy(false)
    if (error) return setErr(error.message)
    setOk("✅ Doğrulama e-postası gönderildi! Bilkent e-postanı kontrol et ve linke tıkla, sonra giriş yap.")
  }

  async function login() {
    setErr(""); setOk("")
    if (!validEmail(email)) return setErr("Sadece @bilkent.edu.tr uzantılı e-posta kabul edilir.")
    setBusy(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass })
    setBusy(false)
    if (error) return setErr(error.message === "Invalid login credentials" ? "E-posta veya şifre hatalı." : error.message)
    // Profile kontrolü / oluşturma
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()
    if (!profile) {
      await supabase.from("profiles").insert({ id: data.user.id, name: data.user.user_metadata?.name || email.split("@")[0], email })
    }
    onLogin({ id: data.user.id, name: profile?.name || data.user.user_metadata?.name || email.split("@")[0], email })
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0d0d0d", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ width:"100%", maxWidth:400 }} className="fu">
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ width:54, height:54, background:"#f0a500", borderRadius:14, display:"inline-flex", alignItems:"center", justifyContent:"center", marginBottom:10 }}>
            <span style={{ fontFamily:"'Bebas Neue'", fontSize:30, color:"#0d0d0d" }}>K</span>
          </div>
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:26, letterSpacing:3, color:"#f0ede8" }}>KAMPÜS</div>
          <div style={{ fontSize:10, color:"#f0a500", letterSpacing:2, marginTop:2 }}>BİLKENT ÜNİVERSİTESİ</div>
        </div>

        <div style={{ background:"#161616", border:"1px solid #222", borderRadius:24, padding:28 }}>
          <div style={{ display:"flex", gap:20, marginBottom:22, borderBottom:"1px solid #1e1e1e", paddingBottom:12 }}>
            {[["login","Giriş Yap"],["register","Kayıt Ol"]].map(([k,l]) => (
              <button key={k} className={`tab ${tab===k?"on":""}`} onClick={() => { setTab(k); setErr(""); setOk("") }}>{l}</button>
            ))}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {tab === "register" && (
              <div>
                <div className="lbl">ADIN SOYADIN</div>
                <input className="inp" placeholder="Ali Yılmaz" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            <div>
              <div className="lbl">BİLKENT E-POSTA</div>
              <input className="inp" type="email" placeholder="ad.soyad@bilkent.edu.tr" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <div className="lbl">ŞİFRE</div>
              <input className="inp" type="password" placeholder={tab==="register"?"En az 6 karakter":"••••••••"} value={pass} onChange={e => setPass(e.target.value)} onKeyDown={e => e.key==="Enter" && (tab==="login"?login():register())} />
            </div>
            {err && <div className="err">{err}</div>}
            {ok  && <div className="ok">{ok}</div>}
            <button className="pbtn" disabled={busy} onClick={tab==="login"?login:register}>
              {busy ? <span className="sp">⟳</span> : tab==="login" ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </div>
        </div>
        <div style={{ textAlign:"center", marginTop:14, fontSize:11, color:"#444" }}>Sadece @bilkent.edu.tr e-postaları kabul edilir</div>
      </div>
    </div>
  )
}

// ── MAIN SCREEN ───────────────────────────────────────────────────────────────
function Main({ user, onLogout }) {
  const [posts, setPosts]   = useState([])
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [myTab, setMyTab]   = useState(false)
  const [modal, setModal]   = useState(false)
  const [form, setForm]     = useState({ category:"ev", title:"", desc:"" })
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    setLoading(true)
    const { data } = await supabase.from("posts").select("*").order("created_at", { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function toggleLike(post) {
    const likes = post.likes || []
    const newLikes = likes.includes(user.email)
      ? likes.filter(e => e !== user.email)
      : [...likes, user.email]
    await supabase.from("posts").update({ likes: newLikes }).eq("id", post.id)
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: newLikes } : p))
  }

  async function addPost() {
    if (!form.title.trim() || !form.desc.trim()) return
    setPosting(true)
    const { data, error } = await supabase.from("posts").insert({
      user_id: user.id, user_name: user.name, user_email: user.email,
      category: form.category, title: form.title, description: form.desc, likes: []
    }).select().single()
    if (!error) { setPosts(prev => [data, ...prev]) }
    setForm({ category:"ev", title:"", desc:"" })
    setModal(false); setMyTab(false); setPosting(false)
  }

  async function deletePost(id) {
    if (!confirm("Bu ilanı silmek istiyor musun?")) return
    await supabase.from("posts").delete().eq("id", id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  const shown = posts.filter(p =>
    (filter === "all" || p.category === filter) &&
    (p.title.toLowerCase().includes(search.toLowerCase()) || (p.description||"").toLowerCase().includes(search.toLowerCase())) &&
    (!myTab || p.user_email === user.email)
  )

  const countCat = k => posts.filter(p => p.category === k).length

  return (
    <div style={{ minHeight:"100vh", background:"#0d0d0d", fontFamily:"'DM Sans',sans-serif", color:"#f0ede8" }}>

      {/* Header */}
      <div style={{ borderBottom:"1px solid #1a1a1a", padding:"0 20px", position:"sticky", top:0, background:"rgba(13,13,13,.96)", backdropFilter:"blur(12px)", zIndex:50 }}>
        <div style={{ maxWidth:800, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:60 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:30, height:30, background:"#f0a500", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontFamily:"'Bebas Neue'", fontSize:18, color:"#0d0d0d" }}>K</span>
            </div>
            <div>
              <div style={{ fontFamily:"'Bebas Neue'", fontSize:18, letterSpacing:2, lineHeight:1 }}>KAMPÜS</div>
              <div style={{ fontSize:9, color:"#f0a500", letterSpacing:1.5 }}>BİLKENT</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <button onClick={() => setModal(true)} style={{ background:"#f0a500", color:"#0d0d0d", border:"none", borderRadius:100, padding:"8px 18px", fontFamily:"'DM Sans'", fontWeight:600, fontSize:13, cursor:"pointer" }}>+ İlan Ver</button>
            <button onClick={onLogout} style={{ background:"none", border:"1px solid #2a2a2a", borderRadius:100, padding:"7px 14px", color:"#555", cursor:"pointer", fontSize:12, fontFamily:"'DM Sans'" }}>Çıkış</button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:800, margin:"0 auto", padding:"24px 20px 80px" }}>

        {/* Hero */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:"'Bebas Neue'", fontSize:"clamp(30px,7vw,52px)", lineHeight:.95, letterSpacing:2, marginBottom:6 }}>
            MERHABA, <span style={{ color:"#f0a500" }}>{user.name.split(" ")[0].toUpperCase()}</span>
          </div>
          <p style={{ color:"#555", fontSize:13 }}>Bilkent öğrenci ağına hoş geldin.</p>
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:24 }}>
          {Object.entries(CAT).map(([k,v]) => (
            <div key={k} onClick={() => setFilter(k)} style={{ background:"#161616", border:`1px solid ${filter===k?"#f0a500":"#1e1e1e"}`, borderRadius:12, padding:"12px 8px", textAlign:"center", cursor:"pointer", transition:"all .2s" }}>
              <div style={{ fontSize:18, marginBottom:3 }}>{v.emoji}</div>
              <div style={{ fontFamily:"'Bebas Neue'", fontSize:22, color:"#f0a500", letterSpacing:1 }}>{countCat(k)}</div>
              <div style={{ fontSize:10, color:"#555" }}>{v.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:20, borderBottom:"1px solid #1e1e1e", marginBottom:16 }}>
          {[["Tüm İlanlar",false],["İlanlarım",true]].map(([l,v]) => (
            <button key={l} className={`tab ${myTab===v?"on":""}`} onClick={() => setMyTab(v)}>{l}</button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position:"relative", marginBottom:14 }}>
          <span style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", color:"#444", pointerEvents:"none" }}>🔍</span>
          <input className="srch" placeholder="İlan ara..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Category filter */}
        <div style={{ display:"flex", gap:8, marginBottom:22, overflowX:"auto", paddingBottom:4 }}>
          <button className={`catbtn ${filter==="all"?"on":""}`} onClick={() => setFilter("all")}>✦ Tümü</button>
          {Object.entries(CAT).map(([k,v]) => (
            <button key={k} className={`catbtn ${filter===k?"on":""}`} onClick={() => setFilter(k)}>{v.emoji} {v.label}</button>
          ))}
        </div>

        {/* Posts */}
        {loading ? (
          <div style={{ textAlign:"center", padding:60, color:"#444" }}><span className="sp" style={{ fontSize:28 }}>⟳</span></div>
        ) : shown.length === 0 ? (
          <div style={{ textAlign:"center", padding:60, color:"#444" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>{myTab ? "📭" : "🔍"}</div>
            <div style={{ fontSize:14 }}>{myTab ? "Henüz ilan vermedin." : "Sonuç bulunamadı."}</div>
            {myTab && <button onClick={() => setModal(true)} style={{ marginTop:16, background:"#f0a500", color:"#0d0d0d", border:"none", borderRadius:100, padding:"8px 20px", fontFamily:"'DM Sans'", fontWeight:600, fontSize:13, cursor:"pointer" }}>İlk İlanını Ver</button>}
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {shown.map((p, i) => {
              const m = CAT[p.category]
              const liked = (p.likes||[]).includes(user.email)
              const mine  = p.user_email === user.email
              return (
                <div key={p.id} className="card fu" style={{ animationDelay:`${i*.04}s` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", gap:12 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, flexWrap:"wrap" }}>
                        <span className="bdg" style={{ background:m.color+"20", color:m.color }}>{m.emoji} {m.label}</span>
                        <span style={{ fontSize:11, color:"#444" }}>{ago(p.created_at)}</span>
                        {mine && <span className="bdg" style={{ background:"rgba(240,165,0,.12)", color:"#f0a500" }}>Senin ilanın</span>}
                      </div>
                      <div style={{ fontWeight:600, fontSize:15, marginBottom:6, lineHeight:1.3 }}>{p.title}</div>
                      <div style={{ fontSize:13, color:"#888", lineHeight:1.65, marginBottom:14 }}>{p.description}</div>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div style={{ fontSize:12, color:"#555", display:"flex", alignItems:"center", gap:7 }}>
                          <div style={{ width:22, height:22, background:"#f0a500", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:"#0d0d0d", fontWeight:700 }}>{p.user_name[0]}</div>
                          {p.user_name}
                        </div>
                        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                          <button className={`likebtn ${liked?"on":""}`} onClick={() => toggleLike(p)}>{liked?"♥":"♡"} {(p.likes||[]).length}</button>
                          {mine && (
                            <button onClick={() => deletePost(p.id)} style={{ background:"none", border:"none", color:"#444", cursor:"pointer", fontSize:15, padding:4, transition:"color .2s" }}
                              onMouseOver={e => e.target.style.color="#ef4444"} onMouseOut={e => e.target.style.color="#444"}>🗑</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="ovl" onClick={e => e.target===e.currentTarget && setModal(false)}>
          <div className="mdl fu">
            <div style={{ fontFamily:"'Bebas Neue'", fontSize:26, letterSpacing:2, marginBottom:4 }}>YENİ İLAN</div>
            <div style={{ fontSize:12, color:"#555", marginBottom:24 }}>Bilkent öğrencileriyle paylaş</div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <div className="lbl">KATEGORİ</div>
                <select className="sel" value={form.category} onChange={e => setForm(p => ({...p, category:e.target.value}))}>
                  {Object.entries(CAT).map(([k,v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
                </select>
              </div>
              <div>
                <div className="lbl">BAŞLIK</div>
                <input className="inp" placeholder="Örn: Ev arkadaşı arıyorum" value={form.title} onChange={e => setForm(p => ({...p, title:e.target.value}))} />
              </div>
              <div>
                <div className="lbl">AÇIKLAMA</div>
                <textarea className="inp" placeholder="Detayları buraya yaz..." rows={4} style={{ resize:"vertical" }} value={form.desc} onChange={e => setForm(p => ({...p, desc:e.target.value}))} />
              </div>
              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                <button className="gbtn" style={{ flex:1 }} onClick={() => setModal(false)}>İptal</button>
                <button className="pbtn" style={{ flex:2 }} disabled={posting||!form.title.trim()||!form.desc.trim()} onClick={addPost}>
                  {posting ? <span className="sp">⟳</span> : "İlan Ver"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]   = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const u = session.user
        setUser({ id: u.id, name: u.user_metadata?.name || u.email.split("@")[0], email: u.email })
      }
      setReady(true)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setUser(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const logout = async () => { await supabase.auth.signOut(); setUser(null) }

  if (!ready) return (
    <div style={{ minHeight:"100vh", background:"#0d0d0d", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <span style={{ color:"#f0a500", fontSize:32, animation:"spin .8s linear infinite", display:"inline-block" }}>⟳</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <>
      <style>{CSS}</style>
      {user ? <Main user={user} onLogout={logout} /> : <Auth onLogin={setUser} />}
    </>
  )
}
