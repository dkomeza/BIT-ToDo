import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  type Relation,
} from "typeorm";
import { AppDataSource } from "@/config/db.config";
import { List } from "./list.model";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @PrimaryColumn({ unique: true })
  email: string;
  @Column()
  password: string;
  @Column()
  name: string;
  @Column()
  surname: string;

  @OneToMany(() => List, (list) => list.user) // Use forward reference
  lists!: Relation<List>[];

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt!: Date;

  @Column({ default: false })
  isVerified!: boolean;

  @Column({ type: "varchar", length: 255, nullable: true })
  resetPasswordToken?: string; // Token for resetting the password

  @Column({ type: "timestamp", nullable: true })
  resetPasswordExpires?: Date; // Expiry time for the reset password token
}

export async function createUser(data: {
  email: string;
  password: string;
  name: string;
  surname: string;
}): Promise<User> {
  const userRepository = AppDataSource.getRepository(User);

  const user = userRepository.create(data);
  await userRepository.save(user);

  return user;
}

export async function getUser(where: Partial<User>): Promise<User | null> {
  const userRepository = AppDataSource.getRepository(User);

  const user = await userRepository.findOne({ where });
  if (!user) return null;

  return user;
}
