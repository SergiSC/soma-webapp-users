import { apiClient } from "@/lib/api";
import { ProductRecurring } from "./products";
import { useQuery } from "@tanstack/react-query";

const packsApi = {
  listUserPacks: (userId: string) =>
    apiClient.get<PackObject[]>(`/users/${userId}/packs`),
};

export interface PackObject {
  id: string;
  product: {
    id: string;
    name: string;
    recurring: ProductRecurring;
  };
  userId: string;
  createdAt: string;
  reservations: {
    confirmedReservations: number;
    noShowReservations: number;
    attendedReservations: number;
  };
}

export function useListUserPacks(userId?: string) {
  return useQuery({
    queryKey: ["packs", userId],
    queryFn: () => packsApi.listUserPacks(userId!),
    enabled: !!userId,
  });
}
