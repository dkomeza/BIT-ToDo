import express from "express";
import { AppDataSource } from "./config/db.config";
import { User } from "./models/user.model";

import { authRouter } from "@/routes";

const app = express();
const PORT = process.env.NODE_ENV === "test" ? 8001 : 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/auth", authRouter);

app.get("/status", (_req, res) => {
  res.send({
    status: "Okay",
  });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
});
