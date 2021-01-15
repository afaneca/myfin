const APIError = require("./apiError");

function apiErrorHandler(err, req, res, next) {
    const errorMessage = (err.message) ? err.message : "Something went wrong.";

    if (err instanceof APIError) {
        res.status(err.code).json({
            message: errorMessage
        });
        return;
    }

    res.status(500).json({
        message: errorMessage
    })
}

module.exports = apiErrorHandler;