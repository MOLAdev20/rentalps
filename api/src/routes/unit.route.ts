import { Router } from "express";
import unitController from "../controllers/unit.controller.js"
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema } from "../schemas/unit.schema.js";

const route = Router()

route.get("/", unitController.getAll);
route.post("/", validate(registerSchema), unitController.create);

export default route