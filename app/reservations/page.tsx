"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageSkeleton } from "@/components/page-skeleton";
import { ReservationsList } from "./reservations-list";
import { ReservationListFilterEnum } from "@/hooks/api/reservations";
import { AccumulatedReservationsList } from "./accumulated-reservations-list";

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const setFilter = useCallback(
    (filter: ReservationListFilterEnum) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("filter", filter);
      router.push(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  // Get type from URL query params
  const component = useMemo(() => {
    const filterParam =
      searchParams.get("filter") ?? ReservationListFilterEnum.FUTURE;
    if (
      Object.values(ReservationListFilterEnum).includes(
        filterParam as ReservationListFilterEnum,
      )
    ) {
      if (filterParam === ReservationListFilterEnum.ACCUMULATED) {
        return (
          <AccumulatedReservationsList
            filter={filterParam as ReservationListFilterEnum}
            setFilter={setFilter}
          />
        );
      } else {
        return (
          <ReservationsList
            filter={filterParam as ReservationListFilterEnum}
            setFilter={setFilter}
          />
        );
      }
    }
    return (
      <AccumulatedReservationsList
        filter={ReservationListFilterEnum.FUTURE}
        setFilter={setFilter}
      />
    );
  }, [searchParams, setFilter]);

  return (
    <PageSkeleton
      title="Reserves"
      sections={[
        {
          content: component,
        },
      ]}
    />
  );
}
