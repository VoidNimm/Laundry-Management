# 🤖 AI Smart Assistant - SmartLaundry

## 📋 Overview

AI Smart Assistant adalah fitur chatbot cerdas yang menggunakan **Google Gemini AI** untuk memberikan insights bisnis real-time, menjawab pertanyaan, dan memberikan rekomendasi berdasarkan data aktual dari sistem laundry Anda.

## ✨ Fitur Utama

### 1. **Percakapan Natural Language**

- Tanya apa saja dengan bahasa Indonesia yang natural
- AI memahami context dan memberikan jawaban yang relevan
- Support pertanyaan follow-up

### 2. **Real-Time Data Integration**

AI memiliki akses ke:

- ✅ Total transaksi & revenue
- ✅ Statistik member
- ✅ Performa per outlet
- ✅ Transaksi terbaru
- ✅ Member terbaik
- ✅ Data historis

### 3. **Business Insights & Recommendations**

- Analisis performa bisnis
- Identifikasi trend
- Rekomendasi actionable
- Prediksi berdasarkan data historis

### 4. **Modern UI/UX**

- Floating chat widget yang tidak mengganggu
- Quick action buttons untuk pertanyaan umum
- Real-time stats display
- Responsive dan mobile-friendly
- Smooth animations

## 🚀 Setup Guide

### Step 1: Install Dependencies

Dependencies sudah terinstall:

```bash
npm install ai @google/generative-ai
```

### Step 2: Setup Environment Variable

Tambahkan ke file `.env` yang sudah ada di root project:

```env
# Google Gemini API Key
GOOGLE_GEMINI_API_KEY="masukkan-api-key-anda-disini"
```

**Cara mendapatkan Gemini API Key:**

1. Buka https://makersuite.google.com/app/apikey
2. Login dengan Google Account
3. Click "Create API Key"
4. Copy dan paste ke file `.env` Anda

### Step 3: Restart Development Server

```bash
npm run dev
```

### Step 4: Test AI Assistant

1. Buka aplikasi di browser (http://localhost:3000)
2. Lihat floating button di kanan bawah dengan badge "AI"
3. Click button untuk membuka chat widget
4. Coba tanya sesuatu!

## 💬 Contoh Pertanyaan

### Statistik Bisnis

```
❓ "Berapa total transaksi bulan ini?"
❓ "Berapa total revenue sekarang?"
❓ "Berapa rata-rata pendapatan per transaksi?"
```

### Analisis Outlet

```
❓ "Outlet mana yang paling ramai?"
❓ "Bandingkan performa semua outlet"
❓ "Outlet mana yang menghasilkan revenue tertinggi?"
```

### Member & Customer

```
❓ "Siapa member terbaik kami?"
❓ "Berapa total member yang terdaftar?"
❓ "Member mana yang paling sering transaksi?"
```

### Insights & Recommendations

```
❓ "Bagaimana performa bisnis kami?"
❓ "Apa rekomendasi untuk meningkatkan penjualan?"
❓ "Kapan waktu terbaik untuk promo?"
```

### Operasional

```
❓ "Berapa transaksi hari ini?"
❓ "Status transaksi terbaru?"
❓ "Estimasi waktu untuk paket kiloan?"
```

## 🎯 Demo untuk Lomba

### Skenario Demo 1: Business Analytics

**Demonstrator**: "Saya ingin tahu performa bisnis saya"
**Action**: Tanya AI: "Bagaimana performa bisnis bulan ini?"
**Result**: AI memberikan ringkasan lengkap dengan data real-time

### Skenario Demo 2: Outlet Comparison

**Demonstrator**: "Outlet mana yang terbaik?"
**Action**: Tanya AI: "Outlet mana yang paling ramai?"
**Result**: AI memberikan ranking outlet dengan jumlah transaksi

### Skenario Demo 3: Quick Stats

**Action**: Click quick action button "Total Transaksi"
**Result**: AI langsung memberikan stats dengan visualisasi

## 🎨 Customization

### Mengubah Model AI

Edit file `app/api/chat/route.ts`:

```typescript
// Ganti model
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // atau 'gemini-1.5-pro'
});
```

### Menambah Quick Actions

Edit file `components/ai-chat-widget.tsx`:

```typescript
const quickActions = [
  { icon: IconChartBar, label: "Custom", query: "Pertanyaan custom?" },
  // Tambah lebih banyak...
];
```

### Mengubah Context AI

Edit system prompt di `app/api/chat/route.ts` bagian `context`:

```typescript
const context = `
Tambahkan instruksi custom untuk AI di sini...
`;
```

## 📊 Monitoring & Analytics

AI Assistant menyimpan beberapa metrics:

- Total pesan dikirim
- Response time
- Stats yang ditampilkan
- Quick actions yang digunakan

## 🔒 Security & Privacy

- ✅ API Key disimpan di environment variable (tidak di-commit)
- ✅ Data tidak dikirim ke third-party selain Gemini API
- ✅ Tidak ada data sensitif di-log
- ✅ HTTPS only di production

## 🐛 Troubleshooting

### Problem: "API Key tidak valid"

**Solution**:

- Check file `.env` sudah berisi GOOGLE_GEMINI_API_KEY
- Pastikan API key benar (copy paste ulang)
- Pastikan tidak ada spasi ekstra
- Restart development server

### Problem: "Gagal mendapatkan respons"

**Solution**:

- Check internet connection
- Check API key quota (max 1500 requests/day untuk free tier)
- Check console browser untuk error details

### Problem: Chat widget tidak muncul

**Solution**:

- Check apakah di halaman login? (widget hanya muncul setelah login)
- Clear browser cache
- Check console untuk error

### Problem: Data tidak akurat

**Solution**:

- Refresh halaman untuk update context
- Check database connection
- Verifikasi data di database

## 🎤 Pitch untuk Juri

**"Kami mengintegrasikan AI terkini (Google Gemini) untuk memberikan business intelligence real-time. Pemilik usaha bisa:**

- 💬 Bertanya dengan bahasa natural
- 📊 Mendapatkan insights otomatis
- 🎯 Menerima rekomendasi bisnis
- ⚡ Akses data kapan saja, dimana saja

**Ini bukan hanya aplikasi CRUD, tapi AI-powered business platform untuk UMKM Indonesia!"**

## 🚀 Future Enhancements

Fitur yang bisa ditambahkan:

- [ ] Voice input (speech-to-text)
- [ ] Multi-language support
- [ ] Predictive analytics
- [ ] WhatsApp integration
- [ ] Email digest harian
- [ ] Custom reports generation
- [ ] Image analysis (foto cucian)

## 📝 Technical Details

**Tech Stack:**

- Framework: Next.js 15 (App Router)
- AI: Google Gemini 1.5 Flash
- Database: PostgreSQL + Prisma ORM
- UI: Tailwind CSS + shadcn/ui
- Icons: Tabler Icons

**API Endpoint:**

- `POST /api/chat` - Send message to AI

**Components:**

- `components/ai-chat-widget.tsx` - Main chat widget
- `app/api/chat/route.ts` - Backend API handler

## 📞 Support

Jika ada masalah atau pertanyaan:

1. Check troubleshooting section
2. Check console browser untuk error
3. Verify .env configuration (GOOGLE_GEMINI_API_KEY)
4. Test dengan pertanyaan simple dulu

---

**Built with ❤️ for UMKM Indonesia**

_Powered by Google Gemini AI_
