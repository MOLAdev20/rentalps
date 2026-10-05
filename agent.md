# AGENT.md — Panduan AI Agent untuk Project Rental POS PlayStation

> Dokumen ini adalah panduan kerja untuk AI coding agent. Isinya: gambaran produk,
> status fitur, arsitektur, alur bisnis, konvensi kode, dan jebakan teknis yang
> harus diketahui sebelum menambah/mengubah fitur.
>
> Bahasa komentar & UI project ini **Indonesia**, identifier kode **Inggris**.
> Ikuti pola yang sudah ada; jangan bawa gaya/stack baru tanpa alasan kuat.

---

## 1. Ringkasan Produk

Aplikasi **POS rental PlayStation**: mencatat sesi sewa unit konsol berdasarkan
durasi main, mengelola master unit & FnB (makanan/minuman), menangani pembayaran
**tunai** dan **QRIS via Midtrans Snap (sandbox)**, serta menyediakan laporan
transaksi & laporan keuangan.

Karakter aplikasi:

- Satu admin/operator (belum ada multi-role / multi-cabang).
- Alur inti: **pilih unit → buat sesi sewa (durasi + FnB) → unit jadi `rented` →
  kelola FnB selama main → bayar (cash/QRIS) → order `complete` & unit `available`**.
- Perhitungan harga dilakukan di backend saat membuat order
  (`rent_price * play_time` dan `price * quantity`), lalu `subtotal = total`.

---

## 2. Tech Stack

| Lapisan      | Teknologi                                                                 |
| ------------ | ------------------------------------------------------------------------- |
| Frontend     | Vue 3 (`<script setup lang="ts">`), Vue Router 5, Vite 8, TypeScript       |
| Styling/UI   | Tailwind CSS v4 (`@tailwindcss/vite`), Lucide Vue, Chart.js               |
| Utilitas FE  | Axios, dayjs, vue3-hot-toast                                               |
| Backend      | Express 5, TypeScript, ESM (`NodeNext`, import wajib pakai `.js`)          |
| DB / ORM     | MariaDB/MySQL + Prisma 7 dengan `@prisma/adapter-mariadb`                  |
| Auth         | JWT (access 15 menit, refresh 1 hari disimpan di DB) + bcrypt             |
| Validasi     | Zod (custom middleware, bukan zod-express)                                 |
| Pembayaran   | `midtrans-client` Snap, `isProduction: false`                             |
| Deploy lokal | `docker-compose.yml` (MariaDB 12.3, backend, frontend + nginx)             |

**Tidak ada test runner** (`api/package.json` test = `exit 1`). Verifikasi = typecheck/build.

---

## 3. Perintah Penting

```bash
# Backend (folder api/)
cd api
npm install
npx prisma migrate dev      # apply migrasi
npx prisma generate         # generate Prisma client ke api/generated/prisma
npm run dev                 # tsx watch ./src/index.ts
npm run build               # npx tsc  (typecheck + emit ke dist/)

# Frontend (folder client/)
cd client
npm install
npm run dev                 # Vite dev server (default :5173)
npm run build               # vue-tsc -b && vite build  <-- ini typecheck FE
npm run preview

# Seluruh stack
docker compose up --build   # db :3307, backend :5000, frontend :8080
```

> Backend dev server mendengarkan `PORT` (default `8080`), tapi CORS di
> `api/src/app.ts` **hardcoded** hanya mengizinkan `http://localhost:5173`.

---

## 4. Struktur Repo

