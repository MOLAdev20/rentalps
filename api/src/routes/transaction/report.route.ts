import { Router } from "express";
import transactionReportController from "../../controllers/transaction/transactionReport.controller.js";

const route = Router();

route.get(
  "/financial-statements",
  transactionReportController.getFinancialStatements,
);

export default route;
