import {
  InternalServerError,
  MethodNotAllowed,
  UnprocessableEntity,
  ValidationError,
  UserNotFound,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} from "infra/errors.js";
import session from "models/session.js";
import * as cookie from "cookie";
import user from "models/user.js";

function onNoMatchHandler(request, response) {
  const error = new MethodNotAllowed();
  return response.status(error.statusCode).json(error);
}

function onErrorHandler(error, request, response) {
  if (error instanceof ValidationError) {
    return response.status(error.statusCode).json(error);
  }

  if (error instanceof UnprocessableEntity) {
    return response.status(error.statusCode).json(error);
  }

  if (error instanceof NotFoundError) {
    return response.status(error.statusCode).json(error);
  }

  if (error instanceof UserNotFound) {
    return response.status(error.statusCode).json(error);
  }

  if (error instanceof UnauthorizedError) {
    clearSessionCookie(response);
    return response.status(error.statusCode).json(error);
  }
  if (error instanceof ForbiddenError) {
    return response.status(error.statusCode).json(error);
  }

  const publicErrorObj = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
  });
  console.error(publicErrorObj);
  response.status(publicErrorObj.statusCode).json(publicErrorObj);
}

function setSessionCookie(response, sessionToken) {
  const setCookie = cookie.serialize("session_id", sessionToken, {
    path: "/",
    httpOnly: true,
    maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
    secure: process.env.NODE_ENV === "production",
  });
  response.setHeader("Set-Cookie", setCookie);
}

function clearSessionCookie(response) {
  const setCookie = cookie.serialize("session_id", "invalid", {
    path: "/",
    httpOnly: true,
    maxAge: -1,
    secure: process.env.NODE_ENV === "production",
  });

  response.setHeader("Set-Cookie", setCookie);
}

async function injectAnonymousOrUser(request, response, next) {
  if (request.cookies?.session_id) {
    await injectAuthenticatedUser(request);
    return next();
  }

  injectAnonymousUser(request);

  return next();
}

async function injectAuthenticatedUser(request) {
  const sessionToken = request.cookies.session_id;

  const sessionObj = await session.findOneValidByToken(sessionToken);
  const authenticatedUser = await user.findOneById(sessionObj.user_id);

  request.context = {
    ...request.context,
    user: authenticatedUser,
  };
}

function injectAnonymousUser(request) {
  const anonymousUserObject = {
    features: ["read:activation_token", "create:session", "create:user"],
  };
  request.context = {
    ...request.context,
    user: anonymousUserObject,
  };
}

function canRequest(feature) {
  return function canRequestMiddleware(request, response, next) {
    const userTryingToRequest = request.context.user;

    if (userTryingToRequest.features.includes(feature)) {
      return next();
    }
    throw new ForbiddenError({
      message: "Você não possui permissão para executar essa ação",
      action: `Verifique se o seu usuário possui a feature ${feature}.`,
    });
  };
}

const controller = {
  errorHandlers: {
    onError: onErrorHandler,
    onNoMatch: onNoMatchHandler,
  },
  setSessionCookie,
  clearSessionCookie,
  injectAnonymousOrUser,
  canRequest,
};

export default controller;
