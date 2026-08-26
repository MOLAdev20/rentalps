import { type Request, type Response } from "express";
import { prisma } from "../../lib/prisma.js";
import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

interface MidtransSnapResponse {
  token: string;
  redirect_url: string;
}

const generateTransactionNo = async (): Promise<string> => {
  const now = new Date();

  // Format Tanggal (DDMMYYYY)
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Month mulai dari 0
  const year = now.getFullYear();
  const dateStr = `${day}${month}${year}`;

  // urutan terbaru
  const latestOrder: number = await prisma.transaction.count({
    where: {
      created_at: {
        gte: new Date(now.getDate(), now.getMonth(), now.getFullYear()),
      },
    },
  });

  const order_no = latestOrder + 1;

  return `TRX-${dateStr}-${order_no}`; // Hasil: ORD-23082026-1
};

const endpoint = {
  proceedPayment: async (req: Request, res: Response) => {
    try {
      const orderId = Number(req.body.order_id);
      const paymentMethod = req.body.payment_method;
      const turnOffUnit = Number(req.body.turn_off_unit);

      const orders = await prisma.orders.update({
        where: {
          id: orderId,
        },
        data: {
          status: "complete",
        },
      });

      const transaction = await prisma.transaction.create({
        data: {
          order_id: orders.id,
          transaction_no: await generateTransactionNo(),
          payment_method: paymentMethod,
          status: "complete",
          amount: orders.total,
        },
      });

      if (turnOffUnit === 1) {
        await prisma.rentedUnitOrder.updateMany({
          where: { order_id: orders.id },
          data: { status: "finished" },
        });

        await prisma.unitItem.updateMany({
          where: {
            rentedUnitOrder: {
              some: {
                order_id: orders.id,
              },
            },
          },
          data: {
            status: "available",
          },
        });
      }

      res.json({
        message: "payment-success",
        data: transaction,
      });
    } catch (err) {
      res.status(500).json({
        message: "payment-error",
        err: err,
      });
    }
  },

  generateQris: async (req: Request, res: Response) => {
    try {
      const orderId = Number(req.body.order_id);

      // 1. Get Order Detail
      const order = await prisma.orders.findUniqueOrThrow({
        where: { id: orderId },
      });

      const transactionNumber = await generateTransactionNo();
      // 2. Request Snap transaction for QRIS only
      const snapMinutesDuration = 1;
      const parameter = {
        transaction_details: {
          gross_amount: order.total,
          order_id: transactionNumber,
        },
        enabled_payments: ["other_qris"],
        expiry: {
          unit: "minutes",
          duration: snapMinutesDuration,
        },
      };

      const snapResponse: MidtransSnapResponse =
        await snap.createTransaction(parameter);

      const snapExpiredAt = new Date(
        Date.now() + snapMinutesDuration * 60 * 1000,
      );
      const transaction = await prisma.transaction.create({
        data: {
          order_id: order.id,
          transaction_no: transactionNumber,
          amount: order.total,
          payment_method: "qris",
          snap_url: snapResponse.redirect_url,
          snap_expiry: snapExpiredAt,
        },
      });

      res.json({
        message: "qris-generated",
        transaction,
      });
    } catch (err) {
      const midtransError = err as {
        message?: string;
        httpStatusCode?: number;
        ApiResponse?: unknown;
      };

      res.status(Number(midtransError.httpStatusCode) ?? 500).json({
        message: "failed-to-generate-qris",
        detail: midtransError.ApiResponse ?? midtransError.message,
      });
    }
  },

  notification: async (req: Request, res: Response) => {
    try {
      const notification = await snap.transaction.notification(req.body);

      console.log(notification);

      const transactionStatus: string = notification.transaction_status;
      const transactionNumber: string = notification.order_id;

      if (transactionStatus === "settlement") {
        // 1. Cari data transaksi + dapet ID dari relasi-relasinya
        const transactionData = await prisma.transaction.findFirst({
          where: { transaction_no: transactionNumber },
          select: {
            id: true,
            transaction_no: true,
            orders: {
              select: {
                order_no: true,
                rentedUnitOrder: {
                  select: {
                    id: true,
                    unit_item_id: true, // ID unit PS fisiknya
                  },
                },
              },
            },
          },
        });
        // 2. Validasi
        if (!transactionData) {
          throw new Error(`Transaction ${notification.order_id} not found`);
        }
        // Extract list ID unit yang disewa & ID PS fisiknya
        const rentedUnitItemIds = transactionData.orders.rentedUnitOrder.map(
          (item) => item.id,
        );
        const unitItemIds = transactionData.orders.rentedUnitOrder.map(
          (item) => item.unit_item_id,
        );
        // 3. Eksekusi update 4 tabel sekaligus pake $transaction
        await prisma.$transaction([
          // A. Update status transaksi ini
          prisma.transaction.update({
            where: { id: transactionData.id },
            data: { status: "complete" },
          }),
          // B. Update status order induk
          prisma.orders.update({
            where: { order_no: transactionData.orders.order_no },
            data: { status: "complete" },
          }),
          // C. Update status item PS yang dipesan
          prisma.rentedUnitOrder.updateMany({
            where: { id: { in: rentedUnitItemIds } },
            data: { status: "finished" },
          }),
          // D. Update status fisik unit PS-nya biar bisa disewa lagi
          prisma.unitItem.updateMany({
            where: { id: { in: unitItemIds } },
            data: { status: "available" },
          }),
        ]);
      } else if (
        transactionStatus === "expire" ||
        transactionStatus === "cancel"
      ) {
        await prisma.transaction.updateMany({
          where: {
            transaction_no: transactionNumber,
          },
          data: {
            status: transactionStatus == "expire" ? "expired" : "cancel",
          },
        });
      }

      res.json({
        message: "notification-processed",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        message: "error",
        err,
      });
    }
  },
};

export default endpoint;
