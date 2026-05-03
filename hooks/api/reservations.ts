import { apiClient, ApiError } from "@/lib/api";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { SessionLevelEnum, SessionTypeEnum } from "./sessions";
import { PaginatedRequest, PaginatedResult } from "@/lib/paginated";
import { ProductTypeEnum } from "./products";

export enum ReservationStatus {
  WAITING_LIST = "waiting_list",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  ATTENDED = "attended",
  NO_SHOW = "no_show",
}
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
    name: string;
    surname: string | null;
  };
  product: {
    id: string;
    name: string;
  } | null;
  packId: string | null;
  subscriptionId: string | null;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string | null;
}

export interface AggregatedReservationJsonObject {
  id: string;
  sessionId: string;
  userId: string;
  packId: string | null;
  subscriptionId: string | null;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string | null;
  session: {
    id: string;
    type: SessionTypeEnum;
    level: SessionLevelEnum;
    schedule: {
      day: string;
      start: string;
      end: string;
    };
    teacher: {
      id: string;
      name: string;
    } | null;
    room: {
      id: string;
      name: string;
      capacity: number;
    } | null;
  };
  product: {
    id: string;
    name: string;
  } | null;
}

export interface CreateReservationRequest extends Record<string, unknown> {
  sessionId: string;
  userId: string;
  product: {
    id: string;
    type: ProductTypeEnum;
    accumulatedSessionId?: string;
  };
}

export enum ReservationListFilterEnum {
  PAST = "past",
  FUTURE = "future",
  ACCUMULATED = "accumulated",
}

// API functions
const reservationsApi = {
  list: (
    userId: string,
    filter: ReservationListFilterEnum,
    paginationRequest: PaginatedRequest,
  ) => {
    let url = `/users/${userId}/reservations`;
    switch (filter) {
      case ReservationListFilterEnum.PAST:
        url += "/past";
        break;
      case ReservationListFilterEnum.FUTURE:
        url += "/future";
        break;
      case ReservationListFilterEnum.ACCUMULATED:
        url += "/accumulated";
        break;
    }
    const queryParams = new URLSearchParams({
      page: paginationRequest.page.toString(),
      perPage: paginationRequest.perPage.toString(),
    });
    return apiClient.get<PaginatedResult<AggregatedReservationJsonObject>>(
      `${url}?${queryParams.toString()}`,
    );
  },
  listCurrentWeek: (userId: string, subscriptionId: string) => {
    return apiClient.get<PaginatedResult<AggregatedReservationJsonObject>>(
      `/users/${userId}/reservations/current-week?subscriptionId=${subscriptionId}`,
    );
  },
  cancel: (userId: string, reservationId: string) =>
    apiClient.delete<void>(`/users/${userId}/reservations/${reservationId}`),

  createReservation: (data: CreateReservationRequest) => {
    return apiClient.post<Reservation>(
      `/users/${data.userId}/reservations`,
      data,
    );
  },
};

export function useInfiniteUserReservations(
  userId: string | undefined,
  filter: ReservationListFilterEnum,
  perPage: number = 10,
) {
  return useInfiniteQuery({
    queryKey: ["user-reservations-infinite", userId, filter],
    queryFn: ({ pageParam }) =>
      reservationsApi.list(userId!, filter, {
        page: pageParam as number,
        perPage,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.nextPage : undefined,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateReservationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reservationsApi.createReservation,
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ["daily-sessions"] });
      queryClient.invalidateQueries({
        queryKey: ["user-reservations-infinite", userId],
      });
      toast.success("Reserva creada correctament");
    },
    onError: (error: Error) => {
      if (error instanceof ApiError) {
        toast.error(`Error al crear la reserva`, {
          description: error.catalanMessage,
        });
      } else {
        toast.error(`Error al crear la reserva: ${error.message}`);
      }
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      reservationId,
    }: {
      userId: string;
      reservationId: string;
    }) => reservationsApi.cancel(userId, reservationId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({
        queryKey: ["user-reservations-infinite", userId],
      });
      queryClient.invalidateQueries({ queryKey: ["daily-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Reserva cancel·lada correctament");
    },
    onError: (error: Error) => {
      toast.error(`Error al cancel·lar la reserva: ${error.message}`);
    },
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
        `/sessions/${data.sessionId}/attendance`,
        body,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["daily-sessions"] });
      toast.success("Assistència registrada correctament");
    },
    onError: (error: Error) => {
      toast.error(`Error al registrar l'assistència: ${error.message}`, {
        className:
          "bg-destructive text-destructive-foreground border-destructive",
      });
    },
  });
}
