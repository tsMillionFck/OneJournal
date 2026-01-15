import React from "react";
import {
  formatDateKey,
  getStorageKey,
  getTodosForDate,
} from "../data/constants";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { User, LogIn, ChevronLeft, ChevronRight, Target } from "lucide-react";

const CalendarView = ({
  currentYear,
  currentMonth,
  onOpenJournal,
  onChangeMonth,
  onGoToToday,
  onOpenGraph,
  onOpenDailyLog,
  isActive,
}) => {
  const { user } = useContext(AuthContext);
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

  return (
    <div
      id="calendar-view"
      className={`view-section ${
        isActive ? "active" : "hidden"
      } fixed inset-0 bg-gray-100 z-10 flex flex-col`}
    >
      {/* Dynamic Island Header */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50">
        <header className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-full px-6 py-2.5 flex items-center gap-6 transition-all duration-300 hover:shadow-3xl hover:-translate-y-0.5">
          {/* Login/Profile Button */}
          <div className="group relative border-r border-gray-200 pr-6 mr-[-12px]">
            {user ? (
              <Link
                to="/profile"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white hover:bg-gray-800 transition-all duration-300"
                title="Profile"
              >
                <User className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/auth"
                className="flex items-center justify-start w-8 h-8 rounded-full bg-gray-100/50 hover:bg-black group-hover:w-24 transition-all duration-500 ease-in-out overflow-hidden p-0"
              >
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <LogIn className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <span className="flex-1 text-center whitespace-nowrap font-bold text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pr-1">
                  LOGIN
                </span>
              </Link>
            )}
          </div>

          {/* Title & Date */}
          <div className="flex items-baseline gap-3 border-r border-gray-200 pr-6">
            <h1 className="font-['Playfair_Display'] text-xl font-black tracking-tight">
              {monthTitle.toUpperCase()}
            </h1>
            <span className="text-xs font-medium text-gray-400 tracking-wider">
              {currentYear}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-full p-1 gap-1">
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-black"
                onClick={() => onChangeMonth(-1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-black"
                onClick={onGoToToday}
              >
                <Target className="w-3.5 h-3.5" />
              </button>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm transition-all text-gray-400 hover:text-black"
                onClick={() => onChangeMonth(1)}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-gray-200 mx-2"></div>

            <button
              className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black px-4 py-2 transition-colors"
              onClick={onOpenGraph}
            >
              Insights
            </button>
            <button
              className="bg-black text-white text-xs font-bold uppercase tracking-widest px-6 py-2.5 rounded-full hover:bg-gray-800 transition-all hover:shadow-lg hover:scale-105 active:scale-95 ml-2 whitespace-nowrap"
              onClick={onOpenDailyLog}
            >
              Daily Log
            </button>
          </div>
        </header>
      </div>

      {/* Branding Text */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 text-[10rem] font-black font-['Playfair_Display'] text-gray-900/5 pointer-events-none whitespace-nowrap z-0 select-none">
        One-Journal
      </div>

      {/* Calendar Grid */}
      <main className="flex-1 flex flex-col md:grid md:grid-cols-7 md:grid-rows-[40px_repeat(6,1fr)] bg-gray-200 h-full pb-24 gap-px">
        {/* Weekday Labels */}
        {weekdays.map((day, index) => (
          <div
            key={day}
            className="hidden md:flex items-center justify-center p-2 text-[10px] font-bold tracking-[0.2em] text-gray-400 bg-white"
          >
            {day}
          </div>
        ))}

        {/* Empty Cells */}
        {Array.from({ length: firstDay }, (_, i) => (
          <div
            key={`empty-${i}`}
            className="hidden md:block bg-gray-50/50"
          ></div>
        ))}

        {/* Day Cells */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(currentYear, currentMonth, day);
          const weekdayName = date.toLocaleDateString("en-US", {
            weekday: "short",
          });
          const todayStyles = isToday(day)
            ? "bg-white ring-1 ring-black inset-0 z-10"
            : "bg-white hover:bg-gray-50/80";
          const todayTextStyles = isToday(day)
            ? "text-black font-black"
            : "text-gray-400 font-medium";
          const entryMarker = hasEntry(day) ? (
            <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-black rounded-full"></div>
          ) : null;

          const todos = getTodosForDate(
            formatDateKey(currentYear, currentMonth, day)
          );
          const topTodos = todos.slice(0, 4); // Show one more since we have space

          return (
            <div
              key={day}
              className={`w-full md:w-auto p-3 relative cursor-pointer transition-all duration-200 flex flex-col group ${todayStyles}`}
              onClick={() => onOpenJournal(day)}
            >
              {entryMarker}
              <div
                className={`text-sm mb-3 flex items-baseline justify-between ${todayTextStyles}`}
              >
                <span>{day}</span>
                <span className="md:hidden text-[10px] uppercase tracking-wider opacity-60">
                  {weekdayName}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 overflow-hidden">
                {topTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-2 group-hover:-translate-y-0.5 transition-transform duration-200"
                  >
                    <div
                      className={`w-1 h-1 rounded-full shrink-0 ${
                        todo.completed ? "bg-gray-300" : "bg-black"
                      }`}
                    ></div>
                    <span
                      className={`text-[10px] truncate leading-tight ${
                        todo.completed
                          ? "text-gray-300 line-through"
                          : "text-gray-500 group-hover:text-black"
                      }`}
                    >
                      {todo.text}
                    </span>
                  </div>
                ))}

                {todos.length > 4 && (
                  <div className="text-[9px] font-medium text-gray-300 group-hover:text-gray-400 pl-3 mt-0.5">
                    +{todos.length - 4} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default CalendarView;