```
rentalps/
├── api/
│   ├── prisma/schema.prisma          # SATU-SATUNYA sumber kebenaran skema DB
│   ├── prisma.config.ts
│   ├── generated/prisma/             # Prisma client hasil generate (jangan edit manual)
│   └── src/
│       ├── index.ts                  # bootstrap app.listen
│       ├── app.ts                    # setup express, cors, json, mount router
│       ├── config/env.ts             # baca process.env (dotenv/config)
│       ├── lib/prisma.ts             # PrismaClient singleton + MariaDB adapter
│       ├── lib/jwt.ts                # signToken / verify
│       ├── middleware/
│       │   ├── authorization.middleware.ts   # cek header `Bearer `
│       │   └── validate.middleware.ts        # jalankan Zod schema body/query/params
│       ├── schemas/                  # Zod schema + tipe infer (unit, fnb)
│       ├── controllers/              # auth, unit, fnb, orders/, transaction/
│       └── routes/                   # definisi endpoint + index.ts (mount semua)
│
└── client/
    └── src/
        ├── main.ts, App.vue, style.css
        ├── router/index.ts           # semua route + name
        ├── helper/axios.ts           # wrapper Axios + interceptor token/refresh
        ├── helper/currency.ts        # formatRupiah
        ├── composables/              # state bersama (alert dialog, history sidebar)
        ├── components/               # layout & komponen UI bersama
        └── pages/
            ├── Dashboard.vue, Login.vue, RentalManagement.vue,
            ├── UnitManagement.vue, FnB.vue, TransactionReport.vue,
            ├── FinancialStatements.vue, NotFound.vue
            ├── new-rental/           # buat sesi sewa baru (draft, belum ada order_id)
            │   ├── index.vue
            │   ├── components/       # SessionCard, FnbCard
            │   └── composables/      # usePlaySessionDraft, useFnbDraft, useCreateOrder
            └── rental-detail/        # kelola order yang sudah tersimpan
                ├── index.vue
                ├── components/SessionCard.vue
                └── composables/      # useOrderPage, usePlaySessionOrder,
                                       # useFnbOrder, usePayment
```

---

## 5. Konfigurasi Environment

`api/.env`:

```env
PORT=8080
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/DB"   # dipakai Prisma CLI/migrate
DATABASE_HOST=... DATABASE_PORT=... DATABASE_USER=...
DATABASE_PASSWORD=... DATABASE_NAME=...             # dipakai adapter runtime (env.ts)
JWT_SECRET_KEY=...
MIDTRANS_SERVER_KEY=SB-Mid-server-...
MIDTRANS_CLIENT_KEY=SB-Mid-client-...
```

`client/.env`:

```env
VITE_API_URL=http://localhost:8080
```

> Note arsitektur: runtime Prisma **tidak** memakai `DATABASE_URL`; ia memakai
> `env.DATABASE.*` lewat `PrismaMariaDb`. `DATABASE_URL` hanya untuk Prisma CLI.
> Jangan pernah commit `.env` atau key Midtrans.

---

## 6. Model Data (ringkasan `api/prisma/schema.prisma`)

Nama model Prisma = PascalCase; nama tabel DB di-`@@map` ke snake_case.

| Model               | Tabel                | Inti                                                                 |
| ------------------- | -------------------- | -------------------------------------------------------------------- |
| `UnitItem`          | `unit_item`          | Unit PS: `title`, `description`, `rent_price`, `status`              |
| `FnBItem`           | `fnb_item`           | Katalog FnB: `title`, `description`, `price`                         |
| `Orders`            | `orders`             | Header order: `order_no` (unik), `customer_name`, `subtotal`, `total`, `status` |
| `RentedUnitOrder`   | `rented_unit_order`  | Detail sewa unit: `order_id`, `unit_item_id`, `play_time`, `sub_total`, `start_time`, `end_time` |
| `FnBItemOrder`      | `fnb_item_order`     | Detail FnB: `order_id`, `fnb_item_id`, `quantity`, `sub_total`       |
| `Transaction`       | `order_transaction`  | Pembayaran: `transaction_no`, `payment_method`, `amount`, `snap_url`, `snap_expiry`, `status` |
| `User`              | `user`               | Admin: `full_name`, `email`, `username`, `password` (bcrypt)         |
| `UserRefreshToken`  | `user_refresh_token` | Refresh token + `expires_at`, `is_revoked`, `user_agent`, `ip_address` |

Enum:

- `UnitItemStatus`: `available` | `rented` | `maintainance`
- `TransactionPaymentMethod`: `pending_payment` | `qris` | `cash`
- `OrderStatus` / `TransactionStatus`: `pending` | `complete` | `cancel` (+ `expired` khusus Transaction)

Alur status:

- **Order** `pending` → `complete` (saat pembayaran berhasil) / `cancel`.
- **Unit** `available` → `rented` (saat order dibuat) → `available` (saat bayar,
  **hanya jika `end_time` sudah lewat**).
- **Transaction** `pending` → `complete` / `expired` / `cancel` (dari webhook Midtrans).

---

## 7. Alur Bisnis End-to-End

1. **Login** — `POST /auth`. Mengembalikan access token 15 menit; refresh token
   1 hari disimpan di `user_refresh_token`. FE menyimpan token di `localStorage`
   **dengan prefix `Bearer `**.
