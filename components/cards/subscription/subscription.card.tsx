"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useUser } from "@/context/user-context";
import { useSubscriptionAggregate } from "@/hooks/api/subscriptions";
import {
  ProductRecurring,
  ProductTypeEnum,
  RecurringIntervalEnum,
} from "@/hooks/api/products";
import { SubscriptionAggregate } from "@/lib/entities/subscription";
import { catalanIntlDayFormatter } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/empty-state";
import { PackageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { CancelSubscriptionDialog } from "@/components/dialogs/cancel-subscription.dialog";
import { useState } from "react";
import { ChangeSubscriptionDialog } from "../../dialogs/change-subscription.dialog";

interface SubscriptionCardProps {
  subscription: SubscriptionAggregate;
}

export function SubscriptionCard() {
  const { user } = useUser();
  const router = useRouter();
  const { data: subscriptionAggregate, isLoading } = useSubscriptionAggregate(
    user?.id ?? undefined,
    user?.subscriptionId ?? undefined,
  );
  const [openCancelSubscriptionDialog, setOpenCancelSubscriptionDialog] =
    useState(false);
  const [openChangeSubscriptionDialog, setOpenChangeSubscriptionDialog] =
    useState(false);

  if (isLoading) {
    return <Spinner />;
  }

  if (!subscriptionAggregate) {
    return (
      <EmptyState
        icon={<PackageIcon />}
        message="No tens cap subscripció activa"
        button={{
          text: "Comprar subscripció",
          onClick: () => {
            router.push("/products?type=subscription");
          },
        }}
      />
    );
  }

  return (
    <>
      <Card>
        <SubscriptionCardHeader subscription={subscriptionAggregate} />
        <CardContent className="p-4">
          <SubscriptionCardDetails subscription={subscriptionAggregate} />
        </CardContent>
        <SubscriptionCardFooter
          subscription={subscriptionAggregate}
          onCancelClick={() => setOpenCancelSubscriptionDialog(true)}
          onChangeClick={() => setOpenChangeSubscriptionDialog(true)}
        />
      </Card>
      <CancelSubscriptionDialog
        open={openCancelSubscriptionDialog}
        onOpenChange={setOpenCancelSubscriptionDialog}
        subscription={subscriptionAggregate}
      />
      <ChangeSubscriptionDialog
        isOpen={openChangeSubscriptionDialog}
        onOpenChange={setOpenChangeSubscriptionDialog}
        originalProductId={subscriptionAggregate.product.id}
        selectedProductId={undefined}
        onClose={() => {}}
        onSelectProduct={() => {}}
        onConfirm={() => {}}
      />
    </>
  );
}

/** Same surface tokens as product list badges (`product-card.tsx`). */
const subscriptionCardHeaderBackground: Record<ProductTypeEnum, string> = {
  [ProductTypeEnum.PACK]: "bg-product-type-pack",
  [ProductTypeEnum.SUBSCRIPTION]: "bg-product-type-subscription",
  [ProductTypeEnum.SUBSCRIPTION_COMBO]: "bg-product-type-subscription-combo",
};

function SubscriptionCardHeader({ subscription }: SubscriptionCardProps) {
  const productType = subscription.product.recurring.type;
  return (
    <CardHeader
      className={cn(
        "rounded-t-md text-primary-foreground",
        subscriptionCardHeaderBackground[productType],
      )}
    >
      <CardTitle className="font-bold text-primary-foreground">
        {subscription.product.name}
      </CardTitle>
    </CardHeader>
  );
}

function SubscriptionCardDetails({ subscription }: SubscriptionCardProps) {
  return (
    <div className="space-y-3 text-sm">
      {subscription.errorMessage ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-destructive">
          <p className="font-medium">Avís</p>
          <p className="mt-1">{subscription.errorMessage}</p>
        </div>
      ) : null}

      <DetailRow label="Identificador" value={subscription.id} />
      <DetailRow
        label="Període actual"
        value={`${formatPeriodInstant(subscription.fromDate)} — ${formatPeriodInstant(subscription.toDate)}`}
      />
      <DetailRow
        label="Alta"
        value={formatPeriodInstant(subscription.createdAt)}
      />
      {subscription.updatedAt ? (
        <DetailRow
          label="Última actualització"
          value={formatPeriodInstant(subscription.updatedAt)}
        />
      ) : null}
      {subscription.cancelledAt ? (
        <DetailRow
          label="Cancel·lada"
          value={formatPeriodInstant(subscription.cancelledAt)}
          className="text-destructive"
        />
      ) : null}

      <div className="space-y-2 border-t pt-3">
        <ul className="mt-1 space-y-1 text-muted-foreground">
          {recurringDetailLines(subscription.product.recurring).map((line) => (
            <li key={line.label}>
              <span className="font-medium text-foreground">
                {line.label}:{" "}
              </span>
              {line.value}
            </li>
          ))}
        </ul>
      </div>

      {subscription.nextPeriodProduct ? (
        <div className="space-y-2 border-t pt-3">
          <p className="font-medium text-foreground">
            Producte del proper període
          </p>
          <div className="space-y-2 text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Nom: </span>
              {subscription.nextPeriodProduct.name ?? "—"}
            </div>
            {subscription.nextPeriodProduct.recurring ? (
              <ul className="space-y-1">
                {recurringDetailLines(
                  subscription.nextPeriodProduct.recurring,
                ).map((line) => (
                  <li key={line.label}>
                    <span className="font-medium text-foreground">
                      {line.label}:{" "}
                    </span>
                    {line.value}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function DetailRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
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

function recurringDetailLines(
  recurring: ProductRecurring,
): { label: string; value: string }[] {
  const lines: { label: string; value: string }[] = [];

  if (recurring.type === ProductTypeEnum.SUBSCRIPTION) {
    lines.push({
      label: "Classes per setmana",
      value: recurring.amountPerWeek?.toString() ?? "—",
    });
    lines.push({
      label: "Cicle",
      value:
        recurring.interval === RecurringIntervalEnum.MONTH
          ? "Mensual"
          : recurring.interval === RecurringIntervalEnum.YEAR
            ? "Anual"
            : "—",
    });
    lines.push({
      label: "Tipus de classe",
      value: recurring.includesReformer ? "Reformer" : "Mat, Barre & Fit",
    });
  }

  if (recurring.type === ProductTypeEnum.SUBSCRIPTION_COMBO) {
    lines.push({
      label: "Classes/setmana Reformer",
      value: recurring.amountReformerPerWeek?.toString() ?? "—",
    });
    lines.push({
      label: "Classes/setmana Mat, Barre & Fit",
      value: recurring.amountOtherPerWeek?.toString() ?? "—",
    });
    lines.push({
      label: "Cicle",
      value:
        recurring.interval === RecurringIntervalEnum.MONTH
          ? "Combo mensual"
          : recurring.interval === RecurringIntervalEnum.YEAR
            ? "Combo anual"
            : "Combo",
    });
  }

  return lines;
}

/** Subscription period boundaries: use main Catalan formatter (not day-only). */
function formatPeriodInstant(value: string): string {
  return catalanIntlDayFormatter.format(new Date(value));
}

interface SubscriptionCardFooterProps {
  subscription: SubscriptionAggregate;
  onCancelClick: () => void;
  onChangeClick: () => void;
}

function SubscriptionCardFooter({
  subscription,
  onCancelClick,
  onChangeClick,
}: SubscriptionCardFooterProps) {
  return (
    <CardFooter className="flex flex-row gap-2 justify-end">
      <Button
        variant="outline"
        type="button"
        className="w-fit"
        onClick={onChangeClick}
      >
        Canviar
      </Button>
      <Button
        type="button"
        className="w-fit"
        variant="destructive"
        disabled={subscription.cancelledAt !== null}
        onClick={onCancelClick}
      >
        Cancel·lar
      </Button>
    </CardFooter>
  );
}
