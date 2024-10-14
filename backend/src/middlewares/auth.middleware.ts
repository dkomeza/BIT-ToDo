import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, getUser } from "@/models/user.model";

declare global {
  namespace Express {
    interface Request {
      user: User | null;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.auth || req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.status(401).send({ error: "Unauthorized" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret") as {
      id: string;
    };

    const user = await getUser({ id: Number(payload.id) });

    if (!user) {
      res.status(401).send({ error: "Unauthorized" });
      return;
    }

    req.user = { ...user, password: "" }; // Remove password from user object
    next();
  } catch (error: any) {
    res.status(401).send({ error: "Unauthorized" });
  }
};
