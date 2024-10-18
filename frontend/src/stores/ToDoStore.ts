import { create } from "zustand";
import {
  fetchLists,
  removeList,
  saveList,
  slugify,
  updateList,
  updatePriority,
} from "@/functions/lists.api";
import {
  fetchTasks,
  markTaskAsComplete,
  removeTask,
  saveTask,
} from "@/functions/tasks.api";

export interface Task {
  id: number;
  name: string;
  description: string;
  date: Date;
  completed: boolean;
  list: List;
  tags: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface List {
  [x: string]: any;
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
  updateList: (id: number, updatedList: Partial<List>) => Promise<void>;
  removeList: (id: number) => Promise<void>;

  // Actions for tasks
  addTask: (task: {
    name: string;
    description?: string;
    date: Date;
    listId: number;
  }) => Promise<void>;
  fetchTasks: () => Promise<void>;
  markTaskAsCompleted: (id: number, completed: boolean) => Promise<void>;
  updateTask: (id: number, updatedTask: Partial<Task>) => void;
  removeTask: (id: number) => Promise<void>;
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
  updateList: async (id: number, updatedList: Partial<List>) => {
    const list = get().lists.find((list) => list.id === id);
    const oldList = { ...list };

    // Check if the updated data is different from the existing data
    if (!list) return;
    if (
      list.name === updatedList.name &&
      list.description === updatedList.description
    )
      return;

    if (!updatedList.name) {
      updatedList.name = list.name; // Prevent empty name
    }

    list.name = updatedList.name;
    list.description = updatedList.description;

    set((state) => ({
      lists: state.lists.map((list) =>
        list.id === id ? { ...list, ...updatedList } : list
      ),
    }));

    try {
      await updateList(id, updatedList);
    } catch (error: any) {
      set((state) => {
        const lists = state.lists.map((l) =>
          l.id === id ? { ...l, ...oldList } : l
        );
        return {
          lists: sortLists(lists),
          error: error.message,
        };
      });
    }
  },

  // Remove a list by id
  removeList: async (id: number) => {
    const list = get().lists.find((list) => list.id === id);
    const tasks = get().tasks.filter((task) => task.list.id === id);

    set((state) => ({
      lists: state.lists.filter((list) => list.id !== id),
      tasks: state.tasks.filter((task) => task.list.id !== id), // Remove tasks associated with the list
    }));

    try {
      await removeList(id);
    } catch (error: any) {
      set((state) => ({
        lists: sortLists([...state.lists, list] as List[]),
        tasks: [...state.tasks, ...tasks] as Task[],
        error: error.message,
      }));
    }
  },

  // Add a new task
  addTask: async (task: {
    name: string;
    description?: string;
    date: Date;
    listId: number;
  }) => {
    const tempId = Date.now(); // Generate a temporary id

    const newTask: Task = {
      id: tempId,
      name: task.name,
      description: task.description || "",
      date: task.date,
      completed: false,
      list: get().lists.find((list) => list.id === task.listId) as List,
      tags: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      tasks: [...state.tasks, newTask],
      lists: state.lists.map((list) =>
        list.id === task.listId
          ? { ...list, tasks: [...list.tasks, newTask] }
          : list
      ),
    }));

    // Save the task to the API
    try {
      const savedTask = await saveTask(newTask);

      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === tempId ? savedTask : t)),
        error: null,
      }));
    } catch (error: any) {
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== tempId),
        error: error.message,
      }));
    }
  },
  fetchTasks: async () => {
    try {
      const tasks = (await fetchTasks()) as Task[];
      set({ tasks, error: null });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
  markTaskAsCompleted: async (id: number, completed: boolean) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, completed } : task
      ),
      lists: state.lists.map((list) => ({
        ...list,
        tasks: list.tasks.map((task) =>
          task.id === id ? { ...task, completed } : task
        ),
      })),
    }));

    try {
      const task = (await markTaskAsComplete(id, completed)) as Task;

      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? task : t)),
        lists: state.lists.map((list) => ({
          ...list,
          tasks: list.tasks.map((t) => (t.id === id ? task : t)),
        })),
        error: null,
      }));
    } catch (error: any) {
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, completed: !completed } : task
        ),
        lists: state.lists.map((list) => ({
          ...list,
          tasks: list.tasks.map((task) =>
            task.id === id ? { ...task, completed: !completed } : task
          ),
        })),
        error: error.message,
      }));
    }
  },
  // Update an existing task
  updateTask: (id: number, updatedTask: Partial<Task>) =>
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...updatedTask } : task
      ),
    })),

  // Remove a task by id
  removeTask: async (id: number) => {
    const task = get().tasks.find((task) => task.id === id);

    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
      lists: state.lists.map((list) => ({
        ...list,
        tasks: list.tasks.filter((task) => task.id !== id),
      })),
    }));

    try {
      await removeTask(id);
    } catch (error: any) {
      set((state) => ({
        tasks: [...state.tasks, task] as Task[],
        lists: state.lists.map((list) => ({
          ...list,
          tasks: [...list.tasks, task] as Task[],
        })),
        error: error.message,
      }));
    }
  },

  // Get all tasks for a specific list
  getTasksByList: (listId: number) =>
    get().tasks.filter((task) => task.list.id === listId),
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

function sortLists(lists: List[]) {
  return lists.sort((a, b) =>
    a.priority === b.priority
      ? a.updatedAt > b.updatedAt
        ? 1
        : -1
      : b.priority - a.priority
  );
}
