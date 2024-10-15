import { create } from "zustand";
import {
  fetchLists,
  saveList,
  slugify,
  updatePriority,
} from "@/functions/lists.api";

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
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  tasks: Task[]; // Each list can have multiple tasks
}

interface ToDoState {
  lists: List[]; // Store all lists
  tasks: Task[]; // Optionally, you can store tasks separately if needed
  error: string | null;

  // Actions for lists
  fetchLists: () => Promise<void>;
  addList: ({
    name,
    description,
  }: {
    name: string;
    description?: string;
  }) => Promise<void>;
  changeListPriority: (oldIndex: number, newIndex: number) => Promise<void>;
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
      const lists = (await fetchLists()) as List[];
      const sortedLists = parseLists(lists);

      set({ lists: sortedLists, error: null });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Add a new list
  addList: async ({
    name,
    description,
  }: {
    name: string;
    description?: string;
  }) => {
    const tempId = Date.now(); // Generate a temporary id

    const list: List = {
      id: tempId,
      name,
      description,
      slug: slugify(name),
      priority: 0,
      tasks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isArchived: false,
    };

    set((state) => ({
      lists: [...state.lists, list],
    }));

    try {
      const savedList = await saveList(list); // Save the list to the API

      set((state) => {
        const lists = state.lists.map((l) => (l.id === tempId ? savedList : l));
        return { lists, error: null };
      });
    } catch (error: any) {
      set((state) => {
        const lists = state.lists.filter((l) => l.slug !== list.slug); // List slug is unique
        return { lists, error: error.message };
      });
    }
  },

  changeListPriority: async (oldIndex: number, newIndex: number) => {
    const newLists = arrayMove(get().lists, oldIndex, newIndex);
    const oldPriorities = get().lists.map(({ id, priority }) => ({
      id,
      priority,
    }));
    newLists[newIndex].priority = 1; // Temporary value

    for (let i = newLists.length - 1; i >= 0; i--) {
      if (i < newLists.length - 1) {
        if (newLists[i].priority === 0 && newLists[i + 1].priority === 0)
          // Account for the case when list with priority 0 is moved in front of another list with priority other than 0
          continue;
        newLists[i].priority = newLists[i + 1].priority + 1;
      } else {
        if (newLists[i].priority === 0) continue;
        newLists[i].priority = 1;
      }
    }

    set({ lists: newLists });

    // Save the updated priority to the API
    const saveData = newLists.map(({ id, priority }) => ({ id, priority }));

    try {
      const lists = await updatePriority(saveData);
      const sortedLists = parseLists(lists);
      set({ lists: sortedLists, error: null });
    } catch (error: any) {
      set((state) => {
        const lists = state.lists.map((l) => {
          const priority = oldPriorities.find((p) => p.id === l.id)?.priority;
          return { ...l, priority: priority ?? 0 };
        });

        return { lists, error: error.message };
      });
    }
  },

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

// Helper function to move an item in an array
function arrayMove<T>(array: T[], from: number, to: number) {
  const newArray = [...array];
  const [item] = newArray.splice(from, 1);
  newArray.splice(to, 0, item);
  return newArray;
}

// Helper function to parse date strings and sort by date and priority
function parseLists(lists: List[]) {
  return lists
    .map((list) => ({
      ...list,
      createdAt: new Date(list.createdAt),
      updatedAt: new Date(list.updatedAt),
    }))
    .sort((a, b) =>
      a.priority === b.priority
        ? a.updatedAt > b.updatedAt
          ? 1
          : -1
        : b.priority - a.priority
    );
}
