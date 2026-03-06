import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import user from "models/user.js";
import password from "models/password.js";
import { UnauthorizedError } from "infra/errors.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST to api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With valid credentials", async () => {
      const createdUser = await orchestrator.createUser({
        password: "123456",
      });
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: `${createdUser.email}`,
          password: "123456",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        token: responseBody.token,
      });
    });
    test("With incorrect email but correct password", async () => {
      const createdUser = await orchestrator.createUser();
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "wrongemail@tabnews.com.br",
          password: `${createdUser.password}`,
        }),
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Email ou senha incorretos",
        action: "Verifique suas credenciais e tente novamente",
        status_code: 401,
      });
    });

    test("With correct email but incorrect password", async () => {
      const createdUser = await orchestrator.createUser();
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: `${createdUser.email}`,
          password: "wrongpassword",
        }),
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Email ou senha incorretos",
        action: "Verifique suas credenciais e tente novamente",
        status_code: 401,
      });
    });

    test("With incorrect email and password", async () => {
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "wrongemail@tabnews.com.br",
          password: "wrongpassword",
        }),
      });

      expect(response.status).toBe(401);
      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Email ou senha incorretos",
        action: "Verifique suas credenciais e tente novamente",
        status_code: 401,
      });
    });
  });
});
