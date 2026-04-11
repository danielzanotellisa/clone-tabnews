import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import authentication from "models/authentication.js";
import session from "models/session.js";
const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:session"), postHandler);
router.delete(deleteHandler);

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

async function deleteHandler(request, response) {
  const sessionToken = request.cookies.session_id;

  const sessionObj = await session.findOneValidByToken(sessionToken);

  const expiredSession = await session.expireById(sessionObj.id);

  controller.clearSessionCookie(response);

  return response.status(200).json(expiredSession);
}
