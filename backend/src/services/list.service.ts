import { z } from "zod";

import {
  createList,
  List,
  selectList,
  deleteList as deleteListModel,
} from "@/models/list.model";
import { User } from "@/models/user.model";

export const CreateListDataSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(50, { message: "Name is too long" }),
  description: z.string().optional(),
});

export type CreateListData = z.infer<typeof CreateListDataSchema>;

export async function create(data: CreateListData, user: User): Promise<List> {
  const slug = slugify(data.name);
  // Check if the name is already taken
  const nameTaken = await selectList({ name: data.name, user });
  if (nameTaken) throw new Error("Name is already taken");

  // Check if the slug is already taken
  const slugTaken = await selectList({ slug, user });
  if (slugTaken)
    throw new Error("Slug is already taken (different name required)");

  return createList({ ...data, user });
}

export async function getUserLists(user: User): Promise<List[]> {
  return user.lists;
}

export async function get(
  user: User,
  { id, slug, name }: { id?: number; slug?: string; name?: string }
) {
  return selectList({ id, slug, name, user });
}

export async function deleteList(user: User, id: number) {
  const list = await get(user, { id });
  if (!list) throw new Error("List not found");

  return deleteListModel({ id });
}

export function slugify(name: string) {
  return name.toString().toLowerCase().replace(/\s+/g, "-");
}
