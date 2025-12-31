import React, { useState, useRef, useEffect } from "react";
import TaskPanel from "./TaskPanel";

// Digital Clock Component
const DigitalClock = ({ zenMode, is24Hour }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`font-['Inter'] font-bold text-xl tabular-nums tracking-widest ${
        zenMode ? "text-gray-400" : "text-gray-800"
      }`}
    >
      {time.toLocaleTimeString([], {
        hour12: !is24Hour,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}
    </div>
  );
};

const HourView = ({
  currentYear,
  currentMonth,
  activeDayNum,
  onBack,
  zenMode,
  todos = [],
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  userTags = [],
  dayTags = {},
  onCreateTag, // Used for updating tags too
  onDeleteTag,
  onUpdateDayTags,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
}) => {
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedTagId, setSelectedTagId] = useState(null); // Tag ID for painting
  const [tagToDeleteId, setTagToDeleteId] = useState(null);
  const [showTagCreator, setShowTagCreator] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#000000");
  // Time Format State
  const [is24Hour, setIs24Hour] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Sync with second
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Check if viewing today
  const isToday =
    currentTime.getDate() === activeDayNum &&
    currentTime.getMonth() === currentMonth &&
    currentTime.getFullYear() === currentYear;

  // Data Mode State (Template vs Specific Day)
  const [isSpecificDay, setIsSpecificDay] = useState(false);
  const [templateTags, setTemplateTags] = useState(() => {
    try {
      const saved = localStorage.getItem("hourViewTemplateTags");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // Save template tags whenever they change
  useEffect(() => {
    localStorage.setItem("hourViewTemplateTags", JSON.stringify(templateTags));
  }, [templateTags]);

  const handleUpdateTemplateTags = (key, tagId) => {
    const updated = { ...templateTags, [key]: tagId };
    if (!tagId) delete updated[key];
    setTemplateTags(updated);
  };

  // Derived Active Tags and Handler
  const activeTags = isSpecificDay ? dayTags : templateTags;
  const handleActiveUpdateTags = isSpecificDay
    ? onUpdateDayTags
    : handleUpdateTemplateTags;

  // Notification Mode State
  const [notificationMode, setNotificationMode] = useState(false);

  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);

  // Request notification permission on mount
  React.useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // Real-time notification checker (Always checks activeTags? Or always specific day?)
  // User request: "create a notification Tag chip... when the sleep is going to 20 mint... then it send the task"
  // If I'm using "Average Day" as my planner, I probably want notifications based on THAT.
  // But if I override for a specific day, I want THAT.
  // HOWEVER, the `HourView` is often closed.
  // If `HourView` is closed, where does the notification check run?
  // It runs inside `HourView`. so Notifications only work if `HourView` is OPEN.
  // The user didn't specify persistent background notifications (which would require Service Worker or JournalView lifting).
  // Assuming checking against `activeTags` is correct for the current view.
  // BUT, usually notifications imply "My Schedule for TODAY".
  // So arguably, the notification checker should ALWAYS check the specific day's tags if they exist, or the template if not?
  // Or maybe it should just check `dayTags` (Specific) because `JournalView` passes the *current day's* tags.
  // Valid point: The user said "make the data local... not for every day".
  // If I set a schedule in "Average Day", I expect it to apply to today unless I overrode it.
  // But our data model `dayTags` is empty by default.
  // So `JournalView` doesn't "inherit" template tags.
  // For now, I will align notifications with the *visible* tags strings.

  React.useEffect(() => {
    const checkNotifications = () => {
      if (Notification.permission !== "granted") return;

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTotalMinutes = currentHour * 60 + currentMinute;

      // Identify tags that have notifications enabled
      const notifiedTagIds = userTags.filter((t) => t.notify).map((t) => t.id);

      if (notifiedTagIds.length === 0) return;

      // Use activeTags for notifications so what you see is what you get alerted on
      const sourceTags = activeTags;

      const sortedKeys = Object.keys(sourceTags).sort((a, b) => {
        const [h1, s1] = a.split("-").map(Number);
        const [h2, s2] = b.split("-").map(Number);
        return h1 * 60 + s1 * 12 - (h2 * 60 + s2 * 12);
      });

      // Iterate and find transitions
      sortedKeys.forEach((key) => {
        const tagId = sourceTags[key];
        if (!notifiedTagIds.includes(tagId)) return;

        const [h, s] = key.split("-").map(Number);
        const slotStartMinutes = h * 60 + s * 12;

        // Check if this is the start of a block
        // Look at previous slot
        let prevKey;
        if (s === 0) {
          prevKey = `${h - 1}-4`; // Last slot of prev hour
        } else {
          prevKey = `${h}-${s - 1}`;
        }

        // If previous slot is the same tag, it's not a start
        if (sourceTags[prevKey] === tagId) return;

        // It is a start! Check time difference
        const diff = slotStartMinutes - currentTotalMinutes;

        const tagName = userTags.find((t) => t.id === tagId)?.name || "Task";

        if (diff === 20 || diff === 5) {
          new Notification(`Upcoming: ${tagName}`, {
            body: `${tagName} starts in ${diff} minutes!`,
            icon: "/favicon.ico", // Optional
          });
        }
      });
    };

    const interval = setInterval(checkNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [activeTags, userTags]); // Depend on activeTags

  // Task Selection Mode State
  const [isTaskSelectionMode, setIsTaskSelectionMode] = useState(false);
  const [selectedTaskSlots, setSelectedTaskSlots] = useState([]); // Array of keys "hour-slot"
  const [showTaskInput, setShowTaskInput] = useState(false);
  const [taskInputText, setTaskInputText] = useState("");

  // Keyboard shortcut for Task Selection Mode (+)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // '+' key (Shift + =) or just + on numpad
      if (e.key === "+" || (e.shiftKey && e.key === "=")) {
        setIsTaskSelectionMode((prev) => !prev);
        if (!isTaskSelectionMode) {
          setSelectedTaskSlots([]); // Reset on entry
          setShowTaskInput(false);
          setNotificationMode(false); // Disable other modes
          setSelectedTagId(null);
        }
      }

      // Enter key to confirm selection
      if (
        e.key === "Enter" &&
        isTaskSelectionMode &&
        selectedTaskSlots.length > 0
      ) {
        setShowTaskInput(true);
      }

      // Escape to cancel everything
      if (e.key === "Escape") {
        setIsTaskSelectionMode(false);
        setSelectedTaskSlots([]);
        setShowTaskInput(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isTaskSelectionMode, selectedTaskSlots]);

  const startLongPress = (tagId) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setTagToDeleteId(tagId);
    }, 600);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleTagClick = (tagId) => {
    if (notificationMode) {
      // Toggle notification for this tag
      const tag = userTags.find((t) => t.id === tagId);
      if (tag) {
        onCreateTag({ ...tag, notify: !tag.notify });
      }
      return;
    }

    if (isLongPress.current) {
      // Logic handled by long press timeout
      return;
    }
    // If we click a tag that is pending delete, cancel delete mode
    if (tagToDeleteId === tagId) {
      setTagToDeleteId(null);
      return;
    }
    setSelectedTagId(selectedTagId === tagId ? null : tagId);
    setTagToDeleteId(null); // Clear others
  };

  // Predefined colors (Dark Palette)
  const presetColors = [
    "#000000", // Black
    "#1C1C1E", // Dark Gray
    "#2C3E50", // Midnight Blue
    "#8B0000", // Dark Red
    "#B22222", // Firebrick (Red)
    "#556B2F", // Dark Olive Green
    "#006400", // Dark Green
    "#228B22", // Forest Green
    "#DAA520", // Goldenrod (Yellow)
    "#483D8B", // Dark Slate Blue
    "#4B0082", // Indigo
    "#800000", // Maroon
    "#2F4F4F", // Dark Slate Gray
    "#8B4513", // Saddle Brown
    "#191970", // Midnight Blue
  ];

  // Helper for Time of Day
  const getTimeOfDay = (hour) => {
    if (hour === 0) return "Midnight";
    if (hour >= 1 && hour <= 4) return "Afternight";
    if (hour >= 5 && hour <= 11) return "Morning";
    if (hour >= 12 && hour <= 16) return "After-noon";
    if (hour >= 17 && hour <= 20) return "Evening";
    if (hour >= 21) return "Night";
    return "";
  };

  // Generate 24 hours based on format
  const hours = Array.from({ length: 24 }, (_, i) => {
    const startObj = new Date();
    startObj.setHours(i, 0, 0, 0);

    let timeLabel;
    if (is24Hour) {
      timeLabel = startObj.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else {
      // 12-hour format manually to avoid leading zeros if desired, or standard
      const h = i % 12 || 12;
      const ampm = i < 12 ? "AM" : "PM";
      timeLabel = `${h} ${ampm}`;
    }

    return {
      hour: i,
      label: timeLabel,
      timeOfDay: !is24Hour ? getTimeOfDay(i) : null,
    };
  });

  const dateObj = new Date(currentYear, currentMonth, activeDayNum);
  const dayDisplay = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  // Filter todos for selected hour
  const hourTodos =
    selectedHour !== null ? todos.filter((t) => t.hour === selectedHour) : [];

  const handleAddTodoInHour = (text) => {
    if (selectedHour !== null && onAddTodo) {
      onAddTodo(text, selectedHour);
    }
  };

  const getTaskCount = (hour) => {
    return todos.filter((t) => t.hour === hour).length;
  };

  const handleCreateNewTag = () => {
    if (!newTagName.trim()) return;
    const newTag = {
      id: Date.now().toString(),
      name: newTagName.trim(),
      color: newTagColor,
      notify: false, // Default no notify
    };
    onCreateTag(newTag);
    setNewTagName("");
    setShowTagCreator(false);
  };

  const handleSlotClick = (hour, slotIndex, e) => {
    e.stopPropagation(); // Prevent opening modal when clicking a slot
    const key = `${hour}-${slotIndex}`;

    if (isTaskSelectionMode) {
      // Toggle selection for task
      if (selectedTaskSlots.includes(key)) {
        setSelectedTaskSlots((prev) => prev.filter((k) => k !== key));
      } else {
        setSelectedTaskSlots((prev) => [...prev, key]);
      }
      return;
    }

    if (selectedTagId) {
      // Painting mode
      // Toggle off if clicking same tag, or apply new tag
      if (activeTags[key] === selectedTagId) {
        handleActiveUpdateTags(key, null);
      } else {
        handleActiveUpdateTags(key, selectedTagId);
      }
    } else {
      // If not painting, maybe opening the hour logic?
      // For now, let's keep the hour opening to the main card click or footer
      setSelectedHour(hour);
    }
  };

  const handleHourClick = (hour) => {
    // Opening mode
    setSelectedHour(hour);
  };

  const handleConfirmTask = () => {
    if (!taskInputText.trim()) return;

    // Calculate time range for the task
    // Sort slots
    const sorted = [...selectedTaskSlots].sort((a, b) => {
      const [h1, s1] = a.split("-").map(Number);
      const [h2, s2] = b.split("-").map(Number);
      return h1 * 60 + s1 * 12 - (h2 * 60 + s2 * 12);
    });

    if (sorted.length === 0) return;

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const [h1, s1] = first.split("-").map(Number);
    const [h2, s2] = last.split("-").map(Number);

    // Start time
    const date = new Date();
    date.setHours(h1, s1 * 12, 0, 0);
    const startTime = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // End time (end of last slot)
    date.setHours(h2, (s2 + 1) * 12, 0, 0);
    const endTime = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const timeRange = `${startTime} - ${endTime}`;

    // We call onAddTodo but we need to pass this metadata.
    // Currently onAddTodo takes (text, hour).
    // We might need to overload it or pass an object?
    // let's pass text + metadata as an object if supported, or hack it?
    // Wait, onAddTodo in JournalView uses:
    // handleAddTodo = (text, hour = null) => { ... id: Date.now(), text: text.trim(), hour: hour ... }
    // We want to store 'slots' or 'timeRange'.
    // Since we can't easily change the function signature without changing JournalView,
    // let's check if we can pass extra properties attached to 'text' (no, that's messy).
    // We should probably assume onAddTodo can handle an object or we'll modify JournalView later.
    // Let's pass the timeRange string as the 'hour' param for now, or better:
    // We will perform a special call if we can.
    // Or, let's just append the time to the text? "Task Name (10:00 - 10:12)"?
    // The user wants "time which can be seen on hover, toast beside the cursor".
    // This implies metadata.
    // Let's pass { timeRange, slots: selectedTaskSlots } as the second argument (instead of just hour number).

    onAddTodo(taskInputText, { timeRange, slots: selectedTaskSlots });

    // Reset
    setTaskInputText("");
    setSelectedTaskSlots([]);
    setShowTaskInput(false);
    setIsTaskSelectionMode(false);
  };

  // Helper to determine text color based on background
  const getContrastColor = (hexcolor) => {
    // Simple logic: if dark, white text; if light, black text
    if (!hexcolor) return "black";
    // Convert hex to RGB
    const r = parseInt(hexcolor.substr(1, 2), 16);
    const g = parseInt(hexcolor.substr(3, 2), 16);
    const b = parseInt(hexcolor.substr(5, 2), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? "black" : "white";
  };

  return (
    <div
      className={`fixed inset-0 z-[600] flex flex-col font-['Inter'] transition-colors duration-300 ${
        zenMode ? "bg-[#050505] text-gray-300" : "bg-white text-black"
      }`}
    >
      {/* Header */}
      <header className="px-6 py-4 border-b border-gray-200 shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-4">
            <button
              onClick={onBack}
              className="text-xl md:text-2xl hover:opacity-70 transition-opacity"
            >
              ←
            </button>
            <h2 className="font-['Playfair_Display'] text-2xl md:text-3xl font-bold">
              {isSpecificDay ? "Specific Day" : "Average Day"}
            </h2>
            <span className="text-sm font-medium opacity-50 uppercase tracking-widest hidden md:inline-block">
              {isSpecificDay ? dayDisplay : "Template"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <DigitalClock zenMode={zenMode} is24Hour={is24Hour} />

            {/* Specific Day Toggle */}
            <button
              onClick={() => setIsSpecificDay(!isSpecificDay)}
              className={`px-3 py-1 text-xs font-bold rounded border transition-colors ${
                isSpecificDay
                  ? "bg-black text-white border-black"
                  : zenMode
                  ? "border-gray-700 hover:bg-gray-800"
                  : "border-gray-200 hover:bg-gray-100"
              }`}
              title="Toggle between Average Day (Template) and Specific Date"
            >
              {isSpecificDay ? "Specific" : "Template"}
            </button>

            {/* Time Format Toggle */}
            <button
              onClick={() => setIs24Hour(!is24Hour)}
              className={`px-3 py-1 text-xs font-bold rounded border transition-colors ${
                zenMode
                  ? "border-gray-700 hover:bg-gray-800"
                  : "border-gray-200 hover:bg-gray-100"
              }`}
            >
              {is24Hour ? "24H" : "AM/PM"}
            </button>
          </div>
        </div>

        {/* Tags Navbar + Task Button */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {/* New Task Selection Button */}
          <button
            onClick={() => {
              setIsTaskSelectionMode(!isTaskSelectionMode);
              if (!isTaskSelectionMode) {
                // Entering mode
                setSelectedTagId(null);
                setNotificationMode(false);
              } else {
                // Exiting
                setSelectedTaskSlots([]);
              }
            }}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-all shrink-0 flex items-center gap-2 ${
              isTaskSelectionMode
                ? "bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200"
                : "bg-transparent border-gray-300 text-gray-500 hover:border-black hover:text-black"
            }`}
            title="Select Time Slots for Task (+)"
          >
            <span>Task Selection</span>
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          {/* Notification Toggle Chip */}
          <button
            onClick={() => {
              setNotificationMode(!notificationMode);
              setSelectedTagId(null);
              setIsTaskSelectionMode(false);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-all shrink-0 flex items-center gap-2 ${
              notificationMode
                ? "bg-yellow-400 text-black border-yellow-500 ring-2 ring-yellow-200"
                : "bg-transparent border-gray-300 text-gray-500 hover:border-black hover:text-black"
            }`}
            title="Toggle Notification Mode"
          >
            <span>🔔</span>
            <span>Notify</span>
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1"></div>

          <span className="text-xs font-bold uppercase tracking-wider opacity-50 shrink-0">
            Tags:
          </span>
          <button
            onClick={() => {
              setSelectedTagId(null);
              setNotificationMode(false);
            }}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-all shrink-0 ${
              selectedTagId === null && !notificationMode
                ? "bg-black text-white border-black"
                : "bg-transparent border-gray-300 text-gray-500 hover:border-black"
            }`}
          >
            Cursor / Open
          </button>
          {userTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.id)}
              onMouseDown={() => startLongPress(tag.id)}
              onMouseUp={cancelLongPress}
              onMouseLeave={cancelLongPress}
              onTouchStart={() => startLongPress(tag.id)}
              onTouchEnd={cancelLongPress}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-all shrink-0 flex items-center gap-2 relative ${
                selectedTagId === tag.id
                  ? "ring-2 ring-offset-2 ring-black"
                  : "hover:opacity-80"
              }`}
              style={{
                backgroundColor: tag.color,
                color: getContrastColor(tag.color),
                borderColor: tag.color,
              }}
            >
              {tag.name}
              {/* Notification Indicator */}
              {tag.notify && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
              )}

              {selectedTagId === tag.id && <span>✓</span>}

              {/* Delete Button Overlay */}
              {tagToDeleteId === tag.id && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTag(tag.id);
                    setTagToDeleteId(null);
                    if (selectedTagId === tag.id) setSelectedTagId(null);
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-sm z-10 animate-scaleIn hover:scale-110"
                >
                  ✕
                </div>
              )}
            </button>
          ))}
          <button
            onClick={() => setShowTagCreator(true)}
            className="w-6 h-6 rounded-full border border-dashed border-gray-400 flex items-center justify-center text-gray-400 hover:text-black hover:border-black transition-colors shrink-0"
            title="Create Tag"
          >
            +
          </button>
        </div>
      </header>

      {/* Grid Content */}
      <div className="flex-1 p-4 md:p-8 overflow-y-auto lg:overflow-hidden">
        <div className="h-full grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 lg:grid-rows-6 xl:grid-cols-6 xl:grid-rows-4">
          {hours.map(({ hour, label, timeOfDay }) => {
            const count = getTaskCount(hour);
            // We no longer have a single tag for the whole hour.
            // visual feedback for tags is now per-slot (vertical stack).

            return (
              <div
                key={hour}
                className={`flex flex-col border-2 rounded-lg overflow-hidden transition-all duration-200 group relative h-auto ${
                  zenMode
                    ? "border-gray-700 bg-gray-900/50 hover:bg-black hover:border-gray-500"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 hover:shadow-sm"
                }`}
              >
                {isToday && hour === currentTime.getHours() && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-50 pointer-events-none transition-all duration-300 ease-out shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                    style={{
                      left: `${
                        ((currentTime.getMinutes() +
                          currentTime.getSeconds() / 60) /
                          60) *
                        100
                      }%`,
                    }}
                  >
                    <div className="absolute top-1 -translate-x-1/2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                      {currentTime.toLocaleTimeString([], {
                        hour12: !is24Hour,
                        hour: "numeric",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                  </div>
                )}
                {/* Header Section (Floating) */}
                <div
                  onClick={() => handleHourClick(hour)}
                  className={`absolute top-0 left-0 w-full p-3 z-10 flex justify-between items-start cursor-pointer transition-all duration-300 ${
                    selectedTagId || isTaskSelectionMode
                      ? "opacity-0 pointer-events-none"
                      : "opacity-100 hover:bg-black/5"
                  }`}
                >
                  <div className="flex flex-col">
                    <div
                      className={`text-2xl font-bold uppercase tracking-wider leading-none ${
                        zenMode ? "text-gray-500" : "text-gray-400/80"
                      }`}
                    >
                      {label}
                    </div>
                    {timeOfDay && (
                      <div
                        className={`text-[10px] font-medium uppercase tracking-widest mt-1 ${
                          zenMode ? "text-gray-600" : "text-gray-400/60"
                        }`}
                      >
                        {timeOfDay}
                      </div>
                    )}
                  </div>

                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full bg-black text-white self-start`}
                    >
                      {count}
                    </span>
                  )}
                </div>

                {/* Time Slots Section (Horizontal Rows / Vertical Columns) */}
                {/* Added min-h to ensure the card has height since header/footer are floating */}
                <div className="flex-1 flex flex-row w-full h-32 md:h-40">
                  {[0, 1, 2, 3, 4].map((slotIndex) => {
                    const key = `${hour}-${slotIndex}`;
                    const tagId = activeTags[key];
                    const tag = userTags.find((t) => t.id === tagId);
                    const hasTag = !!tag;
                    const isSelectedForTask = selectedTaskSlots.includes(key);

                    return (
                      <div
                        key={slotIndex}
                        onClick={(e) => handleSlotClick(hour, slotIndex, e)}
                        className={`flex-1 border-r border-gray-200/50 last:border-r-0 cursor-pointer transition-colors relative group/slot ${
                          isSelectedForTask
                            ? "bg-blue-500/20"
                            : !hasTag && (selectedTagId || isTaskSelectionMode)
                            ? zenMode
                              ? "hover:bg-white/10"
                              : "hover:bg-gray-300"
                            : "hover:bg-black/5"
                        }`}
                        style={
                          hasTag && !isSelectedForTask
                            ? {
                                backgroundColor: tag.color,
                                borderColor: tag.color,
                              }
                            : isSelectedForTask
                            ? { backgroundColor: "rgba(59, 130, 246, 0.5)" }
                            : {}
                        }
                        title={
                          hasTag
                            ? tag.name
                            : `Min: ${slotIndex * 12} - ${(slotIndex + 1) * 12}`
                        }
                      >
                        {/* Selection Indicator */}
                        {isSelectedForTask && (
                          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xs pointer-events-none">
                            +
                          </div>
                        )}
                        {/* Optional Tooltip for Task Mode */}
                        {isTaskSelectionMode && !isSelectedForTask && (
                          <div className="hidden group-hover/slot:flex absolute z-20 -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                            Add to Task
                          </div>
                        )}
                        {/* Optional: Show tooltip or name on hover if large enough */}
                        {hasTag && (
                          <div className="hidden group-hover/slot:flex absolute inset-0 items-center justify-center text-[8px] font-bold text-white/90 break-all p-0.5 text-center leading-none">
                            {tag.name.slice(0, 3)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer Section - Add Task (Floating) */}
                <div
                  onClick={() => handleHourClick(hour)}
                  className={`absolute bottom-0 left-0 w-full p-2 z-10 cursor-pointer transition-all duration-300 text-center ${
                    selectedTagId || isTaskSelectionMode
                      ? "opacity-0 pointer-events-none"
                      : "opacity-100 hover:bg-black/5"
                  }`}
                >
                  <div className="text-xs text-gray-400 font-medium flex items-center justify-center gap-1 group-hover:text-black transition-colors">
                    <span>+</span> Task
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Input Dialog */}
      {showTaskInput && (
        <div className="absolute inset-0 z-[900] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm p-6 rounded-xl shadow-2xl ${
              zenMode ? "bg-gray-900" : "bg-white"
            }`}
          >
            <h3 className="font-['Playfair_Display'] text-xl font-bold mb-4">
              Add Task for Selected Time
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {selectedTaskSlots.length} slots selected
            </p>
            <input
              type="text"
              placeholder="What are you doing?"
              autoFocus
              value={taskInputText}
              onChange={(e) => setTaskInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleConfirmTask()}
              className="w-full p-3 border rounded-lg mb-4 text-sm outline-none focus:border-black"
            />
            <div className="flex gap-2">
              <button
                onClick={handleConfirmTask}
                className="flex-1 bg-black text-white py-2 rounded-lg text-sm"
              >
                Save Task
              </button>
              <button
                onClick={() => setShowTaskInput(false)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tag Creator Modal */}
      {showTagCreator && (
        <div className="absolute inset-0 z-[800] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-sm p-6 rounded-xl shadow-2xl relative ${
              zenMode ? "bg-gray-900 border border-gray-800" : "bg-white"
            }`}
          >
            <h3 className="font-['Playfair_Display'] text-xl font-bold mb-4">
              Create New Tag
            </h3>
            <input
              type="text"
              placeholder="Tag Name (e.g. Sleep, Work)"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className={`w-full p-2 border rounded-lg mb-4 text-sm outline-none focus:border-black ${
                zenMode
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-gray-50 border-gray-200"
              }`}
            />
            <div className="flex flex-wrap gap-2 mb-6">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setNewTagColor(color)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    newTagColor === color
                      ? "border-gray-400 scale-110"
                      : "border-transparent hover:scale-110"
                  }`}
                  style={{ backgroundColor: color }}
                ></button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateNewTag}
                disabled={!newTagName.trim()}
                className="flex-1 bg-black text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                Create Tag
              </button>
              <button
                onClick={() => setShowTagCreator(false)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {selectedHour !== null && (
        <div className="absolute inset-0 z-[700] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-md rounded-xl shadow-2xl overflow-hidden relative ${
              zenMode ? "bg-gray-900" : "bg-white"
            }`}
          >
            <button
              onClick={() => setSelectedHour(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black z-10"
            >
              ✕
            </button>

            <div className="p-6 border-b border-gray-100">
              <h3 className="font-['Playfair_Display'] text-xl font-bold">
                {hours.find((h) => h.hour === selectedHour)?.label}
              </h3>
              <p className="text-sm text-gray-400">
                Manage tasks for this hour
              </p>
            </div>

            <div className="p-0">
              <TaskPanel
                showTodos={true} // Always show in modal
                zenMode={zenMode}
                todos={hourTodos}
                onAddTodo={handleAddTodoInHour}
                onToggleTodo={onToggleTodo}
                onDeleteTodo={onDeleteTodo}
                hideHabits={true} // Hide habits section
                onAddSubTask={onAddSubTask}
                onToggleSubTask={onToggleSubTask}
                onDeleteSubTask={onDeleteSubTask}
              />
            </div>
          </div>
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0 z-[-1]"
            onClick={() => setSelectedHour(null)}
          ></div>
        </div>
      )}
    </div>
  );
};

export default HourView;
