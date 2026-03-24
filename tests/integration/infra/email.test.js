import email from "infra/email.js";
import orchestrator from "tests/orchestrator.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("infra/email.js", () => {
  test("send", async () => {
    await orchestrator.deleteEmails();

    await email.send({
      from: "TabRacing <contato@tabracing.com.br>",
      to: "contato@curso.dev",
      subject: "teste de assunto",
      text: "testando um corpo só de texto",
    });

    await email.send({
      from: "TabRacing <contato@tabracing.com.br>",
      to: "contato@curso.dev",
      subject: "ultimo email enviado",
      text: "ultimo email enviado",
    });

    const lastEmail = await orchestrator.getLastEmail();

    expect(lastEmail.sender).toEqual("<contato@tabracing.com.br>");
    expect(lastEmail.recipients[0]).toEqual("<contato@curso.dev>");
    expect(lastEmail.subject).toEqual("ultimo email enviado");
    expect(lastEmail.text).toEqual("ultimo email enviado\n");
  });
});
