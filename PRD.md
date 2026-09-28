# Product Requirements Document: Rental POS PlayStation

## 1. Informasi Dokumen

| Atribut | Nilai |
| --- | --- |
| Nama produk | Rental POS PlayStation |
| Nama repositori | `rentalps` |
| Status | Implementasi aktif, belum siap dianggap production-ready |
| Dokumen ini | Baseline produk dan teknis berdasarkan source code saat ini |
| Audiens | AI agent, developer, maintainer, dan operator teknis |
| Bahasa | Bahasa Indonesia formal |

Dokumen ini menjelaskan perilaku dan struktur implementasi yang ditemukan pada repositori. Jika dokumen ini berbeda dengan source code, migration Prisma terbaru dan source code yang berjalan menjadi sumber kebenaran; `schema.txt` merupakan dokumentasi lama dan tidak boleh dijadikan acuan tunggal.

## 2. Ringkasan Produk

Rental POS PlayStation adalah aplikasi point of sale untuk operasional tempat rental PlayStation. Aplikasi digunakan oleh administrator atau operator untuk mengelola unit konsol, membuat sesi bermain, menambahkan pesanan makanan dan minuman (FnB), menerima pembayaran tunai atau QRIS, serta memantau laporan operasional dan keuangan.

Aplikasi saat ini berorientasi pada operasi internal satu lokasi. Tidak ditemukan fitur pelanggan untuk melakukan pemesanan mandiri, reservasi publik, multi-cabang, manajemen stok FnB, diskon, pajak, refund, atau audit log.

## 3. Tujuan Produk

1. Memusatkan pencatatan unit PlayStation dan status ketersediaannya.
2. Mempercepat pembuatan sesi rental dengan perhitungan harga otomatis.
3. Memungkinkan operator mengelola tambahan FnB selama sesi berlangsung.
4. Mendukung penyelesaian pembayaran tunai dan pembayaran QRIS melalui Midtrans Snap.
5. Menyediakan visibilitas kondisi operasional dan rekap pendapatan.

## 4. Aktor dan Hak Akses

### Administrator/operator

Administrator atau operator adalah pengguna utama aplikasi. Ia dapat login, melihat dashboard, mengelola unit dan katalog FnB, membuat rental, mengelola FnB pada rental aktif, memproses pembayaran, dan melihat laporan.

Implementasi autentikasi menggunakan username dan password, bcrypt, JWT access token 15 menit, serta refresh token yang disimpan di database dengan masa berlaku satu hari. Belum ada role atau permission terpisah; seluruh pengguna terdaftar secara efektif memiliki akses yang sama.

### Sistem eksternal Midtrans

Midtrans Snap menghasilkan tautan pembayaran QRIS dan mengirim webhook status pembayaran. Endpoint webhook tidak memerlukan JWT karena dipanggil oleh Midtrans.

## 5. Ruang Lingkup Fitur

### 5.1 Autentikasi

- Login administrator.
- Verifikasi access token.
- Registrasi akun.
- Penerbitan access token baru melalui refresh token tersimpan.
- Logout dengan menghapus refresh token pengguna.

Catatan: frontend saat ini menyimpan access token di `localStorage`. Route guard frontend belum diterapkan; perlindungan utama dilakukan oleh API.

### 5.2 Dashboard

Dashboard menampilkan total unit, unit tersedia, unit sedang bermain, unit yang waktu bermainnya sudah selesai, ringkasan pemasukan hari ini, tren tujuh hari, transaksi terbaru, serta grafik pendapatan rental dan FnB. Frontend melakukan refresh data secara berkala setiap 30 detik.

### 5.3 Manajemen unit PlayStation

Operator dapat menambahkan unit dengan nama, deskripsi, dan harga sewa per jam. Unit baru berstatus `available`. Daftar unit menghitung ringkasan status dan menampilkan waktu rental terakhir.

Status unit:

- `available`: dapat dipilih untuk sesi baru.
- `rented`: sedang terkait sesi rental aktif.
- `maintainance`: disiapkan untuk kondisi perawatan, tetapi workflow perawatan belum lengkap.

