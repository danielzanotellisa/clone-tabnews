import user from "models/user.js";
import password from "models/password.js";
import { UnauthorizedError, UserNotFound } from "infra/errors.js";

async function getAuthenticatedUser(providedEmail, providedPassword) {
  try {
    const storedUser = await findUserByEmail(providedEmail);

    await validatePassword(providedPassword, storedUser.password);

    return storedUser;
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError({
        message: "Email ou senha incorretos",
        action: "Verifique suas credenciais e tente novamente",
      });
    }

    throw error;
  }

  async function findUserByEmail(providedEmail) {
    try {
      const storedUser = await user.findOneByEmail(providedEmail);
      return storedUser;
    } catch (error) {
      if (error instanceof UserNotFound) {
        throw new UnauthorizedError({
          message: "Email não encontrado",
          action: "Verifique suas credenciais e tente novamente",
        });
      }

      throw error;
    }
  }
}

async function validatePassword(providedPassword, storedPassword) {
  const passwordMatch = await password.compare(
    providedPassword,
    storedPassword,
  );

  if (!passwordMatch) {
    throw new UnauthorizedError({
      message: "Email ou senha incorretos",
      action: "Verifique suas credenciais e tente novamente",
    });
  }
}

const authentication = {
  getAuthenticatedUser,
};

export default authentication;
