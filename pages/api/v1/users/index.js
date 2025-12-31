import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";
import { UnprocessableEntity } from "infra/errors";
const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  validateUserRequest(request.body);

  const userCreated = await user.create(request.body);

  return response.status(201).json(userCreated);
}

function validateUserRequest(request) {
  if (!request.username || !request.email || !request.password) {
    throw new UnprocessableEntity({
      cause: "Fields may be missing",
      message:
        "Campos obrigatórios precisam ser preenchidos: nome de usuário, e-mail e senha",
      action: "Preencha corretamente os campos",
    });
  }
}
