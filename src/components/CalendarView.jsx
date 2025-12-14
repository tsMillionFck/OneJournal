import React from "react";
import { formatDateKey, getStorageKey } from "../data/constants";

const CalendarView = ({
  currentYear,
  currentMonth,
  onOpenJournal,
  onChangeMonth,
  onGoToToday,
  isActive,
}) => {
  const weekdays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Calculate calendar grid data
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const today = new Date();

  // Month title
  const monthTitle = new Date(currentYear, currentMonth, 1).toLocaleDateString(
    "en-US",
    { month: "long" }
  );

  // Check if a day has an entry in localStorage
  const hasEntry = (day) => {
    const dateKey = formatDateKey(currentYear, currentMonth, day);
    return localStorage.getItem(getStorageKey(dateKey)) !== null;
  };

  // Check if a day is today
  const isToday = (day) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  // Generate empty cells for days before the first day of the month
  const emptyCells = Array.from({ length: firstDay }, (_, i) => (
    <div
      key={`empty-${i}`}
      className="border-r border-b border-gray-200 bg-gray-50"
    ></div>
  ));

  // Generate day cells
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const todayClass = isToday(day) ? "bg-white" : "";
    const todayNumClass = isToday(day)
      ? "text-black font-black underline"
      : "text-gray-400 font-medium";
    const entryClass = hasEntry(day) ? "day-has-entry" : "";

    return (
      <div
        key={day}
        className={`border-r border-b border-gray-200 p-4 relative cursor-pointer transition-colors duration-200 hover:bg-gray-50 flex flex-col [&:nth-child(7n)]:border-r-0 ${todayClass} ${entryClass}`}
        onClick={() => onOpenJournal(day)}
      >
        <div className={`text-sm mb-2 ${todayNumClass}`}>{day}</div>
      </div>
    );
  });

  return (
    <div
      id="calendar-view"
      className={`view-section ${isActive ? "active" : "hidden"} bg-gray-100`}
    >
      {/* Header */}
      <header className="px-15 py-10 flex justify-between items-end border-b border-gray-200 bg-gray-100">
        <div>
          <h1 className="font-['Playfair_Display'] text-7xl leading-none m-0 font-black">
            {monthTitle.toUpperCase()}
          </h1>
          <div className="text-sm uppercase tracking-[4px] mt-2 text-gray-400">
            {currentYear}
          </div>
        </div>
        <div className="flex gap-8 items-center">
          <button
            className="bg-transparent border-none text-2xl cursor-pointer text-gray-400 transition-all duration-300 hover:text-black hover:scale-120"
            onClick={() => onChangeMonth(-1)}
          >
            ←
          </button>
          <button
            className="bg-transparent border-none text-2xl cursor-pointer text-gray-400 transition-all duration-300 hover:text-black hover:scale-120"
            onClick={onGoToToday}
          >
            ●
          </button>
          <button
            className="bg-transparent border-none text-2xl cursor-pointer text-gray-400 transition-all duration-300 hover:text-black hover:scale-120"
            onClick={() => onChangeMonth(1)}
          >
            →
          </button>
        </div>
      </header>

      {/* Calendar Grid */}
      <main className="flex-1 grid grid-cols-7 grid-rows-[40px_repeat(6,1fr)] bg-white">
        {/* Weekday Labels */}
        {weekdays.map((day, index) => (
          <div
            key={day}
            className={`border-b border-r border-gray-200 p-2 text-center text-xs font-semibold tracking-widest text-gray-400 ${
              index === 6 ? "border-r-0" : ""
            }`}
          >
            {day}
          </div>
        ))}
        {emptyCells}
        {dayCells}
      </main>
    </div>
  );
};

export default CalendarView;
