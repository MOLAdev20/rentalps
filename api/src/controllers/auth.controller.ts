import { type Request, type Response } from "express";
import jwt from "../lib/jwt.js";
import * as bcrypt from "bcrypt";
import { prisma } from "../lib/prisma.js";

const endpoint = {
  login: async (req: Request, res: Response) => {
    try {
      const username: string = req.body.username;
      const password: string = req.body.password;

      const userExists = await prisma.user.findFirst({
        where: {
          username,
        },
      });

      if (!userExists) {
        return res.status(401).json({
          message: "invalid-credentials",
        });
      }

      const passwordMatch = await bcrypt.compare(password, userExists.password);

      if (!passwordMatch) {
        return res.status(401).json({
          message: "invalid-credentials",
        });
      }

      const token = await jwt.signToken(
        {
          id: userExists.id,
          username,
        },
        "15m",
      );

      const refreshToken = await jwt.signToken(
        {
          id: userExists.id,
          username,
        },
        "1d",
      );

      await prisma.user_Refresh_Token.create({
        data: {
          user_id: userExists.id,
          user_agent: "Browser",
          is_revoked: false,
          ip_address: "192.168.0.1",
          token: refreshToken,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });

      res.json({
        message: "success",
        token,
      });
    } catch (err) {
      res.status(500).json({
        message: "error",
        err,
      });
    }
  },

  verify: async (req: Request, res: Response) => {
    try {
      const rawToken = req.headers.authorization;

      if (!rawToken) {
        return res.status(401).json({
          message: "unauthorized",
        });
      }

      const token = rawToken.split(" ")[1]!;

      const payload = await jwt.verify(token);

      res.json({ token, payload });
    } catch (err) {
      res.status(500).json({
        message: "error",
        err,
      });
    }
  },

  register: async (req: Request, res: Response) => {
    try {
      const { full_name, email, username, password } = req.body;

      // const userExists = await prisma.user.findFirst({
      //   where: {
      //     email,
      //     OR: [{ username }],
      //   },
      // });

      // if (userExists) {
      //   res.status(400).json({
      //     message: "email-already-registered",
      //   });
      // }

      const hashPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          full_name,
          email,
          username,
          password: hashPassword,
        },
      });
      res.json({ message: "success", user });
    } catch (err) {
      res.status(500).json({
        message: "error",
        err,
      });
    }
  },

  refreshToken: async (req: Request, res: Response) => {
    const userId: number = Number(req.body.user_id);

    try {
      const refreshToken = await prisma.user_Refresh_Token.findFirstOrThrow({
        select: { token: true },
        where: {
          user_id: userId,
        },
      });

      // const isTokenValid = await jwt.verify(
      //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJhbWluIiwiaWF0IjoxNzg3MjI4OTA3LCJleHAiOjE3ODczMTUzMDd9.3GKaLF2KltMOr6FaP7Z8zPnsWHvWhPqXVaPVSFZjYdY",
      // );

      const isTokenValid = await jwt.verify(refreshToken.token);

      const newToken = await jwt.signToken(
        {
          id: isTokenValid.id,
          username: isTokenValid.username,
        },
        "1m",
      );

      res.json({
        token: newToken,
      });
    } catch (err: any) {
      if (err.message == "jwt expired" || err.message == "invalid signature") {
        return res.status(401).json({
          message: "jwt-is-revoked",
        });
      }

      res.status(500).json({
        message: "error",
        err,
      });
    }
  },
};

export default endpoint;
