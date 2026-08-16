import { Router } from "express";
import transactionController from "../../controllers/transaction/transaction.controller.js";

const route = Router();

route.get("/", transactionController.getAll);
route.get("/unit/:id", transactionController.getDetail);
route.post("/", transactionController.create);

export default route;
