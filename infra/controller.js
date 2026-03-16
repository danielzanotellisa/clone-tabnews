import {
  InternalServerError,
  MethodNotAllowed,
  UnprocessableEntity,
  ValidationError,
  UserNotFound,
  UnauthorizedError,
} from "infra/errors.js";
import session from "models/session.js";
import * as cookie from "cookie";

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

  if (error instanceof UserNotFound) {
    return response.status(error.statusCode).json(error);
  }

  if (error instanceof UnauthorizedError) {
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
    sameSite: "strict",
  });
  response.setHeader("Set-Cookie", setCookie);
}

const controller = {
  errorHandlers: {
    onError: onErrorHandler,
    onNoMatch: onNoMatchHandler,
  },
  setSessionCookie,
};

export default controller;
