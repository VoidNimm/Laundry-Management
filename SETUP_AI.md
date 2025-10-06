# 🚀 Quick Setup - AI Assistant

## Langkah Cepat (5 Menit)

### 1️⃣ Tambahkan API Key ke File `.env`

Buka file `.env` yang sudah ada di root project, lalu tambahkan:

```env
GOOGLE_GEMINI_API_KEY="paste-api-key-anda-disini"
```

**Note:** File `.env` Anda sudah berisi DATABASE_URL dan konfigurasi lainnya. Cukup tambahkan baris GOOGLE_GEMINI_API_KEY.

### 2️⃣ Dapatkan Gemini API Key (GRATIS)

1. Buka: https://makersuite.google.com/app/apikey
2. Login dengan Google Account
3. Click tombol **"Create API Key"** atau **"Get API Key"**
4. Pilih **"Create API key in new project"** (jika diminta)
5. Copy API Key yang muncul (format: AIzaSy...)
6. Paste ke file `.env` Anda

**Screenshot:**

```
API Key format: AIzaSyXXXXXXXXXXXXXXXXXXXXXX
```

### 3️⃣ Restart Server

```bash
# Stop server (Ctrl+C di terminal)
# Lalu start ulang:
npm run dev
```

### 4️⃣ Test AI Assistant

1. Buka browser: `http://localhost:3000`
2. Lihat tombol chat AI di kanan bawah (dengan badge "AI" ⭐)
3. Click tombol tersebut
4. Coba tanya: **"Berapa total transaksi?"**

## ✅ Checklist

- [ ] API Key sudah ditambahkan ke file `.env`
- [ ] Server sudah di-restart
- [ ] Chat widget muncul di kanan bawah (tombol bulat orange dengan badge "AI")
- [ ] AI bisa menjawab pertanyaan

## 🎯 Contoh Pertanyaan untuk Testing

Coba pertanyaan ini untuk memastikan AI bekerja:

```
✅ "Berapa total transaksi?"
✅ "Berapa total revenue?"
✅ "Outlet mana yang paling ramai?"
✅ "Siapa member terbaik?"
✅ "Berapa transaksi hari ini?"
```

## ❌ Troubleshooting

**Problem:** Chat widget tidak muncul

- ✅ Check: Apakah sudah restart server?
- ✅ Check: Buka console browser (F12), ada error?

**Problem:** Error "API Key invalid"

- ✅ Check: API Key di `.env` sudah benar?
- ✅ Check: Tidak ada spasi ekstra di awal/akhir?
- ✅ Check: Format: `GOOGLE_GEMINI_API_KEY="AIzaSy..."`
- ✅ Solusi: Copy ulang API Key dari Google AI Studio

**Problem:** AI tidak bisa jawab / error 500

- ✅ Check: Internet connection aktif?
- ✅ Check: Database connection OK?
- ✅ Solusi: Restart server

## 📱 Screenshot Demo

Setelah setup berhasil, Anda akan melihat:

1. **Floating Button**: Tombol bulat di kanan bawah dengan icon chat
2. **Badge "AI"**: Badge kuning dengan icon sparkle
3. **Chat Window**: Window modern dengan gradient header biru-ungu
4. **Quick Actions**: 3 tombol untuk pertanyaan cepat
5. **Stats Bar**: Bar statistik di atas chat

## 🎤 Demo ke Juri

**Script Demo (30 detik):**

> "Ini adalah AI Assistant yang kami integrasikan dengan Google Gemini.
> Saya bisa bertanya apa saja tentang bisnis laundry dengan bahasa natural.
>
> Misalnya..."
>
> [Tanya: "Outlet mana yang paling ramai?"]
>
> "...dan AI langsung memberikan insight real-time berdasarkan data aktual.
> Ini membantu pemilik usaha membuat keputusan bisnis yang lebih baik."

## 💡 Tips untuk Lomba

1. **Highlight "Powered by Gemini"** - Menunjukkan penggunaan teknologi terkini
2. **Tunjukkan Real-time Data** - AI ambil data langsung dari database
3. **Demo Interaktif** - Ajak juri untuk bertanya ke AI
4. **Showcase Multiple Use Cases** - Business analytics, operational queries, recommendations

## 📊 Metrics untuk Presentasi

Setelah implementasi AI, Anda bisa claim:

- ✅ **Integrasi AI Generatif** (Google Gemini 1.5)
- ✅ **Natural Language Processing** untuk query bisnis
- ✅ **Real-time Business Intelligence**
- ✅ **Data-driven Decision Making**
- ✅ **Modern Tech Stack** (Next.js 15 + AI)

## 🎯 Value Proposition untuk Juri

**Kreativitas Ide:**

- Bukan sekadar CRUD, tapi AI-powered system
- User Experience yang innovative
- Solusi modern untuk masalah traditional

**Penerapan Teknologi:**

- Integrasi AI terkini (Gemini)
- Real-time data processing
- Modern web architecture

**Dampak Bisnis:**

- Pemilik usaha bisa akses insights tanpa perlu data analyst
- Pengambilan keputusan lebih cepat
- Demokratisasi AI untuk UMKM

---

## ⏱️ Total Waktu Implementasi

- Setup Environment: **2 menit**
- Get API Key: **2 menit**
- Testing: **1 menit**

**Total: ~5 menit** ✨

---

**Need help?** Check `AI_ASSISTANT_GUIDE.md` untuk dokumentasi lengkap.
