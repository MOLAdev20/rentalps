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

const generateOrderNo = async (): Promise<string> => {
  const now = new Date();

  // Format Tanggal (DDMMYYYY)
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Month mulai dari 0
  const year = now.getFullYear();
  const dateStr = `${day}${month}${year}`;

  // urutan terbaru
  const latestOrder: number = await prisma.orders.count({
    where: {
      order_no: {
        startsWith: `ORD-${dateStr}-`,
      },
    },
  });

  const order_no = latestOrder + 1;

  return `ORD-${dateStr}-${order_no}`; // Hasil: ORD-23082026-1
};

const endpoint = {
  createOrder: async (req: Request, res: Response) => {
    try {
      const selectedUnit: SelectedUnitItem[] = req.body.transaction_rental;
      const selectedFnb: SelectedUnitFnb[] = req.body.transaction_fnb;
      let subTotal = 0;

      // Dapatkan seluruh ID Unit PS yang direquest
      const selectedUnitId = selectedUnit.map(
        (item: SelectedUnitItem) => item.unit_item,
      );
      // Dapatkan unit di database berdasarkan ID
      const availableUnit = await prisma.unitItem.findMany({
        where: { id: { in: selectedUnitId }, status: "available" },
      });

      // Cek apakah hasil data di database jumlahnya sama dengan id unit yang direquest?
      if (selectedUnit.length != availableUnit.length) {
        // Jika tidak sesuai, proses selanjutnya tidak akan dijalankan
        return res.status(404).json({ message: "not-found" });
      }

      // Mapping seluruh unit ID untuk selanjutnya disimpan ke database
      const transactionUnit = selectedUnit.map((item) => {
        const unitInfo = availableUnit.find(
          (unit) => unit.id == item.unit_item,
        )!;

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
      const availableFnb = await prisma.fnBItem.findMany({
        where: { id: { in: selectedFnbId } },
      });

      if (selectedFnb.length != availableFnb.length) {
        return res.status(404).json({
          message: "you-fnb-item-not-found",
        });
      }

      const transactionFnb = selectedFnb.map((item) => {
        const fnbItemInfo = availableFnb.find(
          (fnb) => fnb.id == item.fnb_item,
        )!;

        const itemPrice = fnbItemInfo.price * item.quantity;
        subTotal += itemPrice;

        return {
          fnb_item_id: fnbItemInfo.id,
          quantity: item.quantity,
          sub_total: itemPrice,
        };
      });

      const newOrder = await prisma.orders.create({
        data: {
          order_no: await generateOrderNo(),
          customer_name: req.body.customer_name,
          subtotal: subTotal,
          total: subTotal,

          rentedUnitOrder: {
            create: transactionUnit,
          },

          fnbItemOrder: {
            create: transactionFnb,
          },
        },
      });

      await prisma.unitItem.updateMany({
        where: { id: { in: selectedUnitId } },
        data: { status: "rented" },
      });

      res.json({
        message: "transaction-created",
        data: {
          order_id: newOrder.id,
          order_no: newOrder.order_no,
        },
      });
    } catch (err: any) {
      res.status(500).json({
        message: "internal-server-error",
        err: err,
      });
    }
  },

  getByRentedUnit: async (req: Request, res: Response) => {
    try {
      let id: number = Number(req.params.unit_id);
      let orderId: number = Number(req.query.order);

      if (!orderId || isNaN(orderId)) {
        return res.status(400).json({
          message: "bad-request",
          detail: "order id is required or must a number",
        });
      }

      let orderDetail = await prisma.orders.findFirst({
        where: {
          id: orderId,
          rentedUnitOrder: {
            some: {
              unit_item_id: id,
              unitItem: { id },
            },
          },
        },
        orderBy: {
          id: "desc",
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
              payment_method: true,
              snap_url: true,
              snap_expiry: true,
              status: true,
            },
            take: 1,
            orderBy: {
              id: "desc",
            },
            where: {
              status: "pending",
            },
          },
        },
      });

      return res.json(orderDetail);
    } catch (err: any) {
      res.status(500).json({
        message: "internal-server-error",
        detail: err.message,
      });
    }
  },

  reducePlayTime: async (req: Request, res: Response) => {
    try {
      const orderId = Number(req.body.order_id);
      const unitItemId = Number(req.body.unit_item_id);

      if (
        !Number.isInteger(orderId) ||
        orderId <= 0 ||
        !Number.isInteger(unitItemId) ||
        unitItemId <= 0
      ) {
        return res.status(400).json({
          message: "bad-request",
          detail: "order_id and unit_item_id are required numbers",
        });
      }

      // Cari baris sewa unit yang mau dikurangi durasinya
      const rentedUnitOrder = await prisma.rentedUnitOrder.findFirst({
        where: { order_id: orderId, unit_item_id: unitItemId },
        include: { unitItem: true, orders: true },
      });

      if (!rentedUnitOrder) {
        return res.status(404).json({
          message: "rented-unit-order-not-found",
        });
      }

      // Durasi hanya bisa dikurangi selama order belum dibayar
      if (rentedUnitOrder.orders.status !== "pending") {
        return res.status(409).json({
          message: "order-already-completed",
        });
      }

      const REDUCED_PLAY_TIME = 1; // dalam jam
      const REDUCED_DURATION_MS = REDUCED_PLAY_TIME * 60 * 60 * 1000;

      // Minimal durasi sewa 1 jam, gak boleh dikurangi lagi
      if (rentedUnitOrder.play_time <= REDUCED_PLAY_TIME) {
        return res.status(400).json({
          message: "minimum-play-time-reached",
        });
      }

      const reducedPrice =
        rentedUnitOrder.unitItem.rent_price * REDUCED_PLAY_TIME;

      // Perpendek end_time 1 jam, tapi jangan sampai mendahului start_time
      const earliestEndTime = new Date(rentedUnitOrder.start_time).getTime();
      const newEndTime = new Date(
        Math.max(
          new Date(rentedUnitOrder.end_time).getTime() - REDUCED_DURATION_MS,
          earliestEndTime,
        ),
      );

      const [updatedRentedUnitOrder] = await prisma.$transaction([
        prisma.rentedUnitOrder.update({
          where: { id: rentedUnitOrder.id },
          data: {
            play_time: { decrement: REDUCED_PLAY_TIME },
            end_time: newEndTime,
            sub_total: { decrement: reducedPrice },
          },
        }),
        prisma.orders.update({
          where: { id: orderId },
          data: {
            subtotal: { decrement: reducedPrice },
            total: { decrement: reducedPrice },
          },
        }),
      ]);

      res.json({
        message: "play-time-reduced",
        data: updatedRentedUnitOrder,
      });
    } catch (err: any) {
      res.status(500).json({
        message: "internal-server-error",
        detail: err.message,
      });
    }
  },

  cancelOrder: async (req: Request, res: Response) => {
    try {
      const orderId = Number(req.body.order_id);

      if (!Number.isInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
          message: "bad-request",
          detail: "order_id is required and must be a positive integer",
        });
      }

      // Cari order beserta unit-unit yang disewa di dalamnya
      const order = await prisma.orders.findFirst({
        where: { id: orderId },
        include: {
          rentedUnitOrder: {
            select: { unit_item_id: true },
          },
        },
      });

      if (!order) {
        return res.status(404).json({ message: "not-found" });
      }

      // Hanya order yang masih pending yang bisa dibatalkan
      if (order.status !== "pending") {
        return res.status(409).json({ message: "order-already-completed" });
      }

      const unitItemIds = order.rentedUnitOrder.map((r) => r.unit_item_id);

      // Batalkan order dan kembalikan status unit ke available secara atomik
      await prisma.$transaction([
        prisma.orders.update({
          where: { id: orderId },
          data: { status: "cancel" },
        }),
        prisma.unitItem.updateMany({
          where: { id: { in: unitItemIds } },
          data: { status: "available" },
        }),
      ]);

      return res.json({ message: "order-cancelled" });
    } catch (err: any) {
      res.status(500).json({
        message: "internal-server-error",
        detail: err.message,
      });
    }
  },

  addPlayTime: async (req: Request, res: Response) => {
    try {
      const orderId = Number(req.body.order_id);
      const unitItemId = Number(req.body.unit_item_id);

      if (
        !Number.isInteger(orderId) ||
        orderId <= 0 ||
        !Number.isInteger(unitItemId) ||
        unitItemId <= 0
      ) {
        return res.status(400).json({
          message: "bad-request",
          detail: "order_id and unit_item_id are required numbers",
        });
      }

      // Cari baris sewa unit yang mau ditambah durasinya
      const rentedUnitOrder = await prisma.rentedUnitOrder.findFirst({
        where: { order_id: orderId, unit_item_id: unitItemId },
        include: { unitItem: true, orders: true },
      });

      if (!rentedUnitOrder) {
        return res.status(404).json({
          message: "rented-unit-order-not-found",
        });
      }

      // Durasi hanya bisa ditambah selama order belum dibayar
      if (rentedUnitOrder.orders.status !== "pending") {
        return res.status(409).json({
          message: "order-already-completed",
        });
      }

      const ADDED_PLAY_TIME = 1; // dalam jam
      const ADDED_DURATION_MS = ADDED_PLAY_TIME * 60 * 60 * 1000;
      const addedPrice = rentedUnitOrder.unitItem.rent_price * ADDED_PLAY_TIME;

      // Perpanjang dari end_time lama. Kalau waktu mainnya sudah lewat,
      // hitung tambahan mulai dari sekarang biar jam barunya tetap valid.
      const baseEndTime = Math.max(
        new Date(rentedUnitOrder.end_time).getTime(),
        Date.now(),
      );
      const newEndTime = new Date(baseEndTime + ADDED_DURATION_MS);

      const [updatedRentedUnitOrder] = await prisma.$transaction([
        prisma.rentedUnitOrder.update({
          where: { id: rentedUnitOrder.id },
          data: {
            play_time: { increment: ADDED_PLAY_TIME },
            end_time: newEndTime,
            sub_total: { increment: addedPrice },
          },
        }),
        prisma.orders.update({
          where: { id: orderId },
          data: {
            subtotal: { increment: addedPrice },
            total: { increment: addedPrice },
          },
        }),
      ]);

      console.log(updatedRentedUnitOrder);

      res.json({
        message: "play-time-added",
        data: updatedRentedUnitOrder,
      });
    } catch (err: any) {
      res.status(500).json({
        message: "internal-server-error",
        detail: err.message,
      });
    }
  },
};

export default endpoint;
