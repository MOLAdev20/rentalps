# Rental POS

Aplikasi _point of sale_ (POS) untuk operasional rental PlayStation. Aplikasi ini membantu administrator mengelola unit PS, mencatat sesi sewa dan pesanan makanan/minuman (FnB), memproses pembayaran, serta melihat laporan transaksi dan keuangan.

![Diagram basis data](./display.png)

## Fitur utama

- Autentikasi administrator dengan **JWT** dan penyimpanan _refresh token_.
- Dashboard ringkasan operasional rental.
- Manajemen data unit PlayStation, termasuk harga sewa dan status `available`, `rented`, atau `maintainance`.
- Pembuatan sesi sewa: nama pelanggan, durasi bermain, waktu mulai/selesai, dan perhitungan biaya otomatis.
- Katalog serta pesanan makanan dan minuman (FnB) pada transaksi sewa.
- Detail sesi aktif untuk menambah/menghapus FnB atau mengubah jumlah pesanan.
- Pembayaran tunai dan pembuatan tautan QRIS menggunakan **Midtrans Snap** (mode _sandbox_).
- Riwayat/laporan transaksi.
- Laporan keuangan yang dapat difilter berdasarkan rentang tanggal, mencakup pendapatan sewa, FnB, tunai, QRIS, dan total transaksi.

## Teknologi

| Bagian               | Teknologi                                          |
| -------------------- | -------------------------------------------------- |
| Frontend             | Vue 3, TypeScript, Vite, Vue Router                |
| Antarmuka            | Tailwind CSS, Lucide Vue, Chart.js                 |
| Backend              | Express 5, TypeScript                              |
| Basis data           | MySQL dengan Prisma ORM dan Prisma MariaDB Adapter |
| Autentikasi          | JSON Web Token (JWT), bcrypt                       |
| Integrasi pembayaran | Midtrans Snap (QRIS)                               |
| HTTP client          | Axios                                              |

## Arsitektur dan struktur proyek

Repositori ini memisahkan aplikasi antarmuka dan API sehingga keduanya dapat dijalankan atau dikembangkan secara mandiri.

```text
rentalps/
├── client/                 # SPA Vue untuk administrator
│   └── src/
│       ├── pages/          # Login, dashboard, sewa, unit, dan laporan
│       ├── components/     # Komponen layout dan UI bersama
│       └── composables/    # Pembungkus Axios dan dialog
├── api/                    # REST API Express
│   ├── src/
│   │   ├── controllers/    # Logika autentikasi, master data, transaksi, laporan
│   │   ├── routes/         # Definisi endpoint
│   │   ├── middleware/     # Otorisasi JWT dan validasi Zod
│   │   └── lib/            # Prisma dan JWT
│   └── prisma/             # Skema serta migrasi basis data
└── schema.png              # Diagram relasi basis data
```

## Prasyarat

- Node.js dan npm
- Server MySQL yang dapat diakses
- Akun/sandbox Midtrans apabila fitur QRIS digunakan

## Instalasi dan menjalankan aplikasi

### 1. Siapkan API

```bash
cd api
npm install
```

Buat atau sesuaikan file `api/.env` dengan konfigurasi berikut.

```env
PORT=8080
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/NAMA_DATABASE"
DATABASE_HOST=HOST
DATABASE_PORT=3306
DATABASE_USER=USER
DATABASE_PASSWORD=PASSWORD
DATABASE_NAME=NAMA_DATABASE
JWT_SECRET_KEY=ganti-dengan-rahasia-yang-kuat
MIDTRANS_SERVER_KEY=SB-Mid-server-...
MIDTRANS_CLIENT_KEY=SB-Mid-client-...
```

Terapkan migrasi Prisma dan jalankan API.

```bash
npx prisma migrate dev
npm run dev
```

Secara bawaan, API mendengarkan port dari `PORT` (atau `8080` bila tidak diisi).

### 2. Siapkan frontend

Pada terminal lain:

```bash
cd client
npm install
```

Atur alamat API pada `client/.env`.

```env
VITE_API_URL=http://localhost:8080
```

Lalu jalankan aplikasi web:

```bash
npm run dev
```

Buka alamat yang ditampilkan Vite—umumnya `http://localhost:5173`. Konfigurasi CORS API saat ini mengizinkan origin tersebut.

### Build frontend untuk produksi

```bash
cd client
npm run build
npm run preview
```

## Alur penggunaan

1. Masuk menggunakan akun administrator.
2. Tambahkan unit PS melalui menu **Unit PS** jika data unit belum tersedia.
3. Pilih unit berstatus tersedia dari halaman **Sewa**.
4. Isi pelanggan dan durasi bermain, lalu tambahkan FnB jika diperlukan.
5. Mulai sesi. Unit otomatis berubah menjadi `rented`.
6. Pada halaman detail sesi, kelola pesanan FnB dan pilih pembayaran tunai atau QRIS.
7. Setelah pembayaran diproses, unit dikembalikan ke status `available`.
8. Tinjau data pada **Laporan Transaksi** dan **Laporan Keuangan**.

