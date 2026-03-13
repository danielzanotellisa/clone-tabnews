import { createRouter } from "next-connect";
import * as cookie from "cookie";
import controller from "infra/controller.js";
import authentication from "models/authentication.js";
import session from "models/session.js";
const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInput = request.body;

  const authenticatedUser = await authentication.getAuthenticatedUser(
    userInput?.email,
    userInput?.password,
  );

  const createdSession = await session.create(authenticatedUser.id);

  controller.setSessionCookie(response, createdSession.token);

  return response.status(201).json(createdSession);
}
