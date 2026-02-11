import type { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error("Error:", err.message);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
        message: err.message|| 'Internal Server Error',
        // Optionally include stack trace in development mode
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
}
