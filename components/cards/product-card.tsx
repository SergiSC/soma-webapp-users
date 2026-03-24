"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Product, ProductTypeEnum } from "@/hooks/api/products";
import { useUser } from "@/context/user-context";
import { apiClient, User } from "@/lib/api";
import { Fragment, useState } from "react";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";
import { PurchaseOrRejectproductDialog } from "@/app/products/confirm-purchase";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { user } = useUser();

  const [url, setUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getSubtitle = () => {
    const recurring = product.recurring;
    const entries: { label: string; value: string }[] = [];

    if (recurring.type === ProductTypeEnum.PACK) {
      entries.push({
        label: "Classes totals",
        value: recurring.count?.toString() ?? "",
      });
      entries.push({
        label: "Tipus de classe",
        value: recurring.includesReformer ? "Reformer" : "Mat, Barre & Fit",
      });
    }

    if (recurring.type === ProductTypeEnum.SUBSCRIPTION) {
      entries.push({
        label: "Classes per setmana",
        value: recurring.amountPerWeek?.toString() ?? "",
      });
      entries.push({
        label:
          "Subscripció " +
          (recurring.interval === "month" ? "mensual" : "anual"),
        value: "(desde el dia de la compra)",
      });
      entries.push({
        label: "Tipus de classe",
        value: recurring.includesReformer ? "Reformer" : "Mat, Barre & Fit",
      });
    }

    if (recurring.type === ProductTypeEnum.SUBSCRIPTION_COMBO) {
      entries.push({
        label: "Classes per setmana Reformer",
        value: recurring.amountReformerPerWeek?.toString() ?? "",
      });
      entries.push({
        label: "Classes per setmana Mat, Barre & Fit",
        value: recurring.amountOtherPerWeek?.toString() ?? "",
      });
      entries.push({
        label: "Duració",
        value:
          recurring.intervalCount?.toString() + " / " + recurring.interval ===
          "month"
            ? "mes"
            : "any",
      });
    }

    return entries.map((entry) => (
      <p
        key={entry.label}
        className="inline-block items-baseline text-muted-foreground"
      >
        <span className="text-combo text font-semibold mr-2 text-foreground">
          {entry.label}
        </span>
        {entry.value}
      </p>
    ));
  };

  if (!product.active) {
    return null;
  }

  return (
    <>
      <Card className="hover:shadow-md transition-all bg-card border border-primary">
        <ProductCardHeader product={product} />
        <CardContent className="flex flex-col gap-2">
          {getSubtitle()}
        </CardContent>

        <ProductCardFooter
          product={product}
          user={user}
          setUrl={setUrl}
          setIsDialogOpen={setIsDialogOpen}
        />
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

function ProductCardHeader({ product }: ProductCardProps) {
  return (
    <CardHeader className="bg-linear-to-br from-primary from-0% via-transparent via-45% to-transparent rounded-t-md">
      <CardTitle className="text-2xl font-bold text-foreground">
        {product.name}
      </CardTitle>
      <Badge
        variant="default"
        className={productCardBadgeColors[product.recurring.type]}
      >
        {productCardBadgeVariants[product.recurring.type]}
      </Badge>
    </CardHeader>
  );
}

const productCardBadgeVariants = {
  [ProductTypeEnum.PACK]: "Pack",
  [ProductTypeEnum.SUBSCRIPTION]: "Subscripció",
  [ProductTypeEnum.SUBSCRIPTION_COMBO]: "Combo",
};

const productCardBadgeColors = {
  [ProductTypeEnum.PACK]: "bg-product-type-pack",
  [ProductTypeEnum.SUBSCRIPTION]: "bg-product-type-subscription",
  [ProductTypeEnum.SUBSCRIPTION_COMBO]: "bg-product-type-subscription-combo",
};

interface ProductCardFooterProps {
  product: Product;
  user: User | null;
  setUrl: (url: string) => void;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
}

function ProductCardFooter({
  product,
  user,
  setUrl,
  setIsDialogOpen,
}: ProductCardFooterProps) {
  const [isLoading, setIsLoading] = useState(false);
  const handlePurchase = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const response = await apiClient.get<{ url: string }>(
        `/products/${product.id}/users/${user.id}/checkout`,
      );

      if (response.url) {
        setUrl(response.url);
        setIsDialogOpen(true);
        setIsLoading(false);
      }
    } catch {
      toast.warning("Ja tens una subscripció activa", {
        description: `No pots comprar aquesta subscripció mentre tinguis una activa. Si
              vols modificar la teva subscripció, pots fer-ho a la pantalla
              'Inici', fent click en els tres punts a la dreta de la
              teva subscripció.
            `,
        duration: 7000,
        closeButton: true,
        action: {
          label: "D'acord",
          onClick: () => {
            toast.dismiss();
          },
        },
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <CardFooter className="flex items-end justify-between gap-4">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-0.5">
          {productCardFooterTexts[product.recurring.type]}
        </p>
        <p className="text-2xl font-bold text-foreground">
          {product.stringifiedPrice}
        </p>
      </div>
      <Button
        onClick={handlePurchase}
        disabled={isLoading || !user?.id}
        className={cn(
          "rounded-xl px-6 font-bold tracking-wide uppercase text-sm shrink-0",
          "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        {isLoading ? <Spinner className="size-4" /> : "Comprar"}
      </Button>
    </CardFooter>
  );
}

const productCardFooterTexts = {
  [ProductTypeEnum.PACK]: "Preu total",
  [ProductTypeEnum.SUBSCRIPTION]: "Preu mensual",
  [ProductTypeEnum.SUBSCRIPTION_COMBO]: "Preu mensual",
};
