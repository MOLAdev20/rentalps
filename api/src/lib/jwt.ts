import jwt from "jsonwebtoken";

export default {
  signToken: async (payload: any, exp: string) => {
    return await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: exp,
    });
  },

  verify: async (token: string) => {
    return await jwt.verify(token, process.env.JWT_SECRET_KEY);
  },
};
