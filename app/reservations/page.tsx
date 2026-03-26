"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { PageSkeleton } from "@/components/page-skeleton";
import { ReservationsList } from "./reservations-list";
import { ReservationListFilterEnum } from "@/hooks/api/reservations";

export default function ProductsPage() {
  const searchParams = useSearchParams();

  // Get type from URL query params
  const filter = useMemo(() => {
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

  return (
    <PageSkeleton
      title="Reserves"
      sections={[
        {
          content: <ReservationsList filter={filter} />,
        },
      ]}
    />
  );
}
