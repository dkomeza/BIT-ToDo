import "reflect-metadata";
import { DataSource } from "typeorm";

console.log("DB_HOST", process.env.DB_HOST);

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: 5432,
  username: "postgres",
  password: "postgres",
  database: "postgres",
  synchronize: true,
  logging: false,
  entities: [__dirname + "/../models/*.model.ts"],
});