2. **Pilih unit** — `GET /unit` mengembalikan `{ unit, summary }`. `summary`
   dihitung dari `status` + `end_time` order terakhir (`playing` vs `finished`).
3. **Buat order** — `POST /order` (`order.controller.ts`):
   - Validasi semua `unit_item` harus `available` dan semua `fnb_item` ada.
   - Hitung sub_total per baris, lalu `subtotal` & `total`.
   - Generate `order_no` format `ORD-DDMMYYYY-N` (N = count order hari itu + 1).
   - Simpan `Orders` + nested `RentedUnitOrder` & `FnBItemOrder` sekaligus.
   - Set unit terpilih → `rented`.
4. **Detail sesi** — `GET /order/by-unit/:unit_id?order=<id>` untuk halaman
   rental-detail. Perubahan FnB live: `POST /order/fnb-item/add`,
   `PATCH /order/fnb-item/change-qty/:id/:changeType`, `DELETE /order/fnb-item/:id`.
5. **Pembayaran**
   - **Cash**: `POST /transaction/payment/proceed-payment` → order `complete`,
     buat `Transaction` `cash`, bebaskan unit yang `end_time` sudah lewat.
   - **QRIS**: `POST /transaction/payment/generate-qris` → buat Snap transaction
     (`enabled_payments: ["other_qris"]`, expiry 1 menit), simpan `snap_url`.
     FE buka Snap di iframe dan mendengarkan **SSE**
     `GET /transaction/payment/sse/:orderId`. Webhook Midtrans
     `POST /transaction/payment/notification` menandai complete/expired/cancel
     dan mem-broadcast event SSE.
6. **Laporan**
   - `GET /transaction` → daftar order + unit/FnB (mapping `TRX-YYYYMMDD-NNN`).
   - `GET /transaction/unit-history/:unit_id?date=YYYY-MM-DD` → riwayat per unit
     (filter hari WIB `+07:00`).
   - `GET /transaction/report/financial-statements?start_date&end_date` → query
     raw SQL (`CONVERT_TZ +07:00`) agregasi per hari + summary.

---

## 8. Endpoint API (mount di `api/src/routes/index.ts`)

| Metode   | Endpoint                                            | Auth | Controller                          |
| -------- | --------------------------------------------------- | ---- | ----------------------------------- |
| `POST`   | `/auth`                                             | –    | `auth.login`                        |
| `GET`    | `/auth/verify`                                      | –    | `auth.verify`                       |
| `POST`   | `/auth/register`                                    | –    | `auth.register`                     |
| `POST`   | `/auth/refresh-token`                               | –    | `auth.refreshToken`                 |
| `POST`   | `/auth/logout`                                      | –    | `auth.logout`                       |
| `GET`    | `/unit`                                             | ✔    | `unit.getAll`                       |
| `GET`    | `/unit/available/:id`                               | ✔    | `unit.getAvailableOne`              |
| `GET`    | `/unit/:id`                                         | ✔    | `unit.getOne`                       |
| `POST`   | `/unit`                                             | ✔    | `unit.create` (Zod)                 |
| `GET`    | `/fnb`                                               | –    | `fnb.getAll`                        |
| `POST`   | `/fnb`                                              | –    | `fnb.create` (Zod)                  |
| `GET`    | `/order/by-unit/:unit_id`                           | ✔    | `order.getByRentedUnit`             |
| `POST`   | `/order`                                            | ✔    | `order.createOrder`                 |
| `POST`   | `/order/fnb-item/add`                               | ✔    | `orderedFnB.addToOrder`             |
| `PATCH`  | `/order/fnb-item/change-qty/:id/:changeType`        | ✔    | `orderedFnB.changeQty`              |
| `DELETE` | `/order/fnb-item/:id`                               | ✔    | `orderedFnB.removeFromTransaction`  |
| `GET`    | `/transaction`                                      | ✔    | `transaction.getAll`                |
| `GET`    | `/transaction/unit/:id`                             | ✔    | `transaction.getDetail`             |
| `GET`    | `/transaction/unit-history/:id`                     | ✔    | `transaction.getHistoryByUnit`      |
| `GET`    | `/transaction/payment/sse/:orderId`                 | –    | `payment.sse`                       |
| `POST`   | `/transaction/payment/notification`                 | –    | `payment.notification` (webhook)    |
| `POST`   | `/transaction/payment/proceed-payment`              | ✔    | `payment.proceedPayment`            |
| `POST`   | `/transaction/payment/generate-qris`                | ✔    | `payment.generateQris`              |
| `GET`    | `/transaction/report/financial-statements`          | ✔    | `report.getFinancialStatements`     |

