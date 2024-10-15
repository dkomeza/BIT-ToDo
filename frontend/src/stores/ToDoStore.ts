import { create } from "zustand";
import { fetchLists } from "@/functions/lists.api";

export interface Task {
  id: number;
  name: string;
  description: string;
  date: Date;
  completed: boolean;
  listId: number; // To associate tasks with a specific list
}

export interface List {
  id: number;
  name: string;
  description?: string;
  slug: string;
  priority: number;
  tasks: Task[]; // Each list can have multiple tasks
}

interface ToDoState {
  lists: List[]; // Store all lists
  tasks: Task[]; // Optionally, you can store tasks separately if needed
  error: string | null;

  // Actions for lists
  fetchLists: () => Promise<void>;
  addList: (list: List) => void;
  updateList: (id: number, updatedList: Partial<List>) => void;
  removeList: (id: number) => void;

  // Actions for tasks
  addTask: (task: Task) => void;
  updateTask: (id: number, updatedTask: Partial<Task>) => void;
  removeTask: (id: number) => void;

  // Utility actions
  getTasksByList: (listId: number) => Task[];
}

// Create the store
export const useToDoStore = create<ToDoState>((set, get) => ({
  lists: [],
  tasks: [],
  error: null,

  // Fetch all lists from API
  fetchLists: async () => {
    try {
      const lists = await fetchLists();
      set({ lists });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Add a new list
  addList: (list: List) =>
    set((state) => ({
      lists: [...state.lists, list],
    })),

  // Update an existing list
  updateList: (id: number, updatedList: Partial<List>) =>
    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === id ? { ...list, ...updatedList } : list
      ),
    })),

  // Remove a list by id
  removeList: (id: number) =>
    set((state) => ({
      lists: state.lists.filter((list) => list.id !== id),
      tasks: state.tasks.filter((task) => task.listId !== id), // Remove tasks associated with the list
    })),

  // Add a new task
  addTask: (task: Task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),

  // Update an existing task
  updateTask: (id: number, updatedTask: Partial<Task>) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updatedTask } : task
      ),
    })),

  // Remove a task by id
  removeTask: (id: number) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    })),

  // Get all tasks for a specific list
  getTasksByList: (listId: number) =>
    get().tasks.filter((task) => task.listId === listId),
}));
