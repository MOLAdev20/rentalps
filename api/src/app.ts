import express from "express";
import router from "./routes/index.js";
import cors from "cors";

const app = express();
var corsOptions: cors.CorsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(router);

export default app;
