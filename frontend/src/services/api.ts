import axios from "axios";
import { getAuthToken, clearAuthSession } from "@/utils/storage";

//definiçao da url base da api extraida das variaveis de ambiente
const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3000";

//instancia configurada do axios para chamadas a api
export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

//configuraçao do token bearer em todas as requisiçoes de saida
api.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

//tratamento global de erros de resposta (como 401 unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    //se a api retornar 401, limpamos o token local e mandamos para o login
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearAuthSession();
      //redirecionamento forçado para garantir que o estado do app seja resetado
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);