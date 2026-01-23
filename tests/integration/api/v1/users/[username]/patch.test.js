import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH to api/v1/users", () => {
  describe("Anonymous user", () => {
    test("With nonexisting 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/wrongUser",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "danielPatch",
          }),
        },
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

    test("With already existing 'username'", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "fakename",
          email: "teste@email.com",
          password: "123password",
        }),
      });

      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "fakename2",
          email: "teste2@email.com",
          password: "123password",
        }),
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/fakename2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "fakename",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "Validation Error",
        action: "Utilize um nome de usuário diferente",
        message: "O nome de usuário ja está em uso",
        status_code: 400,
      });
    });

    test("With already existing 'email'", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "fakename",
          email: "teste@email.com",
          password: "123password",
        }),
      });

      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "fakename2",
          email: "teste2@email.com",
          password: "123password",
        }),
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/fakename2",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "teste@email.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "Validation Error",
        action: "Utilize um email diferente",
        message: "O email utilizado ja está em uso",
        status_code: 400,
      });
    });

    test("Can use the same 'username' in different case", async () => {
      await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "fakename4",
          email: "teste4@email.com",
          password: "123password",
        }),
      });

      const response = await fetch(
        "http://localhost:3000/api/v1/users/fakename4",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "FakeName4",
          }),
        },
      );

      expect(response.status).toBe(200);
    });
  });
});
