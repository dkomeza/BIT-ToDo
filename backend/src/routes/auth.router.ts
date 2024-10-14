import { auth } from "@/middlewares/auth.middleware";
import {
  register,
  login,
  RegisterDataSchema,
  LoginDataSchema,
} from "@/services/auth.service";
import express from "express";

const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  const parse = RegisterDataSchema.safeParse(req.body);

  if (!parse.success) {
    res.status(400).send({ error: "Invalid data" });
    return;
  }

  try {
    const token = await register(parse.data);

    res.send({ token });
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

authRouter.post("/login", async (req, res) => {
  const parse = LoginDataSchema.safeParse(req.body);

  if (!parse.success) {
    res.status(400).send({ error: "Invalid data" });
    return;
  }

  try {
    const token = await login(parse.data);

    res.send({ token });
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

authRouter.get("/", auth, (req, res) => {
  const user = req.user;

  res.send({ user });
});

export default authRouter;
