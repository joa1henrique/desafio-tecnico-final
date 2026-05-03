export class ApiError extends Error {
  statusCode: number;
  error: string;
  details?: unknown;

  constructor(
    statusCode: number,
    message: string,
    error: string,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;
  }
}
