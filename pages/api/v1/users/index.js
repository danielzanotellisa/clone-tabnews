import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import activation from "models/activation.js";
import { UnprocessableEntity } from "infra/errors.js";
const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:user"), postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  validateUserRequest(request.body);
  const userCreated = await user.create(request.body);

  const activationToken = await activation.create(userCreated.id);
  await activation.sendEmailToUser(userCreated, activationToken);
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
