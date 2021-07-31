import APIError from './apiError.js';

// eslint-disable-next-line no-unused-vars
export default function apiErrorHandler(err, req, res, next) {
  const errorMessage = (err.message) ? err.message : 'Something went wrong.';

  if (err instanceof APIError) {
    res.status(err.code)
      .json({
        message: errorMessage,
      });
    return;
  }

  res.status(500)
    .json({
      message: errorMessage,
    });
}
