import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
const router = createRouter();

router.get(getHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userReturned = await user.findOneByUsername(request.query.username);

  return response.status(200).json(userReturned);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const userInputValues = request.body;

  const updatedUser = await user.update(username, userInputValues);
  return response.status(200).json(updatedUser);
}
