import React, { useState, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  formatDateKey,
  getStorageKey,
  getTodosForDate,
  quotes,
} from "../data/constants";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { User, ChevronLeft, ChevronRight, Target, Settings, X } from "lucide-react";

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  useGSAP(() => {
    if (isDrawerOpen) {
      gsap.to(drawerRef.current, { y: 0, duration: 0.4, ease: "power3.out" });
    } else {
      gsap.to(drawerRef.current, { y: "100%", duration: 0.3, ease: "power3.in" });
    }
  }, [isDrawerOpen]);

  // Random quote for mobile — stable per mount
  const quote = useMemo(() => quotes[Math.floor(Math.random() * quotes.length)], []);

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
    <motion.div
      id="calendar-view"
      initial={false}
      animate={isActive ? "active" : "hidden"}
      variants={{
        active: { opacity: 1, pointerEvents: "auto", zIndex: 10, scale: 1 },
        hidden: { opacity: 0, pointerEvents: "none", zIndex: 0, scale: 0.98 },
      }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="view-section fixed inset-0 bg-gray-100 z-10 flex flex-col"
    >
      {/* Dynamic Island Header */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 hidden md:block">
        <header className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-2xl rounded-full px-6 py-2.5 flex items-center gap-6 transition-all duration-300 hover:shadow-3xl hover:-translate-y-0.5">
          {/* Profile Button */}
          <div className="group relative border-r border-gray-200 pr-6 mr-[-12px]">
            <Link
              to="/profile"
              className="flex items-center justify-center w-8 h-8 rounded-full bg-black text-white hover:bg-gray-800 transition-all duration-300"
              title="Profile"
            >
              <User className="w-4 h-4" />
            </Link>
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
      {/* Mobile Options FAB */}
      <button 
        onClick={() => setIsDrawerOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 bg-black text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Mobile Drawer Content */}
      <div 
        ref={drawerRef}
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 p-6 flex flex-col gap-6 translate-y-full"
      >
        <div className="flex justify-between items-center border-b pb-4">
          <div className="flex items-baseline gap-2">
            <h2 className="font-['Playfair_Display'] text-2xl font-black">{monthTitle.toUpperCase()}</h2>
            <span className="text-sm font-medium text-gray-400">{currentYear}</span>
          </div>
          <button onClick={() => setIsDrawerOpen(false)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:text-black hover:bg-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-between items-center bg-gray-50 rounded-2xl p-2">
          <button className="p-3 text-gray-500 hover:text-black hover:bg-white rounded-xl shadow-sm transition-all" onClick={() => onChangeMonth(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="px-6 py-2 font-['Inter'] text-sm font-bold tracking-widest hover:bg-white rounded-xl shadow-sm transition-all" onClick={onGoToToday}>
            TODAY
          </button>
          <button className="p-3 text-gray-500 hover:text-black hover:bg-white rounded-xl shadow-sm transition-all" onClick={() => onChangeMonth(1)}>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={() => { setIsDrawerOpen(false); onOpenDailyLog(); }} className="w-full bg-black text-white py-4 rounded-2xl font-bold tracking-widest text-sm uppercase">
            Daily Log
          </button>
          <button onClick={() => { setIsDrawerOpen(false); onOpenGraph(); }} className="w-full bg-gray-100 text-black py-4 rounded-2xl font-bold tracking-widest text-sm uppercase border border-gray-200">
            Insights
          </button>
        </div>
      </div>


      {/* Branding Text */}
      <div className="fixed bottom-2 left-1/2 -translate-x-1/2 text-[4rem] md:text-[10rem] font-black font-['Playfair_Display'] text-gray-900/5 pointer-events-none whitespace-nowrap z-0 select-none">
        One-Journal
      </div>

      {/* Mobile Compact Calendar */}
      <div className="md:hidden flex-1 flex flex-col bg-gray-100 px-4 pt-4 pb-28 overflow-y-auto">
        {/* Mobile Month Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-500 active:scale-95 transition-transform"
              onClick={() => onChangeMonth(-1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white shadow-sm text-gray-500 active:scale-95 transition-transform"
              onClick={() => onChangeMonth(1)}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="ml-2">
              <h2 className="font-['Playfair_Display'] text-xl font-black leading-tight">{monthTitle}</h2>
              <span className="text-[11px] font-medium text-gray-400 tracking-wider">{currentYear}</span>
            </div>
          </div>
          <button
            className="px-4 py-2 text-[11px] font-bold tracking-widest uppercase bg-white rounded-full shadow-sm text-gray-600 active:scale-95 transition-transform"
            onClick={onGoToToday}
          >
            Today
          </button>
        </div>

        {/* Mobile Weekday Labels */}
        <div className="grid grid-cols-7 mb-1">
          {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
            <div key={i} className="text-center text-[11px] font-semibold text-gray-400 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Mobile Day Grid */}
        <div className="grid grid-cols-7 bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          {/* Empty leading cells */}
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`m-empty-${i}`} className="aspect-square" />
          ))}
          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayIsToday = isToday(day);
            const dayHasEntry = hasEntry(day);
            return (
              <button
                key={`m-day-${day}`}
                className="aspect-square flex flex-col items-center justify-center relative active:bg-gray-100 transition-colors"
                onClick={() => onOpenJournal(day)}
              >
                <span
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-sm ${
                    dayIsToday
                      ? "bg-black text-white font-bold"
                      : "text-gray-700 font-medium"
                  }`}
                >
                  {day}
                </span>
                {dayHasEntry && (
                  <span
                    className={`absolute bottom-1.5 w-1 h-1 rounded-full ${
                      dayIsToday ? "bg-white" : "bg-black"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="flex gap-3 mt-5">
          <button
            onClick={onOpenDailyLog}
            className="flex-1 bg-black text-white py-4 rounded-2xl font-['Inter'] font-bold tracking-widest text-xs uppercase active:scale-[0.98] transition-transform shadow-sm"
          >
            ⚡ Daily Log
          </button>
          <button
            onClick={onOpenGraph}
            className="flex-1 bg-white text-black py-4 rounded-2xl font-['Inter'] font-bold tracking-widest text-xs uppercase border border-gray-200 active:scale-[0.98] transition-transform shadow-sm"
          >
            Insights
          </button>
        </div>

        {/* Quote Card */}
        <div className="mt-5 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="font-['Playfair_Display'] italic text-base leading-relaxed text-gray-700">
            "{quote.text}"
          </div>
          <span className="block mt-3 font-['Inter'] text-[11px] uppercase tracking-widest text-gray-400">
            — {quote.author}
          </span>
        </div>

        {/* Today's date display */}
        <div className="mt-5 text-center">
          <div className="font-['Playfair_Display'] text-5xl font-black text-gray-200">
            {today.getDate()}
          </div>
          <div className="font-['Inter'] text-[11px] uppercase tracking-[0.3em] text-gray-300 mt-1">
            {today.toLocaleDateString("en-US", { weekday: "long" })}
          </div>
        </div>
      </div>

      {/* Calendar Grid (Desktop) */}
      <main className="hidden md:grid md:grid-cols-7 md:grid-rows-[40px_repeat(6,1fr)] bg-gray-200 h-full pb-24 gap-px overflow-y-auto">
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
              className={`w-full md:w-auto p-3 relative cursor-pointer transition-all duration-200 flex-col group ${todayStyles} hidden md:flex`}
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
    </motion.div>
  );
};

export default CalendarView;
