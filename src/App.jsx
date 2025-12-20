import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import CalendarView from "./components/CalendarView";
import JournalView from "./components/JournalView";
import GraphView from "./components/GraphView";

gsap.registerPlugin(useGSAP);

function App() {
  // View state
  const [currentView, setCurrentView] = useState("calendar");

  // Date state
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [activeDayNum, setActiveDayNum] = useState(1);

  // Zen mode state
  const [zenMode, setZenMode] = useState(false);

  // Habits state (Lifted from GraphView)
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem("dynamic-habits-v1");
    // If null, return empty array
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("dynamic-habits-v1", JSON.stringify(habits));
  }, [habits]);

  const handleAddHabit = (habit) => {
    setHabits([habit, ...habits]);
  };

  const handleUpdateHabit = (id) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, x: h.x + 1 } : h))
    );
  };

  const handleDeleteHabit = (id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const containerRef = useRef(null);

  // Apply zen mode to body
  useEffect(() => {
    if (zenMode) {
      document.body.classList.add("zen-active");
    } else {
      document.body.classList.remove("zen-active");
    }
  }, [zenMode]);

  // Handle view transitions with GSAP
  useGSAP(() => {
    // Determine entering view based on state
    const enteringSelector =
      currentView === "calendar"
        ? "#calendar-view"
        : currentView === "journal"
        ? "#journal-view"
        : "#graph-view";

    const exitingSelector =
      currentView === "calendar"
        ? "#journal-view, #graph-view" // If moving to calendar, hide others
        : "#calendar-view"; // If moving to journal/graph, hide calendar (this logic might need refinement if navigating between non-calendar views directly, but for now it's Calendar <-> Others)

    const enteringView = document.querySelector(enteringSelector);
    const exitingView = document.querySelector(exitingSelector);

    if (!enteringView || !exitingView) return;

    // Select targets within the ENTERING view for animation
    const targets = enteringView.querySelectorAll(
      "header, .calendar-grid, .hero-container, .editor-wrapper, .ui-control, .side-panel"
    );

    // Initial state for entering elements
    gsap.set(targets, { y: 30, opacity: 0 });

    // Animate entering elements
    gsap.to(targets, {
      duration: 0.6,
      y: 0,
      opacity: 1,
      stagger: 0.1,
      ease: "back.out(1.2)",
      delay: 0.2, // Wait a bit for container fade in handled by CSS
    });

    // Optional: Ensure exiting view fades out cleanly (CSS class handles opacity, but we can ensure internal state)
    // We strictly let CSS 'hidden' class handle the container fade out.
  }, [currentView]);

  const handleOpenJournal = (day) => {
    setActiveDayNum(day);
    setCurrentView("journal");
  };

  const handleOpenGraph = () => {
    setCurrentView("graph");
  };

  const handleBackToCalendar = () => {
    setZenMode(false);
    setCurrentView("calendar");
  };

  const handleChangeMonth = (delta) => {
    let newMonth = currentMonth + delta;
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const handleGoToToday = () => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
  };

  const handleChangeDay = (delta) => {
    // Calculate new date
    const currentDate = new Date(currentYear, currentMonth, activeDayNum);
    currentDate.setDate(currentDate.getDate() + delta);

    // Update state
    setCurrentYear(currentDate.getFullYear());
    setCurrentMonth(currentDate.getMonth());
    setActiveDayNum(currentDate.getDate());
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <CalendarView
        currentYear={currentYear}
        currentMonth={currentMonth}
        onOpenJournal={handleOpenJournal}
        onOpenGraph={handleOpenGraph}
        onChangeMonth={handleChangeMonth}
        onGoToToday={handleGoToToday}
        isActive={currentView === "calendar"}
      />
      <JournalView
        currentYear={currentYear}
        currentMonth={currentMonth}
        activeDayNum={activeDayNum}
        onBack={handleBackToCalendar}
        onChangeDay={handleChangeDay}
        zenMode={zenMode}
        onSetZenMode={setZenMode}
        isActive={currentView === "journal"}
        habits={habits}
        onAddHabit={handleAddHabit}
        onUpdateHabit={handleUpdateHabit}
        onDeleteHabit={handleDeleteHabit}
      />
      <GraphView
        onBack={handleBackToCalendar}
        isActive={currentView === "graph"}
        habits={habits}
        onAddHabit={handleAddHabit}
        onUpdateHabit={handleUpdateHabit}
        onDeleteHabit={handleDeleteHabit}
      />
    </div>
  );
}

export default App;
