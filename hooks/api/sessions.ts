import { apiClient } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Reservation } from "./reservations";

export enum SessionTypeEnum {
  PILATES_REFORMER = "reformer",
  PILATES_REFORMER_PRE_NATAL = "reformer_pre_natal",
  PILATES_MAT = "pilates_mat",
  BARRE = "barre",
  FIT_MIX = "fit_mix",
  PILATES_MAT_PLUS_65 = "pilates_mat_plus_65",
  FIT_MIX_PLUS_65 = "fit_mix_plus_65",
}

export enum SessionStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export enum SessionLevelEnum {
  NORMAL = "normal",
  ADVANCED = "advanced",
}

export enum WeekDayEnum {
  MONDAY = "monday",
  TUESDAY = "tuesday",
  WEDNESDAY = "wednesday",
  THURSDAY = "thursday",
  FRIDAY = "friday",
  SATURDAY = "saturday",
  SUNDAY = "sunday",
}

// Event types
export interface Session {
  id: string;
  type: SessionTypeEnum;
  status: SessionStatus;
  day: string;
  startHour: string;
  endHour: string;
  roomId: string | null;
  teacherId: string | null;
  observations: string | null;
  createdAt: Date;
  updatedAt: Date | null;
}

// Session detail response from API
export interface SessionDetail {
  id: string;
  type: SessionTypeEnum;
  level: SessionLevelEnum;
  isFree: boolean;
  status: SessionStatus;
  day: string;
  weekDay: WeekDayEnum;
  startHour: string;
  endHour: string;
  room: {
    id: string;
    name: string;
    capacity: number;
  } | null;
  teacher: {
    id: string;
    name: string;
    surname: string;
  } | null;
  observations: string | null;
  publicationAt: string;
  createdAt: string;
  updatedAt: string | null;
  reservations: Reservation[];
}

export interface CreateSessionRequest extends Record<string, unknown> {
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  color?: string;
  description?: string;
}

export interface UpdateSessionRequest extends Partial<CreateSessionRequest> {
  id: string;
}

export interface SessionFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
}

// API functions
const sessionsApi = {
  getAll: (filters?: SessionFilters) => {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.userId) params.append("userId", filters.userId);

    const queryString = params.toString();
    return apiClient.get<Session[]>(
      `/sessions${queryString ? `?${queryString}` : ""}`,
    );
  },

  getById: (id: string) => apiClient.get<SessionDetail>(`/sessions/${id}`),

  create: (data: CreateSessionRequest) =>
    apiClient.post<Session>("/sessions", data),

  update: (data: UpdateSessionRequest) =>
    apiClient.patch<Session>(`/sessions/${data.id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/sessions/${id}`),
};

// React Query hooks
export function useSessions(filters?: SessionFilters) {
  return useQuery({
    queryKey: ["sessions", filters],
    queryFn: () => sessionsApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ["sessions", id],
    queryFn: () => sessionsApi.getById(id),
    enabled: !!id,
  });
}

export function useSession(id: string | undefined) {
  return useQuery({
    queryKey: ["sessions", id],
    queryFn: () => sessionsApi.getById(id!),
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Sessió creat correctament");
    },
    onError: (error: Error) => {
      toast.error(`Error al crear la sessió: ${error.message}`);
    },
  });
}

export function useUpdateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionsApi.update,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["sessions", data.id] });
      toast.success("Sessió actualitzada correctament");
    },
    onError: (error: Error) => {
      toast.error(`Error al actualitzar la sessió: ${error.message}`);
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sessionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      toast.success("Esdeveniment eliminat correctament");
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar l'esdeveniment: ${error.message}`);
    },
  });
}

// Utility hooks for calendar-specific data
export function useSessionsForDateRange(startDate: string, endDate: string) {
  return useSessions({
    startDate,
    endDate,
  });
}

export function useSessionsForWeek(weekStartDate: string) {
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  return useSessionsForDateRange(
    weekStartDate,
    weekEndDate.toISOString().split("T")[0],
  );
}
