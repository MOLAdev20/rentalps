import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

interface SelectedUnitItem {
  unit_item: number;
  play_time: number;
  start_time: Date;
  end_time: Date;
}

interface SelectedUnitFnb {
  fnb_item: number;
  quantity: number;
}

const endpoint = {
  create: async (req: Request, res: Response) => {
    const selectedUnit: SelectedUnitItem[] = req.body.transaction_rental;
    const selectedFnb: SelectedUnitFnb[] = req.body.transaction_fnb;
    let subTotal = 0;

    // Dapatkan seluruh ID Unit PS yang direquest
    const selectedUnitId = selectedUnit.map(
      (item: SelectedUnitItem) => item.unit_item,
    );
    // Dapatkan unit di database berdasarkan ID
    const availableUnit = await prisma.unit_Item.findMany({
      where: { id: { in: selectedUnitId }, status: "available" },
    });

    // Cek apakah hasil data di database jumlahnya sama dengan id unit yang direquest?
    if (selectedUnit.length != availableUnit.length) {
      // Jika tidak sesuai, proses selanjutnya tidak akan dijalankan
      return res.status(404).json({ message: "not-found" });
    }

    // Mapping seluruh unit ID untuk selanjutnya disimpan ke database
    const transactionUnit = selectedUnit.map((item) => {
      const unitInfo = availableUnit.find((unit) => unit.id == item.unit_item)!;

      const itemPrice = unitInfo.rent_price * item.play_time;
      subTotal += itemPrice;

      return {
        unit_item_id: unitInfo.id,
        play_time: item.play_time,
        sub_total: itemPrice,
        start_time: new Date(item.start_time),
        end_time: new Date(item.end_time),
      };
    });

    // ========================================
    const selectedFnbId = selectedFnb.map(
      (item: SelectedUnitFnb) => item.fnb_item,
    );
    const availableFnb = await prisma.fnb_Item.findMany({
      where: { id: { in: selectedFnbId } },
    });

    if (selectedFnb.length != availableFnb.length) {
      return res.status(404).json({
        message: "you-fnb-item-not-found",
      });
    }

    const transactionFnb = selectedFnb.map((item) => {
      const fnbItemInfo = availableFnb.find((fnb) => fnb.id == item.fnb_item)!;

      const itemPrice = fnbItemInfo.price * item.quantity;
      subTotal += itemPrice;

      return {
        fnb_item_id: fnbItemInfo.id,
        quantity: item.quantity,
        sub_total: itemPrice,
      };
    });

    await prisma.transaction.create({
      data: {
        customer_name: req.body.customer_name,
        subtotal: subTotal,
        total: subTotal,

        transactionItemUnits: {
          create: transactionUnit,
        },

        transactionItemFnbs: {
          create: transactionFnb,
        },
      },
    });

    await prisma.unit_Item.updateMany({
      where: { id: { in: selectedUnitId } },
      data: { status: "rented" },
    });

    res.json({
      message: "transaction-created",
    });
  },

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

  getFinancialStatements: async (req: Request, res: Response) => {
    const start_date = req.query.start_date as string | undefined;
    const end_date = req.query.end_date as string | undefined;

    // 1. Prepare filter & parameter
    let dateFilter = "";
    const queryParams: any[] = [];

    if (start_date && end_date) {
      dateFilter = "WHERE DATE(t.created_at) BETWEEN ? AND ?";
      queryParams.push(start_date, end_date);
    } else if (start_date) {
      dateFilter = "WHERE DATE(t.created_at) >= ?";
      queryParams.push(start_date);
    } else if (end_date) {
      dateFilter = "WHERE DATE(t.created_at) <= ?";
      queryParams.push(end_date);
    }

    // 2. Query Utama
    const rawQuery = `
    SELECT 
      DATE(t.created_at) AS date,
      COUNT(DISTINCT t.id) AS trx,
      COALESCE(SUM(unit.total_sewa_ps), 0) AS rental,
      COALESCE(SUM(fnb.total_fnb), 0) AS fnb,
      COALESCE(
        SUM(
          CASE 
            WHEN LOWER(t.payment_method) = 'qris' 
            THEN (COALESCE(unit.total_sewa_ps, 0) + COALESCE(fnb.total_fnb, 0))
            ELSE 0 
          END
        ), 0
      ) AS qris,
      COALESCE(
        SUM(
          CASE 
            WHEN LOWER(t.payment_method) = 'cash' 
            THEN (COALESCE(unit.total_sewa_ps, 0) + COALESCE(fnb.total_fnb, 0))
            ELSE 0 
          END
        ), 0
      ) AS cash,
      (COALESCE(SUM(unit.total_sewa_ps), 0) + COALESCE(SUM(fnb.total_fnb), 0)) AS total
    FROM transaction t
    LEFT JOIN (
      SELECT transaction_id, SUM(sub_total) AS total_sewa_ps
      FROM transaction_item_unit
      GROUP BY transaction_id
    ) unit ON unit.transaction_id = t.id
    LEFT JOIN (
      SELECT transaction_id, SUM(sub_total) AS total_fnb
      FROM transaction_item_fnb
      GROUP BY transaction_id
    ) fnb ON fnb.transaction_id = t.id
    ${dateFilter}
    GROUP BY DATE(t.created_at)
    ORDER BY date DESC
  `;

    // Direct hit ke instance prisma lu
    const transactionRecap = await prisma.$queryRawUnsafe<any[]>(
      rawQuery,
      ...queryParams,
    );

    // 3. Loop buat summary & casting BigInt -> Number
    let summary = {
      totalTransaction: 0,
      rentalTransaction: 0,
      fnbTransaction: 0,
      totalCash: 0,
      totalQris: 0,
      total: 0,
    };

    const safeRecap = transactionRecap.map((item) => {
      const trx = Number(item.trx);
      const rental = Number(item.rental);
      const fnb = Number(item.fnb);
      const qris = Number(item.qris);
      const cash = Number(item.cash);
      const total = Number(item.total);

      summary.totalTransaction += trx;
      summary.rentalTransaction += rental;
      summary.fnbTransaction += fnb;
      summary.totalQris += qris;
      summary.totalCash += cash;
      summary.total += total;

      return {
        date: item.date,
        trx,
        rental,
        fnb,
        cash,
        qris,
        total,
      };
    });

    res.json({
      summary,
      recapitulation: safeRecap,
    });
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
