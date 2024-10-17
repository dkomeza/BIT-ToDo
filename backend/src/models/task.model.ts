import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  type Relation,
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
    completed?: boolean;
    date?: Date;
  }
) {
  if (!user || !where) {
    throw new Error("User and where clause must be provided to get a task");
  }

  const taskRepository = AppDataSource.getRepository(Task);

  const task = await taskRepository.findOne({ where: { user, ...where } });

  return task;
}
