import orchestrator from "tests/orchestrator.js";
import activation from "models/activation.js";
import user from "models/user.js";
beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
  await orchestrator.deleteEmails();
});

describe("Use case: Registration Flow (all successful)", () => {
  let createUserResponseBody;
  let activationToken;
  let createdSessionResponseBody;
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

    createUserResponseBody = await createUserResponse.json();

    expect(createUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "RegistrationFlow",
      email: "registration@flow.com",
      password: createUserResponseBody.password,
      features: ["read:activation_token"],
      created_at: createUserResponseBody.created_at,
      updated_at: createUserResponseBody.updated_at,
    });
  });

  test("Receive activation email", async () => {
    const lastEmail = await orchestrator.getLastEmail();

    activationToken = await orchestrator.getValidToken(lastEmail.text);

    expect(lastEmail.sender).toEqual("<contato@tabracing.com.br>");
    expect(lastEmail.recipients[0]).toEqual("<registration@flow.com>");
    expect(lastEmail.subject).toEqual("Ative seu cadastro no TabRacing");
    expect(lastEmail.text).toContain("RegistrationFlow");
    expect(lastEmail.text).toContain(activationToken.id);
    expect(activationToken.user_id).toEqual(createUserResponseBody.id);
  });

  test("Activate account", async () => {
    const activationResponse = await fetch(
      `http://localhost:3000/api/v1/activations/${activationToken.id}`,
      {
        method: "PATCH",
      },
    );

    expect(activationResponse.status).toBe(200);

    const activationResponseBody = await activationResponse.json();

    expect(Date.parse(activationResponseBody.used_at)).not.toBeNaN();
    const activatedUser = await user.findOneByUsername("RegistrationFlow");
    expect(activatedUser.features).toEqual(["create:session", "read:session"]);
  });

  test("Login", async () => {
    const createSessionResponse = await fetch(
      "http://localhost:3000/api/v1/sessions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "registration@flow.com",
          password: "registrationflow",
        }),
      },
    );

    expect(createSessionResponse.status).toBe(201);

    createdSessionResponseBody = await createSessionResponse.json();
    expect(createdSessionResponseBody.user_id).toEqual(
      createUserResponseBody.id,
    );
  });

  test("Get user information", async () => {
    const getUserResponse = await fetch("http://localhost:3000/api/v1/user", {
      method: "GET",
      headers: {
        Cookie: `session_id=${createdSessionResponseBody.token}`,
      },
    });

    expect(getUserResponse.status).toBe(200);

    const getUserResponseBody = await getUserResponse.json();

    expect(getUserResponseBody).toEqual({
      id: createUserResponseBody.id,
      username: "RegistrationFlow",
      email: getUserResponseBody.email,
      password: createUserResponseBody.password,
      features: ["create:session", "read:session"],
      created_at: getUserResponseBody.created_at,
      updated_at: getUserResponseBody.updated_at,
    });
  });
});