UI menampilkan affordance edit, detail, dan hapus, tetapi API aktual hanya menyediakan baca dan create.

### 5.4 Manajemen katalog FnB

Operator dapat menambahkan dan melihat item makanan atau minuman dengan nama, deskripsi, dan harga. Item FnB dapat dipilih saat membuat rental dan dapat ditambahkan ke rental yang sudah berjalan.

API FnB saat ini tidak dipasang di balik middleware JWT. Belum ada stok, status aktif/nonaktif, edit, hapus, atau validasi kuantitas yang lengkap.

### 5.5 Pembuatan sesi rental

Alur normal:

1. Operator memilih unit berstatus `available`.
2. Operator mengisi nama pelanggan dan durasi bermain.
3. Sistem menerima satu atau lebih unit pada payload order, walaupun UI saat ini memulai dari satu unit.
4. Operator dapat memilih FnB dan kuantitasnya.
5. Sistem menghitung subtotal rental dan FnB.
6. Sistem membuat nomor order dengan format `ORD-DDMMYYYY-n`.
7. Sistem membuat detail unit dan detail FnB.
8. Sistem mengubah unit terkait menjadi `rented`.

Durasi rental tidak memiliki schema validasi order formal di backend. UI mengharuskan minimal satu jam, tetapi backend perlu memperlakukan nilai waktu, unit, dan kuantitas sebagai input yang harus divalidasi.

### 5.6 Pengelolaan rental aktif

Pada detail sesi, operator dapat melihat pelanggan, unit, waktu mulai, waktu selesai, durasi, harga, sisa waktu, dan item FnB. Operator dapat:

- menambahkan item FnB;
- menaikkan atau menurunkan kuantitas FnB;
- menghapus item FnB;
- melihat riwayat rental unit;
- memilih metode pembayaran;
- menentukan apakah unit langsung dibebaskan setelah pembayaran.

### 5.7 Pembayaran tunai

Endpoint pembayaran tunai menandai order sebagai `complete`, membuat record `Transaction`, dan menyimpan metode pembayaran `cash`. Bila `turn_off_unit` bernilai satu, unit terkait dikembalikan ke `available`.

### 5.8 Pembayaran QRIS

1. Backend membuat transaksi Snap sandbox dengan metode `other_qris`.
2. Backend menyimpan nomor transaksi, URL Snap, dan waktu kedaluwarsa satu menit.
3. Frontend menampilkan URL pembayaran melalui iframe.
4. Midtrans memanggil endpoint notification.
5. Status settlement menandai transaction dan order sebagai selesai serta membebaskan unit.
6. Status `expire` atau `cancel` menandai transaction sesuai status tersebut.

Konfigurasi Midtrans saat ini `isProduction: false`; implementasi belum dapat dianggap siap untuk pembayaran produksi tanpa konfigurasi dan pengujian webhook yang memadai.

### 5.9 Laporan

Laporan transaksi menampilkan daftar order, pelanggan, unit, durasi, FnB, total, serta riwayat per unit. Laporan keuangan mendukung filter tanggal awal dan tanggal akhir, lalu menghasilkan rekap harian dan ringkasan rental, FnB, tunai, QRIS, jumlah transaksi, dan total.

Fitur cetak struk, export Excel, dan hapus transaksi masih berupa UI atau placeholder dan belum memiliki kontrak API lengkap.

## 6. Arsitektur Sistem

```text
Browser operator
    |
    | Vue SPA + Axios
    v
Express REST API
    |                 \
    | Prisma            \ Midtrans Snap Sandbox
    v                    ^
MariaDB/MySQL <---------- webhook notification
```

### Frontend

- Vue 3 dan TypeScript.
- Vite sebagai dev server dan bundler.
- Vue Router.
- Tailwind CSS.
- Axios untuk komunikasi HTTP.
- Chart.js untuk grafik dashboard.
- Lucide Vue untuk ikon.
- `client/src/pages` berisi halaman fitur.
- `client/src/components` berisi layout dan komponen UI bersama.
- `client/src/pages/*/composables` berisi state dan operasi halaman.

