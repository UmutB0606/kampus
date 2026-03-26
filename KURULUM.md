# KAMPÜS — Bilkent Öğrenci Ağı
## Kurulum ve Deploy Rehberi

---

## 1. Supabase Kurulumu (Ücretsiz Veritabanı)

1. https://supabase.com adresine git
2. "Start your project" → GitHub ile giriş yap
3. "New project" → İsim: `kampus` → Şifre belirle → Region: `eu-central-1` → Create
4. Proje açıldıktan sonra sol menüden **SQL Editor** aç
5. Aşağıdaki kodu yapıştır ve **Run** a bas:

```sql
-- Kullanıcı profilleri
create table profiles (
  id uuid references auth.users on delete cascade,
  name text not null,
  email text not null,
  created_at timestamp default now(),
  primary key (id)
);

-- İlanlar
create table posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade,
  user_name text not null,
  user_email text not null,
  category text not null check (category in ('ev','esya','staj','ders')),
  title text not null,
  description text not null,
  likes text[] default '{}',
  created_at timestamp default now()
);

-- Herkes okuyabilir
alter table posts enable row level security;
alter table profiles enable row level security;

create policy "Herkes görebilir" on posts for select using (true);
create policy "Kendi ilanını ekleyebilir" on posts for insert with check (auth.uid() = user_id);
create policy "Kendi ilanını güncelleyebilir" on posts for update using (auth.uid() = user_id);
create policy "Kendi ilanını silebilir" on posts for delete using (auth.uid() = user_id);

create policy "Herkes profil görebilir" on profiles for select using (true);
create policy "Kendi profilini ekleyebilir" on profiles for insert with check (auth.uid() = id);
create policy "Kendi profilini güncelleyebilir" on profiles for update using (auth.uid() = id);
```

6. Sol menüden **Settings → API** aç:
   - `Project URL` → kopyala → `.env` dosyasına yaz
   - `anon public` key → kopyala → `.env` dosyasına yaz

7. Sol menüden **Authentication → Email Templates** aç:
   - Confirm signup template'i Türkçe yapabilirsin (opsiyonel)

8. **Authentication → URL Configuration**:
   - Site URL: Vercel'den aldığın URL'yi buraya yaz (deploy sonrası)

---

## 2. Proje Kurulumu

Terminal aç ve şunları çalıştır:

```bash
# Proje oluştur
npm create vite@latest kampus -- --template react
cd kampus

# Paketleri yükle
npm install
npm install @supabase/supabase-js

# .env dosyası oluştur
```

`.env` dosyasını aç ve şunu yaz:
```
VITE_SUPABASE_URL=buraya_supabase_url_yaz
VITE_SUPABASE_ANON_KEY=buraya_anon_key_yaz
```

Sonra `src/` klasörü içindeki dosyaları bu repo'daki ile değiştir.

---

## 3. Vercel Deploy

```bash
# GitHub'a yükle
git init
git add .
git commit -m "ilk versiyon"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/kampus.git
git push -u origin main
```

Sonra:
1. https://vercel.com → GitHub ile giriş yap
2. "New Project" → kampus reposunu seç
3. Environment Variables'a `.env` içindeki değerleri ekle
4. Deploy!

---

## 4. Supabase'e Site URL'yi Ekle

Vercel sana bir URL verir (örn: kampus.vercel.app)
Supabase → Authentication → URL Configuration → Site URL → bu URL'yi yaz

**Hepsi bu kadar! 🎉**