> `/fnb` sengaja belum dipasang `authMiddleware`. Kalau menambah proteksi,
> update juga halaman FnB & komponen `FnbItemSidebar` agar tetap berfungsi.

---

## 9. Status Fitur

**Sudah jalan**

- Auth login/verify/refresh/logout, proteksi route via 401 interceptor + refresh otomatis.
- Dashboard: KPI harian, chart 7 hari, monitoring unit real-time, transaksi terkini.
- Master unit (list + tambah) dan master FnB (list + tambah).
- Alur sewa baru + detail sesi + kelola FnB live + timer sisa waktu.
- Keranjang FnB draft (new-rental) vs live ke DB (rental-detail).
- Pembayaran cash & QRIS (Midtrans Snap sandbox) + SSE notifikasi.
- Laporan transaksi (tabel + sidebar detail) & laporan keuangan (filter tanggal + chart).

**Belum selesai / TODO di kode**

- Halaman **UnitManagement**: tombol `Edit`, `Detail`, `Hapus` belum fungsional
  (tidak ada endpoint update/delete unit).
- Halaman **TransactionReport**: `Cetak Struk` dan `Hapus Transaksi` masih TODO
  (perubahan hanya di state client, belum ada endpoint).
- Halaman **FinancialStatements**: tombol `Export Excel` masih stub.
- Detail sesi: tombol `Batalkan Sewa` belum terhubung API. (`Tambah 1 Jam` dan `Kurangi 1 Jam` sudah aktif via `POST /order/add-play-time` dan `POST /order/reduce-play-time`; pengurangan dibatasi minimal 1 jam.)
- Tidak ada guard route FE — halaman bisa dibuka tanpa token, baru ditendang
  saat request pertama kena 401.
- Tidak ada test otomatis.
- Banyak `console.log` debug tertinggal.

---

## 10. Konvensi Coding Backend (WAJIB diikuti)

1. **ESM + import berakhiran `.js`.** Semua import relatif memakai `.js`
   (contoh `import { prisma } from "../lib/prisma.js"`). Tambah `.js` walau file
   sumbernya `.ts`.
2. **Tidak ada `type: module` import default sembarang.** Model ekspor:
   - Controller: `const endpoint = { ...metode }; export default endpoint;`
   - Lib helper: `export default { ... }` atau named export (`export { prisma }`).
3. **Akses DB selalu lewat singleton** `import { prisma } from "../lib/prisma.js"`.
   Jangan bikin `new PrismaClient()` baru.
4. **Handler bertipe eksplisit**: `async (req: Request, res: Response) => { ... }`.
   Untuk body tervalidasi, pakai tipe infer Zod:
   `Request<{}, {}, RegisterInput>`.
5. **Respons**:
   - Sukses: `res.json({ message: "<kode-kebab-case>", data? })`.
   - Kode pesan yang sudah dipakai: `success`, `unit-created`, `transaction-created`,
     `qris-generated`, `payment-success`, `payment-error`, `invalid-credentials`,
     `unauthorized`, `not-found`, `internal-server-error`, `data-not-found`.
   - Error: `res.status(500).json({ message: "...", err })`. Untuk validasi Zod,
     middleware mengembalikan `{ status: 'fail', errors: [{ field, message }] }`
     dengan `400`.
6. **Operasi yang harus atomik pakai `prisma.$transaction([...])`** (lihat
   `payment.controller.ts` saat update Transaction + Orders).
7. **Validasi input pakai Zod** lewat `validate(schema)` di route, bukan manual
   di controller. Schema tinggal di `src/schemas/<nama>.schema.ts` dan mengekspor
   `registerSchema` + `type RegisterInput = z.infer<typeof registerSchema>['body']`.
   Schema membungkus `body`/`query`/`params`. Pesan error berupa kode
   (contoh `"unit-title-is-required"`).
8. **Route** dibuat dengan `Router()` di `src/routes`, sub-route transaksi di
   `src/routes/transaction/`, lalu di-mount di `src/routes/index.ts`.
