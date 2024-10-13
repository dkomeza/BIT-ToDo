import { test, expect } from "bun:test";
import "@/index";

test("Check API status", async () => {
  const response = await fetch("http://localhost:8001/status");
  const data = await response.json();

  expect(data).toEqual({ status: "Okay" });
});
