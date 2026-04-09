import { apiClient } from "@/lib/api";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
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

export interface CreateReservationFromSubscriptionRequest extends Record<
  string,
  unknown
> {
  sessionId: string;
  userId: string;
  subscriptionId: string;
}

export interface CreateReservationFromPackRequest extends Record<
  string,
  unknown
> {
  sessionId: string;
  userId: string;
  packId: string;
}

export interface CreateReservationFromComboSubscriptionRequest extends Record<
  string,
  unknown
> {
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

export enum ReservationListFilterEnum {
  PAST = "past",
  FUTURE = "future",
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
  cancel: (reservationId: string) =>
    apiClient.delete<void>(`/reservations/${reservationId}`),

  canMakeReservation: (params: CanMakeReservationRequest) => {
    const queryParams = new URLSearchParams({
      userId: params.userId,
      sessionId: params.sessionId,
    });
    return apiClient.get<CanMakeReservationResponse>(
      `/reservations/can-make-reservation?${queryParams.toString()}`,
    );
  },
};

// React Query hooks
export function useUserReservations(
  userId: string | undefined,
  filter: ReservationListFilterEnum,
  paginationRequest: PaginatedRequest = {
    page: 1,
    perPage: 10,
  },
) {
  return useQuery({
    queryKey: ["user-reservations", userId, filter],
    queryFn: () => reservationsApi.list(userId!, filter, paginationRequest),
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserCurrentWeekReservations(
  userId: string | undefined,
  subscriptionId: string | undefined,
) {
  return useQuery({
    queryKey: ["user-current-week-reservations", userId, subscriptionId],
    queryFn: () => reservationsApi.listCurrentWeek(userId!, subscriptionId!),
    enabled: !!userId && !!subscriptionId,
  });
}

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
        body,
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
