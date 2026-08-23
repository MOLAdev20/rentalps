import { Router } from "express";
import orderController from "../controllers/orders/order.controller.js";

const route = Router();

route.get("/by-unit/:unit_id", orderController.getByRentedUnit);
route.post("/", orderController.createOrder);

export default route;
