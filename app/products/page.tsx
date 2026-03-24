"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PageSkeleton } from "@/components/page-skeleton";
import { ProductTypeEnum } from "@/hooks/api/products";
import { ProductsList } from "./products-list";

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
    return ProductTypeEnum.SUBSCRIPTION;
  }, [searchParams]);

  return (
    <PageSkeleton
      title="Tarifes"
      sections={[
        {
          content: <ProductsList type={productType} />,
        },
      ]}
    />
  );
}
