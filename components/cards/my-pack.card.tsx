"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useUserInformation,
  ReservationStatus,
  Pack,
} from "@/hooks/api/user-information";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Spinner } from "../ui/spinner";
import { cn } from "@/lib/utils";

interface MyPackCardProps {
  pack: Pack;
  isLoading: boolean;
}

export function MyPackCard({ pack: activePack, isLoading }: MyPackCardProps) {
  const router = useRouter();

  // Count reservations by status
  const reservationCounts = useMemo(() => {
    if (!activePack) {
      return { confirmed: 0, waitingList: 0, noShow: 0, attended: 0 };
    }

    const reservations = activePack.product.reservations || [];
    let confirmed = 0;
    let waitingList = 0;
    let noShow = 0;
    let attended = 0;

    reservations.forEach((reservation) => {
      if (reservation.status === ReservationStatus.CONFIRMED) {
        confirmed++;
      } else if (reservation.status === ReservationStatus.WAITING_LIST) {
        waitingList++;
      } else if (reservation.status === ReservationStatus.NO_SHOW) {
        noShow++;
      } else if (reservation.status === ReservationStatus.ATTENDED) {
        attended++;
      }
    });

    return { confirmed, waitingList, noShow, attended };
  }, [activePack]);

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

  if (activePack.remainingSessions === 0) {
    return (
      <Card className="border-destructive/20 pt-4 bg-destructive/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-secondary-foreground">
              <strong className="text-destructive">Esgotat:</strong>{" "}
              {activePack.product.name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-destructive">
            No queden sessions disponibles en aquest pack
          </p>
          <Button
            onClick={() => router.push("/products?type=pack")}
            variant="destructive"
          >
            Comprar nou pack
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
            {activePack.product.name}
          </CardTitle>
        </div>
        {activePack && (
          <div className="text-xs text-secondary-foreground/80">
            <p className={cn("gap-1 flex align-center")}>
              <span className="font-semibold">Classes restants:</span>
              {activePack.remainingSessions}
            </p>
            {activePack.product.recurring && (
              <p className="gap-1 flex align-center">
                <span className="font-semibold">Total classes:</span>
                {activePack.product.recurring.count}
              </p>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <h4 className="font-semibold text-secondary-foreground mb-2">
              Reserves
            </h4>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-secondary-foreground">
              <strong>Classes confirmades:</strong>{" "}
              {reservationCounts.confirmed}
            </p>
            <p className="text-xs text-secondary-foreground">
              <strong>En llista d&apos;espera:</strong>{" "}
              {reservationCounts.waitingList}
            </p>
            <p className="text-xs text-secondary-foreground">
              <strong>No presentat:</strong> {reservationCounts.noShow}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MyPackCards() {
  const { data: userInfo, isLoading } = useUserInformation();

  const router = useRouter();
  const packs = useMemo(() => userInfo?.packs || [], [userInfo?.packs]);

  return (
    <div className="flex flex-col gap-4">
      {packs.length === 0 ? (
        <Card className="border-primary/20 pt-4">
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              No hi ha cap pack actiu
            </p>
            <Button
              onClick={() => router.push("/products?type=pack")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Comprar pack
            </Button>
          </CardContent>
        </Card>
      ) : (
        packs.map((pack) => (
          <MyPackCard key={pack.id} pack={pack} isLoading={isLoading} />
        ))
      )}
    </div>
  );
}
