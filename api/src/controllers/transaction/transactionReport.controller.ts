import { type Request, type Response } from "express";
import { prisma } from "../../lib/prisma.js";

const endpoint = {
  getFinancialStatements: async (req: Request, res: Response) => {
    try {
      const start_date = req.query.start_date as string | undefined; // 2026-08-01
      const end_date = req.query.end_date as string | undefined; // 2026-08-31

      // 1. Prepare filter & parameter
      let dateFilter = "";
      const queryParams: any[] = [];

      if (start_date && end_date) {
        dateFilter =
          "AND DATE(CONVERT_TZ(o.created_at, '+00:00', '+07:00')) BETWEEN ? AND ?";
        queryParams.push(start_date, end_date);
      } else if (start_date) {
        dateFilter =
          "AND DATE(CONVERT_TZ(o.created_at, '+00:00', '+07:00')) >= ?";
        queryParams.push(start_date);
      } else if (end_date) {
        dateFilter =
          "AND DATE(CONVERT_TZ(o.created_at, '+00:00', '+07:00')) <= ?";
        queryParams.push(end_date);
      }

      // 2. Query Utama
      const rawQuery = `
    SELECT 
      DATE(CONVERT_TZ(o.created_at, '+00:00', '+07:00')) AS date,
      COUNT(DISTINCT o.id) AS trx,
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
    FROM orders o
    LEFT JOIN order_transaction t ON t.order_id = o.id
    LEFT JOIN (
      SELECT order_id, SUM(sub_total) AS total_sewa_ps
      FROM rented_unit_order
      GROUP BY order_id
    ) unit ON unit.order_id = o.id
    LEFT JOIN (
      SELECT order_id, SUM(sub_total) AS total_fnb
      FROM fnb_item_order
      GROUP BY order_id
    ) fnb ON fnb.order_id = o.id
    WHERE o.status = 'complete' ${dateFilter}
    GROUP BY DATE(CONVERT_TZ(o.created_at, '+00:00', '+07:00'))
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
    } catch (err) {
      res.status(500).json({
        err,
      });
    }
  },
};

export default endpoint;
