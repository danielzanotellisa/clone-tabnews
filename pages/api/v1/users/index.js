import { createRouter } from "next-connect";
import controller from "infra/controller";
import user from "models/user.js";
const router = createRouter();

router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  if (!validateUserRequest(request.body)) {
    return response.status(422).json({ message: "invalid request" });
  }

  const userCreated = await user.create(request.body);

  return response.status(201).json(userCreated);
}

function validateUserRequest(request) {
  if (!request.username || !request.email || !request.password) {
    return false;
  }

  return true;
}
