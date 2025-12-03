import { apiClient } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// API functions
const subscriptionsApi = {
  cancel: (subscriptionId: string) =>
    apiClient.delete<void>(`/subscriptions/${subscriptionId}`),
  deleteCanceled: (subscriptionId: string) =>
    apiClient.delete<void>(
      `/subscriptions/${subscriptionId}/already-cancelled`
    ),
  payOnDemand: (subscriptionId: string) =>
    apiClient.post<void>(`/subscriptions/${subscriptionId}/pay-on-demand`),
  change: (subscriptionId: string, productId: string) =>
    apiClient.patch<void>(
      `/subscriptions/${subscriptionId}/product/${productId}`
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

export function useDeleteCanceledSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionsApi.deleteCanceled,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-information"] });
      toast.success("Subscripció eliminada correctament");
    },
  });
}

// TODO: This is not implemented yet
export function usePayOnDemandSubscription() {
  return useMutation({
    mutationFn: subscriptionsApi.payOnDemand,
    onSuccess: () => {
      toast.success("Subscripció renovada correctament");
    },
    onError: (error: Error) => {
      toast.error(`Error al renovar la subscripció: ${error.message}`);
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
