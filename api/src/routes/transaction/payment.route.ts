import { Router } from "express";
import paymentController from "../../controllers/transaction/payment.controller.js";
import authMiddleware from "../../middleware/authorization.middleware.js";

const route = Router();

route.post("/notification", paymentController.notification);
route.post(
  "/proceed-payment",
  authMiddleware,
  paymentController.proceedPayment,
);
route.post("/generate-qris", authMiddleware, paymentController.generateQris);

export default route;
