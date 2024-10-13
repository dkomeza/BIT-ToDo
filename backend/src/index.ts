import express from "express";
import { AppDataSource } from "./config/db.config";

import { authRouter } from "@/routes";

const app = express();
const PORT = process.env.NODE_ENV === "test" ? 8001 : 8000;

app.use(express.json());

app.get("/status", (_req, res) => {
  res.send({
    status: "Okay",
  });
});

app.listen(PORT, async () => {
  await AppDataSource.initialize();

  console.log(`Server is running on port ${PORT}`);
});
