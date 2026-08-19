import { Router } from "express";
import authController from "../controllers/auth.controller.js";

const route = Router();

route.post("/", authController.login);
route.get("/verify", authController.verify);
route.get("/register", authController.register);

export default route;
