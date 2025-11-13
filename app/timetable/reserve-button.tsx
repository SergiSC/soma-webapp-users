"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateReservationFromComboSubscription,
  useCreateReservationFromPack,
  useCreateReservationFromSubscription,
} from "@/hooks/api/reservations";
import { SessionTypeEnum } from "@/hooks/api/sessions";
import {
  ProductTypeEnum,
  useUserInformation,
  Pack,
  Subscription,
} from "@/hooks/api/user-information";
import { useMemo, useState } from "react";

interface ReserveButtonProps {
  session: {
    id: string;
    type: SessionTypeEnum;
    isFull: boolean;
  };
}

export function ReserveButton({ session }: ReserveButtonProps) {
  const { data: userInfo } = useUserInformation();
  const subscription = userInfo?.subscription;
  const packs = userInfo?.packs;
  const currentWeekSubscriptionReservations =
    subscription?.product.currentWeekReservations;

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { canMakeReservation, canUseSubscription, canUsePack } = useMemo((): {
    canMakeReservation: boolean;
    canUseSubscription?: Subscription;
    canUsePack?: Pack;
  } => {
    if (subscription?.isValid) {
      switch (session.type) {
        // reformer
        case SessionTypeEnum.PILATES_REFORMER:
          if (
            subscription.product.recurring?.type ===
            ProductTypeEnum.SUBSCRIPTION
          ) {
            if (subscription.product.recurring.includesReformer) {
              if (
                (currentWeekSubscriptionReservations?.filter(
                  (reservation) =>
                    reservation.sessionType === SessionTypeEnum.PILATES_REFORMER
                ).length ?? 0) < subscription.product.recurring.amountPerWeek
              ) {
                return {
                  canMakeReservation: true,
                  canUseSubscription: subscription,
                };
              }
            }
          }
          if (
            subscription.product.recurring?.type ===
            ProductTypeEnum.SUBSCRIPTION_COMBO
          ) {
            if (subscription.product.recurring.amountReformerPerWeek > 0) {
              if (
                (currentWeekSubscriptionReservations?.filter(
                  (reservation) =>
                    reservation.sessionType === SessionTypeEnum.PILATES_REFORMER
                ).length ?? 0) <
                subscription.product.recurring.amountReformerPerWeek
              ) {
                return {
                  canMakeReservation: true,
                  canUseSubscription: subscription,
                };
              }
            }
          }
          if (
            packs?.some(
              (pack) =>
                pack.product.recurring?.type === ProductTypeEnum.PACK &&
                pack.product.recurring.includesReformer
            )
          ) {
            const pack = packs?.find(
              (pack) =>
                pack.product.recurring?.type === ProductTypeEnum.PACK &&
                pack.product.recurring.includesReformer
            );
            if ((pack?.remainingSessions ?? 0) > 0) {
              if (
                (currentWeekSubscriptionReservations?.filter(
                  (reservation) =>
                    reservation.sessionType === SessionTypeEnum.PILATES_REFORMER
                ).length ?? 0) < (pack?.remainingSessions ?? 0)
              ) {
                return {
                  canMakeReservation: true,
                  canUsePack: pack,
                };
              }
            }
          }
          break;

        // other
        default:
          if (
            subscription.product.recurring?.type ===
            ProductTypeEnum.SUBSCRIPTION
          ) {
            if (!subscription.product.recurring.includesReformer) {
              if (
                (currentWeekSubscriptionReservations?.filter(
                  (reservation) => reservation.sessionType === session.type
                ).length ?? 0) < subscription.product.recurring.amountPerWeek
              ) {
                return {
                  canMakeReservation: true,
                  canUseSubscription: subscription,
                };
              }
            }
          }
          if (
            subscription.product.recurring?.type ===
            ProductTypeEnum.SUBSCRIPTION_COMBO
          ) {
            if (subscription.product.recurring.amountOtherPerWeek > 0) {
              if (
                (currentWeekSubscriptionReservations?.filter(
                  (reservation) => reservation.sessionType === session.type
                ).length ?? 0) <
                subscription.product.recurring.amountOtherPerWeek
              ) {
                return {
                  canMakeReservation: true,
                  canUseSubscription: subscription,
                };
              }
            }
          }
          if (
            packs?.some((pack) => !pack.product.recurring?.includesReformer)
          ) {
            const pack = packs?.find(
              (pack) => !pack.product.recurring?.includesReformer
            );
            if ((pack?.remainingSessions ?? 0) > 0) {
              return {
                canMakeReservation: true,
                canUsePack: pack,
              };
            }
          }
          break;
      }
    }
    return {
      canMakeReservation: false,
      canUseSubscription: undefined,
      canUsePack: undefined,
    };
  }, [subscription, session, packs, currentWeekSubscriptionReservations]);

  return (
    <>
      <Button
        variant={canMakeReservation ? "default" : "outline"}
        disabled={!canMakeReservation}
        size="sm"
        className="mt-auto"
        onClick={() => setIsDialogOpen(true)}
      >
        {canMakeReservation
          ? session.isFull
            ? "Llista d'espera"
            : "Reservar"
          : "No tens subscrpición o pack disponible"}
      </Button>
      <AcceptOrRejectReservationDialog
        userId={userInfo?.id ?? ""}
        session={session}
        canUseSubscription={canUseSubscription}
        canUsePack={canUsePack}
        onReject={() => setIsDialogOpen(false)}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
      />
    </>
  );
}

