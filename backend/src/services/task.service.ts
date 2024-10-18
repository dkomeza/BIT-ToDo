import { z } from "zod";

import {
  createTask,
  deleteTask as deleteTaskModel,
  getTasks,
  Task,
  updateTask,
} from "@/models/task.model";
import { get } from "@/services/list.service";
import { User } from "@/models/user.model";

export const CreateTaskDataSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  date: z.coerce.date(),
  listId: z.number(),
  tags: z.string().optional(),
  description: z.string().optional(),
});

export const UpdateTaskDataSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }).optional(),
  date: z.coerce.date().optional(),
  listId: z.number().optional(),
  tags: z.string().optional(),
  description: z.string().optional(),
  completed: z.boolean().optional(),
});

export type CreateTaskData = z.infer<typeof CreateTaskDataSchema>;
export type UpdateTaskData = z.infer<typeof UpdateTaskDataSchema>;

export async function create(data: CreateTaskData, user: User): Promise<Task> {
  // Check if the list exists
  const list = await get(user, { id: data.listId });
  if (!list) throw new Error("List not found");

  return createTask({
    user,
    list,
    ...data,
  });
}

export async function update(user: User, taskId: number, data: UpdateTaskData) {
  const updatedTask = await updateTask(user, { id: taskId }, data);

  return updatedTask;
}

export async function deleteTask(user: User, taskId: number) {
  await deleteTaskModel(user, taskId);

  return;
}

export async function getUsersTasks(user: User) {
  const tasks = await getTasks(user);

  return tasks;
}
