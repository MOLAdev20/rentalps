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

      await prisma.orders.create({
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

      let orderDetail = await prisma.orders.findFirst({
        where: {
          rentedUnitOrder: {
            some: {
              unit_item_id: id,
              status: "playing",
              unitItem: {
                status: "rented",
              },
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
              status: true,
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

      if (!orderDetail) {
        let orderDetail = await prisma.orders.findFirst({
          where: {
            status: "pending",
            rentedUnitOrder: {
              some: {
                unit_item_id: id,
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
                status: true,
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
      }

      res.json(orderDetail);
    } catch (err) {
      res.status(500).json({
        message: "internal-server-error",
        detail: err,
      });
    }
  },
};

export default endpoint;
