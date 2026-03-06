import user from "models/user.js";
import password from "models/password.js";
import { UnprocessableEntity, UnauthorizedError } from "infra/errors.js";

async function createSession(userInput) {
  const userInDb = await user.findOneByEmail(userInput.email);

  if (userInDb === null) {
    throw new UnauthorizedError({
      message: "Email ou senha incorretos",
      action: "Verifique suas credenciais e tente novamente",
    });
  }

  const passwordMatch = await password.compare(
    userInput.password,
    userInDb.password,
  );

  if (!passwordMatch) {
    throw new UnauthorizedError({
      message: "Email ou senha incorretos",
      action: "Verifique suas credenciais e tente novamente",
    });
  }
}

const session = {
  createSession,
};

export default session;
