import type {Request, Response} from "express"
import { prisma } from "../lib/prisma.js"
import type { RegisterInput } from "../schemas/fnb.schema.js"

const endpoint = {
  getAll : async (_:Request, res: Response) => {
    try{

      const unit = await prisma.unit_Item.findMany()

      res.json({
        data: unit
      })

    }catch(err){
      res.status(500).json({
        message: "Error creating unit"
      })
    }
  },

  create : async (req: Request<{}, {}, RegisterInput>, res: Response) => {

    try{
      
      await prisma.fnb_Item.create({
        data: {
          title: req.body.title,
          price: req.body.price,
          description: req.body.description
        }
      })

      res.json({
        message: "unit-created"
      })

    }catch(err){
      res.status(500).json({
        message: "internal-server-error"
      })
    }

  }
}

export default endpoint