"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product, ProductGroup, ProductTypeEnum } from "@/hooks/api/products";
import { useUser } from "@/context/user-context";
import { apiClient } from "@/lib/api";
import { useState } from "react";
import { Spinner } from "../ui/spinner";
import { ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import { PurchaseOrRejectproductDialog } from "@/app/products/confirm-purchase";

interface ProductCardProps {
  product: Product;
}

// Color mappings for different product types
const productTypeColors: Record<
  ProductTypeEnum,
  { border: string; bg: string; text: string; button: string }
> = {
  [ProductTypeEnum.PACK]: {
    border: "#60a5fa", // Soft Blue
    bg: "bg-blue-50/50 dark:bg-blue-950/20",
    text: "text-blue-600 dark:text-blue-400",
    button: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  [ProductTypeEnum.SUBSCRIPTION]: {
    border: "#4ade80", // Soft Green
    bg: "bg-green-50/50 dark:bg-green-950/20",
    text: "text-green-600 dark:text-green-400",
    button: "bg-green-500 hover:bg-green-600 text-white",
  },
  [ProductTypeEnum.SUBSCRIPTION_COMBO]: {
    border: "#fbbc04", // Yellow/Orange
    bg: "bg-amber-50/50 dark:bg-amber-950/20",
    text: "text-amber-700 dark:text-amber-300",
    button: "bg-amber-600 hover:bg-amber-700 text-white",
  },
};

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const productType = product.recurring.type;
  const colors = productTypeColors[productType];

  const handlePurchase = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await apiClient.get<{ url: string }>(
        `/products/${product.id}/users/${user.id}/checkout`
      );

      if (response.url) {
        setUrl(response.url);
        setIsDialogOpen(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error initiating checkout:", error);
      setIsLoading(false);
    }
  };

  const getProductTypeLabel = () => {
    switch (product.recurring.type) {
      case ProductTypeEnum.PACK:
        return "Pack de Classes";
      default:
        return "Subscripció Mensual";
    }
  };

  const getProductTypeDescription = () => {
    switch (product.recurring.type) {
      case ProductTypeEnum.PACK:
        return "Compra un pack de classes i utilitza-les quan vulguis";
      case ProductTypeEnum.SUBSCRIPTION:
        return "Subscripció mensual amb classes setmanals incloses";
      case ProductTypeEnum.SUBSCRIPTION_COMBO:
        return "Subscripció premium amb accés a múltiples tipus de classes";
      default:
        return "";
    }
  };

  const getProductDetails = () => {
    const recurring = product.recurring;

    if (recurring.type === ProductTypeEnum.PACK) {
      return {
        primary: {
          label: "Classes incloses",
          value: recurring.count?.toString() || "N/A",
        },
        secondary: recurring.includesReformer
          ? { label: "Tipus", value: "Inclou classes de Reformer" }
          : { label: "Tipus", value: "Classes de Pilates mat, barre i fit" },
      };
    }

    if (recurring.type === ProductTypeEnum.SUBSCRIPTION) {
      return {
        primary: {
          label: "Classes per setmana",
          value: recurring.amountPerWeek?.toString() || "N/A",
        },
        secondary: {
          label: "Durada",
          value: `${recurring.intervalCount || 1} ${
            recurring.interval === "month" ? "mes" : "any"
          }`,
        },
        tertiary: recurring.includesReformer
          ? { label: "Inclou", value: "Classes de Reformer" }
          : { label: "Inclou", value: "Classes de Mat i Altres" },
      };
    }

    if (recurring.type === ProductTypeEnum.SUBSCRIPTION_COMBO) {
      return {
        primary: {
          label: "Classes per setmana",
          value:
            (recurring.amountReformerPerWeek || 0) +
            (recurring.amountOtherPerWeek || 0),
        },
        secondary: {
          label: "Durada",
          value: `${recurring.intervalCount || 1} ${
            recurring.interval === "month" ? "mes" : "any"
          }`,
        },
        tertiary: {
          label: "Inlou",
          value: `Reformer: ${
            recurring.amountReformerPerWeek || 0
          } classes\nPilates mat, barre o fit: ${
            recurring.amountOtherPerWeek || 0
          } classes`,
        },
      };
    }

    return null;
  };

  const productDetails = getProductDetails();

  if (!product.active) {
    return null;
  }

  return (
    <>
      <Card
        className={cn(
          "border-l-4 hover:shadow-md transition-all",
          colors.bg,
          colors.text
        )}
        style={{ borderLeftColor: colors.border }}
      >
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className={cn("text-lg font-bold", colors.text)}>
                {product.name}
              </CardTitle>
              <div className="sm:hidden mb-2">
                <p className={"text-2xl font-bold text-foreground"}>
                  {product.stringifiedPrice}
                </p>
              </div>
              <CardDescription className="text-sm text-muted-foreground mb-1">
                {product.description || getProductTypeDescription()}
              </CardDescription>
              <div className="mt-2">
                <span
                  className={cn(
                    "text-xs font-semibold py-1 rounded",
                    colors.text,
                    colors.bg
                  )}
                >
                  {getProductTypeLabel()}
                </span>
              </div>
            </div>
            <div className="hidden sm:block text-right shrink-0">
              <p className={cn("text-2xl font-bold", colors.text)}>
                {product.stringifiedPrice}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="space-y-2">
            {productDetails?.primary && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {productDetails.primary.label}:
                </span>
                <span className={cn("text-sm font-bold", colors.text)}>
                  {productDetails.primary.value}
                </span>
              </div>
            )}
            {productDetails?.secondary && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {productDetails.secondary.label}:
                </span>
                <span className="text-xs text-muted-foreground">
                  {productDetails.secondary.value}
                </span>
              </div>
            )}
            {productDetails?.tertiary && (
              <div className="flex gap-2 whitespace-pre-line">
                <span className="text-xs font-semibold text-foreground">
                  {productDetails.tertiary.label}:
                </span>
                <span className="text-xs text-muted-foreground">
                  {productDetails.tertiary.value}
                </span>
              </div>
            )}
          </div>
          <Button
            onClick={handlePurchase}
            disabled={isLoading || !user?.id}
            className={cn("w-full", colors.button)}
          >
            {isLoading ? (
              <>
                <Spinner className="size-4" />
                Processant...
              </>
            ) : (
              <>
                <ShoppingCart className="size-4" />
                Comprar ara
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      {url && (
        <PurchaseOrRejectproductDialog
          product={product}
          url={url}
          onReject={() => {
            setIsDialogOpen(false);
          }}
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
        />
      )}
    </>
  );
}

interface ProductCardsProps {
  products?: Record<ProductGroup, Product[]>;
  isLoading?: boolean;
}

export function ProductCards({ products, isLoading }: ProductCardsProps) {
  if (isLoading) {
    return (
      <Card className="bg-transparent border-none">
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <Spinner />
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const existingProducts = Object.values(products || {}).flat();

  if (!products || existingProducts.length === 0) {
    return (
      <Card className="border-primary/20 pt-4">
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            No hi ha productes disponibles
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(products).map(([group, products]) => (
        <div key={group} className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-primary">
            {productGroupLabels[group as ProductGroup]}
          </h2>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ))}
    </div>
  );
}

const productGroupLabels: Record<ProductGroup, string> = {
  subscription: "Subscripcions",
  pack: "Packs",
};
