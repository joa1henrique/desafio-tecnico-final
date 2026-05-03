const statusTextByCode: Record<number, string> = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  500: "Internal Server Error",
};

export const getStatusText = (statusCode: number) =>
  statusTextByCode[statusCode] ?? "Error";
