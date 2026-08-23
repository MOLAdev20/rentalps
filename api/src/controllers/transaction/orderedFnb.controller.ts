import { type Request, type Response } from "express";
import { prisma } from "../../lib/prisma.js";

const endpoint = {
  addToTransaction: async (req: Request, res: Response) => {
    const orderId = Number(req.body.order_id);
    const fnbId = req.body.fnb_id;

    try {
      const selectedFnb = await prisma.fnBItem.findUniqueOrThrow({
        where: { id: fnbId },
      });
      const existingFnbOrder = await prisma.fnBItemOrder.findFirst({
        where: {
          order_id: orderId,
          fnb_item_id: fnbId,
        },
      });

      let newFnbTransaction: any;
      if (!existingFnbOrder) {
        newFnbTransaction = await prisma.fnBItemOrder.create({
          data: {
            order_id: orderId,
            fnb_item_id: fnbId,
            quantity: 1,
            sub_total: selectedFnb.price,
          },
        });
      } else {
        const oldQuantity = existingFnbOrder.quantity;
        newFnbTransaction = await prisma.fnBItemOrder.update({
          where: {
            id: existingFnbOrder.id,
          },
          data: {
            quantity: oldQuantity + 1,
            sub_total: selectedFnb.price * (oldQuantity + 1),
          },
        });
      }
      res.json({
        newFnbTransaction,
      });
    } catch (err) {
      res.status(500).json({
        message: "error-update-data",
      });
    }
  },

  changeQty: async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const changeType = req.params.changeType;

    try {
      const newFnbOrder = await prisma.fnBItemOrder.update({
        where: { id },
        data: {
          quantity: {
            increment: changeType == "increase" ? 1 : -1,
          },
        },
      });
      res.json({
        newFnbOrder,
      });
    } catch (err) {
      res.status(500).json({
        message: "error-update-data",
      });
    }
  },

  removeFromTransaction: async (req: Request, res: Response) => {
    const fnbItemOrderId = Number(req.params.id);

    try {
      await prisma.fnBItemOrder.delete({
        where: { id: fnbItemOrderId },
      });
      res.json({
        message: "fnb-transaction-deleted",
      });
    } catch (err) {
      res.status(500).json({
        message: "error-delete-data",
      });
    }
  },
};

export default endpoint;
