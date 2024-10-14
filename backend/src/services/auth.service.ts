import jwt from "jsonwebtoken";
import { z } from "zod";

import { getUser, createUser, User } from "@/models/user.model";

export const RegisterDataSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  surname: z.string().min(1, { message: "Surname is required" }),
  email: z.string().email(),
  password: z.string().min(1),
});

export const LoginDataSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type RegisterData = z.infer<typeof RegisterDataSchema>;
export type LoginData = z.infer<typeof LoginDataSchema>;

export type Token = string;

export async function register(
  data: RegisterData
): Promise<{ token: Token; user: User }> {
  const isEmailTaken = await getUser({ email: data.email });

  if (isEmailTaken) throw new Error("Email is already taken");

  const hashedPassword = Bun.password.hashSync(data.password, {
    algorithm: "bcrypt",
    cost: 10,
  });

  const user = await createUser({ ...data, password: hashedPassword });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "1d",
  });

  return { token, user };
}

export async function login(
  data: LoginData
): Promise<{ token: Token; user: User }> {
  const user = await getUser({ email: data.email });

  if (!user) throw new Error("Wrong email or password");
  if (!Bun.password.verifySync(data.password, user.password)) {
    throw new Error("Wrong email or password");
  }

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "1d",
  });

  return { token, user };
}
