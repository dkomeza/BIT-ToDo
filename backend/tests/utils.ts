import { beforeAll, afterAll } from "bun:test";
import { AppDataSource } from "@/config/db.config";

export const setupDB = async () => {
  await AppDataSource.initialize();
};

export const teardownDB = async () => {
  await AppDataSource.destroy();
};

export const clearDB = async () => {
  const entities = AppDataSource.entityMetadatas;

  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name); // Get repository
    await repository.clear(); // Clear each entity table's content
  }
};
