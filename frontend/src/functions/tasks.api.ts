import { Task } from "@/stores/ToDoStore";

const url = "/api/tasks";

export async function saveTask(task: Task) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: task.name,
      description: task.description,
      date: task.date,
      listId: task.list.id,
    }),
  });

  if (!response.ok) {
    let data;

    try {
      // Attempt to parse the JSON response
      data = (await response.json()) as { error?: string };
    } catch (error) {
      throw new Error("Failed to save task"); // Generic error message if the response isn't JSON
    }

    // Now handle any errors returned from the server
    if (data?.error) {
      throw new Error(data.error);
    } else {
      throw new Error("Failed to save task");
    }
  }

  const data = (await response.json()) as Task;
  if (!data.id) throw new Error("Failed to save task"); // Generic error message if the response doesn't contain an id
  return data;
}

export async function fetchTasks() {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  const data = (await response.json()) as Task[];
  return data;
}

export async function markTaskAsComplete(taskID: number, completed: boolean) {
  const response = await fetch(`${url}/${taskID}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ completed }),
  });

  if (!response.ok) {
    let data;

    try {
      // Attempt to parse the JSON response
      data = (await response.json()) as { error?: string };
    } catch (error) {
      throw new Error("Failed to mark task as complete"); // Generic error message if the response isn't JSON
    }

    // Now handle any errors returned from the server
    if (data?.error) {
      throw new Error(data.error);
    } else {
      throw new Error("Failed to mark task as complete");
    }
  }

  const data = (await response.json()) as Task;
  if (!data.id) throw new Error("Failed to mark task as complete"); // Generic error message if the response doesn't contain an id
  return data;
}

export async function removeTask(taskID: number) {
  const response = await fetch(`${url}/${taskID}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let data;

    try {
      // Attempt to parse the JSON response
      data = (await response.json()) as { error?: string };
    } catch (error) {
      throw new Error("Failed to remove task"); // Generic error message if the response isn't JSON
    }

    // Now handle any errors returned from the server
    if (data?.error) {
      throw new Error(data.error);
    } else {
      throw new Error("Failed to remove task");
    }
  }

  return true;
}
