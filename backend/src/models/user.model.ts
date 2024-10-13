import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AppDataSource } from "@/config/db.config";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column()
  name: string;
  @Column()
  surname: string;
}

export async function createUser(data: Partial<User>): Promise<User> {
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
