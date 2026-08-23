import { Router } from "express";
import authMiddleware from "../middleware/authorization.middleware.js";
import auth from "./auth.route.js";
import unit from "./unit.route.js";
import fnb from "./fnb.route.js";
import transaction from "./transaction/transaction.route.js";
import payment from "./transaction/payment.route.js";
import orderedFnb from "./transaction/orderedFnb.route.js";
import transactionReport from "./transaction/report.route.js";
import order from "./order.route.js";

const route = Router();

route.use("/auth", auth);
route.use("/unit", authMiddleware, unit);
route.use("/fnb", fnb);
route.use("/order", authMiddleware, order);
route.use("/transaction/payment", payment);
route.use("/transaction/fnb-item", authMiddleware, orderedFnb);
route.use("/transaction/report", authMiddleware, transactionReport);
route.use("/transaction", authMiddleware, transaction);

export default route;
