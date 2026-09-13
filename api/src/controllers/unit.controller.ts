import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import type { RegisterInput } from "../schemas/unit.schema.js";

const endpoint = {
  getAll: async (_: Request, res: Response) => {
    try {
      const rawUnit = await prisma.unitItem.findMany({
        include: {
          rentedUnitOrder: {
            select: {
              order_id: true,
              start_time: true,
              end_time: true,
            },
            orderBy: {
              id: "desc",
            },
            take: 1,
          },
        },
      });

      const now = new Date();

      const summary = rawUnit.reduce(
        (acc, item) => {
          acc.total += 1;

          if (item.status === "available") {
            acc.available += 1;
          }

          const latestOrder = item.rentedUnitOrder[0];

          if (item.status === "rented" && latestOrder) {
            const endTime = new Date(latestOrder.end_time);

            if (endTime.getTime() > now.getTime()) {
              acc.playing += 1;
            } else {
              acc.finished += 1;
            }
          }

          return acc;
        },
        {
          total: 0,
          playing: 0,
          finished: 0,
          available: 0,
        },
      );

      const unit = rawUnit.map((item) => {
        let rentedUnitOrder: any = {};
        if (item.rentedUnitOrder.length != 0) {
          rentedUnitOrder = item.rentedUnitOrder[0];
        }

        return {
          ...item,
          rentedUnitOrder: rentedUnitOrder,
        };
      });

      if (unit.length <= 0) {
        return res.status(404).json({
          message: "data-not-found",
        });
      }

      return res.json({ unit, summary });
    } catch (err) {
      return res.status(500).json({
        message: "Error fetch data",
        err,
      });
    }
  },

  getOne: async (req: Request, res: Response) => {
    try {
      const id: number = Number(req.params.id);

      const unit = await prisma.unitItem.findUniqueOrThrow({
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

      const unit = await prisma.unitItem.findUniqueOrThrow({
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
      await prisma.unitItem.create({
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
