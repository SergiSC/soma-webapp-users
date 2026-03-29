import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { SessionTypeEnum } from "./sessions";
import { ReservationStatus } from "./reservations";
import { ProductRecurring } from "./products";
import { queryClient } from "@/lib/query-client";

export enum UserType {
  TEACHER = "teacher",
  CLIENT = "client",
  ADMIN = "admin",
}

export enum HowDidYouFindUs {
  FRIENDS = "friends",
  SOCIAL_MEDIA = "social_media",
  ADVERTISEMENT = "advertisement",
  OTHER = "other",
}
export interface LoginRequest {
  externalId: string;
  email: string;
  emailVerified: boolean;
}

export interface UserObject {
  id: string;
  externalId: string;
  type: UserType;
  name: string | null;
  surname: string | null;
  fullName: string | null;
  email: string;
  emailVerifiedAt: string | null;
  birthDate: string | null;
  languageCode: string;
  profileImageUrl: string | null;
  missedSessionsCount: number;
  onboardingCompletedAt: string | null;
  howDidYouFindUs: HowDidYouFindUs | null;
  postalCode: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
}

export interface AggregatedUserObject extends UserObject {
  packs:
    | {
        id: string;
        remainingSessions: number;
        product: {
          id: string;
          name: string;
          includesReformer: boolean;
          recurring: ProductRecurring | null;
          reservations: {
            status: ReservationStatus;
            id: string;
          }[];
        };
      }[]
    | null;
  subscription: {
    id: string;
    product: {
      id: string;
      name: string;
      stringifiedPrice: string;
      recurring: ProductRecurring | null;
      currentWeekReservations: {
        status: ReservationStatus;
        id: string;
        sessionType: SessionTypeEnum | null;
      }[];
    };
    fromDate: string;
    toDate: string;
    cancelledAt: string | null;
    errorMessage: string | null;
    isValid: boolean;
    remainingDays: number;
  } | null;
  nextReservations: {
    status: ReservationStatus;
    id: string;
    sessionId: string;
    sessionType: SessionTypeEnum | null;
    sessionSchedule: {
      day: string;
      start: string;
      end: string;
    } | null;
  }[];
  completedReservations: {
    status: ReservationStatus;
    id: string;
    sessionType: SessionTypeEnum | null;
    sessionSchedule: {
      day: string;
      start: string;
      end: string;
    } | null;
  }[];
}

export enum ReservationListFilterEnum {
  PAST = "past",
  FUTURE = "future",
}

// API functions
const usersApi = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>("/users/login", {
      externalId: data.externalId,
      email: data.email,
      emailVerified: data.emailVerified,
    }),
  get: (userId: string) => apiClient.get<UserObject>(`/users/${userId}`),
  update: (userId: string, data: Partial<UserObject>) =>
    apiClient.patch<UserObject>(`/users/${userId}`, { ...data }),
};

export interface LoginResponse {
  id: string;
  email: string;
  name: string | null;
  surname: string | null;
  onboardingCompletedAt: string | null;
}

interface UseLoginProps {
  onSuccess: (data: LoginResponse) => void;
}

export function useLogin({ onSuccess }: UseLoginProps) {
  return useMutation<LoginResponse, Error, LoginRequest>({
    mutationFn: usersApi.login,
    onSuccess: (data) => {
      onSuccess(data);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

interface UseGetUserProps {
  userId?: string;
}

export function useGetUser({ userId }: UseGetUserProps) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => usersApi.get(userId!),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId,
  });
}

interface UseUpdateUserProps {
  userId?: string;
}

export function useUpdateUser({ userId }: UseUpdateUserProps) {
  return useMutation<UserObject, Error, Partial<UserObject>>({
    mutationFn: (data) => {
      if (userId) return usersApi.update(userId, data);
      throw new Error("User ID is required");
    },
  });
}
