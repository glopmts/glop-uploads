import { QueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api";

// Função para pré-carregar os dados
export const prefetchFolders = async (queryClient: QueryClient, userId: string) => {
  if (!userId) return;
  
  await queryClient.prefetchQuery({
    queryKey: ["folders", userId],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE_URL}/files/userFolders/${userId}`);
      return data.data.folders || [];
    }
  });
};

export default function useFoldersQuery(userId: string) {
  return useQuery({
    queryKey: ["folders", userId],
    queryFn: async () => {
      if (!userId) throw new Error("ID do usuário inválido");
      const { data } = await axios.get(`${API_BASE_URL}/files/userFolders/${userId}`);
      return data.data.folders || []; 
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}
