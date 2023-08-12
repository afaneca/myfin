export default class APIError extends Error {
  code: number;

  message: string;

  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.message = message;
  }

  static badRequest(msg = "Unknown error") {
    return new APIError(400, msg);
  }

  static notAuthorized(msg = "The owner of this request is not authorized to do so.") {
    return new APIError(401, msg);
  }

  static forbidden(msg = "The owner of this request is not authorized to do so.") {
    return new APIError(403, msg);
  }

  static notFound(msg = "The requested resource could not be found.") {
    return new APIError(404, msg);
  }

  static notAcceptable(msg = "The request is not acceptable.") {
    return new APIError(406, msg);
  }

  static internalServerError(msg = "Unknown error") {
    return new APIError(500, msg);
  }
}
