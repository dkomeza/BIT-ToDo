import express from "express";
import { AppDataSource } from "./config/db.config";
import cookieParser from "cookie-parser";

import { authRouter, listRouter, taskRouter } from "@/routes";

const app = express();
const PORT = process.env.NODE_ENV === "test" ? 8001 : 8000;

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRouter);
app.use("/lists", listRouter);
app.use("/tasks", taskRouter);

app.get("/status", (_req, res) => {
  res.send({
    status: "Okay",
  });
});

app.use((_req, res) => {
  res.status(404).send({
    error: "Not Found",
  });
});

app.listen(PORT, async () => {
  await AppDataSource.initialize();
  console.log(`Server is running on port ${PORT}`);
});
