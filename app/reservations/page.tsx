"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageSkeleton } from "@/components/page-skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReservationsList } from "./reservations-list";
import { ReservationListFilterEnum } from "@/hooks/api/reservations";
import { AccumulatedReservationsList } from "./accumulated-reservations-list";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const filter = useMemo<ReservationListFilterEnum>(() => {
    const filterParam = searchParams.get("filter");
    if (
      filterParam &&
      Object.values(ReservationListFilterEnum).includes(
        filterParam as ReservationListFilterEnum,
      )
    ) {
      return filterParam as ReservationListFilterEnum;
    }
    return ReservationListFilterEnum.FUTURE;
  }, [searchParams]);

  const setFilter = useCallback(
    (next: ReservationListFilterEnum) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("filter", next);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  return (
    <PageSkeleton
      title="Reserves"
      sections={[
        {
          content: (
            <div className="flex flex-col gap-4">
              <Tabs
                value={filter}
                onValueChange={(value) =>
                  setFilter(value as ReservationListFilterEnum)
                }
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
              {filter === ReservationListFilterEnum.ACCUMULATED ? (
                <AccumulatedReservationsList filter={filter} />
              ) : (
                <ReservationsList filter={filter} />
              )}
            </div>
          ),
        },
      ]}
    />
  );
}
