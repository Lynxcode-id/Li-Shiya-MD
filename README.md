<p align="center">
  <img src="media/menu.jpg" alt="Li Shiya MD Banner" width="450"/>
</p>

<h1 align="center">🎀 Li Shiya MD v2.0 (Multi-Device) 🎀</h1>

<p align="center">
  <em>WhatsApp Bot dengan kepribadian AI ala gadis anime, ringan, dan modular.</em>
</p>

<p align="center">
<a href="https://github.com/AgusXzz/ChiiMD"><img src="https://img.shields.io/badge/Base%20Repo-ChiiMD-ff69b4?style=for-the-badge&logo=github&logoColor=white" height="32"/></a>
&nbsp;
<a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-v20+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" height="32"/></a>
&nbsp;
<a href="https://github.com/WhiskeySockets/Baileys"><img src="https://img.shields.io/badge/Library-Baileys-007ACC?style=for-the-badge&logo=javascript&logoColor=white" height="32"/></a>
</p>

<p align="center">
<a href="https://whatsapp.com/channel/0029Vb5rT77Ae5Vqi7s27P3L"><img src="https://img.shields.io/badge/CHANNEL%20WHATSAPP-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" height="32"/></a>
</p>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%" height="6px">

<p align="center">
<strong>Li Shiya MD</strong> adalah bot WhatsApp berbasis <strong>Multi-Device (Baileys)</strong> yang dirancang dengan sistem modular berbasis plugin. Bot ini telah dikustomisasi secara mendalam agar memiliki performa yang ringan, bypass Cloudflare yang aman menggunakan User-Agent kustom, dan dilengkapi dengan kepribadian AI (Persona) interaktif layaknya seorang gadis anime nyata.
</p>

<br/>

## 📝 Daftar Isi

