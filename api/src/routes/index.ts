import { Router } from "express";
import unit from "./unit.route.js";
import fnb from "./fnb.route.js";
import transaction from "./transaction/transaction.route.js";
import payment from "./transaction/payment.route.js";
import orderedFnb from "./transaction/orderedFnb.route.js";

const route = Router();

route.use("/unit", unit);
route.use("/fnb", fnb);
route.use("/transaction", transaction);
route.use("/transaction/payment", payment);
route.use("/transaction/fnb-item", orderedFnb);

export default route;
