import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

const endpoint = {
  getAll: async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const start_date = req.query.start_date as string | undefined; // 2026-08-01
      const end_date = req.query.end_date as string | undefined; // 2026-08-31
      const status = req.query.status as string | undefined; // complete | cancel | pending
      const take = 10;
      const skip = (page - 1) * take;

      // Filter tanggal pakai rentang hari WIB (+07:00), konsisten dengan laporan lain
      const where: any = {};
      if (start_date || end_date) {
        where.created_at = {};
        if (start_date) {
          where.created_at.gte = new Date(`${start_date}T00:00:00+07:00`);
        }
        if (end_date) {
          where.created_at.lte = new Date(`${end_date}T23:59:59.999+07:00`);
        }
      }

      // Filter status buat daftar transaksi (score card). Ringkasan tetap full
      // rentang tanggal supaya semua score card tetap punya angka.
      const dataWhere: any = { ...where };
      if (status && ["pending", "complete", "cancel"].includes(status)) {
        dataWhere.status = status;
      }

      const orders = await prisma.orders.findMany({
        where: dataWhere,
        select: {
          id: true,
          customer_name: true,
          subtotal: true,
          total: true,
          created_at: true,
          status: true,
          rentedUnitOrder: {
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
          fnbItemOrder: {
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
          transaction: {
            select: {
              payment_method: true,
            },
            where: {
              status: "complete",
            },
          },
        },
        take,
        skip,
        orderBy: {
          created_at: "desc",
        },
      });

      // Mapping/Transformasi ringan biar nama key relasinya lebih bersih di JSON
      // Ringkasan per status buat score card (jumlah transaksi + akumulasi uang)
      const statusGroups = await prisma.orders.groupBy({
        by: ["status"],
        where,
        _count: { _all: true },
        _sum: { total: true },
      });

      const summary = {
        all: { count: 0, amount: 0 },
        complete: { count: 0, amount: 0 },
        cancel: { count: 0, amount: 0 },
        pending: { count: 0, amount: 0 },
      };

      statusGroups.forEach((group) => {
        const count = group._count._all;
        const amount = group._sum.total ?? 0;

        summary.all.count += count;
        summary.all.amount += amount;

        if (group.status in summary) {
          const key = group.status as keyof typeof summary;
          summary[key].count += count;
          summary[key].amount += amount;
        }
      });

      // Mapping/Transformasi ringan biar nama key relasinya lebih bersih di JSON
      const responseData = orders.map((trx) => ({
        id: trx.id,
        transaction_no: `TRX-${new Date(trx.created_at).toISOString().slice(0, 10).replace(/-/g, "")}-${String(trx.id).padStart(3, "0")}`,
        customer_name: trx.customer_name,
        payment_method: trx.transaction[0]?.payment_method ?? "",
        status: trx.status,
        subtotal: trx.subtotal,
        total: trx.total,
        created_at: trx.created_at,

        units: trx.rentedUnitOrder.map((item) => ({
          id: item.id,
          unit_id: item.unitItem.id,
          title: item.unitItem.title,
          play_time: item.play_time,
          rent_price: item.unitItem.rent_price,
          sub_total: item.sub_total,
          start_time: item.start_time,
          end_time: item.end_time,
        })),

        fnbs: trx.fnbItemOrder.map((item) => ({
          id: item.id,
          fnb_id: item.fnbItem.id,
          title: item.fnbItem.title,
          price: item.fnbItem.price,
          quantity: item.quantity,
          sub_total: item.sub_total,
        })),
      }));

      res.json({
        data: responseData,
        summary,
      });
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
          rentedUnitOrder: {
            some: {
              unit_item_id: id,
              unitItem: {
                status: "rented",
              },
            },
          },
        },
        include: {
          rentedUnitOrder: {
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
          fnbItemOrder: {
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

  getHistoryByUnit: async (req: Request, res: Response) => {
    try {
      let unitId: number = Number(req.params.id);
      let date: string = req.query.date as string; // Contoh: "2026-10-03"

      // 1. Tentukan Awal Hari WIB (00:00:00 WIB = 17:00:00 UTC tanggal sebelumnya)
      const startOfDay = new Date(`${date}T00:00:00+07:00`);

      // 2. Tentukan Akhir Hari WIB (23:59:59.999 WIB = 16:59:59.999 UTC)
      const endOfDay = new Date(`${date}T23:59:59.999+07:00`);

      const orderHistory = await prisma.orders.findMany({
        where: {
          created_at: {
            gte: startOfDay,
            lte: endOfDay,
          },
          rentedUnitOrder: {
            some: {
              unit_item_id: unitId,
            },
          },
        },
        select: {
          id: true,
          customer_name: true,
          total: true,
          created_at: true,
          status: true,
          rentedUnitOrder: {
            select: {
              id: true,
              play_time: true,
              start_time: true,
              end_time: true,
              unitItem: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      res.json(orderHistory);
    } catch (err) {
      res.status(500).json({
        message: "internal-server-error",
        detail: err,
      });
    }
  },
};

export default endpoint;
