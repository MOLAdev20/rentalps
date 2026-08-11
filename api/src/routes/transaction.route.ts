import { Router } from "express";
import transactionController from "../controllers/transaction.controller.js";

const route = Router();

route.get("/", transactionController.getAll);
route.get(
  "/financial-statements",
  transactionController.getFinancialStatements,
);
route.get("/:id", transactionController.getDetail);
route.post("/", transactionController.create);

export default route;
