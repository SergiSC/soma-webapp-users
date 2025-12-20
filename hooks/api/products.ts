import { apiClient } from "@/lib/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ProductTypeEnum, RecurringIntervalEnum } from "./user-information";

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
  items: Record<ProductTypeEnum, Product[]>;
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
  list: (filters?: {
    active?: boolean;
    type?: ProductTypeEnum | ProductTypeEnum[];
  }) => {
    const params = new URLSearchParams();

    params.append("active", "true");

    if (filters?.type) {
      const types = Array.isArray(filters.type) ? filters.type : [filters.type];
      types.forEach((type) => params.append("type", type));
    }

    const queryString = params.toString();
    return apiClient.get<ProductListResponse>(
      `/products${queryString ? `?${queryString}` : ""}`
    );
  },
  get: (productId: string) => apiClient.get<Product>(`/products/${productId}`),
  createCheckoutSession: (
    productId: string,
    userId: string
  ): Promise<{ url: string }> =>
    apiClient.get<{ url: string }>(
      `/products/${productId}/users/${userId}/checkout`
    ),
};

export function useProducts(filters?: {
  active?: boolean;
  type?: ProductTypeEnum | ProductTypeEnum[];
}) {
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

export function useCreateProductCheckoutSession(productId: string) {
  return useMutation({
    mutationFn: (userId?: string) =>
      productsApi.createCheckoutSession(productId, userId ?? ""),
    onError: (error) => {
      console.error("Error creating checkout session:", error);
    },
  });
}
