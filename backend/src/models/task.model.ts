import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  type Relation,
  MoreThanOrEqual,
} from "typeorm";
import { AppDataSource } from "@/config/db.config";
import { List } from "./list.model";
import { User } from "./user.model";

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // Task name

  @Column({ type: "text", nullable: true })
  description?: string; // Optional description of the task

  @Column()
  date: Date; // Date for the task (could be deadline, creation date, etc.)

  @Column({ default: false })
  completed: boolean; // Flag to mark if the task is completed

  @ManyToOne(() => List, (list) => list.tasks, { onDelete: "CASCADE" })
  list: Relation<List>; // Relation to the List entity

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: "CASCADE" })
  user: Relation<User>; // Relation to the User entity

  @Column({ type: "varchar", length: 255, nullable: true })
  tags?: string; // Optional tags, comma-separated string for categorization

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date; // Creation date of the task

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date; // Update date of the task
}

export async function createTask(data: {
  name: string;
  description?: string;
  date: Date;
  completed?: boolean;
  list: List;
  user: User;
  tags?: string;
}): Promise<Task> {
  if (!data.user || !data.list) {
    throw new Error("User and List must be provided to create a task");
  }

  const taskRepository = AppDataSource.getRepository(Task);

  const task = taskRepository.create(data);
  await taskRepository.save(task);

  return task;
}

export async function getTask(
  user: User,
  where: {
    id?: number;
    list?: List;
    name?: string;
    date?: Date;
  }
) {
  if (!user || !where) {
    throw new Error("User and where clause must be provided to get a task");
  }

  const taskRepository = AppDataSource.getRepository(Task);

  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const task = await taskRepository.findOne({
    where: [
      { user: { id: user.id }, ...where, completed: false },
      {
        user: { id: user.id },
        ...where,
        completed: true,
        updatedAt: MoreThanOrEqual(oneDayAgo),
      },
    ],
    relations: ["list"],
  });

  return task;
}

export async function getTasks(
  user: User,
  where?: {
    id?: number;
    list?: List;
    name?: string;
    completed?: boolean;
    date?: Date;
  }
) {
  if (!user) {
    throw new Error("User must be provided to get tasks");
  }

  const taskRepository = AppDataSource.getRepository(Task);
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const tasks = await taskRepository.find({
    where: [
      { user: { id: user.id }, ...where, completed: false },
      {
        user: { id: user.id },
        ...where,
        completed: true,
        updatedAt: MoreThanOrEqual(oneDayAgo),
      },
    ],
    relations: ["list"],
  });

  return tasks;
}

export async function updateTask(
  user: User,
  where: { id: number },
  data: {
    name?: string;
    description?: string;
    date?: Date;
    completed?: boolean;
    listId?: number;
    tags?: string;
  }
) {
  if (!user) {
    throw new Error("User must be provided to update a task");
  }

  if (!where || !where.id) {
    throw new Error("ID must be provided to update a task");
  }

  const taskRepository = AppDataSource.getRepository(Task);
  const task = await taskRepository.findOne({
    where: { id: where.id, user: { id: user.id } },
    relations: ["list"],
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (data.listId) {
    const listRepository = AppDataSource.getRepository(List);
    const list = await listRepository.findOne({
      where: { id: data.listId, user: { id: user.id } },
    });

    if (!list) {
      throw new Error("List not found");
    }

    task.list = list;
  }

  Object.assign(task, data);
  await taskRepository.save(task);

  return task;
}

export async function deleteTask(user: User, taskId: number) {
  if (!user) {
    throw new Error("User must be provided to delete a task");
  }

  if (!taskId) {
    throw new Error("ID must be provided to delete a task");
  }

  const taskRepository = AppDataSource.getRepository(Task);
  const task = await taskRepository.findOne({
    where: { id: taskId, user: { id: user.id } },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  await taskRepository.remove(task);

  return task;
}
