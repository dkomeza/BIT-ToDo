import jwt from "jsonwebtoken";

import { getUser, createUser } from "@/models/user.model";

export type RegisterData = {
  name: string;
  surname: string;

  email: string;
  password: string;
};

export type LoginData = {
  email: string;
  password: string;
};

export type Token = string;

export async function register(data: RegisterData): Promise<Token> {
  const isEmailTaken = await getUser({ email: data.email });

  if (isEmailTaken) throw new Error("Email is already taken");

  const hashedPassword = Bun.password.hashSync(data.password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  const user = await createUser({ ...data, password: hashedPassword });

  return jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "1d",
  });
}

export async function login(data: LoginData): Promise<Token> {
  const user = await getUser({ email: data.email });

  if (!user) throw new Error("Wrong password or email");
  if (!Bun.password.verifySync(data.password, user.password)) {
    throw new Error("Wrong password or email");
  }

  return jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "1d",
  });
}
