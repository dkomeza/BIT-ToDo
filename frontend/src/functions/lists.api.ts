import { List } from "@/stores/ToDoStore";

const url = "/api/lists";

export function slugify(name: string) {
  return name.toString().toLowerCase().replace(/\s+/g, "-");
}

export async function fetchLists() {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch lists");
  return response.json();
}

export async function saveList(list: List) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: list.name,
      description: list.description,
    }),
  });

  if (!response.ok) {
    let data;

    try {
      // Attempt to parse the JSON response
      data = (await response.json()) as { error?: string };
    } catch (error) {
      throw new Error("Failed to save list"); // Generic error message if the response isn't JSON
    }

    // Now handle any errors returned from the server
    if (data?.error) {
      throw new Error(data.error);
    } else {
      throw new Error("Failed to save list");
    }
  }
  const data = (await response.json()) as List;
  if (!data.id) throw new Error("Failed to save list"); // Generic error message if the response doesn't contain an id
  return data;
}

export async function updatePriority(data: { id: number; priority: number }[]) {
  const response = await fetch(`${url}/priority`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) throw new Error("Failed to update list priority");
  return response.json();
}

export async function removeList(id: number) {
  const response = await fetch(`${url}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to remove list");
  return response.json();
}
