"use client";

import { Loader2 } from "lucide-react";
import { useInfiniteUserAccumulatedSessions } from "@/hooks/api/reservations";
import { useUser } from "@/context/user-context";
import { useEffect, useRef } from "react";
import { AccumulatedSessionCard } from "@/components/cards/accumulated-session.card";

export function AccumulatedReservationsList() {
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
