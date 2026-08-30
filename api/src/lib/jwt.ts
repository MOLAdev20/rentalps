import jwt, { type SignOptions } from "jsonwebtoken";
import env from "../config/env.js";

interface jwtPayload {
  id: number;
  username: string;
}

export default {
  signToken: async (payload: jwtPayload, exp: SignOptions["expiresIn"]) => {
    return jwt.sign(payload, env.JWT_SECRET_KEY, {
      expiresIn: exp,
    });
  },

  verify: async (token: string) => {
    return jwt.verify(token, env.JWT_SECRET_KEY);
  },
};
