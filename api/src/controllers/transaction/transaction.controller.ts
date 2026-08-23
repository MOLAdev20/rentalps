import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

const endpoint = {
  getAll: async (_: Request, res: Response) => {
    try {
      const transactions = await prisma.transaction.findMany({
        // Filter status/date bisa dimasukin di sini nantinya
        select: {
          id: true,
          customer_name: true,
          subtotal: true,
          total: true,
          created_at: true,
          transactionItemUnits: {
            select: {
              id: true,
              play_time: true,
              sub_total: true,
              start_time: true,
              end_time: true,
              unit_item: {
                select: {
                  id: true,
                  title: true,
                  rent_price: true,
                },
              },
            },
          },
          transactionItemFnbs: {
            select: {
              id: true,
              quantity: true,
              sub_total: true,
              fnb_item: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      // Mapping/Transformasi ringan biar nama key relasinya lebih bersih di JSON
      const responseData = transactions.map((trx) => ({
        id: trx.id,
        transaction_no: `TRX-${new Date(trx.created_at).toISOString().slice(0, 10).replace(/-/g, "")}-${String(trx.id).padStart(3, "0")}`,
        customer_name: trx.customer_name,
        payment_method: "CASH",
        status: "COMPLETED",
        subtotal: trx.subtotal,
        total: trx.total,
        created_at: trx.created_at,

        units: trx.transactionItemUnits.map((item) => ({
          id: item.id,
          unit_id: item.unit_item.id,
          title: item.unit_item.title,
          play_time: item.play_time,
          rent_price: item.unit_item.rent_price,
          sub_total: item.sub_total,
          start_time: item.start_time,
          end_time: item.end_time,
        })),

        fnbs: trx.transactionItemFnbs.map((item) => ({
          id: item.id,
          fnb_id: item.fnb_item.id,
          title: item.fnb_item.title,
          price: item.fnb_item.price,
          quantity: item.quantity,
          sub_total: item.sub_total,
        })),
      }));

      res.json(responseData);
    } catch (err) {
      res.status(500).json({
        err,
      });
    }
  },

  getDetail: async (req: Request, res: Response) => {
    try {
      let id: number = Number(req.params.id);

      const transactionDetail = await prisma.transaction.findFirstOrThrow({
        where: {
          transactionItemUnits: {
            some: {
              unit_item_id: id,
              unit_item: {
                status: "rented",
              },
            },
          },
        },
        include: {
          transactionItemUnits: {
            select: {
              play_time: true,
              sub_total: true,
              start_time: true,
              end_time: true,
              unit_item: {
                select: {
                  title: true,
                  rent_price: true,
                  status: true,
                },
              },
            },
          },
          transactionItemFnbs: {
            select: {
              id: true,
              quantity: true,
              sub_total: true,
              fnb_item: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  price: true,
                },
              },
            },
          },
          paymentLink: {
            select: {
              url: true,
              expired_at: true,
              status: true,
            },
            take: 1,
            orderBy: {
              id: "desc",
            },
          },
        },
      });

      res.json(transactionDetail);
    } catch (err) {
      res.status(500).json({
        message: "internal-server-error",
        detail: err,
      });
    }
  },
};

export default endpoint;
