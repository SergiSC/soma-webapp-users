"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PageSkeleton } from "@/components/page-skeleton";
import { ProductCards } from "@/components/cards/product-card";
import { useProducts, ProductTypeEnum } from "@/hooks/api/products";

export default function ProductsPage() {
  const searchParams = useSearchParams();

  // Get type from URL query params
  const productType = useMemo(() => {
    const typeParam = searchParams.get("type");
    if (
      typeParam &&
      Object.values(ProductTypeEnum).includes(typeParam as ProductTypeEnum)
    ) {
      return typeParam as ProductTypeEnum;
    }
    return undefined;
  }, [searchParams]);

  const { data: productsResponse, isLoading } = useProducts({
    active: true,
    type: productType,
  });

  return (
    <PageSkeleton
      title="Tarifes"
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