### Backend

- Express 5 dan TypeScript.
- Prisma ORM dengan MariaDB adapter.
- JWT dan bcrypt untuk autentikasi.
- Zod dipakai pada validasi unit dan FnB, tetapi belum konsisten pada order dan autentikasi.
- Controller memuat logika bisnis dan route memetakan endpoint.

### Basis data dan integrasi

- MariaDB/MySQL.
- Connection pool Prisma dikonfigurasi melalui `@prisma/adapter-mariadb`.
- Midtrans Snap hanya digunakan untuk QRIS dan berjalan dalam mode sandbox.

## 7. Struktur Repositori

```text
rentalps/
├── README.md                 # Dokumentasi setup dan gambaran umum
├── PRD.md                    # Dokumen ini
├── docker-compose.yml        # MariaDB, backend, dan frontend
├── midtrans-notification.json # Contoh payload webhook
├── schema.txt                # Dokumentasi schema lama; bukan sumber kebenaran
├── api/
│   ├── src/
│   │   ├── config/            # Pembacaan environment
│   │   ├── controllers/      # Logika autentikasi, master data, order, pembayaran, laporan
│   │   ├── lib/              # Prisma dan JWT
│   │   ├── middleware/       # JWT authorization dan validasi
│   │   ├── routes/            # Route REST
│   │   └── schemas/           # Schema Zod
│   └── prisma/
│       ├── schema.prisma     # Schema database aktual
│       └── migrations/       # Riwayat perubahan database
└── client/
    ├── src/
    │   ├── components/        # Layout dan UI reusable
    │   ├── composables/       # Helper state/dialog
    │   ├── helper/            # Axios dan formatter
    │   ├── pages/             # Halaman aplikasi
    │   └── router/            # Definisi route SPA
    └── public/
```

## 8. Route Frontend

| Path | Halaman | Tujuan |
| --- | --- | --- |
| `/login` | Login | Autentikasi operator |
| `/dashboard` | Dashboard | Ringkasan operasional |
| `/rent` | RentalManagement | Daftar unit dan sesi rental |
| `/rent/new/:unitId` | NewRental | Membuat sesi baru |
| `/rent/detail/:id` | Rental detail | Mengelola sesi aktif dan pembayaran |
| `/unit` | UnitManagement | Master unit PlayStation |
| `/fnb` | FnB | Master katalog FnB |
| `/transaction-report` | TransactionReport | Daftar dan detail transaksi |
| `/financial-statements` | FinancialStatements | Rekap keuangan berdasarkan tanggal |

## 9. Kontrak API Aktual

Semua endpoint di bawah ini berada di bawah root API yang dikonfigurasi pada `VITE_API_URL`. Endpoint bertanda JWT memerlukan `Authorization: Bearer <access_token>`.

| Method | Endpoint | JWT | Keterangan |
| --- | --- | --- | --- |
| POST | `/auth` | Tidak | Login |
| GET | `/auth/verify` | Header token | Verifikasi token |
| POST | `/auth/register` | Tidak | Registrasi pengguna |
| POST | `/auth/refresh-token` | Tidak | Membuat access token baru berdasarkan user ID dan record refresh aktif |
| POST | `/auth/logout` | Ya | Menghapus refresh token pengguna |
| GET | `/unit` | Ya | Semua unit dan ringkasan status |
| GET | `/unit/available/:id` | Ya | Detail unit yang tersedia |
| GET | `/unit/:id` | Ya | Detail unit |
| POST | `/unit` | Ya | Membuat unit |
| GET | `/fnb` | Tidak | Semua item FnB |
| POST | `/fnb` | Tidak | Membuat item FnB |
| GET | `/order/by-unit/:unit_id?order=:order_id` | Ya | Detail order pada unit |
| POST | `/order` | Ya | Membuat order rental dan detailnya |
| POST | `/order/fnb-item/add` | Ya | Menambah FnB ke order |
| PATCH | `/order/fnb-item/change-qty/:id/:changeType` | Ya | Mengubah kuantitas FnB |
| DELETE | `/order/fnb-item/:id` | Ya | Menghapus FnB dari order |
| GET | `/transaction` | Ya | Daftar order untuk laporan transaksi |
| GET | `/transaction/unit/:id` | Ya | Detail order aktif unit |
| GET | `/transaction/unit-history/:id` | Ya | Riwayat order unit |
| POST | `/transaction/payment/proceed-payment` | Ya | Pembayaran tunai |
| POST | `/transaction/payment/generate-qris` | Ya | Membuat tautan Snap QRIS |
| POST | `/transaction/payment/notification` | Tidak | Webhook Midtrans |
| GET | `/transaction/report/financial-statements` | Ya | Rekap keuangan; query `start_date`, `end_date` |

