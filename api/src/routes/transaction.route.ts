import { Router } from "express";
import transactionController from "../controllers/transaction.controller.js";

const route = Router();

route.get("/", transactionController.getAll);
route.get(
  "/financial-statements",
  transactionController.getFinancialStatements,
);
route.post("/proceed-payment/:id", transactionController.proceedPayment);
route.post("/generate-qris/:id", transactionController.generateQris);
route.post("/add-fnb", transactionController.addFnbItem);
route.get("/remove-fnb/:id", transactionController.removeFnBTransaction);
route.get("/:id", transactionController.getDetail);
route.post("/", transactionController.create);

export default route;
