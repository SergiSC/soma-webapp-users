import { apiClient } from "@/lib/api";
import { SubscriptionAggregate } from "@/lib/entities/subscription";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// API functions
const subscriptionsApi = {
  cancel: (userId: string, subscriptionId: string) =>
    apiClient.delete<void>(`/users/${userId}/subscriptions/${subscriptionId}`),
  get: (userId: string, subscriptionId: string) =>
    apiClient.get<SubscriptionAggregate>(
      `/users/${userId}/subscriptions/${subscriptionId}`,
    ),
  change: (userId: string, subscriptionId: string, productId: string) =>
    apiClient.patch<void>(
      `/users/${userId}/subscriptions/${subscriptionId}/product/${productId}`,
    ),
};

// React Query hooks
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      subscriptionId,
    }: {
      userId: string;
      subscriptionId: string;
    }) => subscriptionsApi.cancel(userId, subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Subscripció cancel·lada correctament");
    },
    onError: (error: Error) => {
      toast.error(`Error al cancel·lar la subscripció: ${error.message}`);
    },
  });
}

export function useChangeSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      subscriptionId,
      productId,
    }: {
      userId: string;
      subscriptionId: string;
      productId: string;
    }) => subscriptionsApi.change(userId, subscriptionId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Subscripció modificada correctament");
    },
    onError: (error: Error) => {
      toast.error(`Error al modificar la subscripció: ${error.message}`);
    },
  });
}

export function useSubscriptionAggregate(
  userId?: string,
  subscriptionId?: string,
) {
  return useQuery({
    queryKey: ["subscription", userId, subscriptionId],
    queryFn: () => subscriptionsApi.get(userId!, subscriptionId!),
    enabled: !!userId && !!subscriptionId,
  });
}
