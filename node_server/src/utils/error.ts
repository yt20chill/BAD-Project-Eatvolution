export class ApplicationError extends Error {
  constructor(
    public httpStatus: number,
    public message: string
  ) {
    super(message);
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }
}

export class BadRequestError extends ApplicationError {
  constructor(public message: string = "bad request") {
    super(400, message);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(public message: string = "unauthorized") {
    super(401, message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
export class ForbiddenError extends ApplicationError {
  constructor(public message: string = "forbidden") {
    super(403, message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
export class NotFoundError extends ApplicationError {
  constructor(public message: string = "not found") {
    super(404, message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class InternalServerError extends ApplicationError {
  constructor(public message: string = "internal server error") {
    super(500, message);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}