9. **Auth** dipasang per-router sebagai middleware (`route.use("/unit", authMiddleware, unit)`).
   Middleware hanya memverifikasi signature/expiry; **tidak** menempel payload ke `req`.
10. **Penamaan field mengikuti schema Prisma** (snake_case: `order_id`, `sub_total`,
    `rent_price`). Jangan mengarang alias baru di response tanpa alasan.

---

## 11. Konvensi Coding Frontend (WAJIB diikuti)

1. **SFC `<script setup lang="ts">`**, Composition API. `defineProps`/`defineEmits`/
   `defineModel` bertipe generic. `defineModel("sidebar-status")` dipakai untuk
   sidebar/modal.
2. **Struktur halaman**: setiap halaman dibungkus `<BaseLayout>` (dari
   `components/__Layout.vue`), lalu konten dalam `<div class="mx-auto max-w-7xl">`.
3. **Panggilan API lewat helper `../helper/axios.ts`** — gaya **callback**:
   ```ts
   axios.get("unit", (response) => { ... }, (err) => { ... });
   axios.getWithParams("...", params, onSuccess, onError);
   axios.post("order", payload, onSuccess, onError);
   ```
   Helper ini otomatis menempelkan header Authorization & menangani refresh 401.
   **Jangan** pakai `Axios` langsung untuk endpoint internal (kecuali Login yang
   memang memakai Axios mentah, dan refresh-token internal).
4. **Logika kompleks ditaruh di composables** `pages/<page>/composables/*.ts`,
   nama file `use<Feature>.ts`, fungsi `use<Feature>()`. Ini pola yang dipakai
   untuk memisahkan draft (local state) vs live (sync API). **Jangan menaruh
   logika besar langsung di `index.vue`.**
5. **Draft vs Live FnB** — pahami bedanya sebelum menyentuh FnB:
   - `new-rental/composables/useFnbDraft.ts` → state lokal murni, **tidak** hit API,
     dipakai sebelum `order_id` ada.
   - `rental-detail/composables/useFnbOrder.ts` → langsung panggil API
     (`order/fnb-item/...`), butuh `order_id`.
6. **Umpan balik ke user**: toast `vue3-hot-toast` untuk notifikasi ringan,
   `useAlertDialog().alert/confirm` + pasang `<AlertDialog />` di halaman untuk
   konfirmasi/dialog. Jangan pakai `window.confirm`.
7. **Uang**: gunakan `formatRupiah` dari `helper/currency.ts` (jangan bikin
   formatter baru, walau ada beberapa duplikat `Intl.NumberFormat` inline —
   ikuti yang terdekat, idealnya konsolidasi ke helper).
8. **Tanggal/waktu**: `dayjs` (+ plugin `utc`, `duration`, locale `id`).
9. **Ikon**: `@lucide/vue` (contoh `import { PlayCircle } from "@lucide/vue"`).
10. **Chart**: `chart.js/auto`, selalu `destroy()` instance lama sebelum render
    ulang, dan render setelah `await nextTick()`.
11. **Routing**: daftarkan route + `name` di `router/index.ts`. Nama yang ada:
    `login`, `dashboard`, `rent`, `new-rent`, `rent-detail`, `unit`,
    `transaction-report`, `financial-statements`, `fnb`, `NotFound`.
12. **Styling**: Tailwind utility langsung di template. Palet utama: `indigo` /
    `violet` untuk aksi utama, `emerald` (cash/available), `amber` (warning/
    finished), `rose`/`red` (danger), `slate`/`gray` untuk netral. Kelas
    `font-display` dipakai untuk heading. Kartu: `rounded-2xl border border-gray-200
    bg-white shadow-sm`. Tombol: `h-10 rounded-xl`. Selalu tambahkan
    `cursor-pointer` pada elemen klik.
13. **State global ringan** cukup `ref` singleton di module composable
    (lihat `useRentedHistorySidebar.ts`, `useAlertDialog.ts`) — tidak pakai Pinia.
14. **TypeScript cukup ketat**: FE punya `noUnusedLocals` & `noUnusedParameters`.
    Hindari variabel tak terpakai. `vue-tsc -b` akan gagal kalau ada yang bocor.

---

## 12. Jebakan & Gotcha Penting

