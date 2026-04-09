import orchestrator from "tests/orchestrator.js";
import activation from "models/activation.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteEmails();
});

describe("Use case: Registration Flow (all successful)", () => {
  test("Create user account", async () => {
    const createUserResponse = await fetch(
      "http://localhost:3000/api/v1/users",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "RegistrationFlow",
          email: "registration@flow.com",
          password: "registrationflow",
        }),
      },
    );

    expect(createUserResponse.status).toBe(201);

    const createUserResponseBody = await createUserResponse.json();

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "RegistrationFlow",
      email: "registration@flow.com",
      password: createUserResponseBody.password,
      features: ["read:activation_token"],
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    });

    const lastEmail = await orchestrator.getLastEmail();

    const activationToken = await orchestrator.getValidToken(lastEmail.text);

    expect(lastEmail.sender).toEqual("<contato@tabracing.com.br>");
    expect(lastEmail.recipients[0]).toEqual("<registration@flow.com>");
    expect(lastEmail.subject).toEqual("Ative seu cadastro no TabRacing");
    expect(lastEmail.text).toContain("RegistrationFlow");
    expect(lastEmail.text).toContain(activationToken.id);
    expect(activationToken.user_id).toEqual(createUserResponseBody.id);
  });

  test("Receive activation email", async () => {});

  test("Activate account", async () => {});

  test("Login", async () => {});

  test("Get user information", async () => {});
});
