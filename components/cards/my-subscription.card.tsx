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
import { useMemo } from "react";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";

export function MySubscriptionCard() {
  const router = useRouter();
  const { data: userInfo, isLoading } = useUserInformation();

  const subscription = userInfo?.subscription;

  // Check if subscription is active (using isValid from API)
  const { isActive, isExpired, isCancelled } = useMemo(() => {
    return {
      isActive: subscription?.isValid ?? false,
      isExpired: (subscription?.remainingDays ?? 0) <= 0,
      isCancelled: subscription?.cancelledAt !== null,
    };
  }, [subscription]);

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

  if (subscription === null) {
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
              {subscription?.product.name}
            </CardTitle>
          </div>
          {subscription && (
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
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-destructive"></p>
          <Button
            onClick={() =>
              router.push("/products?type=subscription&type=subscription-combo")
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
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-secondary-foreground">
            {subscription?.product.name}
          </CardTitle>
        </div>
        {subscription && (
          <div className="text-xs text-secondary-foreground/80">
            {isCancelled && (
              <p className="gap-1 flex align-center">
                <span className="font-semibold">Cancel·lada el:</span>
                {new Date(subscription.cancelledAt!).toLocaleDateString(
                  "ca-ES",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
                . Pots reservar classes fins el dia que finalitza la teva
                subscripció.
              </p>
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
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-1 md:grid md:grid-cols-2 md:gap-16">
          <div>
            <h4 className="font-semibold text-secondary-foreground">
              Setmana actual
            </h4>
            <p className="text-xs text-muted-foreground space-x-1 mb-3">
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
          </div>

          <div className="space-y-2">
            <p className="text-xs text-secondary-foreground">
              <strong>Classes fetes:</strong> {reservationTotals.totalConfirmed}
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
}
