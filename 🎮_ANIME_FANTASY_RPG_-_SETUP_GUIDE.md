# 🎮 ANIME FANTASY RPG - SETUP GUIDE

Website ini dirancang untuk memberikan pengalaman visual ala game RPG dengan kemudahan pengelolaan data via Google Sheets.

## 🛠️ Struktur File
Pastikan semua file ini ada di dalam folder yang sama di repositori GitHub Anda:
1. `index.html` - Struktur Utama
2. `style-core.css` - Layout & Reset
3. `style-rpg.css` - Desain RPG & Animasi
4. `style-themes.css` - Warna Kategori
5. `script-data.js` - Pengelolaan Data (Google Sheets)
6. `script-ui.js` - Logika Antarmuka (Jam, Navigasi, Theme)
7. `script-main.js` - Logika Utama (Filter, Render)

## 📊 Setup Google Sheets (Otomatis)
1. Buat Google Sheet baru.
2. Buat header di baris pertama dengan nama berikut (huruf kecil):
   `category`, `name`, `nickname`, `rarity`, `main_image_url`, `extra_image_1`, `extra_image_2`, `extra_image_3`, `tags`, `story`
3. Isi data unit Anda (Minimal 3 unit per kategori untuk tes).
4. Klik **File > Share > Publish to web**.
5. Pilih **Entire Document** dan format **CSV**.
6. Salin link yang muncul.
7. Buka file `script-data.js`, cari bagian `csvUrl` di paling atas, dan ganti link-nya dengan link CSV Anda.

## ✍️ Edit Manual (Tanpa Google Sheets)
Jika Anda ingin mengedit data langsung di kodingan:
1. Buka file `script-data.js`.
2. Cari fungsi `getMockArchive()`.
3. Anda bisa menambah atau mengubah data di dalam array `data.push({...})` tersebut.

## ✨ Fitur RPG
- **HUD System**: Jam dan Tanggal otomatis di bagian atas.
- **Dynamic Theme**: Klik ikon Bulan/Matahari untuk ganti mode Gelap/Terang.
- **Smooth Transition**: Gak ada lagi bug scroll, halaman otomatis ke atas setiap pindah.
- **Carousel Zoom**: Di Page 3, klik gambar gallery untuk memperbesar.
- **Tag Jump**: Klik tag di Page 3 akan otomatis membawa Anda kembali ke Page 2 dengan filter tag tersebut aktif.
