import { apiClient } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
  ProductTypeEnum,
  RecurringIntervalEnum,
} from "./user-information";

export { ProductTypeEnum, RecurringIntervalEnum };

export interface ProductRecurring {
  type: ProductTypeEnum;
  includesReformer?: boolean;
  count?: number;
  amountPerWeek?: number;
  amountReformerPerWeek?: number;
  amountOtherPerWeek?: number;
  intervalCount?: number;
  interval?: RecurringIntervalEnum;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  active: boolean;
  price: number;
  stringifiedPrice: string;
  recurring: ProductRecurring;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  perPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
  totalPages: number;
}

const productsApi = {
  list: (filters?: { active?: boolean }) =>
    apiClient.get<ProductListResponse>(
      `/products${filters?.active !== undefined ? `?active=${filters.active}` : ""}`
    ),
  get: (productId: string) =>
    apiClient.get<Product>(`/products/${productId}`),
};

export function useProducts(filters?: { active?: boolean }) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productsApi.list(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => productsApi.get(productId),
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
