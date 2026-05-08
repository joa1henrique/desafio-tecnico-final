import axios from "axios";
import { getAuthToken } from "@/utils/storage";

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