import React, { useState, useRef } from "react";
import TaskPanel from "./TaskPanel";

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
  onCreateTag,
  onDeleteTag,
  onUpdateDayTags,
}) => {
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedTagId, setSelectedTagId] = useState(null); // Tag ID for painting
  const [tagToDeleteId, setTagToDeleteId] = useState(null);
  const [showTagCreator, setShowTagCreator] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#000000");

  const longPressTimer = useRef(null);
  const isLongPress = useRef(false);

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

  // Predefined colors
  const presetColors = [
    "#000000",
    "#FF3B30",
    "#FF9500",
    "#FFCC00",
    "#4CD964",
    "#5AC8FA",
    "#007AFF",
    "#5856D6",
    "#FF2D55",
    "#8E8E93",
  ];

  // Generate 24 hours
  const hours = Array.from({ length: 24 }, (_, i) => {
    const startObj = new Date();
    startObj.setHours(i, 0, 0, 0);
    const timeLabel = startObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return {
      hour: i,
      label: timeLabel,
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
    };
    onCreateTag(newTag);
    setNewTagName("");
    setShowTagCreator(false);
  };

  const handleHourClick = (hour) => {
    if (selectedTagId) {
      // Painting mode
      // Toggle off if clicking same tag, or apply new tag
      if (dayTags[hour] === selectedTagId) {
        onUpdateDayTags(hour, null);
      } else {
        onUpdateDayTags(hour, selectedTagId);
      }
    } else {
      // Opening mode
      setSelectedHour(hour);
    }
  };

  // Helper to determine text color based on background
  const getContrastColor = (hexcolor) => {
    // Simple logic: if dark, white text; if light, black text
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
              Average Day
            </h2>
            <span className="text-sm font-medium opacity-50 uppercase tracking-widest hidden md:inline-block">
              {dayDisplay}
            </span>
          </div>
        </div>

        {/* Tags Navbar */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold uppercase tracking-wider opacity-50 shrink-0">
            Tags:
          </span>
          <button
            onClick={() => setSelectedTagId(null)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-all shrink-0 ${
              selectedTagId === null
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
          {hours.map(({ hour, label }) => {
            const count = getTaskCount(hour);
            const tagId = dayTags[hour];
            const tag = userTags.find((t) => t.id === tagId);
            const hasTag = !!tag;
            const textColor = hasTag ? getContrastColor(tag.color) : "inherit";

            return (
              <div
                key={hour}
                onClick={() => handleHourClick(hour)}
                className={`p-4 border rounded-lg flex flex-col transition-all duration-200 group relative min-h-[100px] lg:min-h-0 cursor-pointer ${
                  hasTag
                    ? "" /* styles handled inline */
                    : zenMode
                    ? "border-gray-800 bg-gray-900/50 hover:bg-gray-800"
                    : "border-gray-200 bg-gray-50 hover:bg-white hover:shadow-sm"
                }`}
                style={
                  hasTag
                    ? {
                        backgroundColor: tag.color,
                        color: textColor,
                        borderColor: tag.color,
                      }
                    : {}
                }
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <div
                      className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
                        hasTag
                          ? ""
                          : zenMode
                          ? "text-gray-500"
                          : "text-gray-400"
                      }`}
                      style={hasTag ? { opacity: 0.8 } : {}}
                    >
                      {label}
                    </div>
                    {hasTag && (
                      <div className="text-sm font-bold leading-tight mb-2">
                        {tag.name}
                      </div>
                    )}
                  </div>

                  {count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        hasTag
                          ? "bg-white/20 backdrop-blur-sm"
                          : "bg-black text-white"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </div>

                {/* Content Placeholder */}
                <div className="flex-1 flex flex-col justify-end">
                  {!hasTag && count === 0 ? (
                    <div className="border-dashed border-2 border-transparent rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:border-current transition-all text-xs text-gray-400 py-2">
                      + Add Task
                    </div>
                  ) : (
                    <div
                      className={`text-xs truncate ${
                        hasTag ? "" : "text-gray-500"
                      }`}
                      style={hasTag ? { opacity: 0.8 } : {}}
                    >
                      {count > 0 && `${count} task${count !== 1 ? "s" : ""}`}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

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
