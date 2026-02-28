"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ReservationStatus,
  ReservationSummary,
  useUserInformation,
} from "@/hooks/api/user-information";
import { SessionTypeEnum } from "@/hooks/api/sessions";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Spinner } from "../ui/spinner";
import { Separator } from "../ui/separator";
import { Trash2Icon } from "lucide-react";
import { useCancelReservation } from "@/hooks/api/reservations";

// Catalan session type labels
const sessionTypeToLabelCatalan: Record<SessionTypeEnum, string> = {
  [SessionTypeEnum.PILATES_REFORMER]: "Reformer",
  [SessionTypeEnum.PILATES_REFORMER_PRE_NATAL]: "Reformer Pre Natal",
  [SessionTypeEnum.PILATES_MAT]: "Pilates Mat",
  [SessionTypeEnum.BARRE]: "Barre",
  [SessionTypeEnum.FIT_MIX]: "Fit",
  [SessionTypeEnum.PILATES_MAT_PLUS_65]: "Pilates Mat +65",
  [SessionTypeEnum.FIT_MIX_PLUS_65]: "Fit +65",
};

interface MySessionsCardProps {
  type: "next" | "completed";
  isLoading: boolean;
  reservations: ReservationSummary[];
}

export function MySessionsCard({
  type,
  reservations,
  isLoading,
}: MySessionsCardProps) {
  const router = useRouter();

  // Count next reservations by status
  const reservationCounts = useMemo(() => {
    if (!reservations) {
      return { confirmed: 0, waitingList: 0, cancelled: 0 };
    }

    let confirmed = 0;
    let waitingList = 0;
    let cancelled = 0;

    reservations.forEach((reservation) => {
      if (reservation.status === ReservationStatus.CONFIRMED) {
        confirmed++;
      } else if (reservation.status === ReservationStatus.WAITING_LIST) {
        waitingList++;
      } else if (reservation.status === ReservationStatus.CANCELLED) {
        cancelled++;
      }
    });

    return { confirmed, waitingList, cancelled };
  }, [reservations]);

  const totalReservations = useMemo(() => {
    return (
      reservationCounts.confirmed +
      reservationCounts.waitingList +
      reservationCounts.cancelled
    );
  }, [reservationCounts]);

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

  if (totalReservations === 0) {
    return (
      <Card className="bg-accent/50 border-accent-foreground">
        <CardHeader>
          <CardTitle className="flex items-center justify-center">
            <p className="text-sm text-muted-foreground">
              No tens cap sessió {type === "next" ? "propera" : "completada"}
            </p>
          </CardTitle>
        </CardHeader>
        {type === "next" && (
          <CardContent>
            <Button
              variant={"outline"}
              onClick={() => router.push("/timetable")}
              className="w-full"
            >
              Reservar
            </Button>
          </CardContent>
        )}
      </Card>
    );
  }

  return (
    <Card className="bg-accent/50 border-accent-foreground">
      <CardContent className="p-2">
        <div className="space-y-4">
          <div>
            {reservations
              .filter(
                (r) =>
                  r.status === ReservationStatus.CONFIRMED ||
                  r.status === ReservationStatus.WAITING_LIST,
              )
              .map((reservation, index) => (
                <SessionCard
                  key={reservation.id}
                  reservation={reservation}
                  isFirst={index === 0}
                />
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SessionCard({
  reservation,
  isFirst,
}: {
  reservation: ReservationSummary;
  isFirst: boolean;
}) {
  const { mutate: cancelReservation } = useCancelReservation();
  const handleCancelReservation = () => {
    cancelReservation(reservation.id);
  };

  return (
    <>
      {!isFirst && <Separator orientation="horizontal" />}
      <div
        key={reservation.id}
        className="text-xs text-secondary-foreground p-2 rounded bg-accent/30"
      >
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <div className="font-medium">
              {reservation.sessionType &&
                sessionTypeToLabelCatalan[
                  reservation.sessionType as SessionTypeEnum
                ]}
              {reservation.sessionSchedule &&
                ` • ${reservation.sessionSchedule.start}h`}
            </div>
            {reservation.sessionSchedule && (
              <div className="text-muted-foreground">
                {new Date(reservation.sessionSchedule.day).toLocaleDateString(
                  "ca-ES",
                  {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  },
                )}
              </div>
            )}
          </div>
          <div className="ml-2 ">
            {reservation.status === ReservationStatus.WAITING_LIST ? (
              <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">
                Llista d&apos;espera
              </span>
            ) : (
              <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-700 dark:text-green-400">
                Confirmada
              </span>
            )}
          </div>
          <Trash2Icon
            className="size-4 text-muted-foreground cursor-pointer"
            onClick={handleCancelReservation}
          />
        </div>
      </div>
    </>
  );
}

export function MyNextSessionsCard() {
  const { data: userInfo, isLoading } = useUserInformation();
  const reservations = userInfo?.nextReservations || [];

  return (
    <MySessionsCard
      type="next"
      reservations={reservations}
      isLoading={isLoading}
    />
  );
}

export function MyCompletedSessionsCard() {
  const { data: userInfo, isLoading } = useUserInformation();
  const reservations = userInfo?.completedReservations || [];

  return (
    <MySessionsCard
      type="completed"
      reservations={reservations}
      isLoading={isLoading}
    />
  );
}
