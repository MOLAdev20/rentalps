import { Router } from "express";
import orderController from "../controllers/orders/order.controller.js";

const route = Router();

route.get("/by-unit/:unit_id", orderController.getByRentedUnit);
route.post("/", orderController.createOrder);
route.post("/add-play-time", orderController.addPlayTime);
route.post("/reduce-play-time", orderController.reducePlayTime);

export default route;
