import { ProductRecurring } from "@/hooks/api/products";

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
  fromDate: string;
  toDate: string;
  createdAt: string;
  updatedAt: string | null;
  cancelledAt: string | null;
  errorMessage: string | null;
}
