import { type Request, type Response, type NextFunction } from "express";
import jwt from "../lib/jwt.js";

const unAuthorizedResponse = (res: Response) => {
  return res.status(401).json({
    message: "unauthorized",
  });
};

const authorization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const rawToken = req.headers.authorization;

    if (!rawToken || !rawToken.startsWith("Bearer ")) {
      return unAuthorizedResponse(res);
    }

    const token = rawToken.split(" ")[1]!;
    await jwt.verify(token);

    next();
  } catch (err: any) {
    if (err.message === "invalid signature" || err.message === "jwt expired") {
      return unAuthorizedResponse(res);
    }

    return res.status(500).json({
      message: "error",
      err,
    });
  }
};

export default authorization;
