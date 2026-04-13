import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import session from "models/session.js";
import authorization from "models/authorization";

const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:session"), getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const sessionToken = request.cookies.session_id;

  const sessionOjbect = await session.findOneValidByToken(sessionToken);
  const userFound = await user.findOneById(sessionOjbect.user_id);

  const renewedSession = await session.renew(sessionOjbect.id);

  controller.setSessionCookie(response, renewedSession.token);

  response.setHeader(
    "Cache-Control",
    "no-store, no-cache, max-age=0, must-revalidate",
  );

  return response.status(200).json(userFound);
}
