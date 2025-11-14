"use client";

import { useMemo, useRef, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDailySessions } from "@/hooks/api/daily-sessions";
import { SessionCard } from "@/components/cards/session-card";
import { cn } from "@/lib/utils";

const CATALAN_MONTHS = [
  "Gen",
  "Feb",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Oct",
  "Nov",
  "Des",
];

const CATALAN_WEEKDAYS = ["Dl", "Dt", "Dc", "Dj", "Dv", "Ds", "Dg"];

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

  // Get date from URL query params or default to today
  const selectedDate = useMemo(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      // Parse YYYY-MM-DD format in local timezone
      const [year, month, day] = dateParam.split("-").map(Number);
      if (year && month && day) {
        // Create date at noon local time to avoid DST/timezone edge cases
        const parsedDate = new Date(year, month - 1, day, 12, 0, 0);
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }
    }
    return today;
  }, [searchParams, today]);

  const currentMonth = useMemo(
    () =>
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        1,
        12,
        0,
        0
      ),
    [selectedDate]
  );

  // Update URL when selectedDate changes
  const updateUrlDate = useCallback(
    (date: Date) => {
      const dateString = formatDateLocal(date);
      const params = new URLSearchParams(searchParams.toString());
      params.set("date", dateString);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
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

  // Get all days in the current month
  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0, 12, 0, 0);
    const days: Date[] = [];

    // If it's the current month, start from today
    const startDate =
      year === today.getFullYear() && month === today.getMonth()
        ? today.getDate()
        : 1;

    for (let day = startDate; day <= lastDay.getDate(); day++) {
      // Create date at noon local time to avoid DST/timezone edge cases
      const date = new Date(year, month, day, 12, 0, 0);
      days.push(date);
    }

    return days;
  }, [currentMonth, today]);

  const handlePreviousMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1,
      12,
      0,
      0
    );
    // Reset selected date to first available day of new month
    const year = newMonth.getFullYear();
    const month = newMonth.getMonth();
    const firstAvailableDay =
      year === today.getFullYear() && month === today.getMonth()
        ? today.getDate()
        : 1;
    const newDate = new Date(year, month, firstAvailableDay, 12, 0, 0);
    updateUrlDate(newDate);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1,
      12,
      0,
      0
    );
    // Reset selected date to first available day of new month
    const year = newMonth.getFullYear();
    const month = newMonth.getMonth();
    const firstAvailableDay =
      year === today.getFullYear() && month === today.getMonth()
        ? today.getDate()
        : 1;
    const newDate = new Date(year, month, firstAvailableDay, 12, 0, 0);
    updateUrlDate(newDate);
  };

  const formatMonthYear = (date: Date) => {
    const month = CATALAN_MONTHS[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${year}`;
  };

  const formatDay = (date: Date) => {
    return date.getDate().toString();
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isPreviousMonthInPast = useMemo(() => {
    const previousMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1,
      12,
      0,
      0
    );
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1,
      12,
      0,
      0
    );
    return previousMonth < todayStart;
  }, [currentMonth, today]);

  // Scroll selected date to center
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const selectedButton = container.querySelector(
      `[data-date="${formatDateLocal(selectedDate)}"]`
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
  }, [selectedDate, currentMonth]);

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-0 z-10 bg-background">
        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousMonth}
            disabled={isPreviousMonthInPast}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold">
            {formatMonthYear(currentMonth)}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Days List */}
        <div
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {daysInMonth.map((day) => (
            <Button
              key={formatDateLocal(day)}
              data-date={formatDateLocal(day)}
              variant={isSelected(day) ? "default" : "outline"}
              onClick={() => updateUrlDate(day)}
              className={cn(
                "min-w-[50px] flex flex-col gap-1 h-auto py-2 px-3",
                isToday(day) && !isSelected(day) && "border-2 border-primary"
              )}
            >
              <span className="text-xs text-muted-foreground">
                {CATALAN_WEEKDAYS[(day.getDay() + 6) % 7]}
              </span>
              <span className="text-base font-semibold">{formatDay(day)}</span>
            </Button>
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
          <div className="text-center text-muted-foreground py-8">
            No hi ha sessions disponibles per aquest dia
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
