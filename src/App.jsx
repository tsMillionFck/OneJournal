import React, { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import CalendarView from "./components/CalendarView";
import JournalView from "./components/JournalView";

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
      currentView === "calendar" ? "#calendar-view" : "#journal-view";
    const exitingSelector =
      currentView === "calendar" ? "#journal-view" : "#calendar-view";

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
      />
    </div>
  );
}

export default App;
