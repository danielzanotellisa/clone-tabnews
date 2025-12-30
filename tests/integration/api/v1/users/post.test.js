import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST to api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "daniel",
          email: "teste@email.com",
          password: "123password",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "daniel",
        email: "teste@email.com",
        password: "123password",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);

      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With duplicated `email`", async () => {
      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "danielzanotelli",
          email: "Teste@email.com",
          password: "123password",
        }),
      });

      expect(response2.status).toBe(400);

      const responseBody2 = await response2.json();
      expect(responseBody2).toEqual({
        name: "Validation Error",
        action: "Utilize um email diferente",
        message: "O email utilizado ja está em uso",
        status_code: 400,
      });
    });

    test("With duplicated `username`", async () => {
      const response3 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "Daniel",
          email: "teste2@email.com",
          password: "123password",
        }),
      });

      expect(response3.status).toBe(400);

      const responseBody3 = await response3.json();
      expect(responseBody3).toEqual({
        name: "Validation Error",
        action: "Utilize um nome de usuário diferente",
        message: "O nome de usuário ja está em uso",
        status_code: 400,
      });
    });
  });
});
