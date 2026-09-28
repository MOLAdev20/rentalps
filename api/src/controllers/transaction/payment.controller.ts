import { type Request, type Response } from "express";
import { prisma } from "../../lib/prisma.js";
import midtransClient from "midtrans-client";
import env from "../../config/env.js";

const sseClients = new Map<number, Set<Response>>();

const removeSseClient = (orderId: number, res: Response) => {
  const clients = sseClients.get(orderId);
  if (!clients) return;

  clients.delete(res);
  if (clients.size === 0) {
    sseClients.delete(orderId);
  }
};

const broadcastPaymentComplete = (orderId: number) => {
  const clients = sseClients.get(orderId);
  if (!clients) return;

  const message = `data: ${JSON.stringify({ status: "complete" })}\n\n`;
  for (const client of clients) {
    client.write(message);
    client.end();
    removeSseClient(orderId, client);
  }
};

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: env.MIDTRANS.SERVER_KEY,
  clientKey: env.MIDTRANS.CLIENT_KEY,
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
  sse: (req: Request, res: Response) => {
    const orderId = Number(req.params.orderId);

    if (!Number.isInteger(orderId) || orderId <= 0) {
      return res.status(400).json({ message: "invalid-order-id" });
    }

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.flushHeaders();
    res.write(`retry: 5000\n\n`);

    const clients = sseClients.get(orderId) ?? new Set<Response>();
    clients.add(res);
    sseClients.set(orderId, clients);

    const heartbeat = setInterval(() => {
      if (!res.writableEnded) {
        res.write(": heartbeat\n\n");
      }
    }, 30_000);

    const cleanup = () => {
      clearInterval(heartbeat);
      removeSseClient(orderId, res);
    };

    req.on("close", cleanup);
    res.on("error", cleanup);
  },

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
      const notification = await (snap as any).transaction.notification(
        req.body,
      );

      const transactionStatus: string = notification.transaction_status;
      const transactionNumber: string = notification.order_id;

      if (
        transactionStatus === "settlement" ||
        transactionStatus === "complete"
      ) {
        // 1. Cari data transaksi + dapet ID dari relasi-relasinya
        const transactionData = await prisma.transaction.findFirst({
          where: { transaction_no: transactionNumber },
          select: {
            id: true,
            order_id: true,
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

        broadcastPaymentComplete(transactionData.order_id);
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
