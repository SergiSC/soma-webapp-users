import {
  SessionLevelEnum,
  SessionStatus,
  SessionTypeEnum,
} from "@/hooks/api/sessions";
import { ReservationStatus } from "@/hooks/api/reservations";

export const sessionColorsRecord: Record<SessionTypeEnum, string> = {
  [SessionTypeEnum.PILATES_REFORMER]: "#4285f4",
  [SessionTypeEnum.PILATES_REFORMER_PRE_NATAL]: "#cc9e50",
  [SessionTypeEnum.PILATES_MAT]: "#34a853",
  [SessionTypeEnum.BARRE]: "#fbbc04",
  [SessionTypeEnum.FIT_MIX]: "#ea4335",
  [SessionTypeEnum.PILATES_MAT_PLUS_65]: "#34a853",
  [SessionTypeEnum.FIT_MIX_PLUS_65]: "#ea4335",
};

export const sessionStatusColorRecord: Record<SessionStatus, string> = {
  [SessionStatus.DRAFT]: "#f4b400",
  [SessionStatus.PUBLISHED]: "#4285f4",
  [SessionStatus.CANCELLED]: "#f36060",
  [SessionStatus.COMPLETED]: "#6e6e6e",
};

export const sessionTypeToLabel: Record<SessionTypeEnum, string> = {
  [SessionTypeEnum.PILATES_REFORMER]: "Pilates Reformer",
  [SessionTypeEnum.PILATES_REFORMER_PRE_NATAL]: "Pilates Reformer Pre Natal",
  [SessionTypeEnum.PILATES_MAT]: "Pilates Mat",
  [SessionTypeEnum.BARRE]: "Barre",
  [SessionTypeEnum.FIT_MIX]: "Fit",
  [SessionTypeEnum.PILATES_MAT_PLUS_65]: "Pilates Mat +65",
  [SessionTypeEnum.FIT_MIX_PLUS_65]: "Fit +65",
};

export const CATALAN_MONTHS = [
  "Gen",
  "Feb",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Oct",
  "Nov",
  "Des",
];

export const CATALAN_WEEKDAYS = ["Dl", "Dt", "Dc", "Dj", "Dv", "Ds", "Dg"];

export const catalanIntlFormatter = new Intl.DateTimeFormat("ca-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "Europe/Madrid",
});

export const catalanIntlMonthYearFormatter = new Intl.DateTimeFormat("ca-ES", {
  month: "long",
  year: "numeric",
});

export const catalanIntlDayFormatter = new Intl.DateTimeFormat("ca-ES", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const sessionStatusToLabel: Record<SessionStatus, string> = {
  [SessionStatus.DRAFT]: "Esborrany",
  [SessionStatus.PUBLISHED]: "Publicada",
  [SessionStatus.CANCELLED]: "Cancel·lada",
  [SessionStatus.COMPLETED]: "Completada",
};

export const sessionLevelToLabel: Record<SessionLevelEnum, string> = {
  [SessionLevelEnum.NORMAL]: "Normal",
  [SessionLevelEnum.ADVANCED]: "Avançat",
};

export const reservationStatusToLabel: Record<ReservationStatus, string> = {
  [ReservationStatus.CONFIRMED]: "Confirmada",
  [ReservationStatus.WAITING_LIST]: "Llista d'espera",
  [ReservationStatus.CANCELLED]: "Cancel·lada",
  [ReservationStatus.ATTENDED]: "Assistida",
  [ReservationStatus.NO_SHOW]: "No presentat",
};

export const reservationStatusToVariant: Record<
  ReservationStatus,
  | "reservationConfirmed"
  | "reservationWaitingList"
  | "reservationCancelled"
  | "reservationAttended"
  | "reservationNoShow"
> = {
  [ReservationStatus.CONFIRMED]: "reservationConfirmed",
  [ReservationStatus.WAITING_LIST]: "reservationWaitingList",
  [ReservationStatus.CANCELLED]: "reservationCancelled",
  [ReservationStatus.ATTENDED]: "reservationAttended",
  [ReservationStatus.NO_SHOW]: "reservationNoShow",
};
