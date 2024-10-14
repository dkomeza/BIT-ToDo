import {
  test,
  expect,
  describe,
  beforeAll,
  afterAll,
  afterEach,
} from "bun:test";
import "@/index";
import { setupDB, teardownDB, clearDB } from "./utils";

beforeAll(async () => {
  await setupDB();
});

afterAll(async () => {
  await teardownDB();
});

afterEach(async () => {
  await clearDB();
});

function createTestUser() {
  return fetch("http://localhost:8001/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Admin",
      surname: "Admin",
      email: "admin@admin.com",
      password: "admin",
    }),
  });
}

function loginTestUser() {
  return fetch("http://localhost:8001/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: "admin@admin.com",
      password: "admin",
    }),
  });
}

describe("Register", () => {
  test("Register a new user", async () => {
    const response = await createTestUser();

    expect(response.status).toBe(200);

    const data = await response.json();

    expect(data).toHaveProperty("token");
  });

  test("Register a user with invalid data", async () => {
    const response = await fetch("http://localhost:8001/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Admin",
        surname: "Admin",
        email: "",
        password: "admin",
      }),
    });

    expect(response.status).toBe(400);

    const data = (await response.json()) as { error: string };

    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Invalid data");
  });
});

describe("Login", () => {
  test("Login with a registered user", async () => {
    const response = await createTestUser();

    expect(response.status).toBe(200);

    const loginResponse = await loginTestUser();

    expect(loginResponse.status).toBe(200);

    const data = await loginResponse.json();
    expect(data).toHaveProperty("token");
  });

  test("Login with an unregistered user", async () => {
    const response = await loginTestUser();

    expect(response.status).toBe(400);

    const data = (await response.json()) as { error: string };

    expect(data).toHaveProperty("error");
    expect(data.error).toBe("Wrong email or password");
  });

  test("Login with wrong password", async () => {
    await createTestUser();

    const response = await fetch("http://localhost:8001/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@admin.com",
        password: "wrongpassword",
      }),
    });
  });

  test("Login with invalid data", async () => {
    const response = await fetch("http://localhost:8001/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "",
      }),
    });

    expect(response.status).toBe(400);

    const data = (await response.json()) as { error: string };
    expect(data).toHaveProperty("error");

    expect(data.error).toBe("Invalid data");
  });
});

describe("Authorization", () => {
  test("Get user data with a token", async () => {
    const response = await createTestUser();

    expect(response.status).toBe(200);

    const loginResponse = await loginTestUser();

    expect(loginResponse.status).toBe(200);

    const data = (await loginResponse.json()) as { token: string };
    expect(data).toHaveProperty("token");

    const token = data.token;

    const userResponse = await fetch("http://localhost:8001/auth", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(userResponse.status).toBe(200);

    const userData = (await userResponse.json()) as {
      user: { email: string; name: string; surname: string };
    };
    expect(userData).toHaveProperty("user");
  });
});
