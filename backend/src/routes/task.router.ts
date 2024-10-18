import { auth } from "@/middlewares/auth.middleware";
import {
  create,
  CreateTaskDataSchema,
  deleteTask,
  getUsersTasks,
  update,
  UpdateTaskDataSchema,
} from "@/services/task.service";
import express from "express";

const taskRouter = express.Router();

taskRouter.get("/", auth, async (req, res) => {
  try {
    const tasks = await getUsersTasks(req.user!);

    res.send(tasks);
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

taskRouter.post("/", auth, async (req, res) => {
  const parse = CreateTaskDataSchema.safeParse(req.body);

  if (!parse.success) {
    console.log(parse.error);
    res.status(400).send({ error: "Invalid data" });
    return;
  }

  try {
    const task = await create(parse.data, req.user!);

    res.send(task);
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

taskRouter.patch("/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).send({ error: "Task ID is required" });
    return;
  }

  const parse = UpdateTaskDataSchema.safeParse(req.body);

  if (!parse.success) {
    res.status(400).send({ error: "Invalid data" });
    return;
  }

  try {
    const task = await update(req.user!, parseInt(id), parse.data);

    res.send(task);
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

taskRouter.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400).send({ error: "Task ID is required" });
    return;
  }

  try {
    await deleteTask(req.user!, parseInt(id));

    res.send({ message: "Task deleted" });
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

export default taskRouter;