### Payload order minimal

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

### Payload pembayaran minimal

```json
{
  "order_id": 1,
  "payment_method": "cash",
  "turn_off_unit": 1
}
```

## 10. Schema Database Aktual

Database menggunakan nama tabel berikut melalui `@@map` pada Prisma.

### `unit_item` - model `UnitItem`

| Kolom | Tipe/logika | Keterangan |
| --- | --- | --- |
| `id` | Int, PK, auto increment | Identitas unit |
| `title` | String | Nama unit |
| `description` | Text | Deskripsi unit |
| `rent_price` | Float | Harga sewa per jam |
| `status` | `available`, `rented`, `maintainance` | Status operasional |
| `created_at` | DateTime | Waktu dibuat |
| `updated_at` | DateTime | Waktu diperbarui otomatis |

Satu unit memiliki banyak `rented_unit_order`.

### `fnb_item` - model `FnBItem`

| Kolom | Tipe/logika | Keterangan |
| --- | --- | --- |
| `id` | Int, PK, auto increment | Identitas item |
| `title` | String | Nama makanan/minuman |
| `description` | Text | Deskripsi item |
| `price` | Float | Harga satuan |
| `created_at` | DateTime | Waktu dibuat |
| `updated_at` | DateTime | Waktu diperbarui |

Satu item memiliki banyak `fnb_item_order`.

### `orders` - model `Orders`

| Kolom | Tipe/logika | Keterangan |
| --- | --- | --- |
| `id` | Int, PK, auto increment | Identitas order |
| `order_no` | String, unique | Nomor `ORD-DDMMYYYY-n` |
| `customer_name` | String | Nama pelanggan |
| `subtotal` | Float | Akumulasi rental dan FnB saat order dibuat |
| `total` | Float | Total yang dibayar; saat ini sama dengan subtotal |
| `status` | `pending`, `complete`, `cancel` | Status order |
| `created_at` | DateTime | Waktu dibuat |
| `updated_at` | DateTime | Waktu diperbarui |

Relasi: satu order memiliki banyak detail unit, banyak detail FnB, dan banyak record transaction.

### `rented_unit_order` - model `RentedUnitOrder`

| Kolom | Tipe/logika | Keterangan |
| --- | --- | --- |
| `id` | Int, PK, auto increment | Identitas detail |
| `order_id` | Int, FK ke `orders.id` | Order induk |
| `unit_item_id` | Int, FK ke `unit_item.id` | Unit yang disewa |
| `play_time` | Float | Durasi bermain |
| `sub_total` | Float | Harga unit dikali durasi |
| `start_time` | DateTime | Waktu mulai |
| `end_time` | DateTime | Waktu selesai |

Foreign key menggunakan cascade delete. Source controller pembayaran masih mencoba memperbarui kolom `status` pada tabel ini, tetapi kolom tersebut tidak ada di schema Prisma terbaru; hal ini harus diperbaiki sebelum alur pembayaran dianggap stabil.

### `fnb_item_order` - model `FnBItemOrder`

| Kolom | Tipe/logika | Keterangan |
| --- | --- | --- |
| `id` | Int, PK, auto increment | Identitas detail |
| `order_id` | Int, FK ke `orders.id` | Order induk |
| `fnb_item_id` | Int, FK ke `fnb_item.id` | Item FnB |
| `quantity` | Int | Kuantitas |
| `sub_total` | Float | Harga item dikali kuantitas |

