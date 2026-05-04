import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback = "Não foi possível concluir a operação") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;

    return data?.message || data?.error || error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}