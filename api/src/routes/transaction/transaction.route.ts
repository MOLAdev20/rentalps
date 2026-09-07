import { Router } from "express";
import transactionController from "../../controllers/transaction/transaction.controller.js";

const route = Router();

route.get("/", transactionController.getAll);
route.get("/unit/:id", transactionController.getDetail); // get transaction by unit
route.get("/unit-history/:id", transactionController.getHistoryByUnit); // get transaction history by unit

export default route;
