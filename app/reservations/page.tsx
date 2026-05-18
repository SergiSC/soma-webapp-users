"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PageSkeleton } from "@/components/page-skeleton";
import { ReservationsList } from "./reservations-list";
import { ReservationListFilterEnum } from "@/hooks/api/reservations";
import { AccumulatedReservationsList } from "./accumulated-reservations-list";

export default function ProductsPage() {
  const searchParams = useSearchParams();

  // Get type from URL query params
  const component = useMemo(() => {
    const filterParam =
      searchParams.get("filter") ?? ReservationListFilterEnum.FUTURE;

    switch (filterParam) {
      case ReservationListFilterEnum.ACCUMULATED:
        return (
          <AccumulatedReservationsList
            filter={filterParam as ReservationListFilterEnum}
          />
        );
      default:
        return (
          <ReservationsList filter={filterParam as ReservationListFilterEnum} />
        );
    }
  }, [searchParams]);

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
