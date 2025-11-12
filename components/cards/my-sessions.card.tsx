"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ReservationStatus,
  ReservationSummary,
  useUserInformation,
} from "@/hooks/api/user-information";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Spinner } from "../ui/spinner";

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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-secondary-foreground">
            Les meves sessions
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 md:grid md:grid-cols-2 md:gap-8">
          <div>
            <h4 className="font-semibold text-secondary-foreground mb-3">
              Properes sessions
            </h4>
            {totalReservations === 0 ? (
              <p className="text-xs text-muted-foreground">
                No tens cap sessió propera
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-secondary-foreground">
                  <strong>Classes confirmades:</strong>{" "}
                  {reservationCounts.confirmed}
                </p>
                <p className="text-xs text-secondary-foreground">
                  <strong>En llista d&apos;espera:</strong>{" "}
                  {reservationCounts.waitingList}
                </p>
                {reservationCounts.cancelled > 0 && (
                  <p className="text-xs text-secondary-foreground">
                    <strong>Cancel·lades:</strong> {reservationCounts.cancelled}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {type === "next" && totalReservations === 0 && (
          <div className="mt-4 pt-4 border-t border-accent-foreground">
            <Button
              onClick={() => router.push("/timetable")}
              className="w-full"
            >
              Reservar
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
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
