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

  const setCookie = cookie.serialize("session_id", createdSession.token, {
    path: "/",
    httpOnly: true,
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  response.setHeader("Set-Cookie", setCookie);

  return response.status(201).json(createdSession);
}
