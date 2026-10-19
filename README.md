# Sistem Pendukung Keputusan Penilaian Kinerja Karyawan Menggunakan Metode SAW
Sistem Pendukung Keputusan (SPK) untuk membantu proses penilaian kinerja karyawan menggunakan metode _Simple Additive Weighting_ (SAW). Project ini dikembangkan sebagai aplikasi berbasis web dengan backend dan frontend terpisah serta dukungan Docker untuk menjalankan layanan secara terintegrasi.

## Fitur Utama
- **Autentikasi**: login untuk mengakses sistem.
- **Manajemen posisi**: pengelolaan posisi karyawan.
- **Manajemen karyawan**: pengelolaan data karyawan.
- **Manajemen kriteria**: mengelola kriteria dan bobot penilaian.
- **Manajemen posisi kriteria**: mengatur kriteria dengan posisi kerja.
- **Manajemen skala penilaian**: mengatur aturan konversi nilai dari nilai mentah.
- **Manajemen periode**: mengelola periode penilaian kinerja.
- **Penilaian kinerja**: pencatatan nilai karyawan berdasarkan periode penilaian
- **Perhitungan SAW**: konversi nilai, normalisasi, perhitungan nilai preferensi, dan perangkingan.
- **Perankingan karyawan**: penyajian hasil berdasarkan nilai preferensi.

## Teknologi
### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod
- Json Web Token (JWT)
- bcrypt

### Frontend
- Vue 3
- TypeScript
- Vite
- Vue Router
- Pinia
- Axios
- Tailwind CSS
- Chart.js dan Vue Chart.js
- Lucide Vue Next
- SweetAlert2

## Persiapan
Pastikan perangkat sudah memiliki:
- Docker Desktop
- Git

## Menjalankan Projek dengan Docker
### 1. Clone repository
```bash
git clone https://github.com/zackyhermawan/spk-penilaian-kinerja-karyawan-menggunakan-metode-saw.git
cd /spk-penilaian-kinerja-karyawan-menggunakan-metode-saw
```

### 2. Konfigurasi environment
copy file .env.example, salin menjadi .env, kemudian sesuaikan nilai variabel environment dengan konfigurasi lokal.

### 3. Jalankan seluruh layanan
Dari direktori root project, jalankan:
```bash
docker compose up --build -d
```

### 4. Periksa status container
```bash
docker compose ps
```

### 5. Akses aplikasi

Dengan konfigurasi port default project:
- Frontend: http://localhost:8080
- Backend: http://localhost:3000

## _Metode Simple Additive Weighting_ (SAW)
Metode SAW digunakan untuk menghitung nilai preferensi karyawan berdasarkan kriteria dan bobot yang ditentukan dari masing-masing posisi. Secara umum, tahapannya meliputi:

1. Menentukan kriteria dan bobot penilaian.
2. Memasukkan nilai kinerja karyawan.
3. Mengonversi nilai berdasarkan aturan skala penilaian.
4. Melakukan normalisasi matriks keputusan.
5. Menghitung nilai preferensi dengan mengalikan nilai normalisasi dan bobot kriteria.
6. Mengurutkan nilai preferensi untuk memperoleh peringkat karyawan.

Karyawan dengan nilai preferensi lebih tinggi memperoleh peringkat lebih tinggi berdasarkan hasil perhitungan metode SAW.
