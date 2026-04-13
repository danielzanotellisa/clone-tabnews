import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import activation from "models/activation.js";
const router = createRouter();

router.use(controller.injectAnonymousOrUser);
router.get(controller.canRequest("read:activation_token"), patchHandler);
router.patch(patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const activationToken = request.query.token_id;

  const validACtivationToken =
    await activation.findOneValidById(activationToken);
  await activation.activateUserByUserId(validACtivationToken.user_id);
  const usedActivationToken = await activation.markAsUsed(activationToken);

  return response.status(200).json(usedActivationToken);
}