// Catalan session type labels
const sessionTypeToLabelCatalan: Record<SessionTypeEnum, string> = {
  [SessionTypeEnum.PILATES_REFORMER]: "Reformer",
  [SessionTypeEnum.PILATES_MAT]: "Pilates Mat",
  [SessionTypeEnum.BARRE]: "Barre",
  [SessionTypeEnum.FIT_MIX]: "Fit",
  [SessionTypeEnum.PILATES_MAT_PLUS_65]: "Pilates Mat +65",
  [SessionTypeEnum.FIT_MIX_PLUS_65]: "Fit +65",
};

interface MakeReservationProps {
  userId: string;
  session: {
    id: string;
    type: SessionTypeEnum;
  };
  canUseSubscription?: Subscription;
  canUsePack?: Pack;
  onReject: () => void;
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
}

// Accept or reject reservation dialog
function AcceptOrRejectReservationDialog({
  userId,
  session,
  canUseSubscription,
  canUsePack,
  onReject,
  isDialogOpen,
  setIsDialogOpen,
}: MakeReservationProps) {
  console.log("AAAA", userId, session, canUseSubscription, canUsePack);
  const sessionTypeLabel = sessionTypeToLabelCatalan[session.type];

  const {
    mutate: createReservationFromSubscription,
    isPending: isCreatingReservationFromSubscription,
  } = useCreateReservationFromSubscription();
  const {
    mutate: createReservationFromPack,
    isPending: isCreatingReservationFromPack,
  } = useCreateReservationFromPack();
  const {
    mutate: createReservationFromComboSubscription,
    isPending: isCreatingReservationFromComboSubscription,
  } = useCreateReservationFromComboSubscription();

  const makeReservation = () => {
    if (canUseSubscription) {
      if (
        canUseSubscription.product.recurring?.type ===
        ProductTypeEnum.SUBSCRIPTION
      ) {
        createReservationFromSubscription({
          sessionId: session.id,
          userId,
          subscriptionId: canUseSubscription.id,
        });
      } else if (
        canUseSubscription.product.recurring?.type ===
        ProductTypeEnum.SUBSCRIPTION_COMBO
      ) {
        createReservationFromComboSubscription({
          sessionId: session.id,
          userId,
          subscriptionId: canUseSubscription.id,
        });
      }
    } else if (canUsePack) {
      createReservationFromPack({
        sessionId: session.id,
        userId,
        packId: canUsePack.id,
      });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-start">
            Vols fer una reserva per la classe de {sessionTypeLabel}?
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          En cas que es vulgui cancel·lar la classe, caldrà fer-ho com a mínim 3
          hores abans de l&apos;inici. En cas contrari, la classe es perdrà.
        </p>
        <div className="flex gap-2 w-full justify-between">
          <Button variant="outline" onClick={onReject}>
            Rebutar
          </Button>
          <Button
            onClick={makeReservation}
            disabled={
              isCreatingReservationFromSubscription ||
              isCreatingReservationFromPack ||
              isCreatingReservationFromComboSubscription
            }
          >
            Reservar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
