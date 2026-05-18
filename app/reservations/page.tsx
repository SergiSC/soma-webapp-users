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
    const filterParam = searchParams.get("filter");
    if (
      filterParam &&
      Object.values(ReservationListFilterEnum).includes(
        filterParam as ReservationListFilterEnum,
      )
    ) {
      if (filterParam === ReservationListFilterEnum.ACCUMULATED) {
        return (
          <AccumulatedReservationsList
            filter={filterParam as ReservationListFilterEnum}
          />
        );
      } else {
        return (
          <ReservationsList filter={filterParam as ReservationListFilterEnum} />
        );
      }
    }
    return (
      <AccumulatedReservationsList filter={ReservationListFilterEnum.FUTURE} />
    );
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
