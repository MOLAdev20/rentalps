import { Router } from "express";
import fnbController from "../controllers/fnb.controller.js"
import { validate } from "../middleware/validate.middleware.js";
import { registerSchema } from "../schemas/fnb.schema.js";

const route = Router()

route.get("/", fnbController.getAll);
route.post("/", validate(registerSchema), fnbController.create);

export default route