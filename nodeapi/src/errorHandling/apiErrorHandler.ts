import APIError from "./apiError.js";
import { NextFunction, Request, Response } from "express";

// eslint-disable-next-line no-unused-vars
export default function apiErrorHandler(err: { message: string, code: string } | undefined, req: Request, res: Response, next: NextFunction) {
  const errorMessage = err.message ? err.message : "Something went wrong.";

  if (err instanceof APIError) {
    res.status(err.code).json({
      message: errorMessage
    });
    return;
  }

  res.status(500).json({
    message: errorMessage
  });
}
