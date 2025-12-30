import {
  InternalServerError,
  MethodNotAllowed,
  ValidationError,
} from "infra/errors.js";
function onNoMatchHandler(request, response) {
  const error = new MethodNotAllowed();
  return response.status(error.statusCode).json(error);
}

function onErrorHandler(error, request, response) {
  if (error instanceof ValidationError) {
    return response.status(error.statusCode).json(error);
  }

  const publicErrorObj = new InternalServerError({
    cause: error,
    statusCode: error.statusCode,
  });
  console.error(publicErrorObj);
  response.status(publicErrorObj.statusCode).json(publicErrorObj);
}

const controller = {
  errorHandlers: {
    onError: onErrorHandler,
    onNoMatch: onNoMatchHandler,
  },
};

export default controller;
