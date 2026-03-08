import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST to api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With valid credentials", async () => {
      const createdUser = await orchestrator.createUser({
        email: "tudo.correto@email.com",
        password: "tudocorreto",
      });
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "tudo.correto@email.com",
          password: "tudocorreto",
        }),
      });

      expect(response.status).toBe(201);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        user_id: createdUser.id,
        token: responseBody.token,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);

      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      const expiresAt = new Date(responseBody.expires_at);
      const createdAt = new Date(responseBody.created_at);

      const expirationInMilliSeconds = expiresAt - createdAt;

      expect(
        session.EXPIRATION_IN_MILLISECONDS - expirationInMilliSeconds,
      ).toBeLessThan(1000);

      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });
      expect(parsedSetCookie.session_id).toBeDefined();
      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: responseBody.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        httpOnly: true,
        path: "/",
        sameSite: "Strict",
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
