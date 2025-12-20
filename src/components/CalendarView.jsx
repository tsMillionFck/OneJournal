import React from "react";
import {
  formatDateKey,
  getStorageKey,
  getTodosForDate,
} from "../data/constants";

const CalendarView = ({
  currentYear,
  currentMonth,
  onOpenJournal,
  onChangeMonth,
  onGoToToday,
  onOpenGraph,
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
      className="hidden md:block border-r border-b border-gray-200 bg-gray-50"
    ></div>
  ));

  // Generate day cells
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(currentYear, currentMonth, day);
    const weekdayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const todayClass = isToday(day) ? "bg-white" : "";
    const todayNumClass = isToday(day)
      ? "text-black font-black underline"
      : "text-gray-400 font-medium";
    const entryClass = hasEntry(day) ? "day-has-entry" : "";

    const todos = getTodosForDate(
      formatDateKey(currentYear, currentMonth, day)
    );
    const topTodos = todos.slice(0, 3);

    return (
      <div
        key={day}
        className={`w-full md:w-auto border-b border-gray-200 md:border-r p-3 md:p-4 relative cursor-pointer transition-colors duration-200 hover:bg-gray-50 flex flex-col md:[&:nth-child(7n)]:border-r-0 ${todayClass} ${entryClass}`}
        onClick={() => onOpenJournal(day)}
      >
        <div
          className={`text-xs md:text-sm mb-2 flex items-baseline gap-2 ${todayNumClass}`}
        >
          <span className="md:hidden text-gray-400 font-medium uppercase tracking-wider text-[10px]">
            {weekdayName}
          </span>
          <span>{day}</span>
        </div>
        <div className="flex flex-col gap-1 mt-1 overflow-hidden">
          {topTodos.map((todo) => (
            <div
              key={todo.id}
              className="text-[10px] text-gray-500 truncate flex items-center gap-1"
            >
              <span
                className={`w-1 h-1 rounded-full ${
                  todo.completed ? "bg-gray-300" : "bg-black"
                }`}
              ></span>
              <span className={todo.completed ? "line-through opacity-50" : ""}>
                {todo.text}
              </span>
            </div>
          ))}
          {todos.length > 3 && (
            <div className="text-[9px] text-gray-400 pl-2 block">
              +{todos.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  });

  return (
    <div
      id="calendar-view"
      className={`view-section ${isActive ? "active" : "hidden"} bg-gray-100`}
    >
      {/* Header */}
      <header className="px-4 md:px-15 py-6 md:py-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 bg-gray-100 gap-4 md:gap-0 shrink-0">
        <div>
          <h1 className="font-['Playfair_Display'] text-5xl md:text-7xl leading-none m-0 font-black">
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
          <div className="flex gap-4 items-center border-l border-gray-200 pl-8 ml-4">
            <button
              className="bg-transparent border-none text-xs uppercase tracking-widest cursor-pointer text-gray-400 transition-all duration-300 hover:text-black hover:scale-105"
              onClick={onOpenGraph}
            >
              Insights
            </button>
          </div>
        </div>
      </header>

      {/* Calendar Grid */}
      <main className="flex-1 flex flex-col md:grid md:grid-cols-7 md:grid-rows-[40px_repeat(6,1fr)] bg-white overflow-y-auto md:overflow-visible">
        {/* Weekday Labels */}
        {weekdays.map((day, index) => (
          <div
            key={day}
            className={`hidden md:block border-b border-r border-gray-200 p-2 text-center font-semibold tracking-widest text-gray-400 text-[10px] md:text-xs ${
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
