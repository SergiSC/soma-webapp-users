"use client";

import { useMemo, useRef, useEffect, useCallback, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useDailySessions } from "@/hooks/api/daily-sessions";
import { SessionCard } from "@/components/cards/session-card";
import { cn } from "@/lib/utils";
import {
  CATALAN_MONTHS,
  CATALAN_WEEKDAYS,
  catalanIntlDayFormatter,
} from "@/lib/constants";
import { SessionReservationDialog } from "@/components/dialogs/session-reservation-dialog";
import { useUser } from "@/context/user-context";
import { UserType } from "@/hooks/api/users";
import { EmptyState } from "@/components/empty-state";
import { CalendarIcon } from "lucide-react";

// Helper function to format date as YYYY-MM-DD in local timezone (not UTC)
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function Timetable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const today = useMemo(() => new Date(), []);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  const isAdminOrTeacher =
    user?.type === UserType.ADMIN || user?.type === UserType.TEACHER;

  // Get date from URL query params or default to today
  const selectedDate = useMemo(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const [year, month, day] = dateParam.split("-").map(Number);
      if (year && month && day) {
        const parsedDate = new Date(year, month - 1, day, 12, 0, 0);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }
    return today;
  }, [searchParams, today]);

  // Update URL when selectedDate changes
  const updateUrlDate = useCallback(
    (date: Date) => {
      const dateString = formatDateLocal(date);
      const params = new URLSearchParams(searchParams.toString());
      params.set("date", dateString);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Initialize URL with today's date if no date parameter exists
  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (!dateParam) {
      const todayString = formatDateLocal(today);
      const params = new URLSearchParams(searchParams.toString());
      params.set("date", todayString);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [pathname, router, searchParams, today]);

  const { data: sessions, isLoading } = useDailySessions({
    date: selectedDate,
  });

  // Generate a flat range of days spanning 3 months.
  // Admins/teachers can see from the 1st of the current month; others start from today.
  const daysRange = useMemo(() => {
    const startDate = isAdminOrTeacher
      ? new Date(today.getFullYear(), today.getMonth() - 2, 1, 12, 0, 0)
      : new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate(),
          12,
          0,
          0,
        );

    const endDate = new Date(
      today.getFullYear(),
      today.getMonth() + 3,
      0,
      12,
      0,
      0,
    );

    const days: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [today, isAdminOrTeacher]);

  const daysByMonth = useMemo(() => {
    const groups: { key: string; monthIndex: number; days: Date[] }[] = [];
    for (const day of daysRange) {
      const key = `${day.getFullYear()}-${day.getMonth()}`;
      const last = groups[groups.length - 1];
      if (!last || last.key !== key) {
        groups.push({
          key,
          monthIndex: day.getMonth(),
          days: [day],
        });
      } else {
        last.days.push(day);
      }
    }
    return groups;
  }, [daysRange]);

  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isSelected = (date: Date) =>
    date.getDate() === selectedDate.getDate() &&
    date.getMonth() === selectedDate.getMonth() &&
    date.getFullYear() === selectedDate.getFullYear();

  const isPastDay = (date: Date) => {
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const t = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return d < t;
  };

  // Scroll selected date to center
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const selectedButton = container.querySelector(
      `[data-date="${formatDateLocal(selectedDate)}"]`,
    ) as HTMLElement;

    if (selectedButton) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = selectedButton.getBoundingClientRect();
      const scrollLeft =
        container.scrollLeft +
        buttonRect.left -
        containerRect.left -
        containerRect.width / 2 +
        buttonRect.width / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: "smooth",
      });
    }
  }, [selectedDate]);

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky -top-px z-10 bg-background">
        {/* Scrollable Days List */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden items-end"
        >
          {daysByMonth.map((group) => (
            <div key={group.key} className="flex shrink-0 items-end gap-2">
              <div
                className={cn(
                  "sticky left-0 z-10 h-20 flex items-end self-stretch border-r border-border/60 bg-background pb-2 pr-2",
                  "text-xs font-semibold text-primary",
                )}
              >
                {CATALAN_MONTHS[group.monthIndex]}
              </div>
              <div className="flex gap-2 items-end mb-2">
                {group.days.map((day) => (
                  <Button
                    key={formatDateLocal(day)}
                    data-date={formatDateLocal(day)}
                    variant={isSelected(day) ? "default" : "outline"}
                    onClick={() => updateUrlDate(day)}
                    className={cn(
                      "min-w-[50px] flex flex-col gap-1 h-auto py-2 px-3",
                      isToday(day) && "border-2 border-primary",
                      isPastDay(day) && !isSelected(day) && "opacity-50",
                    )}
                  >
                    <span className="text-xs  text-muted-foreground">
                      {CATALAN_WEEKDAYS[(day.getDay() + 6) % 7]}
                    </span>
                    <span className="text-base font-semibold">
                      {day.getDate()}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sessions List */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            Carregant sessions...
          </div>
        ) : !sessions || sessions.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon className="w-10 h-10 text-muted-foreground" />}
            message={`No hi ha classes programades pel ${catalanIntlDayFormatter.format(selectedDate)}`}
          />
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onSelect={setSelectedSessionId}
              />
            ))}
          </div>
        )}
      </div>
      <SessionReservationDialog
        session={
          sessions?.find((session) => session.id === selectedSessionId) ?? null
        }
        open={selectedSessionId !== null}
        onOpenChange={() => setSelectedSessionId(null)}
      />
    </div>
  );
}
