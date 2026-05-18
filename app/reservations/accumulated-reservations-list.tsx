"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  setFilter: (filter: ReservationListFilterEnum) => void;
}

export function AccumulatedReservationsList({
  filter,
}: AccumulatedReservationsListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", value);
    router.push(`?${params.toString()}`);
  }

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
          <TabsTrigger value={ReservationListFilterEnum.ACCUMULATED}>
            Acumulades
          </TabsTrigger>
        </TabsList>
      </Tabs>

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
