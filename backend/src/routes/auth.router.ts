import { auth } from "@/middlewares/auth.middleware";
import {
  register,
  login,
  type RegisterData,
  type LoginData,
} from "@/services/auth.service";
import express from "express";

const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  const { data } = req.body as { data: RegisterData };

  if (!data || !data.email || !data.name || !data.surname || !data.password) {
    res.status(400).send({ error: "Invalid data" });
    return;
  }

  try {
    const token = await register(data);

    res.send({ message: "User registered successfully", token });
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

authRouter.post("/login", async (req, res) => {
  const { data } = req.body as { data: LoginData };

  if (!data || !data.email || !data.password) {
    res.status(400).send({ error: "Invalid data" });
    return;
  }

  try {
    const token = await login(data);

    res.send({ message: "User logged in successfully", token });
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

authRouter.get("/", auth, (req, res) => {
  const user = req.user;

  res.send({ user });
});

export default authRouter;
