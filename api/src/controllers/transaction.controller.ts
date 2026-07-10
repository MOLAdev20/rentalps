import type { Request, Response } from "express"
import { prisma } from "../lib/prisma.js"

interface SelectedUnitItem {
  unit_item: number
  play_time: number
  start_time: Date
  end_time: Date
}

interface SelectedUnitFnb {
  fnb_item: number
  quantity: number
}

const endpoint = {
  create : async (req: Request, res: Response) => {

    const selectedUnit: SelectedUnitItem[] = req.body.transaction_rental
    const selectedFnb: SelectedUnitFnb[] = req.body.transaction_fnb
    let subTotal = 0

    // Dapatkan seluruh ID Unit PS yang direquest
    const selectedUnitId = selectedUnit.map((item: SelectedUnitItem) => item.unit_item)
    // Dapatkan unit di database berdasarkan ID
    const availableUnit = await prisma.unit_Item.findMany({
      where: {id: {in: selectedUnitId}, status: "available"}
    })

    // Cek apakah hasil data di database jumlahnya sama dengan id unit yang direquest?
    if(selectedUnit.length != availableUnit.length){
      // Jika tidak sesuai, proses selanjutnya tidak akan dijalankan
      return res.status(404).json({ message: "not-found" });
    }

    // Mapping seluruh unit ID untuk selanjutnya disimpan ke database
    const transactionUnit = selectedUnit.map((item) => {
      const unitInfo = availableUnit.find(unit => unit.id == item.unit_item)!
      
      const itemPrice = unitInfo.rent_price * item.play_time
      subTotal += itemPrice

      return {
        unit_item_id: unitInfo.id,
        play_time: item.play_time,
        sub_total: itemPrice,
        start_time: new Date(item.start_time),
        end_time: new Date(item.end_time)
      }
    })


    // ========================================
    const selectedFnbId = selectedFnb.map((item: SelectedUnitFnb) => item.fnb_item)
    const availableFnb = await prisma.fnb_Item.findMany({
      where: {id: {in: selectedFnbId}}
    })

    if(selectedFnb.length != availableFnb.length){
      return res.status(404).json({
        message: "you-fnb-item-not-found"
      })
    }

    const transactionFnb = selectedFnb.map(item => {
      const fnbItemInfo = availableFnb.find(fnb => fnb.id == item.fnb_item)!

      const itemPrice = fnbItemInfo.price * item.quantity
      subTotal += itemPrice

      return {
        fnb_item_id: fnbItemInfo.id,
        quantity: item.quantity,
        sub_total: itemPrice
      }
    })

    await prisma.transaction.create({
      data : {
        customer_name: req.body.customer_name,
        subtotal: subTotal,
        total: subTotal,

        transactionItemUnits: {
          create: transactionUnit,
        },

        transactionItemFnbs: {
          create: transactionFnb
        }
      }
    })

    await prisma.unit_Item.updateMany({
      where: {id: {in: selectedUnitId}},
      data: {status: 'rented'}
    })

    res.json({
      message: "transaction-created"
    })

  }
}

export default endpoint