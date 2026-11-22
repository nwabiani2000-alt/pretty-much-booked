"use client";

import {
  emergencyTimeSlots,
  formatDayLabel,
  formatHourLabel,
  nextFourteenDays,
  sameDay,
  standardTimeSlots,
} from "@/lib/booking-time";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type DateTimePickerProps = {
  emergency: boolean;
  selectedDate: Date | null;
  selectedHour: number | null;
  onSelectDate: (date: Date) => void;
  onSelectHour: (hour: number) => void;
};

export function DateTimePicker({
  emergency,
  selectedDate,
  selectedHour,
  onSelectDate,
  onSelectHour,
}: DateTimePickerProps) {
  const days = useMemo(() => nextFourteenDays(), []);
  const emergencySlots = useMemo(() => emergencyTimeSlots(), []);

  if (emergency) {
    return (
      <div>
        <p className="mb-2 text-sm font-semibold text-brand-dark">
          ASAP slots (next 3 hours)
        </p>
        <div className="grid grid-cols-3 gap-2">
          {emergencySlots.map((slot) => {
            const active =
              selectedDate &&
              sameDay(selectedDate, slot.date) &&
              selectedHour === slot.hour;
            return (
              <button
                key={slot.date.toISOString()}
                type="button"
                onClick={() => {
                  onSelectDate(slot.date);
                  onSelectHour(slot.hour);
                }}
                className={cn(
                  "rounded-xl px-2 py-3 text-center text-xs font-semibold transition",
                  active
                    ? "bg-brand-purple text-white shadow-md shadow-brand-purple/30"
                    : "bg-white text-brand-dark ring-1 ring-brand-purple/10 hover:bg-brand-purple-light"
                )}
              >
                <span className="block text-[10px] font-medium opacity-80">
                  {formatDayLabel(slot.date)}
                </span>
                {formatHourLabel(slot.hour)}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-brand-dark">Date</p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none">
          {days.map((day) => {
            const active = selectedDate ? sameDay(selectedDate, day) : false;
            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => onSelectDate(day)}
                className={cn(
                  "min-w-[4.5rem] shrink-0 rounded-2xl px-3 py-2.5 text-center transition",
                  active
                    ? "bg-brand-purple text-white shadow-md shadow-brand-purple/30"
                    : "bg-white text-brand-dark ring-1 ring-brand-purple/10"
                )}
              >
                <span className="block text-[10px] font-medium opacity-80">
                  {day.toLocaleDateString("en-GB", { weekday: "short" })}
                </span>
                <span className="text-sm font-bold">{day.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-brand-dark">Time</p>
        <div className="grid grid-cols-3 gap-2">
          {standardTimeSlots().map((hour) => {
            const active = selectedHour === hour;
            return (
              <button
                key={hour}
                type="button"
                onClick={() => onSelectHour(hour)}
                className={cn(
                  "rounded-xl py-2.5 text-sm font-semibold transition",
                  active
                    ? "bg-brand-purple text-white shadow-md shadow-brand-purple/30"
                    : "bg-white text-brand-dark ring-1 ring-brand-purple/10 hover:bg-brand-purple-light"
                )}
              >
                {formatHourLabel(hour)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
