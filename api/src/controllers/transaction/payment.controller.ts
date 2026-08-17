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

const endpoint = {
  proceedPayment: async (req: Request, res: Response) => {
    try {
      const transactionId = Number(req.body.transaction_id);
      const paymentMethod = req.body.payment_method;

      await prisma.transaction.update({
        where: {
          id: transactionId,
        },
        data: {
          payment_method: paymentMethod,
          status: "complete",
        },
      });

      await prisma.unit_Item.updateMany({
        where: {
          transactionItemUnits: {
            some: {
              transaction_id: transactionId,
            },
          },
        },
        data: {
          status: "available",
        },
      });

      res.json({
        message: "payment-success",
      });
    } catch (err) {
      res.status(500).json({
        message: "payment-error",
      });
    }
  },

  generateQris: async (req: Request, res: Response) => {
    try {
      const transactionId = Number(req.body.transaction_id);

      // 1. Get Transaction Detail
      const transaction = await prisma.transaction.findUniqueOrThrow({
        where: { id: transactionId },
      });

      // 2. Request Snap transaction for QRIS only
      const snapMinutesDuration = 15;
      const parameter = {
        transaction_details: {
          gross_amount: transaction.total,
          order_id: `TRX-${transaction.id}-${Date.now()}`,
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
      const paymentLink = await prisma.payment_Link.create({
        data: {
          transaction_id: transaction.id,
          url: snapResponse.redirect_url,
          expired_at: snapExpiredAt,
        },
      });

      await prisma.transaction.update({
        where: {
          id: transaction.id,
        },
        data: {
          payment_method: "qris",
        },
      });

      res.json({
        message: "qris-generated",
        data: paymentLink,
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
};

export default endpoint;
