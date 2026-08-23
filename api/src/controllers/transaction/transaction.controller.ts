import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

const endpoint = {
  getAll: async (_: Request, res: Response) => {
    try {
      const orders = await prisma.orders.findMany({
        // Filter status/date bisa dimasukin di sini nantinya
        select: {
          id: true,
          customer_name: true,
          subtotal: true,
          total: true,
          created_at: true,
          RentedUnitOrder: {
            select: {
              id: true,
              play_time: true,
              sub_total: true,
              start_time: true,
              end_time: true,
              unitItem: {
                select: {
                  id: true,
                  title: true,
                  rent_price: true,
                },
              },
            },
          },
          FnbItemOrder: {
            select: {
              id: true,
              quantity: true,
              sub_total: true,
              fnbItem: {
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
      const responseData = orders.map((trx) => ({
        id: trx.id,
        transaction_no: `TRX-${new Date(trx.created_at).toISOString().slice(0, 10).replace(/-/g, "")}-${String(trx.id).padStart(3, "0")}`,
        customer_name: trx.customer_name,
        payment_method: "CASH",
        status: "COMPLETED",
        subtotal: trx.subtotal,
        total: trx.total,
        created_at: trx.created_at,

        units: trx.RentedUnitOrder.map((item) => ({
          id: item.id,
          unit_id: item.unitItem.id,
          title: item.unitItem.title,
          play_time: item.play_time,
          rent_price: item.unitItem.rent_price,
          sub_total: item.sub_total,
          start_time: item.start_time,
          end_time: item.end_time,
        })),

        fnbs: trx.FnbItemOrder.map((item) => ({
          id: item.id,
          fnb_id: item.fnbItem.id,
          title: item.fnbItem.title,
          price: item.fnbItem.price,
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

      const ordeDetail = await prisma.orders.findFirstOrThrow({
        where: {
          RentedUnitOrder: {
            some: {
              unit_item_id: id,
              unitItem: {
                status: "rented",
              },
            },
          },
        },
        include: {
          RentedUnitOrder: {
            select: {
              play_time: true,
              sub_total: true,
              start_time: true,
              end_time: true,
              unitItem: {
                select: {
                  title: true,
                  rent_price: true,
                  status: true,
                },
              },
            },
          },
          FnbItemOrder: {
            select: {
              id: true,
              quantity: true,
              sub_total: true,
              fnbItem: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  price: true,
                },
              },
            },
          },
          transaction: {
            select: {
              snap_url: true,
              snap_expiry: true,
              status: true,
            },
            take: 1,
            orderBy: {
              id: "desc",
            },
          },
        },
      });

      res.json(ordeDetail);
    } catch (err) {
      res.status(500).json({
        message: "internal-server-error",
        detail: err,
      });
    }
  },
};

export default endpoint;
