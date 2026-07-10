import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../../generated/prisma/client.js";
import env from "../config/env.js";

const adapter = new PrismaMariaDb({
  host: env.DATABASE.HOST,
  user: env.DATABASE.USER,
  password: env.DATABASE.PASSWORD,
  database: env.DATABASE.NAME,
  connectionLimit: 5,
})

const prisma = new PrismaClient({adapter})

export {prisma}