import orchestrator from "tests/orchestrator";
import { version as uuidVersion } from "uuid";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET to api/v1/users/[username]", () => {
  describe("Anonymous user", () => {
    test("With unique and exact case match", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
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

      const response = await fetch("http://localhost:3000/api/v1/users/daniel");

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "daniel",
        email: "teste@email.com",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);

      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });
    test("Not existing user", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/NonExistingUser",
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "UserNotFound",
        action: "Verifique se o nome de usuário está correto",
        message: "Usuário informado não existe",
        status_code: 404,
      });
    });
  });
});
