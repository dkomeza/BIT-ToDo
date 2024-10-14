import { auth } from "@/middlewares/auth.middleware";
import {
  register,
  login,
  RegisterDataSchema,
  LoginDataSchema,
} from "@/services/auth.service";
import express from "express";

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  console.log(req.body);
  const parse = RegisterDataSchema.safeParse(req.body);

  if (!parse.success) {
    res.status(400).send({ error: "Invalid data" });
    return;
  }

  try {
    const { token, user } = await register(parse.data);

    res.cookie("auth", token, { httpOnly: true, maxAge: 86400000 }); // 1 day

    if (process.env.NODE_ENV === "test") {
      res.send({ token });
      return;
    }

    res.send({ user: { ...user, password: "" } });
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

authRouter.post("/login", async (req, res) => {
  console.log(req.body);

  const parse = LoginDataSchema.safeParse(req.body);

  if (!parse.success) {
    res.status(400).send({ error: "Invalid data" });
    return;
  }

  try {
    const { token, user } = await login(parse.data);

    res.cookie("auth", token, { httpOnly: true, maxAge: 86400000 }); // 1 day

    if (process.env.NODE_ENV === "test") {
      res.send({ token });
      return;
    }

    res.send({ user: { ...user, password: "" } });
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("auth");
  res.send({ message: "Logged out" });
});

authRouter.get("/", auth, (req, res) => {
  const user = req.user;

  res.send({ user });
});

export default authRouter;