| | |
|---|---|
| 1. [✨ Fitur Unggulan](#-fitur-unggulan) | 6. [📈 PM2 / VPS](#-pengoperasian-lanjutan-pm2--vps) |
| 2. [📋 Daftar Perintah](#-daftar-perintah-commands) | 7. [📂 Struktur Direktori](#-struktur-direktori-proyek) |
| 3. [⚙️ Persyaratan Sistem](#️-persyaratan-sistem) | 8. [🛠️ Troubleshooting](#️-troubleshooting--solusi-error) |
| 4. [🚀 Instalasi](#-panduan-instalasi-lengkap) | 9. [🤝 Kontribusi & Kredit](#-kontribusi--kredit-hak-cipta) |
| 5. [🔧 Konfigurasi](#-konfigurasi-file-configjs) | |

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%" height="6px">

## ✨ Fitur Unggulan

- 🌸 **AI Cosplay Persona** — Mengubah AI konvensional menjadi kepribadian gadis anime (Li Shiya) yang emosional, dinamis (bisa ceria, bucin, sedih, bahkan sedikit toxic), dan tidak kaku seperti robot.
- 🛡️ **Smart Cloudflare Bypass** — Request API yang sensitif dilengkapi header `User-Agent` browser modern untuk meminimalisir pemblokiran atau error 503/403.
- 📦 **Automated Full Backup System** — Mengompresi seluruh file penting proyek (kecuali `node_modules` dan cache) ke dalam berkas `.zip` dengan kompresi tingkat tinggi (Level 9) menggunakan `archiver`, lalu mengirimkannya langsung ke nomor owner cadangan secara privat.
- 🎨 **Advanced Media Maker** — Integrasi image generator, uploader otomatis menggunakan library Catbox/Telegra.ph, dan manipulasi buffer gambar langsung melalui API eksternal.

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%" height="6px">

## 📋 Daftar Perintah (Commands)

### 🌸 AI & Persona

| Perintah | Parameter | Deskripsi |
|---|---|---|
| `.shiya` | `<teks>` | Mengobrol interaktif dengan persona anime Li Shiya |
| `.gptfree` | `<teks>` | Mengakses GPT tanpa API Key (Bypass Cloudflare) |
| `.unlimitedai` | `<teks>` | Mengakses asisten UnlimitedAI lewat gateway Kaicloud |

### 📥 Downloader

| Perintah | Parameter | Deskripsi |
|---|---|---|
| `.dailymotion` | `<url>` | Mengunduh video & subtitle dari platform Dailymotion |
| `.tiktok` | `<url>` | Mengunduh video TikTok tanpa tanda air (no watermark) |
| `.youtube` | `<url>` | Mengunduh audio (MP3) atau video (MP4) dari YouTube |

### 🎨 Maker & Efek Gambar

| Perintah | Parameter | Deskripsi |
|---|---|---|
| `.fakedana` | `<nominal>` | Membuat gambar manifes/bukti transfer palsu aplikasi DANA |
| `.fakedev` | `nama\|bio` | Membuat kartu profil developer palsu (wajib kirim/reply foto) |
| `.tohitam` | `(reply foto)` | Mengubah foto yang dikirim menjadi efek sketsa hitam legam |
| `.sticker` | `(reply foto)` | Mengonversi gambar menjadi stiker WhatsApp secara instan |

### 🎲 Random Image

| Perintah | Parameter | Deskripsi |
|---|---|---|
| `.waifu` | — | Mengambil gambar waifu anime acak secara langsung |
| `.papayang` | — | Mengambil gambar estetik/pap pacar secara acak |
| `.neko` | — | Mengambil gambar karakter anime kucing (Neko) acak |
| `.cosplay` | — | Mengambil foto cosplayer anime nyata secara acak |

### ⚙️ Owner Only

| Perintah | Parameter | Deskripsi |
|---|---|---|
| `.backup` | — | Membuat file zip proyek dan mengirimkannya ke nomor owner |

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%" height="6px">

## ⚙️ Persyaratan Sistem

| Komponen | Spesifikasi |
|---|---|
| 🟢 Runtime | Node.js v18.x atau lebih tinggi (disarankan versi LTS) |
| 📦 Package Manager | NPM (bawaan Node.js) |
| 🎞️ Aplikasi Tambahan | FFmpeg (untuk konversi audio/video) |
| 💻 Sistem Operasi | Linux (Ubuntu/Debian), Windows 10/11, atau Android (Termux) |

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%" height="6px">

## 🚀 Panduan Instalasi Lengkap

### 1️⃣ Kloning Repositori

```bash
git clone https://github.com/AgusXzz/ChiiMD.git
cd ChiiMD
```

### 2️⃣ Instalasi Dependensi

```bash
npm install
```

### 3️⃣ Instalasi FFmpeg

**Ubuntu/Debian:**
```bash
sudo apt update && sudo apt install ffmpeg -y
```

**Windows:** unduh installer FFmpeg dari situs resmi, lalu masukkan folder `bin` ke dalam Environment Variables System (PATH).

**Termux (Android):**
```bash
pkg update && pkg install ffmpeg libwebp -y
```

### 4️⃣ Menjalankan Bot

```bash
npm start
```

> Saat terminal menampilkan Pairing Code, buka **WhatsApp → Perangkat Tertaut → Tautkan Perangkat → Tautkan dengan nomor telepon saja**, lalu masukkan kode 8 digit yang muncul di terminal.

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%" height="6px">

## 🔧 Konfigurasi File (`config.js`)

Buka file `config.js` di direktori utama, lalu sesuaikan variabel global berikut:

```js
import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath } from 'url'

// Pengaturan Nomor Utama & Backup
global.pairingNumber = "628211297179" // Nomor akun WhatsApp bot (wajib pakai kode negara)
global.ownerbackup = "628211297179"   // Nomor WhatsApp pribadi (tujuan pengiriman file .zip otomatis)

// Pengaturan Identitas Bot & Owner
global.rowner = [['628211297179', 'lynx decode', true]]
global.owner = [['628211297179', 'lynx decode', true]]
global.mods = ['628211297179']
global.prems = ['628211297179']

// Pengaturan Penamaan Tampilan (Watermark)
global.wm = '🎀 Li Shiya MD v2.0 🎀'
global.titler = 'Li Shiya MD - Cosplay Persona'
global.author = 'lynx decode'

// Deteksi Otomatis Perubahan File Config
let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})
```

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%" height="6px">

## 📈 Pengoperasian Lanjutan (PM2 / VPS)

Agar bot tetap berjalan di background meski terminal ditutup, gunakan **PM2 Process Manager**.

**1. Instalasi PM2 secara global**
```bash
sudo npm install pm2 -g
```

**2. Menjalankan bot dengan PM2**
```bash
pm2 start index.js --name "shiya-bot"
```

**3. Mengontrol proses bot**

| Aksi | Perintah |
|---|---|
| Lihat log/konsol aktivitas | `pm2 logs shiya-bot` |
| Hentikan bot sementara | `pm2 stop shiya-bot` |
| Restart bot | `pm2 restart shiya-bot` |
| Hapus proses dari daftar | `pm2 delete shiya-bot` |

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%" height="6px">

## 📂 Struktur Direktori Proyek

```
Li Shiya MD/
├── plugins/              # Direktori modular untuk semua fitur utama (.js)
│   ├── ai_shiya.js       # Manipulasi prompt persona Li Shiya
│   ├── downloader_dm.js  # Pengunduh video Dailymotion
│   ├── maker_dana.js     # Pembuatan fake transfer DANA
│   ├── owner_backup.js   # Kompresi zip otomatis untuk owner
│   └── random_image.js   # Pencari gambar acak (waifu, cosplay, dll)
├── lib/                  # Kumpulan helper, modul uploader, dan fungsi pembantu
├── media/                # Aset gambar statis, audio, dan thumbnail bot
├── sessions/             # Kredensial login/sesi koneksi WhatsApp (otomatis dibuat)
├── config.js             # File konfigurasi global (nomor owner, nama bot, dll)
├── index.js              # Berkas entry-point utama aplikasi
├── package.json          # Daftar dependensi library dan script NPM
└── README.md             # Dokumentasi panduan bot
```

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%" height="6px">

## 🛠️ Troubleshooting & Solusi Error

<details>
<summary><strong>❌ Error: Cannot find module '...'</strong></summary>
<br/>

**Penyebab:** Ada library yang belum terpasang atau `package.json` mengalami pembaruan.
**Solusi:** Jalankan ulang `npm install` di direktori utama bot.
</details>

<details>
<summary><strong>❌ Error 503 / 403 atau Stuck di Request API</strong></summary>
<br/>

**Penyebab:** Server API tujuan menerapkan proteksi Cloudflare yang ketat sehingga mendeteksi bot sebagai bot jahat.
**Solusi:** Pastikan parameter `headers` di dalam fungsi `axios.get()` menggunakan `User-Agent` terbaru seperti yang sudah diimplementasikan pada kode plugin Li Shiya MD.
</details>

<details>
<summary><strong>❌ Error: archiver atau file .zip tidak bisa dibuat saat .backup</strong></summary>
<br/>

**Penyebab:** Modul `archiver` belum terinstal secara sempurna di environment kamu.
**Solusi:** Jalankan `npm install archiver` secara manual untuk memastikan pustaka tersebut terdaftar di `node_modules`.
</details>

<img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.gif" width="100%" height="6px">

## 🤝 Kontribusi & Kredit Hak Cipta

Pengembangan proyek ini tidak lepas dari kontribusi komunitas open-source WhatsApp Bot Indonesia:

- 🛠️ **Remodified & Code Injection by:** lynx decode — kustomisasi persona anime, bypass User-Agent, dan advanced backup handler.
- 🌟 **Original Base Source Code:** [ChiiMD](https://github.com/AgusXzz/ChiiMD) oleh AgusXzz — terima kasih banyak atas struktur dasar kode yang luar biasa dan rapi!

<br/>

<p align="center">
<em>Proyek ini disebarluaskan untuk tujuan pembelajaran. Dibuat dengan ❤️ oleh lynx decode.</em>
</p>

<p align="center">
<a href="https://whatsapp.com/channel/0029Vb5rT77Ae5Vqi7s27P3L"><img src="https://img.shields.io/badge/Join%20Channel-INF%20Project-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" height="36"/></a>
&nbsp;
<a href="https://saweria.co/LynxPreset"><img src="https://img.shields.io/badge/Support-Saweria-FF4500?style=for-the-badge&logo=ko-fi&logoColor=white" height="36"/></a>
</p>
