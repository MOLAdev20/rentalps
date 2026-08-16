import type { Request, Response } from "express";
import { prisma } from "../../lib/prisma.js";

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
