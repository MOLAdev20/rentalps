import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { RegisterInput } from "../schemas/unit.schema.js";

const endpoint = {
  getAll: async (_: Request, res: Response) => {
    try {
      const rawUnit = await prisma.unit_Item.findMany({
        include: {
          transactionItemUnits: {
            where: {
              status: "playing",
            },
            select: {
              start_time: true,
              end_time: true,
            },
          },
        },
      });

      const unit = rawUnit.map((item) => {
        let transactionItemUnits: any = {};
        if (item.transactionItemUnits.length != 0) {
          transactionItemUnits = item.transactionItemUnits[0];
        }

        return {
          ...item,
          transactionItemUnits: transactionItemUnits,
        };
      });

      if (unit.length <= 0) {
        return res.status(404).json({
          message: "data-not-found",
        });
      }

      return res.json({ unit });
    } catch (err) {
      return res.status(500).json({
        message: "Error creating unit",
      });
    }
  },

  getOne: async (req: Request, res: Response) => {
    try {
      const id: number = Number(req.params.id);

      const unit = await prisma.unit_Item.findUniqueOrThrow({
        where: { id },
      });

      res.json(unit);
    } catch (err) {
      res.status(500).json({
        message: "internal-server-error",
      });
    }
  },

  getAvailableOne: async (req: Request, res: Response) => {
    try {
      const id: number = Number(req.params.id);

      const unit = await prisma.unit_Item.findUniqueOrThrow({
        where: { id, status: "available" },
      });

      res.json(unit);
    } catch (err) {
      res.status(500).json({
        message: "internal-server-error",
      });
    }
  },

  create: async (req: Request<{}, {}, RegisterInput>, res: Response) => {
    try {
      await prisma.unit_Item.create({
        data: {
          title: req.body.title,
          rent_price: req.body.rent_price,
          description: req.body.description,
        },
      });

      res.json({
        message: "unit-created",
      });
    } catch (err) {
      res.status(500).json({
        message: "internal-server-error",
      });
    }
  },
};

export default endpoint;
