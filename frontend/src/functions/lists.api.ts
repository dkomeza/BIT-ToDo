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

  // if (!response.ok) throw new Error("Failed to save list");
  const data = (await response.json()) as List;
  console.log(data);

  if (!data.id) throw new Error("Failed to save list");
  return data;
}
