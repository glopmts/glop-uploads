import { API_BASE_URL } from "@renderer/lib/api_url";
import axios from "axios";
import { useAuth } from "../renderer/src/hooks/useAuth";
import { authService } from "./auth";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Adiciona o token de autenticação às requisições
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Trata erros de autenticação
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Se o erro for 401 (não autorizado) e não for uma tentativa de refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token");

        const { token, refreshToken: newRefreshToken } =
          await authService.refreshToken(refreshToken);

        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", newRefreshToken);

        // Atualiza o header de autorização e repete a requisição
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch {
        // Se o refresh falhar, desloga o usuário
        const { logout } = useAuth();
        logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
