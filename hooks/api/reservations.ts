import { apiClient } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SessionTypeEnum } from "./sessions";
import { ProductTypeEnum, ReservationStatus } from "./user-information";

export interface Reservation {
  id: string;
  session: {
    id: string;
    type: SessionTypeEnum | null;
    schedule: {
      day: string;
      start: string;
      end: string;
    } | null;
  };
  user: {
    id: string;
    name: string | null;
    surname: string | null;
  };
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string | null;
  product: {
    id: string;
    name: string;
  } | null;
  packId: string | null;
  subscriptionId: string | null;
}

export interface CreateReservationFromSubscriptionRequest
  extends Record<string, unknown> {
  sessionId: string;
  userId: string;
  subscriptionId: string;
}

export interface CreateReservationFromPackRequest
  extends Record<string, unknown> {
  sessionId: string;
  userId: string;
  packId: string;
}

export interface CreateReservationFromComboSubscriptionRequest
  extends Record<string, unknown> {
  sessionId: string;
  userId: string;
  subscriptionId: string;
}

export interface CanMakeReservationResponse {
  canMakeReservation: boolean;
  isRoomAtFullCapacity: boolean;
  reasonCannotMakeReservation?: string;
  product: {
    id: string;
    type: ProductTypeEnum;
  };
  waitingListAmount?: number;
}

export interface CanMakeReservationRequest {
  userId: string;
  sessionId: string;
}

// API functions
const reservationsApi = {
  createFromSubscription: (data: CreateReservationFromSubscriptionRequest) =>
    apiClient.post<Reservation>("/reservations/from-subscription", data),

  createFromPack: (data: CreateReservationFromPackRequest) =>
    apiClient.post<Reservation>("/reservations/from-pack", data),

  createFromComboSubscription: (
    data: CreateReservationFromComboSubscriptionRequest
  ) =>
    apiClient.post<Reservation>("/reservations/from-combo-subscription", data),

  cancel: (reservationId: string) =>
    apiClient.delete<void>(`/reservations/${reservationId}`),

  canMakeReservation: (params: CanMakeReservationRequest) => {
    const queryParams = new URLSearchParams({
      userId: params.userId,
      sessionId: params.sessionId,
    });
    return apiClient.get<CanMakeReservationResponse>(
      `/reservations/can-make-reservation?${queryParams.toString()}`
    );
  },
};

// React Query hooks
export function useCreateReservationFromSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reservationsApi.createFromSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-information"] });
      queryClient.invalidateQueries({ queryKey: ["daily-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Reserva creada correctament");
    },
    onError: (error: Error) => {
      toast.error(`Error al crear la reserva: ${error.message}`);
    },
  });
}

export function useCreateReservationFromPack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reservationsApi.createFromPack,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-information"] });
      queryClient.invalidateQueries({ queryKey: ["daily-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Reserva creada correctament");
    },
    onError: (error: Error) => {
      toast.error(`Error al crear la reserva: ${error.message}`);
    },
  });
}

export function useCreateReservationFromComboSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reservationsApi.createFromComboSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-information"] });
      queryClient.invalidateQueries({ queryKey: ["daily-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Reserva creada correctament");
    },
    onError: (error: Error) => {
      toast.error(`Error al crear la reserva: ${error.message}`);
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reservationsApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-information"] });
      queryClient.invalidateQueries({ queryKey: ["daily-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Reserva cancel·lada correctament");
    },
    onError: (error: Error) => {
      toast.error(`Error al cancel·lar la reserva: ${error.message}`);
    },
  });
}

export function useCanMakeReservation(
  userId: string | undefined,
  sessionId: string | undefined
) {
  return useQuery({
    queryKey: ["can-make-reservation", userId, sessionId],
    queryFn: () =>
      reservationsApi.canMakeReservation({
        userId: userId!,
        sessionId: sessionId!,
      }),
    enabled: !!userId && !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export interface TakeAttendanceRequest {
  sessionId: string;
  attendeeUserIds: string[];
  notAttendedUserIds: string[];
}

export interface TakeAttendanceResponse {
  sessionId: string;
  attendedReservations: number;
  noShowReservations: number;
}

export function useTakeAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TakeAttendanceRequest) => {
      const body: Record<string, unknown> = {
        sessionId: data.sessionId,
        attendeeUserIds: data.attendeeUserIds,
        notAttendedUserIds: data.notAttendedUserIds,
      };
      return apiClient.post<TakeAttendanceResponse>(
        "/reservations/attendance",
        body
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["daily-sessions"] });
      toast.success("Assistència registrada correctament");
    },
    onError: (error: Error) => {
      toast.error(`Error al registrar l'assistència: ${error.message}`);
    },
  });
}
