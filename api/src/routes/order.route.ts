import { Router } from "express";
import orderController from "../controllers/order.controller.js";

const route = Router();

route.post("/", orderController.createOrder);

export default route;