## Model data utama

| Model                   | Kegunaan                                                             |
| ----------------------- | -------------------------------------------------------------------- |
| `User`                  | Akun administrator aplikasi.                                         |
| `User_Refresh_Token`    | Token sesi jangka panjang yang terkait dengan pengguna.              |
| `Unit_Item`             | Master unit PlayStation beserta harga dan statusnya.                 |
| `Fnb_Item`              | Master produk makanan/minuman.                                       |
| `Transaction`           | Header transaksi sewa dan informasi pembayaran.                      |
| `Transaction_Item_Unit` | Rincian unit, durasi, biaya, dan waktu sesi sewa.                    |
| `Transaction_Item_Fnb`  | Rincian produk FnB pada transaksi.                                   |
| `Payment_Link`          | Tautan pembayaran QRIS dari Midtrans beserta masa berlaku/statusnya. |

## Ringkasan endpoint API

Endpoint yang berada di balik autentikasi memerlukan header berikut:

```http
Authorization: Bearer <token_jwt>
```

| Metode   | Endpoint                                           | Keterangan                                                            | Autentikasi    |
| -------- | -------------------------------------------------- | --------------------------------------------------------------------- | -------------- |
| `POST`   | `/auth`                                            | Login dan memperoleh token JWT.                                       | Tidak          |
| `GET`    | `/auth/verify`                                     | Memverifikasi token.                                                  | Mengirim token |
| `GET`    | `/auth/register`                                   | Mendaftarkan pengguna (implementasi saat ini membaca data dari body). | Tidak          |
| `GET`    | `/unit`                                            | Mengambil semua unit PS.                                              | Ya             |
| `GET`    | `/unit/available/:id`                              | Mengambil unit yang masih tersedia.                                   | Ya             |
| `GET`    | `/unit/:id`                                        | Mengambil detail unit.                                                | Ya             |
| `POST`   | `/unit`                                            | Menambahkan unit PS.                                                  | Ya             |
| `GET`    | `/fnb`                                             | Mengambil katalog FnB.                                                | Tidak          |
| `POST`   | `/fnb`                                             | Menambahkan item FnB.                                                 | Tidak          |
| `GET`    | `/transaction`                                     | Mengambil daftar transaksi.                                           | Ya             |
| `POST`   | `/transaction`                                     | Membuat transaksi/sesi sewa.                                          | Ya             |
| `GET`    | `/transaction/unit/:id`                            | Mengambil detail transaksi aktif sebuah unit.                         | Ya             |
| `POST`   | `/transaction/fnb-item/add`                        | Menambahkan FnB ke transaksi.                                         | Ya             |
| `DELETE` | `/transaction/fnb-item/:id`                        | Menghapus FnB dari transaksi.                                         | Ya             |
| `PATCH`  | `/transaction/fnb-item/change-qty/:id/:changeType` | Mengubah kuantitas FnB.                                               | Ya             |
| `POST`   | `/transaction/payment/proceed-payment`             | Menyelesaikan pembayaran dan membebaskan unit.                        | Ya             |
| `POST`   | `/transaction/payment/generate-qris`               | Membuat tautan QRIS Midtrans.                                         | Ya             |
| `GET`    | `/transaction/report/financial-statements`         | Mengambil ringkasan keuangan; mendukung `start_date` dan `end_date`.  | Ya             |

## Contoh payload

### Membuat transaksi sewa

```json
{
  "customer_name": "Budi",
  "transaction_rental": [
    {
      "unit_item": 1,
      "play_time": 2,
      "start_time": "2026-08-19T10:00:00.000Z",
      "end_time": "2026-08-19T12:00:00.000Z"
    }
  ],
  "transaction_fnb": [
    {
      "fnb_item": 1,
      "quantity": 2
    }
  ]
}
```

### Menambahkan unit PS

```json
{
  "title": "PlayStation 5 - Unit 1",
  "description": "PS5 dengan dua stik dan TV 43 inci.",
  "rent_price": 15000
}
```

## Catatan keamanan dan pengembangan

- Jangan pernah memasukkan `.env`, kredensial database, kunci Midtrans, atau `JWT_SECRET_KEY` ke Git.
- Token akses memiliki masa berlaku 15 menit; _refresh token_ dibuat dengan masa berlaku satu hari dan disimpan di basis data.
- QRIS dikonfigurasi dalam mode _sandbox_ (`isProduction: false`). Ubah konfigurasi pembayaran dan kunci Midtrans secara sadar saat memasuki produksi.
- Endpoint registrasi saat ini terdaftar sebagai `GET`, walaupun kontrolernya membaca body. Untuk API yang konsisten, endpoint tersebut sebaiknya diubah menjadi `POST` pada pengembangan berikutnya.

## Lisensi

Belum ada lisensi proyek yang ditetapkan.
