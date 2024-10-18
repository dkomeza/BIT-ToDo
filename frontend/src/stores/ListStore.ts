import { create } from "zustand";
import { List, Task } from "./ToDoStore";
import { fetchList } from "@/functions/lists.api";

interface ListStore {
  list: List | null;
  tasks: Task[];

  fetchList: (slug: string) => Promise<void>;
  fetchTasks: () => Promise<void>;
}

export const useListStore = create<ListStore>((set) => ({
  list: null,
  tasks: [],

  fetchList: async (slug: string) => {
    const list = await fetchList(slug);
    set({ list });
  },

  fetchTasks: async () => {
    const response = await fetch("http://localhost:3001/tasks");
    const data = await response.json();
    set({ tasks: data });
  },
}));
