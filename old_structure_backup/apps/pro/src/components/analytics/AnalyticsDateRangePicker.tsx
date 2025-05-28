
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface DateRangePickerProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  onUpdate: (range: { from: Date; to: Date }) => void;
  align?: "start" | "center" | "end";
  className?: string;
}

export function AnalyticsDateRangePicker({
  dateRange,
  onUpdate,
  align = "start",
  className,
}: DateRangePickerProps) {
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const { from, to } = dateRange;
      
      // If both dates are already set or neither is set, start a new range
      if ((from && to) || (!from && !to)) {
        onUpdate({ from: date, to: date });
      } 
      // If only 'from' is set, and the new date is after it, set 'to'
      else if (from && !to && date > from) {
        onUpdate({ from, to: date });
      }
      // If only 'from' is set but the new date is before it, set the new date as 'from'
      else if (from && !to && date <= from) {
        onUpdate({ from: date, to: from });
      }
      // If only 'to' is set and the new date is before it, set 'from'
      else if (!from && to && date <= to) {
        onUpdate({ from: date, to });
      }
      // If only 'to' is set but the new date is after it, set the new date as 'to'
      else if (!from && to && date > to) {
        onUpdate({ from: to, to: date });
      }
    }
  };

  const displayValue = dateRange.from && dateRange.to
    ? `${format(dateRange.from, "LLL d, y")} - ${format(dateRange.to, "LLL d, y")}`
    : "Select date range";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal w-full md:w-[300px]",
            !dateRange.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent align={align} className="w-auto p-0">
        <Calendar
          mode="range"
          defaultMonth={dateRange.from}
          selected={{
            from: dateRange.from,
            to: dateRange.to,
          }}
          onSelect={(range) => {
            if (range?.from && range?.to) {
              onUpdate({ from: range.from, to: range.to });
            }
          }}
          numberOfMonths={2}
          initialFocus
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
}
