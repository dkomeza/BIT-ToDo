import { auth } from "@/middlewares/auth.middleware";
import { getUserLists, get } from "@/services/list.service";
import express from "express";

const listRouter = express.Router();

listRouter.get("/", auth, async (req, res) => {
  const lists = await getUserLists(req.user!);

  res.send(lists);
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

listRouter.get("/:slug", auth, async (req, res) => {
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

export default listRouter;
