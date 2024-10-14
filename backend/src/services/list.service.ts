import { z } from "zod";

import { createList, List, selectList } from "@/models/list.model";
import type { User } from "@/models/user.model";

export const CreateListDataSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name is too long" }),
  description: z.string().optional(),
});

export type CreateListData = z.infer<typeof CreateListDataSchema>;

export async function create(data: CreateListData, user: User): Promise<List> {
  // Check if the name is already taken
  const taken = await selectList({ name: data.name, user });
  if (taken) throw new Error("Name is already taken");

  return createList({ ...data, user });
}
