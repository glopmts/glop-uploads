import { useQuery } from "@tanstack/react-query";
import { itemUploadsUser } from "./items-uploads";

export default function UserItemsQuery(userId: string) {
  return useQuery({
    queryKey: ["itemsFiles", userId],
    queryFn: async () => {
      if (!userId) throw new Error("ID do usuário inválido");
      const data = await itemUploadsUser.getUploads(userId);
      return data.data.items || [];
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}
