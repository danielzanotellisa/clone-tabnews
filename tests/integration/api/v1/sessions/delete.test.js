import orchestrator from "tests/orchestrator.js";
import { version as uuidVersion } from "uuid";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("DELETE to api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("With nonexisting session", async () => {
      const invalidToken = "123qweasdzxc";
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          cookie: `session_id=${invalidToken}`,
        },
      });

      expect(response.status).toBe(401);
    });
    test("With expired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS - 1000),
      });
      const createdUser = await orchestrator.createUser();
      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(response.status).toBe(401);
    });
    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser();
      const sessionObj = await orchestrator.createSession(createdUser.id);
      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          cookie: `session_id=${sessionObj.token}`,
        },
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: sessionObj.id,
        user_id: sessionObj.user_id,
        token: sessionObj.token,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(
        responseBody.expires_at < sessionObj.expires_at.toISOString(),
      ).toBe(true);
      expect(
        responseBody.updated_at > sessionObj.updated_at.toISOString(),
      ).toBe(true);

      const parsedCookie = setCookieParser(response, {
        map: true,
      });
      expect(parsedCookie.session_id).toBeDefined();
      expect(parsedCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        httpOnly: true,
        path: "/",
        
      });

      const response2 = await fetch("http://localhost:3000/api/v1/user", {
        headers: {
          Cookie: `session_id=${sessionObj.token}`,
        },
      });
      expect(response2.status).toBe(401);

      const responseBody2 = await response2.json();

      expect(responseBody2).toEqual({
        name: "UnauthorizedError",
        action: "Usuário não possui sessão ativa",
        message: "Verifique se esse usuário está logado e tente novamente",
        status_code: 401,
      });
    });
  });
});
