"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCanMakeReservation,
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
  closeInformationDialog: () => void;
}

export function ReserveButton({
  session,
  closeInformationDialog,
}: ReserveButtonProps) {
  const { data: userInfo } = useUserInformation();
  const subscription = userInfo?.subscription;
  const packs = userInfo?.packs;
  const currentWeekSubscriptionReservations =
    subscription?.product.currentWeekReservations;

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Call the backend to check if user can make reservation
  const {
    data: canMakeReservationData,
    isLoading: isLoadingCanMakeReservation,
  } = useCanMakeReservation(userInfo?.id, session.id);

  // Keep the client-side logic for determining which subscription/pack to use
  const { canUseSubscription, canUsePack } = useMemo((): {
    canUseSubscription?: Subscription;
    canUsePack?: Pack;
  } => {
    switch (session.type) {
      // reformer
      case SessionTypeEnum.PILATES_REFORMER:
        if (
          subscription?.isValid &&
          subscription.product.recurring?.type === ProductTypeEnum.SUBSCRIPTION
        ) {
          if (subscription.product.recurring.includesReformer) {
            if (
              (currentWeekSubscriptionReservations?.filter(
                (reservation) =>
                  reservation.sessionType === SessionTypeEnum.PILATES_REFORMER
              ).length ?? 0) < subscription.product.recurring.amountPerWeek
            ) {
              return {
                canUseSubscription: subscription,
              };
            }
          }
        }
        if (
          subscription?.isValid &&
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
                canUsePack: pack,
              };
            }
          }
        }
        break;

      // other
      default:
        if (
          subscription?.isValid &&
          subscription.product.recurring?.type === ProductTypeEnum.SUBSCRIPTION
        ) {
          if (!subscription.product.recurring.includesReformer) {
            if (
              (currentWeekSubscriptionReservations?.filter(
                (reservation) => reservation.sessionType === session.type
              ).length ?? 0) < subscription.product.recurring.amountPerWeek
            ) {
              return {
                canUseSubscription: subscription,
              };
            }
          }
        }
        if (
          subscription?.isValid &&
          subscription.product.recurring?.type ===
            ProductTypeEnum.SUBSCRIPTION_COMBO
        ) {
          if (subscription.product.recurring.amountOtherPerWeek > 0) {
            if (
              (currentWeekSubscriptionReservations?.filter(
                (reservation) => reservation.sessionType === session.type
              ).length ?? 0) < subscription.product.recurring.amountOtherPerWeek
            ) {
              return {
                canUseSubscription: subscription,
              };
            }
          }
        }
        if (packs?.some((pack) => !pack.product.recurring?.includesReformer)) {
          const pack = packs?.find(
            (pack) => !pack.product.recurring?.includesReformer
          );
          if ((pack?.remainingSessions ?? 0) > 0) {
            return {
              canUsePack: pack,
            };
          }
        }
        break;
    }
    return {
      canUseSubscription: undefined,
      canUsePack: undefined,
    };
  }, [subscription, session, packs, currentWeekSubscriptionReservations]);

  // Use the backend response to determine if reservation can be made
  const canMakeReservation =
    canMakeReservationData?.canMakeReservation ?? false;

  const errorMessage = canMakeReservationData?.reasonCannotMakeReservation;
  const buttonText = isLoadingCanMakeReservation
    ? "Comprovant..."
    : canMakeReservation
    ? session.isFull || canMakeReservationData?.isRoomAtFullCapacity
      ? "Llista d'espera"
      : "Reservar"
    : errorMessage;

  return (
    <>
      <div className="flex flex-col items-center gap-1">
        <Button
          variant={canMakeReservation ? "default" : "outline"}
          disabled={!canMakeReservation || isLoadingCanMakeReservation}
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="w-full"
        >
          {buttonText}
        </Button>
      </div>
      <AcceptOrRejectReservationDialog
        userId={userInfo?.id ?? ""}
        session={session}
        canUseSubscription={canUseSubscription}
        canUsePack={canUsePack}
        onReject={() => setIsDialogOpen(false)}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        closeAllDialogs={() => {
          setIsDialogOpen(false);
          closeInformationDialog();
        }}
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
  closeAllDialogs: () => void;
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
  closeAllDialogs,
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
    closeAllDialogs();
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
