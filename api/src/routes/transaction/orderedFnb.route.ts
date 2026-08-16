import { Router } from "express";
import orderedFnbController from "../../controllers/transaction/orderedFnb.controller.js";

const route = Router();

route.post("/add", orderedFnbController.addToTransaction);
route.delete("/:id", orderedFnbController.removeFromTransaction);
route.patch("/change-qty/:id/:changeType", orderedFnbController.changeQty);

export default route;
