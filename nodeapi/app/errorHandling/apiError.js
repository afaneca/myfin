class APIError {
    constructor(code, message) {
        this.code = code
        this.message = message
    }

    static badRequest(msg) {
        return new APIError(400, msg);
    }

    static notAuthorized(msg) {
        return new APIError(401, msg);
    }

    static forbidden(msg) {
        return new APIError(403, msg);
    }

    static notFound(msg) {
        return new APIError(404, msg);
    }

    static notAcceptable(msg) {
        return new APIError(406, msg);
    }

    static internalServerError(msg) {
        return new APIError(500);
    }
}

module.exports = APIError