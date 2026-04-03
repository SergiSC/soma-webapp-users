import { ProductRecurring } from "@/hooks/api/products";
import { ReservationStatus } from "@/hooks/api/reservations";
import { SessionTypeEnum } from "@/hooks/api/sessions";

export interface SubscriptionAggregate {
  id: string;
  stripeId: string | null;
  user: {
    id: string;
    name: string | null;
    surname: string | null;
  };
  product: {
    id: string;
    name: string;
    recurring: ProductRecurring;
  };
  nextPeriodProduct: {
    id: string;
    name: string | null;
    recurring: ProductRecurring | null;
  } | null;
  fromDate: Date;
  toDate: Date;
  createdAt: Date;
  updatedAt: Date | null;
  cancelledAt: Date | null;
  currentWeekReservations: {
    status: ReservationStatus;
    id: string;
    sessionType: SessionTypeEnum | null;
  }[];
}
