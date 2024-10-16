import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  type Relation,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
} from "typeorm";
import { AppDataSource } from "@/config/db.config";
import { User } from "./user.model";
import { slugify } from "@/services/list.service";
import { Task } from "./task.model";

@Entity()
export class List {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255, unique: true })
  name!: string;

  @Column({ type: "varchar", length: 255, unique: true })
  slug!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @ManyToOne(() => User, (user) => user.lists, { onDelete: "CASCADE" }) // Use forward reference
  user!: Relation<User>;

  @OneToMany(() => Task, (task) => task.list) // Use forward reference
  tasks!: Relation<Task>[];

  @Column({ type: "int", default: 0 })
  priority!: number; // Control order of the lists

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Column({ type: "timestamp", nullable: true })
  updatedAt?: Date;

  @Column({ type: "boolean", default: false })
  isArchived!: boolean; // Archive a list if it's not actively used

  @BeforeInsert()
  @BeforeUpdate()
  generateSlug() {
    this.slug = slugify(this.name);
    this.updatedAt = new Date();
  }
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

export async function selectList(
  user: User,
  where: {
    id?: number;
    name?: string;
    slug?: string;
  }
): Promise<List | null> {
  // Either id or user and name or slug is required
  if (!user || (!where.id && !where.name && !where.slug)) {
    throw new Error("ID or user and name or slug is required");
  }

  const listRepository = AppDataSource.getRepository(List);

  const list = await listRepository.findOne({
    where: {
      ...where,
      user: {
        id: user.id, // Ugly but typeorm refuses to accept user object
      },
    },
  });

  return list;
}

export async function selectUserLists(user: User): Promise<List[]> {
  const listRepository = AppDataSource.getRepository(List);

  const lists = await listRepository.find({
    where: {
      user: {
        id: user.id,
      },
      isArchived: false,
    },
    relations: ["tasks"],
  });

  return lists;
}

export async function updateList(
  user: User,
  where: { id: number },
  data: Partial<List>
): Promise<List | null> {
  const listRepository = AppDataSource.getRepository(List);

  const list = await listRepository.findOne({
    where: {
      ...where,
      user: {
        id: user.id, // Ensure the user owns the list
      },
    },
  });
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
