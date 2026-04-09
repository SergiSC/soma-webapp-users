"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  ReservationListFilterEnum,
  useCancelReservation,
  useInfiniteUserReservations,
} from "@/hooks/api/reservations";
import { ReservationCard } from "@/components/cards/reservation.card";
import { useUser } from "@/context/user-context";
import { CancelReservationDialog } from "@/components/dialogs/cancel-reservation.dialog";
import { useEffect, useRef, useState } from "react";
import { AggregatedReservationJsonObject } from "@/hooks/api/reservations";
import { EmptyState } from "@/components/empty-state";
import { catalanIntlMonthYearFormatter } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

interface ReservationsListProps {
  filter: ReservationListFilterEnum;
}

interface ReservationGroup {
  label: string;
  items: AggregatedReservationJsonObject[];
}

function getReservationDate(
  reservation: AggregatedReservationJsonObject,
): Date {
  const [year, month, day] = reservation.session.schedule.day.split("-");
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/** Local Monday 00:00 of the ISO-style week that contains `reference`. */
function startOfMondayWeek(reference: Date): Date {
  const d = new Date(reference);
  d.setHours(0, 0, 0, 0);
  const daysFromMonday = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - daysFromMonday);
  return d;
}

/** Past sessions from local Monday of the current week through today (inclusive). */
function isInUltimaSetmanaSection(sessionDay: Date, today: Date): boolean {
  const d = new Date(sessionDay);
  d.setHours(0, 0, 0, 0);
  const t = new Date(today);
  t.setHours(0, 0, 0, 0);
  if (d > t) return false;
  const monday = startOfMondayWeek(t);
  return d >= monday && d <= t;
}

function groupReservations(
  reservations: AggregatedReservationJsonObject[],
): ReservationGroup[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const groupMap = new Map<string, AggregatedReservationJsonObject[]>();
  const groupOrder: string[] = [];

  for (const reservation of reservations) {
    const date = getReservationDate(reservation);

    let key: string;
    if (isInUltimaSetmanaSection(date, today)) {
      key = "__last_week__";
    } else {
      const [year, month] = reservation.session.schedule.day.split("-");
      key = `${year}-${month}`;
    }

    if (!groupMap.has(key)) {
      groupMap.set(key, []);
      groupOrder.push(key);
    }
    groupMap.get(key)!.push(reservation);
  }

  const sortedKeys = [...groupOrder].sort((a, b) => {
    if (a === "__last_week__") return -1;
    if (b === "__last_week__") return 1;
    return b.localeCompare(a);
  });

  return sortedKeys.map((key) => {
    let label: string;
    if (key === "__last_week__") {
      label = "Aquesta setmana";
    } else {
      const [year, month] = key.split("-");
      const date = new Date(Number(year), Number(month) - 1, 1);
      const raw = catalanIntlMonthYearFormatter.format(date);
      label = raw.charAt(0).toUpperCase() + raw.slice(1);
    }
    return { label, items: groupMap.get(key)! };
  });
}

export function ReservationsList({ filter }: ReservationsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteUserReservations(user?.id, filter);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const reservations = data?.pages.flatMap((page) => page.items) ?? [];
  const groups = groupReservations(reservations);

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
      ) : reservations.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="size-10 text-muted-foreground" />}
          message={`No tens cap reserva ${filter === ReservationListFilterEnum.FUTURE ? "pròximament" : "completada"}`}
          button={{
            text: "Reservar classe",
            onClick: () => {
              router.push("/sessions");
            },
          }}
        />
      ) : filter === ReservationListFilterEnum.PAST ? (
        <div className="flex flex-col gap-4">
          {groups.map((group, index) => (
            <section key={group.label} className="flex flex-col gap-4">
              {index > 0 && <Separator orientation="horizontal" />}
              <h2 className="text-lg font-semibold uppercase tracking-widest text-muted-foreground px-1">
                {group.label}
              </h2>
              {group.items.map((reservation) => (
                <ReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  setReservationToCancel={onOpenCancelReservationDialog}
                  isCompleted={true}
                />
              ))}
            </section>
          ))}
          <div ref={sentinelRef} className="h-4" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              setReservationToCancel={onOpenCancelReservationDialog}
              isCompleted={false}
            />
          ))}
          <div ref={sentinelRef} className="h-4" />
          {isFetchingNextPage && (
            <div className="flex justify-center py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          )}
        </div>
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
