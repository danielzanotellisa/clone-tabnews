import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import password from "models/password.js";
import session from "models/session.js";
import { UnprocessableEntity, UnauthorizedError } from "infra/errors.js";
const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInput = request.body;

  await session.createSession(userInput);

  return response.status(200).json({});
}
