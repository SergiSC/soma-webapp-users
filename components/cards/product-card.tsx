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
import { apiClient } from "@/lib/api";
import { useMemo, useState } from "react";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";
import { PurchaseOrRejectproductDialog } from "@/app/products/confirm-purchase";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { useChangeSubscription } from "@/hooks/api/subscriptions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
interface ProductCardProps {
  product: Product;
  userActiveProductId?: string;
}

export function ProductCard({
  product,
  userActiveProductId,
}: ProductCardProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [openChangeSubscriptionDialog, setOpenChangeSubscriptionDialog] =
    useState(false);
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
        value: "(des de el dia de la compra)",
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
        label:
          "Combo " + (recurring.interval === "month" ? "mensual" : "anual"),
        value: "(des de el dia de la compra)",
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
        <CardContent className="flex flex-col gap-2 p-4">
          {getSubtitle()}
        </CardContent>

        <ProductCardFooter
          product={product}
          setUrl={setUrl}
          setIsDialogOpen={setIsDialogOpen}
          userActiveProductId={userActiveProductId}
          setIsChangeSubscriptionDialogOpen={setOpenChangeSubscriptionDialog}
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
      <ChangeSubscriptionDialog
        open={openChangeSubscriptionDialog}
        onOpenChange={setOpenChangeSubscriptionDialog}
        newProduct={product}
      />
    </>
  );
}

function ProductCardHeader({ product }: ProductCardProps) {
  return (
    <CardHeader className="rounded-t-md bg-primary/10">
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
  setUrl: (url: string) => void;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  userActiveProductId?: string;
  setIsChangeSubscriptionDialogOpen: (
    isChangeSubscriptionDialogOpen: boolean,
  ) => void;
}

function ProductCardFooter({
  product,
  setUrl,
  setIsDialogOpen,
  userActiveProductId,
  setIsChangeSubscriptionDialogOpen,
}: ProductCardFooterProps) {
  const { hasActive, isActive } = useMemo(() => {
    return {
      hasActive: userActiveProductId !== undefined,
      isActive: userActiveProductId === product.id,
    };
  }, [userActiveProductId, product.id]);
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    if (hasActive) {
      try {
        if (!user?.subscriptionId) return;
        setIsChangeSubscriptionDialogOpen(true);
      } catch {
        toast.error("Error al canviar la subscripció");
      }
    } else {
      try {
        const response = await apiClient.get<{ url: string }>(
          `/products/${product.id}/users/${user.id}/checkout`,
        );

        if (response.url) {
          setUrl(response.url);
          setIsDialogOpen(true);
          setIsLoading(false);
        }
      } catch {
        toast.error("Error al comprar el producte");
      }
    }
    setIsLoading(false);
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
        disabled={isLoading || !user?.id || isActive}
        className={cn(
          "rounded-xl px-6 font-bold tracking-wide uppercase text-sm shrink-0",
          "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        {isLoading ? (
          <Spinner className="size-4" />
        ) : hasActive ? (
          isActive ? (
            "Actual"
          ) : (
            "Canviar"
          )
        ) : (
          "Comprar"
        )}
      </Button>
    </CardFooter>
  );
}

interface ChangeSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newProduct: {
    id: string;
    name: string;
    stringifiedPrice: string;
  };
}

function ChangeSubscriptionDialog({
  open,
  onOpenChange,
  newProduct,
}: ChangeSubscriptionDialogProps) {
  const { mutateAsync: changeSubscription } = useChangeSubscription();
  const { user } = useUser();
  const handleChangeSubscription = async () => {
    if (!user?.id) return;
    if (!user?.subscriptionId) return;
    await changeSubscription({
      userId: user.id,
      subscriptionId: user.subscriptionId,
      productId: newProduct.id,
    });
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid gap-6">
        <DialogHeader className="grid gap-2">
          <DialogTitle>Canviar subscripció</DialogTitle>
          <DialogDescription className="text-start">
            Estàs segur/a que vols canviar la subscripció actual a{" "}
            <strong>{newProduct.name}</strong>?
            <br />
            El preu de la nova subscripció és de{" "}
            <strong>{newProduct.stringifiedPrice}</strong> mensuals.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel·lar
          </Button>
          <Button variant="default" onClick={handleChangeSubscription}>
            Canviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const productCardFooterTexts = {
  [ProductTypeEnum.PACK]: "Preu total",
  [ProductTypeEnum.SUBSCRIPTION]: "Preu mensual",
  [ProductTypeEnum.SUBSCRIPTION_COMBO]: "Preu mensual",
};
