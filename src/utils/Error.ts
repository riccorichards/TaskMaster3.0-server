const STATUS_CODE = {
  OK: 200,
  BAD_REQUEST: 400,
  UN_AUTHORISED: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

export class BaseError extends Error {
  statusCode: number;
  constructor(name: string, statusCode: number, description: string) {
    super(description);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this);
  }
}

export class ApiError extends BaseError {
  constructor(description = "api error") {
    super("api internal server error", STATUS_CODE.INTERNAL_ERROR, description);
  }
}
export class BadRequestError extends BaseError {
  constructor(description = "bad request") {
    super("bad request", STATUS_CODE.BAD_REQUEST, description);
  }
}
export class AuthorisedError extends BaseError {
  constructor(description = "wrong credentials") {
    super("access denied", STATUS_CODE.UN_AUTHORISED, description);
  }
}
export class NotFoundError extends BaseError {
  constructor(description = "not found") {
    super("not found", STATUS_CODE.NOT_FOUND, description);
  }
}