Foreign key menggunakan cascade delete.

### `order_transaction` - model `Transaction`

| Kolom | Tipe/logika | Keterangan |
| --- | --- | --- |
| `id` | Int, PK, auto increment | Identitas pembayaran |
| `order_id` | Int, FK ke `orders.id` | Order yang dibayar |
| `transaction_no` | String | Nomor transaksi `TRX-DDMMYYYY-n` |
| `payment_method` | `pending_payment`, `qris`, `cash` | Metode pembayaran |
| `amount` | Float | Nilai pembayaran |
| `snap_url` | String nullable | URL Snap untuk QRIS |
| `snap_expiry` | DateTime nullable | Waktu kedaluwarsa Snap |
| `status` | `pending`, `complete`, `cancel`, `expired` | Status pembayaran |
| `created_at` | DateTime | Waktu dibuat |
| `updated_at` | DateTime | Waktu diperbarui |

### `user` - model `User`

Kolom: `id`, `full_name`, `email`, `username`, `password`, `created_at`, dan `updated_at`. Password harus disimpan dalam bentuk hash bcrypt.

### `user_refresh_token` - model `UserRefreshToken`

Kolom: `id`, `user_id`, `token`, `expires_at`, `is_revoked`, `user_agent`, `ip_address`, dan `created_at`. Relasi ke `user` menggunakan cascade delete.

## 11. Status dan Invarian Domain

Alur nominal status adalah:

```text
Unit available -> Order dibuat -> Unit rented
Order pending -> Pembayaran berhasil -> Order complete
Transaction pending -> settlement tunai/QRIS -> Transaction complete
Unit rented -> Unit dibebaskan -> Unit available
```

Invarian yang perlu dipertahankan oleh perubahan berikutnya:

- Unit yang dipilih untuk order baru harus masih `available`.
- Total order harus konsisten dengan detail unit dan detail FnB.
- Pembayaran tidak boleh membuat lebih dari satu penyelesaian yang tidak disengaja.
- Webhook Midtrans harus idempotent.
- Unit tidak boleh tersedia kembali sebelum sesi selesai atau operator memilih membebaskannya.
- Semua perubahan lintas tabel order, pembayaran, dan unit idealnya dilakukan dalam transaksi database.

## 12. Environment dan Menjalankan Proyek

### API lokal

Variabel utama pada `api/.env`:

```env
PORT=8080
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/NAMA_DATABASE"
DATABASE_HOST=HOST
DATABASE_PORT=3306
DATABASE_USER=USER
DATABASE_PASSWORD=PASSWORD
DATABASE_NAME=NAMA_DATABASE
JWT_SECRET_KEY=ganti-dengan-rahasia-kuat
MIDTRANS_SERVER_KEY=SB-Mid-server-...
MIDTRANS_CLIENT_KEY=SB-Mid-client-...
```

Perintah:

```bash
cd api
npm install
npx prisma migrate dev
npm run dev
```

Build API: `npm run build`.

### Frontend lokal

Variabel `client/.env`:

```env
VITE_API_URL=http://localhost:8080
```

Perintah:

```bash
cd client
npm install
npm run dev
```

Build produksi: `npm run build`; preview: `npm run preview`.

### Docker Compose

- MariaDB: host port `3307`, database `rentalps`.
- Backend: host port `5000`.
- Frontend Nginx: host port `8080`.
- Volume database: `shared_mariadb_data`.
- Network internal: `app-network`.

Compose saat ini belum meneruskan `JWT_SECRET_KEY` dan kredensial Midtrans ke backend, serta belum meneruskan build argument `VITE_API_URL` ke frontend. Konfigurasi ini perlu dilengkapi untuk deployment yang benar.

## 13. Kesenjangan, Risiko, dan Backlog Teknis

### Prioritas tinggi

