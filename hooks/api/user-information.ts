import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "@/context/user-context";
import { SessionTypeEnum } from "./sessions";

export enum ReservationStatus {
  WAITING_LIST = "waiting_list",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
  ATTENDED = "attended",
  NO_SHOW = "no_show",
}

export enum RecurringIntervalEnum {
  MONTH = "month",
  YEAR = "year",
}

export enum ProductTypeEnum {
  PACK = "pack",
  SUBSCRIPTION = "subscription",
  SUBSCRIPTION_COMBO = "subscription-combo",
}

export type SubscriptionProductRecurring =
  | {
      type: ProductTypeEnum.SUBSCRIPTION;
      includesReformer: boolean;
      amountPerWeek: number;
      intervalCount: number;
      interval: RecurringIntervalEnum;
    }
  | {
      type: ProductTypeEnum.SUBSCRIPTION_COMBO;
      amountReformerPerWeek: number;
      amountOtherPerWeek: number;
      intervalCount: number;
      interval: RecurringIntervalEnum;
    };

export type PackProductRecurring = {
  type: ProductTypeEnum.PACK;
  includesReformer: boolean;
  count: number;
};

export interface Pack {
  id: string;
  remainingSessions: number;
  product: {
    id: string;
    name: string;
    includesReformer: boolean;
    recurring: PackProductRecurring | null;
    reservations: {
      status: ReservationStatus;
      id: string;
    }[];
  };
}

export interface Subscription {
  id: string;
  product: {
    id: string;
    name: string;
    recurring: SubscriptionProductRecurring | null;
    currentWeekReservations: {
      status: ReservationStatus;
      id: string;
      sessionType: SessionTypeEnum | null;
    }[];
  };
  fromDate: string;
  toDate: string;
  cancelledAt: string | null;
  cancelledReason: string | null;
  isValid: boolean;
  remainingDays: number;
}

export interface ReservationSummary {
  status: ReservationStatus;
  id: string;
  sessionType: SessionTypeEnum | null;
  sessionSchedule: {
    day: string;
    start: string;
    end: string;
  } | null;
}

export interface UserInformation {
  id: string;
  externalId: string;
  type: string;
  name: string | null;
  surname: string | null;
  email: string;
  emailVerifiedAt: string | null;
  birthDate: string | null;
  languageCode: string;
  profileImageUrl: string | null;
  missedSessionsCount: number;
  onboardingCompletedAt: string | null;
  howDidYouFindUs: string | null;
  postalCode: string | null;
  createdAt: string;
  updatedAt: string | null;
  deletedAt: string | null;
  packs: Pack[];
  subscription: Subscription | null;
  nextReservations: ReservationSummary[];
  completedReservations: ReservationSummary[];
}

const userInformationApi = {
  get: (userId: string) =>
    apiClient.get<UserInformation>(`/users/${userId}/information`),
};

export function useUserInformation() {
  const { user } = useUser();

  return useQuery({
    queryKey: ["user-information", user?.id],
    queryFn: () => userInformationApi.get(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
