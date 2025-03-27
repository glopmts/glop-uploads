import { useQuery } from "@tanstack/react-query";
import { api_url } from "../lib/api_url";
import { token_api } from "../lib/token-api";

export default function UseFolders(userId: string) {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["folders", userId],
    queryFn: async () => {
      if (!userId) throw new Error("ID do usuário inválido");
      
      const result = await window.api.fetchData(`${api_url}/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token_api}`,
        },
      });

      if (result.error) {
        throw new Error(result.error);
      }

      return result.data;
    }
  });

  return { data, error, isLoading, refetch };
}