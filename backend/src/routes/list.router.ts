import { auth } from "@/middlewares/auth.middleware";
import { updateList } from "@/models/list.model";
import {
  getUserLists,
  get,
  create,
  CreateListDataSchema,
  UpdateListsPriorityDataSchema,
} from "@/services/list.service";
import express from "express";

const listRouter = express.Router();

listRouter.get("/", auth, async (req, res) => {
  const lists = await getUserLists(req.user!);
  res.send(lists);
});

listRouter.post("/", auth, async (req, res) => {
  const parse = CreateListDataSchema.safeParse(req.body);

  if (!parse.success) {
    res.status(400).send({ error: "Invalid data" });
    return;
  }

  try {
    const list = await create(parse.data, req.user!);

    res.send(list);
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

listRouter.get("/:id", auth, async (req, res) => {
  if (!req.params.id) {
    res.status(400).send({ error: "ID is required" });
    return;
  }

  const list = await get(req.user!, { id: Number(req.params.id) });

  if (!list) {
    res.status(404).send({ error: "List not found" });
    return;
  }

  res.send(list);
});

listRouter.delete("/:id", auth, async (req, res) => {
  if (!req.params.id) {
    res.status(400).send({ error: "ID is required" });
    return;
  }

  try {
    await updateList(
      req.user!,
      { id: Number(req.params.id) },
      { isArchived: true }
    );
    res.send({ success: true });
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

listRouter.get("/slug/:slug", auth, async (req, res) => {
  if (!req.params.slug) {
    res.status(400).send({ error: "Slug is required" });
    return;
  }

  const list = await get(req.user!, { slug: req.params.slug });

  if (!list) {
    res.status(404).send({ error: "List not found" });
    return;
  }

  res.send(list);
});

listRouter.put("/priority", auth, async (req, res) => {
  const parse = UpdateListsPriorityDataSchema.safeParse(req.body);

  if (!parse.success) {
    res.status(400).send({ error: "Invalid data" });
    return;
  }

  console.log(parse.data);

  try {
    const lists = await Promise.all(
      parse.data.map((data) =>
        updateList(req.user!, { id: data.id }, { priority: data.priority })
      )
    );

    res.send(lists);
  } catch (error: any) {
    res.status(400).send({ error: error.message });
  }
});

export default listRouter;
