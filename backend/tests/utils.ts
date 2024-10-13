import { AppDataSource } from "@/config/db.config";

export const setupDB = async () => {
  await AppDataSource.initialize();
};

export const teardownDB = async () => {
  await AppDataSource.destroy();
};

export const cleanDB = async () => {};
