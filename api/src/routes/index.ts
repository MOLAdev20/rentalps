import { Router } from "express";
import unit from "./unit.route.js"
import fnb from "./fnb.route.js"
import transaction from "./transaction.route.js"

const route = Router();

route.use("/unit", unit);
route.use("/fnb", fnb);
route.use("/transaction", transaction);

export default route