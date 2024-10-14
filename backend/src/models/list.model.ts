import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  type Relation,
} from "typeorm";
import { AppDataSource } from "@/config/db.config";
import { User } from "./user.model";

@Entity()
export class List {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, unique: true })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @ManyToOne(() => User, (user) => user.lists, { onDelete: "CASCADE" }) // Use forward reference
  user!: Relation<User>;

  @Column({ type: "int", default: 0 })
  priority!: number; // Control order of the lists

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  updatedAt?: Date;

  @Column({ type: "boolean", default: false })
  isArchived!: boolean; // Archive a list if it's not actively used
}

export async function createList(data: {
  name: string;
  description?: string;
  user: User;
  priority?: number;
  isArchived?: boolean;
}): Promise<List> {
  if (!data.user) {
    throw new Error("User is required");
  }

  const listRepository = AppDataSource.getRepository(List);

  const list = listRepository.create(data);
  await listRepository.save(list);

  return list;
}

export async function selectList(where: {
  id?: number;
  name?: string;
  user?: User;
}): Promise<List | null> {
  const listRepository = AppDataSource.getRepository(List);

  const list = await listRepository.findOne({
    where,
  });

  return list;
}

export async function getUserLists(user: User): Promise<List[]> {
  const listRepository = AppDataSource.getRepository(List);

  const lists = await listRepository.find({
    where: { user },
  });

  return lists;
}

export async function updateList(
  where: { id: number },
  data: Partial<List>
): Promise<List | null> {
  const listRepository = AppDataSource.getRepository(List);

  const list = await listRepository.findOne({ where });
  if (!list) return null;

  Object.assign(list, data);
  await listRepository.save(list);

  return list;
}

export async function deleteList({ id }: { id: number }): Promise<boolean> {
  const listRepository = AppDataSource.getRepository(List);

  const result = await listRepository.delete({ id });

  return result.affected === 1;
}