- **Auth token & prefix `Bearer `**: FE menyimpan token **sudah** berisi prefix
  `"Bearer <jwt>"`, dan interceptor menetapkan `Authorization = token` langsung.
  Middleware backend mencari `Bearer `. Jangan mengubah salah satu sisi tanpa
  menyesuaikan yang lain.
- **`api/src/pages` tak ada** — jangan bingung, source FE ada di `client/src`.
- **Import `.js`** di backend sering terlupakan saat menyalin pola; build `tsc`
  akan menolak.
- **`createOrder` butuh `end_time`** yang benar. Saat ini `usePlaySessionDraft.ts`
  **me-hardcode `endTime = dayjs().add(1, "minute")`** (ada baris alternatif
  `playDuration` yang dikomentari) — ini shortcut dev. Saat memperbaiki durasi,
  hapus hardcode ini. Timer unit bergantung pada `end_time` yang valid.
- **Bebas unit hanya jika `end_time` sudah lewat.** Baik cash maupun webhook QRIS
  hanya meng-`available`-kan unit dengan `end_time < now`. Jadi menyelesaikan
  pembayaran lebih awal tidak otomatis mengosongkan unit — perilaku ini disengaja.
- **`generate-qris` berulang** akan membuat baris `Transaction` baru tiap klik.
  Saat menyempurnakan alur, pertimbangkan reuse transaksi pending yang belum
  expired.
- **SSE `sseClients` disimpan in-memory** (`Map<orderId, Set<Response>>`), tidak
  akan bekerja lintas proses/instance. Heartbeat 30 detik.
- **Timezone**: laporan menggunakan `CONVERT_TZ(..., '+00:00', '+07:00')` (WIB).
  `unit-history` memakai rentang hari `+07:00`. Pertahankan konsistensi WIB.
- **`prisma.$queryRawUnsafe`** dipakai di report — parameter sudah dipisah
  (`...queryParams`), jangan menyisipkan input user ke string SQL.
- **`noUncheckedIndexedAccess`** aktif di backend: pengaksesan array
  (`arr[0]`) bertipe `T | undefined`. Gunakan `!` atau guard seperti kode yang ada.
- **`&&` respons register** — `auth.register` mengirim 400 tapi tidak `return`,
  sehingga bisa lanjut membuat user. Perbaiki bila menyentuh file itu.
- **CORS hardcoded** ke `localhost:5173`; ubah bila port/origin berubah.
- **README sebagian outdated**: `register` ditulis `GET`, padahal route-nya
  `POST /register`; port docker `5000`, dev `8080`.

---

## 13. Checklist Menambah Fitur

**Menambah endpoint baru (backend):**

1. Tambah/ubah model di `api/prisma/schema.prisma` bila perlu, lalu
   `npx prisma migrate dev` & `npx prisma generate`.
2. Buat schema Zod di `src/schemas/` (bila ada input).
3. Buat handler di controller terkait; ikuti pola `endpoint` & format respons.
4. Daftarkan route di `src/routes/...` (pasang `validate(...)` & `authMiddleware`
   bila perlu).
5. Jalankan `npm run build` di `api/` untuk typecheck.

**Menambah halaman/komponen (frontend):**

1. Tambah route + `name` di `client/src/router/index.ts`.
2. Buat page dengan `<BaseLayout>`; taruh logika di
   `pages/<page>/composables/`.
3. Panggil API lewat `helper/axios.ts` gaya callback.
4. Gunakan `formatRupiah`, `dayjs`, toast, dan `useAlertDialog` sesuai konvensi.
5. Jalankan `npm run build` di `client/` (`vue-tsc -b` + Vite) untuk typecheck.

**Sebelum selesai:**

- Pastikan **tidak ada `.env`/secret** yang ikut berubah.
- Pastikan tidak meninggalkan `console.log` debug baru.
- Jika mengubah kontrak API, cek ulang semua pemanggilnya di `client/src`.

---

## 14. Aturan Keamanan

- Jangan pernah menulis kredensial DB, `JWT_SECRET_KEY`, atau key Midtrans ke
  file yang ter-commit atau ke output chat.
- QRIS masih **sandbox** (`isProduction: false`). Jangan menyalakan produksi
  tanpa instruksi eksplisit.
- Verifikasi signature webhook Midtrans sebelum dipakai di produksi
  (`midtrans-client` `notification()` sudah memvalidasi order_id → status).
- Jangan mengubah CORS, prefix token, atau TTL jwt secara diam-diam.
