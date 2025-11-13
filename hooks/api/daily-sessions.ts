import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { SessionTypeEnum, SessionStatus } from "./sessions";
import { ReservationStatus } from "./user-information";

export interface DailySession {
  id: string;
  type: SessionTypeEnum;
  status: SessionStatus;
  day: string;
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
  reservations: {
    id: string;
    status: ReservationStatus;
  }[];
}

export interface DailySessionsFilters {
  type?: SessionTypeEnum[];
  roomId?: string;
  teacherId?: string;
  status?: SessionStatus;
}

const dailySessionsApi = {
  get: (date: string, filters?: DailySessionsFilters) => {
    const params = new URLSearchParams();
    params.append("date", date);

    if (filters?.type && filters.type.length > 0) {
      filters.type.forEach((t) => params.append("type", t));
    }
    if (filters?.roomId) {
      params.append("roomId", filters.roomId);
    }
    if (filters?.teacherId) {
      params.append("teacherId", filters.teacherId);
    }
    if (filters?.status) {
      params.append("status", filters.status);
    }

    return apiClient.get<DailySession[]>(
      `/sessions/daily?${params.toString()}`
    );
  },
};

export interface UseDailySessionsOptions {
  date: Date | string;
  filters?: DailySessionsFilters;
  enabled?: boolean;
}

// Helper function to format date as YYYY-MM-DD in local timezone (not UTC)
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function useDailySessions({
  date,
  filters,
  enabled = true,
}: UseDailySessionsOptions) {
  // Convert Date to YYYY-MM-DD format if needed (using local timezone)
  const dateString = date instanceof Date ? formatDateLocal(date) : date;

  return useQuery({
    queryKey: ["daily-sessions", dateString, filters],
    queryFn: () => dailySessionsApi.get(dateString, filters),
    enabled: enabled && !!dateString,
    staleTime: 60 * 1000, // 5 minutes
  });
}
