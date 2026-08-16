import { type Request, type Response } from "express";
import { prisma } from "../../lib/prisma.js";

const endpoint = {
  addToTransaction: async (req: Request, res: Response) => {
    const transactionId = Number(req.body.transaction_id);
    const fnbId = req.body.fnb_id;

    try {
      const selectedFnb = await prisma.fnb_Item.findUniqueOrThrow({
        where: { id: fnbId },
      });
      const existingFnbTransaction =
        await prisma.transaction_Item_Fnb.findFirst({
          where: {
            transaction_id: transactionId,
            fnb_item_id: fnbId,
          },
        });

      let newFnbTransaction: any;
      if (!existingFnbTransaction) {
        newFnbTransaction = await prisma.transaction_Item_Fnb.create({
          data: {
            transaction_id: transactionId,
            fnb_item_id: fnbId,
            quantity: 1,
            sub_total: selectedFnb.price,
          },
        });
      } else {
        const oldQuantity = existingFnbTransaction.quantity;
        newFnbTransaction = await prisma.transaction_Item_Fnb.update({
          where: {
            id: existingFnbTransaction.id,
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
      const newFnbTransaction = await prisma.transaction_Item_Fnb.update({
        where: { id },
        data: {
          quantity: {
            increment: changeType == "increase" ? 1 : -1,
          },
        },
      });
      res.json({
        newFnbTransaction,
      });
    } catch (err) {
      res.status(500).json({
        message: "error-update-data",
      });
    }
  },

  removeFromTransaction: async (req: Request, res: Response) => {
    const fnbTransactionId = Number(req.params.id);

    try {
      await prisma.transaction_Item_Fnb.delete({
        where: { id: fnbTransactionId },
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
