"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProductTypeEnum } from "@/hooks/api/products";
import { catalanIntlDayFormatter } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { PackObject } from "@/hooks/api/packs";

interface PackCardProps {
  pack: PackObject;
}

export function PackCard({ pack }: PackCardProps) {
  return (
    <>
      <Card>
        <PackCardHeader pack={pack} />
        <CardContent className="p-4">
          <PackCardDetails pack={pack} />
        </CardContent>
        <PackCardFooter pack={pack} />
      </Card>
    </>
  );
}

/** Same surface tokens as product list badges (`product-card.tsx`). */
const subscriptionCardHeaderBackground: Record<ProductTypeEnum, string> = {
  [ProductTypeEnum.PACK]: "bg-product-type-pack",
  [ProductTypeEnum.SUBSCRIPTION]: "bg-product-type-subscription",
  [ProductTypeEnum.SUBSCRIPTION_COMBO]: "bg-product-type-subscription-combo",
};

function PackCardHeader({ pack }: PackCardProps) {
  const productType = pack.product.recurring.type;
  return (
    <CardHeader
      className={cn(
        "rounded-t-md text-primary-foreground",
        subscriptionCardHeaderBackground[productType],
      )}
    >
      <CardTitle className="font-bold text-primary-foreground">
        {pack.product.name}
      </CardTitle>
    </CardHeader>
  );
}

function PackCardDetails({ pack }: PackCardProps) {
  return (
    <div className="space-y-3 text-sm">
      <DetailRow label="Identificador" value={pack.id} />
      <DetailRow
        label="Comprat el"
        value={formatPeriodInstant(pack.createdAt)}
      />
    </div>
  );
}

function DetailRow({
  label,
  value,
  className,
  variant = "default",
}: {
  label: string;
  value: string;
  className?: string;
  variant?: "default" | "destructive" | "info";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3",
        variant === "destructive" &&
          "text-destructive border-destructive/40 bg-destructive/5 px-3 py-2",
        variant === "info" &&
          "text-muted-foreground border-muted-foreground/20 bg-secondary/80 px-3 py-2",
      )}
    >
      <span
        className={cn(
          "shrink-0 font-bold text-muted-foreground sm:min-w-40",
          className,
        )}
      >
        {label}
      </span>
      <span className="wrap-break-words text-foreground">{value}</span>
    </div>
  );
}

/** Subscription period boundaries: use main Catalan formatter (not day-only). */
function formatPeriodInstant(value: string): string {
  return catalanIntlDayFormatter.format(new Date(value));
}

interface PackCardFooterProps {
  pack: PackObject;
}

function PackCardFooter({ pack }: PackCardFooterProps) {
  const { confirmedReservations, attendedReservations, noShowReservations } =
    pack.reservations;
  const total = pack.product.recurring.count ?? 0;

  const items: {
    key: string;
    code: string;
    label: string;
    value: number;
    dotClass: string;
    valueClass: string;
  }[] = [
    {
      key: "confirmed",
      code: "C",
      label: "Confirmades",
      value: confirmedReservations,
      dotClass: "bg-blue-500",
      valueClass: "text-blue-600",
    },
    {
      key: "attended",
      code: "A",
      label: "Assistides",
      value: attendedReservations,
      dotClass: "bg-emerald-500",
      valueClass: "text-emerald-600",
    },
    {
      key: "no-show",
      code: "NS",
      label: "No assistides",
      value: noShowReservations,
      dotClass: "bg-destructive",
      valueClass: "text-destructive",
    },
    {
      key: "total",
      code: "T",
      label: "Total disponibles",
      value: total,
      dotClass: "bg-foreground",
      valueClass: "text-foreground",
    },
  ];

  return (
    <CardFooter className="flex flex-col items-stretch gap-2 text-sm border-t pt-3">
      {items.map((item) => (
        <div key={item.key} className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span
              className={cn(
                "inline-block h-2.5 w-2.5 rounded-full",
                item.dotClass,
              )}
              aria-hidden
            />
            <span className="font-bold">({item.code})</span>
            <span>{item.label}</span>
          </div>
          <span className={cn("font-semibold tabular-nums", item.valueClass)}>
            {item.value}
          </span>
        </div>
      ))}
    </CardFooter>
  );
}
