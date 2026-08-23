import { Router } from "express";
import orderedFnbController from "../../controllers/orders/orderedFnb.controller.js";

const route = Router();

route.post("/add", orderedFnbController.addToOrder);
route.delete("/:id", orderedFnbController.removeFromTransaction);
route.patch("/change-qty/:id/:changeType", orderedFnbController.changeQty);

export default route;
