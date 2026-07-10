import { Router } from "express";
import transactionController from "../controllers/transaction.controller.js"

const route = Router()

route.post("/", transactionController.create);

export default route