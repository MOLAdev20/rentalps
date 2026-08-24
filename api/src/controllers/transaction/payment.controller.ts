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

  return `ORD-${dateStr}-${order_no}`; // Hasil: ORD-23082026-1
};

const endpoint = {
  proceedPayment: async (req: Request, res: Response) => {
    try {
      const orderId = Number(req.body.order_id);
      const paymentMethod = req.body.payment_method;

      const orders = await prisma.orders.update({
        where: {
          id: orderId,
        },
        data: {
          status: "complete",
          rentedUnitOrder: {
            updateMany: {
              where: {
                status: "playing",
              },
              data: {
                status: "finished",
              },
            },
          },
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

      // 2. Request Snap transaction for QRIS only
      const snapMinutesDuration = 15;
      const parameter = {
        transaction_details: {
          gross_amount: order.total,
          order_id: await generateTransactionNo(),
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
          transaction_no: await generateTransactionNo(),
          amount: order.total,
          payment_method: "qris",
          snap_url: snapResponse.redirect_url,
          snap_expiry: snapExpiredAt,
        },
      });

      res.json({
        message: "qris-generated",
        data: transaction,
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

      res.json(notification);
      console.log(notification);
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
