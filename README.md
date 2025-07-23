
# 🧾 Aplikasi Kasir Toko Baju (Next.js & LocalStorage)

Aplikasi kasir dan katalog penjualan berbasis web yang **modern**, **ringan**, dan **sepenuhnya offline**. Dibangun menggunakan **Next.js** dan **CSS Modules**, dengan **LocalStorage** sebagai satu-satunya media penyimpanan.

> Anda bisa mengganti gambar di bawah ini dengan screenshot aplikasi Anda.
> 
><img width="1916" height="947" alt="image" src="https://github.com/user-attachments/assets/c1802c6f-5e1e-4f39-bdb2-3b7f427d1519" />


---

## 📦 Fitur Utama

- **Manajemen Produk**  
  Tambah, edit, dan hapus produk dengan stok per ukuran (S, M, L, XL, XXL).

- **Transaksi Penjualan**  
  Halaman kasir lengkap dengan keranjang belanja, pencarian member, dan diskon dinamis.

- **Sistem Member**  
  Kelola data member dengan diskon yang bisa diatur manual per anggota.

- **Laporan Penjualan**  
  Filter laporan berdasarkan harian, bulanan, atau tahunan, lengkap dengan **chart visual** dan **paginasi**.

- **Cetak Struk**  
  Cetak struk transaksi baru atau cetak ulang struk lama. Dapat disesuaikan untuk printer **thermal 58mm / 80mm**.

- **Manajemen Data**  
  Ekspor laporan ke CSV, backup seluruh data ke file JSON, dan restore dari file JSON.

- **Offline First**  
  Semua data disimpan di **LocalStorage** browser. Tidak butuh koneksi internet untuk menjalankan aplikasi.

- **Autentikasi**  
  Sistem login sederhana dengan akun admin default yang dibuat otomatis saat pertama kali dijalankan.

---

## 🚀 Teknologi yang Digunakan

- **Framework:** Next.js (React)
- **Styling:** CSS Modules (tanpa framework CSS)
- **Penyimpanan:** LocalStorage
- **Charting:** Chart.js via `react-chartjs-2`
- **Fitur Tambahan:**  
  `react-to-print`, `papaparse`, `uuid`, `bcryptjs`

---

## ⚙️ Cara Instalasi dan Menjalankan

### 🧩 Prasyarat

Pastikan Anda sudah menginstal **Node.js versi 18 atau lebih baru**.

### 📥 Clone Repository Ini

```bash
git clone https://github.com/kasir-baju.git
````


### 📁 Masuk ke Direktori Proyek

```bash
cd kasir-baju
```

### 📦 Install Semua Dependency

```bash
npm install
```

### ▶️ Jalankan Aplikasi

```bash
npm run dev
```

### 🌐 Buka di Browser

Buka browser Anda dan akses:
[http://localhost:3000](http://localhost:3000)

---

## 🔑 Login Pertama Kali

Saat pertama kali dijalankan, aplikasi akan otomatis membuat akun admin default.

* **Username:** `admin`
* **Password:** `password`

Anda bisa mengubah password di halaman **Edit Profil** setelah login.

---

## ☁️ Deployment

Aplikasi ini sangat mudah di-deploy ke platform seperti **Vercel**:

1. Hubungkan repo GitHub Anda ke Vercel.
2. Deploy otomatis akan dilakukan.
3. Aplikasi siap digunakan online.

---

## 📄 Lisensi

Proyek ini menggunakan lisensi bebas untuk penggunaan pribadi dan edukasi. Silakan sesuaikan jika Anda ingin menggunakan secara komersial.

---

## ❤️ Kontribusi

Pull Request dan masukan sangat diterima! Jangan lupa untuk ⭐ repository ini jika Anda merasa terbantu.
