"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import {
  ReservationListFilterEnum,
  useCancelReservation,
  useUserReservations,
} from "@/hooks/api/reservations";
import { ReservationCard } from "@/components/cards/reservation.card";
import { useUser } from "@/context/user-context";
import { CancelReservationDialog } from "@/components/dialogs/cancel-reservation.dialog";
import { useState } from "react";
import { AggregatedReservationJsonObject } from "@/hooks/api/reservations";

interface ReservationsListProps {
  filter: ReservationListFilterEnum;
}

export function ReservationsList({ filter }: ReservationsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { data: reservationsResponse, isLoading } = useUserReservations(
    user?.id,
    filter,
  );
  const reservations = reservationsResponse?.items ?? [];

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", value);
    router.push(`?${params.toString()}`);
  }

  const [openCancelReservationDialog, setOpenCancelReservationDialog] =
    useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<
    AggregatedReservationJsonObject | undefined
  >(undefined);

  const onOpenCancelReservationDialog = (
    reservation: AggregatedReservationJsonObject,
  ) => {
    setOpenCancelReservationDialog(true);
    setReservationToCancel(reservation);
  };
  const { mutate: cancelReservation } = useCancelReservation();

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={filter}
        onValueChange={handleTabChange}
        className="sticky top-0 bg-background z-10 pb-2"
      >
        <TabsList className="w-full">
          <TabsTrigger value={ReservationListFilterEnum.FUTURE}>
            Pròximes
          </TabsTrigger>
          <TabsTrigger value={ReservationListFilterEnum.PAST}>
            Passades
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : (
        reservations.map((reservation) => (
          <ReservationCard
            key={reservation.id}
            reservation={reservation}
            setReservationToCancel={onOpenCancelReservationDialog}
          />
        ))
      )}
      <CancelReservationDialog
        open={openCancelReservationDialog}
        onOpenChange={setOpenCancelReservationDialog}
        reservation={reservationToCancel}
        onCancel={cancelReservation}
      />
    </div>
  );
}
