const url = "/api/lists";

export async function fetchLists() {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch lists");
  return response.json();
}
