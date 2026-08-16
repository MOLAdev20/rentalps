import { Router } from "express";
import paymentController from "../../controllers/transaction/payment.controller.js";

const route = Router();

route.post("/proceed-payment", paymentController.proceedPayment);
route.post("/generate-qris", paymentController.generateQris);

export default route;
