export class InternalServerError extends Error {
  constructor({ cause, statusCode }) {
    super("Erro interno inesperado", {
      cause,
    });
    this.name = "InternalServerError";
    this.action = "Entre em contato com o suporte.";
    this.statusCode = statusCode || 500;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class MethodNotAllowed extends Error {
  constructor() {
    super("Método não disponível para este endpoint");
    this.name = "MethodNotAllowed";
    this.action = "Utilize um método válido";
    this.statusCode = 405;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class UnprocessableEntity extends Error {
  constructor({ action, message, cause }) {
    super(message || "Request inválida", {
      cause,
    });
    ((this.name = "Unprocessable Entity"),
      (this.action = action || "Valide os dados"),
      (this.statusCode = 422));
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ValidationError extends Error {
  constructor({ cause, action, message }) {
    super(message || "Erro de validação", {
      cause,
    });
    ((this.name = "Validation Error"),
      (this.action = action || "Valide os dados"),
      (this.statusCode = 400));
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class UserNotFound extends Error {
  constructor({ cause, action, message }) {
    super(message || "Erro ao tentar encontrar usuário", {
      cause,
    });
    ((this.name = "UserNotFound"),
      (this.action = action || "Informe um usuário válido"),
      (this.statusCode = 404));
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}

export class ServiceError extends Error {
  constructor({ cause, message }) {
    super(message || "Serviço indisponível no momento", {
      cause,
    });
    this.name = "Service error";
    this.action = "Entre em contato com o suporte.";
    this.statusCode = 503;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    };
  }
}
