"use client";

import { useRouter } from "next/navigation";
import { CalendarIcon, Loader2 } from "lucide-react";
import {
  ReservationListFilterEnum,
  useInfiniteUserAccumulatedSessions,
} from "@/hooks/api/reservations";
import { useUser } from "@/context/user-context";
import { useEffect, useRef } from "react";
import { EmptyState } from "@/components/empty-state";
import { Separator } from "@/components/ui/separator";
import { AccumulatedSessionCard } from "@/components/cards/accumulated-session.card";

interface AccumulatedReservationsListProps {
  filter: ReservationListFilterEnum;
}

export function AccumulatedReservationsList({
  filter,
}: AccumulatedReservationsListProps) {
  const router = useRouter();
  const { user } = useUser();
  const { data, isLoading, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useInfiniteUserAccumulatedSessions(user?.id);

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

  const accumulatedSessions = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="flex flex-col gap-4">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : accumulatedSessions.length === 0 ? (
        <EmptyState
          icon={<CalendarIcon className="size-10 text-muted-foreground" />}
          message={`No tens cap reserva ${textMap[filter]}`}
          button={
            filter === ReservationListFilterEnum.FUTURE
              ? {
                  text: "Reservar classe",
                  onClick: () => {
                    router.push("/sessions");
                  },
                }
              : undefined
          }
        />
      ) : filter === ReservationListFilterEnum.PAST ? (
        <div className="flex flex-col gap-4">
          {accumulatedSessions.map((accumulatedSession, index) => (
            <section
              key={accumulatedSession.id}
              className="flex flex-col gap-4"
            >
              {index > 0 && <Separator orientation="horizontal" />}
              <h2 className="text-lg font-semibold uppercase tracking-widest text-muted-foreground px-1">
                {accumulatedSession.expiresAt}
              </h2>
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
          {accumulatedSessions.map((accumulatedSession) => (
            <AccumulatedSessionCard
              key={accumulatedSession.id}
              accumulatedSession={accumulatedSession}
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
    </div>
  );
}

const textMap: Record<ReservationListFilterEnum, string> = {
  [ReservationListFilterEnum.FUTURE]: "pròximament",
  [ReservationListFilterEnum.PAST]: "completada",
  [ReservationListFilterEnum.ACCUMULATED]: "acumulada",
};
