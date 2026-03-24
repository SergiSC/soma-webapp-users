"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/cards/product-card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductTypeEnum, useProducts } from "@/hooks/api/products";
import { Loader2 } from "lucide-react";

interface ProductsListProps {
  type: ProductTypeEnum;
}

export function ProductsList({ type }: ProductsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: productsResponse, isLoading } = useProducts({ type });
  const products = Object.values(productsResponse?.items ?? {}).flat();

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", value);
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={type}
        onValueChange={handleTabChange}
        className="sticky top-0 bg-background z-10 pb-2"
      >
        <TabsList className="w-full">
          <TabsTrigger value={ProductTypeEnum.SUBSCRIPTION}>
            Subscripcions
          </TabsTrigger>
          <TabsTrigger value={ProductTypeEnum.PACK}>Packs</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : (
        products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      )}
    </div>
  );
}
