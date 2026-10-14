import { prisma } from "../src/lib/prisma.js"; // Menggunakan instance prisma kamu
import { faker } from "@faker-js/faker";

const TOTAL_ORDERS_TO_GENERATE = 50;

// Helper function format tanggal YYYYMMDD
function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

async function main() {
  console.log(`🔍 Ambil data UnitItem & FnBItem langsung dari Database...`);

  const unitItems = await prisma.unitItem.findMany();
  const fnbItems = await prisma.fnBItem.findMany();

  if (unitItems.length === 0) {
    console.error(
      "❌ DB Kosong: Harap isi minimal 1 data di tabel `unit_item` terlebih dahulu!",
    );
    process.exit(1);
  }

  console.log(
    `Ditemukan ${unitItems.length} Unit Item dan ${fnbItems.length} FnB Item di Database.`,
  );
  console.log(
    `🚀 Mulai generate ${TOTAL_ORDERS_TO_GENERATE} data order & transaksi...`,
  );

  for (let i = 0; i < TOTAL_ORDERS_TO_GENERATE; i++) {
    const createdAt = faker.date.recent({ days: 30 });
    const dateStr = formatDateToYYYYMMDD(createdAt);

    const orderNo = `ORD-${dateStr}-${faker.string.alphanumeric({ length: 5, casing: "upper" })}`;
    const customerName = faker.person.fullName();

    const orderStatus = faker.helpers.arrayElement([
      "pending",
      "complete",
      "cancel",
    ] as const);

    let transactionStatus: "pending" | "complete" | "cancel" | "expired" =
      "pending";
    if (orderStatus === "complete") transactionStatus = "complete";
    if (orderStatus === "cancel")
      transactionStatus = faker.helpers.arrayElement([
        "cancel",
        "expired",
      ] as const);

    const paymentMethod = faker.helpers.arrayElement([
      "pending_payment",
      "qris",
      "cash",
    ] as const);

    // Rental Unit
    const selectedUnit = faker.helpers.arrayElement(unitItems);
    const playTime = faker.helpers.arrayElement([1, 1.5, 2, 2.5, 3, 4]);
    const unitSubtotal = selectedUnit.rent_price * playTime;

    const startTime = createdAt;
    const endTime = new Date(startTime.getTime() + playTime * 60 * 60 * 1000);

    // FnB Items
    let fnbSubtotal = 0;
    let fnbOrdersData: Array<{
      fnb_item_id: number;
      quantity: number;
      sub_total: number;
    }> = [];

    if (fnbItems.length > 0) {
      const maxFnbPick = Math.min(fnbItems.length, 3);
      const selectedFnBs = faker.helpers.arrayElements(
        fnbItems,
        faker.number.int({ min: 0, max: maxFnbPick }),
      );

      fnbOrdersData = selectedFnBs.map((fnb) => {
        const quantity = faker.number.int({ min: 1, max: 3 });
        const itemSubtotal = fnb.price * quantity;
        fnbSubtotal += itemSubtotal;

        return {
          fnb_item_id: fnb.id,
          quantity: quantity,
          sub_total: itemSubtotal,
        };
      });
    }

    const subtotal = unitSubtotal + fnbSubtotal;
    const total = subtotal;

    // Insert Order & Relations
    await prisma.orders.create({
      data: {
        order_no: orderNo,
        customer_name: customerName,
        subtotal: subtotal,
        total: total,
        status: orderStatus,
        created_at: createdAt,
        updated_at: createdAt,

        rentedUnitOrder: {
          create: [
            {
              unit_item_id: selectedUnit.id,
              play_time: playTime,
              sub_total: unitSubtotal,
              start_time: startTime,
              end_time: endTime,
            },
          ],
        },

        ...(fnbOrdersData.length > 0 && {
          fnbItemOrder: {
            create: fnbOrdersData,
          },
        }),

        transaction: {
          create: [
            {
              transaction_no: `TRX-${dateStr}-${faker.string.alphanumeric({ length: 6, casing: "upper" })}`,
              payment_method: paymentMethod,
              amount: total,
              snap_url: paymentMethod === "qris" ? faker.internet.url() : null,
              snap_expiry:
                paymentMethod === "qris"
                  ? new Date(createdAt.getTime() + 15 * 60 * 1000)
                  : null,
              status: transactionStatus,
              created_at: createdAt,
              updated_at: createdAt,
            },
          ],
        },
      },
    });
  }

  console.log(
    `✅ Sukses generate ${TOTAL_ORDERS_TO_GENERATE} data order & transaksi!`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Error Seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
