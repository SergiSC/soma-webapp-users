import { apiClient } from "@/lib/api";
import { SubscriptionAggregate } from "@/lib/entities/subscription";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// API functions
const subscriptionsApi = {
  cancel: (subscriptionId: string) =>
    apiClient.delete<void>(`/subscriptions/${subscriptionId}`),

  get: (subscriptionId: string) =>
    apiClient.get<SubscriptionAggregate>(`/subscriptions/${subscriptionId}`),
  change: (subscriptionId: string, productId: string) =>
    apiClient.patch<void>(
      `/subscriptions/${subscriptionId}/product/${productId}`,
    ),
};

// React Query hooks
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionsApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-information"] });
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
      subscriptionId,
      productId,
    }: {
      subscriptionId: string;
      productId: string;
    }) => subscriptionsApi.change(subscriptionId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-information"] });
      toast.success("Subscripció modificada correctament");
    },
    onError: (error: Error) => {
      toast.error(`Error al modificar la subscripció: ${error.message}`);
    },
  });
}

export function useSubscriptionAggregate(subscriptionId?: string) {
  return useQuery({
    queryKey: ["subscription", subscriptionId],
    queryFn: () => subscriptionsApi.get(subscriptionId ?? ""),
    enabled: !!subscriptionId,
  });
}
