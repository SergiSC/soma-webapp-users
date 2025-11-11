"use client";

import { Calendar as CalendarIcon, ChevronDownIcon } from "lucide-react";

import { formatDate } from "date-fns";
import { ca } from "date-fns/locale/ca";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";

interface DatePickerProps {
  date: Date;
  setDate: (date: Date | undefined) => void;
  placeholder: string;
  errorMessage?: string;
  maxDate?: Date;
}

export function DatePicker({
  date,
  setDate,
  placeholder,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          id="date"
          className=" justify-between font-normal"
        >
          <CalendarIcon />
          {date
            ? formatDate(date, "dd MMM yyyy", {
                locale: ca,
              })
            : placeholder}
          <ChevronDownIcon className="ml-auto" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full overflow-hidden p-0" align="center">
        <Calendar
          mode="single"
          weekStartsOn={0}
          lang="ca"
          selected={date}
          locale={ca}
          endMonth={maxDate}
          captionLayout="dropdown"
          onSelect={(date) => {
            setDate(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
