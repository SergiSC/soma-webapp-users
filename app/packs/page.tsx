"use client";

import { PageSkeleton } from "@/components/page-skeleton";
import { ProductCards } from "@/components/cards/product-card";
import { useProducts } from "@/hooks/api/products";

export default function ProductsPage() {
  const { data: productsResponse, isLoading } = useProducts({ active: true });

  return (
    <PageSkeleton
      title="Packs"
      sections={[
        {
          content: (
            <ProductCards
              products={productsResponse?.items}
              isLoading={isLoading}
            />
          ),
        },
      ]}
    />
  );
}
