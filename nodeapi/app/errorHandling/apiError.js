class APIError {
    constructor(code, message) {
        this.code = code
        this.message = message
    }

    static badRequest(msg) {
        return new APIError(400, msg);
    }

    static notAuthorized(msg) {
        return new APIError(401, msg || "The owner of this request is not authorized to do so.");
    }

    static forbidden(msg) {
        return new APIError(403, msg || "The owner of this request is not authorized to do so.");
    }

    static notFound(msg) {
        return new APIError(404, msg || "The requested resource could not be found.");
    }

    static notAcceptable(msg) {
        return new APIError(406, msg);
    }

    static internalServerError(msg) {
        return new APIError(500);
    }
}

module.exports = APIError