1. Perbaiki referensi kolom `status` pada `RentedUnitOrder` di controller pembayaran karena tidak ada pada schema terbaru.
2. Pastikan perubahan order, detail order, status unit, dan transaction memakai database transaction.
3. Cegah race condition saat dua operator menyewa unit yang sama.
4. Buat nomor order dan nomor transaksi yang aman terhadap request bersamaan; `count() + 1` berpotensi menghasilkan duplikasi.
5. Validasi webhook Midtrans dan pastikan pemrosesan settlement idempotent.
6. Jangan simpan atau commit rahasia `.env`; tambahkan aturan `.gitignore` dan rotasi kredensial bila pernah terekspos.
7. Lengkapi environment Docker, termasuk JWT, Midtrans, dan URL API frontend.
8. Perbaiki CORS agar sesuai dengan environment lokal, Docker, dan produksi.

### Prioritas menengah

1. Hitung ulang `orders.subtotal` dan `orders.total` setiap kali detail FnB berubah.
2. Tambahkan validasi Zod untuk login, registrasi, order, pembayaran, dan perubahan kuantitas.
3. Lindungi endpoint FnB dengan JWT dan batasi registrasi sesuai kebijakan administrator.
4. Tambahkan route guard frontend dan mekanisme refresh token yang mengirim token secara eksplisit.
5. Selaraskan laporan transaksi dengan payment method dan status transaction aktual; saat ini endpoint laporan memaksa nilai `CASH` dan `COMPLETED`.
6. Tetapkan workflow maintenance unit dan perilaku otomatis ketika waktu bermain berakhir.
7. Selaraskan `schema.txt` dan README dengan `api/prisma/schema.prisma`.

### Fitur bisnis yang belum tersedia

- edit dan hapus unit;
- edit dan hapus item FnB;
- perpanjangan waktu rental;
- pembatalan dan refund;
- stok FnB;
- diskon, pajak, dan biaya tambahan;
- cetak atau export struk;
- export Excel/CSV;
- notifikasi berakhirnya sesi;
- role dan permission;
- audit log;
- multi-cabang;
- reservasi pelanggan.

## 14. Pedoman untuk AI Agent dan Developer

1. Baca `api/prisma/schema.prisma` dan migration terbaru sebelum mengubah query atau model data.
2. Jangan menghidupkan kembali tabel lama dari `schema.txt` tanpa keputusan migrasi yang eksplisit.
3. Pertahankan nama tabel database aktual yang ditentukan oleh `@@map`.
4. Saat mengubah alur pembayaran, verifikasi sekaligus status `Orders`, `Transaction`, dan `UnitItem`.
5. Setiap endpoint baru harus memiliki definisi route, controller, validasi input, aturan otorisasi, dan dokumentasi payload.
6. Perubahan harga harus mempertimbangkan apakah nilai historis disimpan pada detail order; laporan tidak boleh bergantung pada harga master yang dapat berubah.
7. Gunakan nilai enum yang sudah ada secara konsisten: `available`, `rented`, `maintainance`, `pending`, `complete`, `cancel`, `expired`, `pending_payment`, `qris`, dan `cash`.
8. Jangan memasukkan kredensial database, JWT, atau Midtrans dalam source control.
9. Setelah perubahan backend, jalankan build API; setelah perubahan frontend, jalankan build client.
10. Untuk perubahan yang menyentuh pembayaran atau status unit, tambahkan pengujian integrasi untuk kasus sukses, gagal, webhook berulang, dan konkurensi.

## 15. Sumber Kebenaran Teknis

- Product overview dan setup: `README.md`
- Schema dan enum database: `api/prisma/schema.prisma`
- Evolusi database: `api/prisma/migrations/`
- Root route API: `api/src/routes/index.ts`
- Perhitungan order: `api/src/controllers/orders/order.controller.ts`
- Perubahan FnB order: `api/src/controllers/orders/orderedFnB.controller.ts`
- Pembayaran dan webhook: `api/src/controllers/transaction/payment.controller.ts`
- Laporan transaksi: `api/src/controllers/transaction/transaction.controller.ts`
- Laporan keuangan: `api/src/controllers/transaction/transactionReport.controller.ts`
- Navigasi frontend: `client/src/router/index.ts`
- Contoh webhook: `midtrans-notification.json`
