"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useUserInformation,
  ReservationStatus,
} from "@/hooks/api/user-information";
import { SessionTypeEnum } from "@/hooks/api/sessions";
import { AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Spinner } from "../../ui/spinner";
import { cn } from "@/lib/utils";
import { Separator } from "../../ui/separator";
import { MenuOption, OptionsMenu } from "../../options-menu";
import { ConfirmationModal } from "@/components/confirmation-modal";
import { ChangeSubscriptionModal } from "./change-subscription-modal";
import {
  useCancelSubscription,
  useChangeSubscription,
  useDeleteCanceledSubscription,
  usePayOnDemandSubscription,
} from "@/hooks/api/subscriptions";

export function MySubscriptionCard() {
  const router = useRouter();
  const { data: userInfo, isLoading } = useUserInformation();

  const subscription = userInfo?.subscription;

  const [confirmCancelSubscription, setConfirmCancelSubscription] =
    useState(false);
  const [confirmChangeSubscription, setConfirmChangeSubscription] =
    useState(false);
  const [confirmRenewSubscription, setConfirmRenewSubscription] =
    useState(false);
  const [deleteSubscription, setDeleteSubscription] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<
    string | undefined
  >();

  const { mutate: cancelSubscription } = useCancelSubscription();
  const { mutate: deleteCanceledSubscription } =
    useDeleteCanceledSubscription();
  const { mutate: payOnDemand } = usePayOnDemandSubscription();
  const { mutate: changeSubscription } = useChangeSubscription();

  const handlePayOnDemandSubscription = () => {
    if (!subscription?.id) return;
    payOnDemand(subscription.id);
    setConfirmRenewSubscription(false);
  };
  const handleCancelSubscription = () => {
    if (!subscription?.id) return;
    cancelSubscription(subscription.id);
    setConfirmCancelSubscription(false);
  };

  const handleChangeSubscription = () => {
    if (!subscription?.id || !selectedProductId) return;
    changeSubscription({
      subscriptionId: subscription.id,
      productId: selectedProductId,
    });
    setConfirmChangeSubscription(false);
  };

  const handleDeleteSubscription = () => {
    if (!subscription?.id) return;
    deleteCanceledSubscription(subscription.id);
    setDeleteSubscription(false);
  };

  // Check if subscription is active (using isValid from API)
  const { isActive, isExpired, isCancelled } = useMemo(() => {
    return {
      isActive: subscription?.isValid ?? false,
      isExpired: (subscription?.remainingDays ?? 0) < 0,
      isCancelled: subscription?.cancelledAt !== null,
    };
  }, [subscription]);

  const options = useMemo(() => {
    const options: MenuOption[] = [];
    const isProductChanged =
      subscription?.product.nextPeriodProduct !== null &&
      subscription?.product.nextPeriodProduct !== undefined;
    if (!isCancelled && !isExpired) {
      if (!isProductChanged) {
        options.push({
          label: "Modificar subscripció",
          action: () => setConfirmChangeSubscription(true),
        });
      }
      options.push({
        label: "Cancel·lar subscripció",
        action: () => setConfirmCancelSubscription(true),
        variant: "destructive",
      });
    }
    if (isExpired) {
      options.push({
        label: "Modificar subscripció",
        action: () => setConfirmChangeSubscription(true),
      });
      options.push({
        label: "Renovar subscripció",
        action: () => setConfirmRenewSubscription(true),
      });
    }
    if (isCancelled) {
      options.push({
        label: "Eliminar subscripció cancel·lada",
        action: () => setDeleteSubscription(true),
        variant: "destructive",
      });
    }
    return options;
  }, [isCancelled, isExpired, subscription]);

  // Check if subscription expires in less than 5 days
  const expiresSoon = useMemo(() => {
    if (!subscription || !isActive) return false;
    return subscription.remainingDays > 0 && subscription.remainingDays < 5;
  }, [subscription, isActive]);

  // Get current week boundaries (Monday to Sunday)
  const currentWeek = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
  }, []);

  // Group reservations by session type and count by status
  const reservationsBySessionType = useMemo(() => {
    if (!isActive || !subscription) {
      return new Map<
        SessionTypeEnum,
        { confirmed: number; waitingList: number; noShow: number }
      >();
    }

    const currentWeekReservations =
      subscription.product.currentWeekReservations || [];

    const grouped = new Map<
      SessionTypeEnum,
      { confirmed: number; waitingList: number; noShow: number }
    >();

    currentWeekReservations.forEach((reservation) => {
      if (!reservation.sessionType) return;

      const sessionType = reservation.sessionType as SessionTypeEnum;

      if (!grouped.has(sessionType)) {
        grouped.set(sessionType, { confirmed: 0, waitingList: 0, noShow: 0 });
      }

      const counts = grouped.get(sessionType)!;

      if (reservation.status === ReservationStatus.CONFIRMED) {
        counts.confirmed++;
      } else if (reservation.status === ReservationStatus.WAITING_LIST) {
        counts.waitingList++;
      } else if (reservation.status === ReservationStatus.NO_SHOW) {
        counts.noShow++;
      }
    });

    return grouped;
  }, [subscription, isActive]);

  // Calculate totals across all session types
  const reservationTotals = useMemo(() => {
    let totalConfirmed = 0;
    let totalWaitingList = 0;
    let totalNoShow = 0;

    reservationsBySessionType.forEach((counts) => {
      totalConfirmed += counts.confirmed;
      totalWaitingList += counts.waitingList;
      totalNoShow += counts.noShow;
    });

    return { totalConfirmed, totalWaitingList, totalNoShow };
  }, [reservationsBySessionType]);

  const OptionsMenuComponent = useMemo(() => {
    if (options.length === 0) return null;
    return <OptionsMenu title="Opcions de la subscripció" options={options} />;
  }, [options]);

  const CardComponent = useMemo(() => {
    const isProductChanged =
      subscription?.product.nextPeriodProduct !== null &&
      subscription?.product.nextPeriodProduct !== undefined;
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
    if (subscription === null || subscription === undefined) {
      return (
        <Card className="border-primary/20 pt-4">
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              No hi ha cap subscripció activa
            </p>
            <Button
              onClick={() => router.push("/products")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Activar subscripció
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (isExpired) {
      return (
        <Card className="border-destructive/20 pt-4 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-secondary-foreground">
                <strong className="text-destructive">Expirada:</strong>{" "}
                {subscription.product.name}
              </CardTitle>
            </div>
            <div className="text-xs text-secondary-foreground/80">
              <p className="gap-1 flex align-center">
                <span className="font-semibold">Vàlid fins:</span>
                {new Date(subscription.toDate).toLocaleDateString("ca-ES", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-destructive"></p>
            <Button
              onClick={() =>
                router.push(
                  "/products?type=subscription&type=subscription-combo"
                )
              }
              variant="destructive"
            >
              Renovar subscripció
            </Button>
          </CardContent>
        </Card>
      );
    }
    return (
      <Card className="bg-secondary/50 border-secondary">
        <CardHeader className="flex flex-row justify-between items-center pb-3">
          <CardTitle className="text-secondary-foreground ">
            {subscription.product.name}
          </CardTitle>
          {OptionsMenuComponent}
        </CardHeader>
        <CardContent>
          <div className="text-xs text-secondary-foreground/80 flex flex-col gap-2">
            {isCancelled && (
              <SubscriptionCancelledComponent
                cancelledAt={subscription.cancelledAt!}
              />
            )}
            {isProductChanged && (
              <SubscriptionProductChangedComponent
                nextPeriodProduct={subscription.product.nextPeriodProduct!}
              />
            )}
            <p className="gap-1 flex align-center">
              <span className="font-semibold">Vàlid fins:</span>
              {new Date(subscription.toDate).toLocaleDateString("ca-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p
              className={cn(
                "gap-1 flex align-center ",
                expiresSoon && "text-destructive"
              )}
            >
              <span className="font-semibold">Dies restants:</span>
              {subscription.remainingDays}
              {expiresSoon && (
                <span className="text-destructive">
                  <AlertTriangle className="size-3 inline-block" />
                </span>
              )}
            </p>
            <Separator />
            <div className="flex flex-col gap-2">
              <h4 className="font-semibold text-secondary-foreground">
                Setmana actual
              </h4>
              <p className="text-xs text-muted-foreground">
                {currentWeek.start.toLocaleDateString("ca-ES", {
                  month: "long",
                  day: "numeric",
                })}
                -
                {currentWeek.end.toLocaleDateString("ca-ES", {
                  month: "long",
                  day: "numeric",
                })}
              </p>

              <p className="text-xs text-secondary-foreground">
                <strong>Classes fetes:</strong>{" "}
                {reservationTotals.totalConfirmed}
              </p>
              <p className="text-xs text-secondary-foreground">
                <strong>En llista d&apos;espera:</strong>{" "}
                {reservationTotals.totalWaitingList}
              </p>
              <p className="text-xs text-secondary-foreground">
                <strong>No presentat:</strong> {reservationTotals.totalNoShow}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [
    subscription,
    isLoading,
    isExpired,
    isCancelled,
    expiresSoon,
    currentWeek,
    reservationTotals,
    router,
    OptionsMenuComponent,
  ]);

  return (
    <>
      {CardComponent}
      <ConfirmationModal
        isOpen={confirmCancelSubscription}
        onOpenChange={setConfirmCancelSubscription}
        title="Estàs segur/a?"
        description="Aquesta acció no es pot desfer. Pots reservar classes fins el dia que finalitza la teva subscripció."
        onConfirm={() => {
          handleCancelSubscription();
        }}
        onCancel={() => setConfirmCancelSubscription(false)}
      />
      <ChangeSubscriptionModal
        isOpen={confirmChangeSubscription}
        onOpenChange={setConfirmChangeSubscription}
        onConfirm={handleChangeSubscription}
        onClose={() => setConfirmChangeSubscription(false)}
        selectedProductId={selectedProductId}
        originalProductId={subscription?.product.id ?? ""}
        onSelectProduct={setSelectedProductId}
      />
      <ConfirmationModal
        isOpen={confirmRenewSubscription}
        onOpenChange={setConfirmRenewSubscription}
        title="Estàs segur/a?"
        description={`En prémer el botó "Confirmar", es carregarà un import de ${
          subscription?.product.stringifiedPrice ?? ""
        } a la targeta amb què vas efectuar el pagament. Assegura’t de disposar de fons suficients per realitzar el càrrec.`}
        onConfirm={handlePayOnDemandSubscription}
        onCancel={() => setConfirmRenewSubscription(false)}
      />
      <ConfirmationModal
        isOpen={deleteSubscription}
        onOpenChange={setDeleteSubscription}
        title="Elimina subscripció cancel·lada"
        description="Aquesta subscripció ja ha estat cancel·lada anteriorment. Si encara et queden dies de validesa i vols gastar-los, no eliminis la subscripció! Aquesta acció és útil per si vols canviar un cop ha acabat l'últim pagament, marcant aquesta com a eliminada."
        onConfirm={handleDeleteSubscription}
        onCancel={() => setDeleteSubscription(false)}
      />
    </>
  );
}

export function SubscriptionCancelledComponent({
  cancelledAt,
}: {
  cancelledAt: string;
}) {
  return (
    <div className="text-xs bg-destructive/50  p-2 rounded-md text-secondary-foreground/80 flex flex-col gap-2">
      <p>
        Aquesta subscripció ha sigut cancel·lada. Pots reservar classes fins el
        dia que finalitza la teva subscripció.
      </p>
      <p>
        <span className="font-semibold">Cancel·lada el:</span>{" "}
        {new Date(cancelledAt!).toLocaleDateString("ca-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </div>
  );
}

export function SubscriptionProductChangedComponent({
  nextPeriodProduct,
}: {
  nextPeriodProduct: { id: string; name: string | null };
}) {
  return (
    <div className="text-xs bg-primary/50  p-2 rounded-md text-secondary-foreground/80 flex flex-col gap-2">
      <p>
        Aquesta subscripció ha sigut modificada. Es canviarà en la pròxima
        facturació per <strong>{nextPeriodProduct.name}</strong>.
      </p>
    </div>
  );
}
