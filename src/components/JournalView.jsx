import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  frameworks,
  getRandomQuote,
  getRandomPrompt,
  formatDateKey,
  getJournalsForDate,
  getJournalContentKey,
  saveJournalToList,
  generateJournalId,
  deleteJournal,
  getTodosForDate,
  saveTodosForDate,
  getUserTags,
  saveUserTag,
  deleteUserTag,
  getDayTags,
  saveDayTags,
} from "../data/constants";
import TaskPanel from "./TaskPanel";
import HourView from "./HourView";

const JournalView = ({
  currentYear,
  currentMonth,
  activeDayNum,
  onBack,
  onChangeDay,
  zenMode,
  onSetZenMode,
  isActive,
  habits = [],
  onAddHabit,
  onUpdateHabit,
  onDeleteHabit,
}) => {
  // State for dynamic content
  const [quote, setQuote] = useState(getRandomQuote());
  const [prompt, setPrompt] = useState(getRandomPrompt());
  const [activeFramework, setActiveFramework] = useState("standard");
  const [todos, setTodos] = useState([]);
  const [showTodos, setShowTodos] = useState(false);
  const [showHourView, setShowHourView] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Multi-journal state
  const [journals, setJournals] = useState([]);
  const [activeJournalId, setActiveJournalId] = useState(null);
  const [showJournalList, setShowJournalList] = useState(false);
  const [editingTitle, setEditingTitle] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  // Tags state
  const [userTags, setUserTags] = useState([]);
  const [dayTags, setDayTags] = useState({});

  // Editor state
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    h2: false,
    justifyLeft: false,
    justifyCenter: false,
    unorderedList: false,
    orderedList: false,
    blockquote: false,
  });

  // List dropdown state
  const [showListDropdown, setShowListDropdown] = useState(false);
  const listDropdownRef = useRef(null);
  const journalListRef = useRef(null);

  const editorRef = useRef(null);

  // Get the current date key for localStorage
  const dateKey = formatDateKey(currentYear, currentMonth, activeDayNum);

  // Format date display
  const dateObj = new Date(currentYear, currentMonth, activeDayNum);
  const monthYearDisplay = dateObj
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();
  const dayDisplay = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
  });

  // Load journals list when date changes
  useEffect(() => {
    const loadedJournals = getJournalsForDate(dateKey);
    setJournals(loadedJournals);
    const loadedTodos = getTodosForDate(dateKey);
    setTodos(loadedTodos);
    const loadedDayTags = getDayTags(dateKey);
    setDayTags(loadedDayTags);

    // Set active journal to first one or null
    if (loadedJournals.length > 0) {
      setActiveJournalId(loadedJournals[0].id);
    } else {
      setActiveJournalId(null);
    }
  }, [dateKey]);

  // Load content when active journal changes
  useEffect(() => {
    if (activeJournalId && editorRef.current) {
      const content =
        localStorage.getItem(getJournalContentKey(activeJournalId)) || "";
      editorRef.current.innerHTML = content;
    } else if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  }, [activeJournalId]);

  // Load global tags on mount
  useEffect(() => {
    setUserTags(getUserTags());
  }, []);

  // Tag Handlers
  const handleCreateTag = (tag) => {
    const updated = saveUserTag(tag);
    setUserTags(updated);
  };

  const handleDeleteTag = (tagId) => {
    const updated = deleteUserTag(tagId);
    setUserTags(updated);
  };

  const handleUpdateDayTags = (hour, tagId) => {
    const updated = { ...dayTags, [hour]: tagId };
    if (!tagId) delete updated[hour];
    setDayTags(updated);
    saveDayTags(dateKey, updated);
  };

  // Update clock every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rotate quote
  const rotateQuote = () => {
    setQuote(getRandomQuote());
  };

  // Create new journal
  const createNewJournal = () => {
    const newId = generateJournalId();
    const newJournal = {
      id: newId,
      title: `Journal ${journals.length + 1}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedJournals = saveJournalToList(dateKey, newJournal);
    setJournals(updatedJournals);
    setActiveJournalId(newId);
    setShowJournalList(false);

    // Clear editor for new journal
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
      editorRef.current.focus();
    }
  };

  // Switch journal
  const switchJournal = (journalId) => {
    // Save current journal first
    saveEntry(false);
    setActiveJournalId(journalId);
    setShowJournalList(false);
  };

  // Delete current journal
  const handleDeleteJournal = (journalId) => {
    if (!confirm("Are you sure you want to delete this journal?")) return;

    const remaining = deleteJournal(dateKey, journalId);
    setJournals(remaining);

    if (remaining.length > 0) {
      setActiveJournalId(remaining[0].id);
    } else {
      setActiveJournalId(null);
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }
  };

  // Rename journal
  const startRenaming = (journal) => {
    setEditingTitle(journal.id);
    setNewTitle(journal.title);
  };

  const saveRename = (journalId) => {
    if (!newTitle.trim()) return;

    const journal = journals.find((j) => j.id === journalId);
    if (journal) {
      journal.title = newTitle.trim();
      saveJournalToList(dateKey, journal);
      setJournals([...journals]);
    }
    setEditingTitle(null);
  };

  // Todo handlers
  // Todo handlers
  const handleAddTodo = (text, hour = null) => {
    if (text.trim()) {
      const newItem = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        hour: hour,
        subTasks: [], // Initialize subTasks array
      };
      const updatedTodos = [...todos, newItem];
      setTodos(updatedTodos);
      saveTodosForDate(dateKey, updatedTodos);
    }
  };

  const addSubTask = (parentId, text) => {
    if (!text.trim()) return;
    const updatedTodos = todos.map((t) => {
      if (t.id === parentId) {
        const newSubTask = {
          id: Date.now(),
          text: text.trim(),
          completed: false,
        };
        return { ...t, subTasks: [...(t.subTasks || []), newSubTask] };
      }
      return t;
    });
    setTodos(updatedTodos);
    saveTodosForDate(dateKey, updatedTodos);
  };

  const toggleSubTask = (parentId, subTaskId) => {
    const updatedTodos = todos.map((t) => {
      if (t.id === parentId) {
        const updatedSubTasks = (t.subTasks || []).map((st) =>
          st.id === subTaskId ? { ...st, completed: !st.completed } : st
        );
        return { ...t, subTasks: updatedSubTasks };
      }
      return t;
    });
    setTodos(updatedTodos);
    saveTodosForDate(dateKey, updatedTodos);
  };

  const deleteSubTask = (parentId, subTaskId) => {
    const updatedTodos = todos.map((t) => {
      if (t.id === parentId) {
        const updatedSubTasks = (t.subTasks || []).filter(
          (st) => st.id !== subTaskId
        );
        return { ...t, subTasks: updatedSubTasks };
      }
      return t;
    });
    setTodos(updatedTodos);
    saveTodosForDate(dateKey, updatedTodos);
  };

  const toggleTodo = (id) => {
    const updatedTodos = todos.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTodos(updatedTodos);
    saveTodosForDate(dateKey, updatedTodos);
  };

  const deleteTodo = (id) => {
    const updatedTodos = todos.filter((t) => t.id !== id);
    setTodos(updatedTodos);
    saveTodosForDate(dateKey, updatedTodos);
  };

  // Save entry
  const saveEntry = useCallback(
    (showAlert = true) => {
      if (!editorRef.current || !activeJournalId) return;

      const content = editorRef.current.innerHTML;
      const plainText = editorRef.current.innerText.trim();

      if (!plainText) {
        localStorage.removeItem(getJournalContentKey(activeJournalId));
      } else {
        localStorage.setItem(getJournalContentKey(activeJournalId), content);
        // Update journal metadata
        const journal = journals.find((j) => j.id === activeJournalId);
        if (journal) {
          saveJournalToList(dateKey, { ...journal, updatedAt: Date.now() });
        }
      }

      if (showAlert) {
        alert("Entry Saved.");
        onSetZenMode(false);
      }
    },
    [activeJournalId, journals, dateKey, onSetZenMode]
  );

  // Handle day change with auto-save
  const handleChangeDay = (delta) => {
    saveEntry(false);
    onChangeDay(delta);
  };

  // Handle back with auto-save
  const handleBack = () => {
    saveEntry(false);
    onSetZenMode(false);
    onBack();
  };

  // Format command execution
  const format = (command, value = null) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    checkFormats();
  };

  // Check current formatting state
  const checkFormats = () => {
    setFormatState({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      h2: document.queryCommandValue("formatBlock").toLowerCase() === "h2",
      justifyLeft: document.queryCommandState("justifyLeft"),
      justifyCenter: document.queryCommandState("justifyCenter"),
      unorderedList: document.queryCommandState("insertUnorderedList"),
      orderedList: document.queryCommandState("insertOrderedList"),
      blockquote:
        document.queryCommandValue("formatBlock").toLowerCase() ===
        "blockquote",
    });
  };

  // Insert checkbox list
  const insertCheckboxList = () => {
    const checkboxHtml = `
      <div class="checkbox-list-item" style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
        <input type="checkbox" style="width: 16px; height: 16px; cursor: pointer;" />
        <span contenteditable="true" style="flex: 1;">Item</span>
      </div>
    `;
    document.execCommand("insertHTML", false, checkboxHtml);
    editorRef.current?.focus();
    setShowListDropdown(false);
  };

  // Handle list insertion
  const handleListInsert = (type) => {
    if (type === "bullet") {
      format("insertUnorderedList");
    } else if (type === "numbered") {
      format("insertOrderedList");
    } else if (type === "checkbox") {
      insertCheckboxList();
    }
    setShowListDropdown(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        listDropdownRef.current &&
        !listDropdownRef.current.contains(e.target)
      ) {
        setShowListDropdown(false);
      }
      if (
        journalListRef.current &&
        !journalListRef.current.contains(e.target) &&
        !e.target.closest(".journal-switcher-btn")
      ) {
        setShowJournalList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            format("bold");
            break;
          case "i":
            e.preventDefault();
            format("italic");
            break;
          case "h":
            e.preventDefault();
            format("formatBlock", "H2");
            break;
          case "l":
            e.preventDefault();
            format("justifyLeft");
            break;
          case "e":
            e.preventDefault();
            format("justifyCenter");
            break;
          case "s":
            e.preventDefault();
            saveEntry();
            break;
          case "n":
            e.preventDefault();
            createNewJournal();
            break;
          case "q": // Shortcut for blockquote
            e.preventDefault();
            format("formatBlock", "BLOCKQUOTE");
            break;
          case "enter":
            if (formatState.blockquote) {
              e.preventDefault();
              document.execCommand("insertParagraph");
              document.execCommand("formatBlock", false, "div");
            }
            break;
          default:
            break;
        }
      } else {
        // Non-meta keys
        if (e.key === "Enter" && formatState.blockquote) {
          e.preventDefault();
          document.execCommand("insertParagraph");
          document.execCommand("formatBlock", false, "div");
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [saveEntry, journals, formatState]);

  // Handle editor focus for zen mode
  const handleEditorFocus = () => {
    onSetZenMode(true);
  };

  // Handle click on stage to exit zen mode
  const handleStageClick = (e) => {
    if (
      e.target.id === "stage" ||
      e.target.classList.contains("hero-container")
    ) {
      onSetZenMode(false);
    }
  };

  const timeDisplay = currentTime.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Zen mode classes
  const zenBg = zenMode ? "bg-[#050505]" : "bg-gray-100";
  const zenText = zenMode ? "text-gray-300" : "text-black";
  const zenMuted = zenMode ? "text-gray-600" : "text-gray-400";

  // Get active journal info
  const activeJournal = journals.find((j) => j.id === activeJournalId);

  return (
    <div
      id="journal-view"
      className={`view-section ${
        isActive ? "active" : "hidden"
      } font-['Lora'] ${zenBg} ${zenText}`}
    >
      {/* Left Side Panel - Quotes */}
      <aside
        className={`fixed top-1/2 -translate-y-[45%] left-0 w-70 p-10 text-right border-r border-black/5 z-50 transition-opacity duration-800 hidden xl:block ${
          zenMode ? "opacity-0 pointer-events-none" : "opacity-70"
        }`}
      >
        <div>
          <div className="font-['Playfair_Display'] italic text-lg leading-relaxed min-h-20">
            "{quote.text}"
          </div>
          <span className="block mt-4 font-['Inter'] text-xs uppercase tracking-widest text-gray-400">
            — {quote.author}
          </span>
        </div>
        <button
          className="bg-transparent border-none text-gray-400 text-xl cursor-pointer mt-2 opacity-50 transition-all duration-300 hover:opacity-100 hover:rotate-90"
          onClick={rotateQuote}
        >
          ↻
        </button>
      </aside>

      {/* Right Side Panel - Framework Tips */}
      <aside
        className={`fixed top-1/2 -translate-y-[45%] right-0 w-70 p-10 text-left border-l border-black/5 z-50 transition-opacity duration-800 hidden xl:block ${
          zenMode ? "opacity-0 pointer-events-none" : "opacity-70"
        }`}
      >
        <div className="flex gap-2 mb-5 border-b border-gray-200 pb-2">
          {Object.keys(frameworks).map((fw) => (
            <button
              key={fw}
              className={`bg-transparent border-none font-['Inter'] text-[0.65rem] font-semibold uppercase tracking-wide cursor-pointer transition-colors ${
                activeFramework === fw
                  ? "text-black underline"
                  : "text-gray-400 hover:text-black"
              }`}
              onClick={() => setActiveFramework(fw)}
            >
              {fw.charAt(0).toUpperCase() + fw.slice(1)}
            </button>
          ))}
        </div>
        <ul className="list-none p-0 m-0">
          {frameworks[activeFramework].map((item, index) => (
            <li
              key={index}
              className="font-['Inter'] text-sm text-gray-500 mb-4 leading-relaxed"
            >
              <b className="text-black font-semibold block mb-0.5">
                {item.title}
              </b>
              {item.desc}
            </li>
          ))}
        </ul>
      </aside>

      {/* Control Buttons */}
      <button
        className={`fixed top-7 left-7 bg-transparent border border-gray-300 px-5 py-2.5 rounded-full font-['Inter'] text-sm font-medium cursor-pointer transition-all duration-300 z-500 hover:bg-white hover:border-black hover:text-black ${
          zenMode
            ? "opacity-0 pointer-events-none hover:opacity-100 hover:pointer-events-auto"
            : ""
        }`}
        onClick={handleBack}
      >
        ← BACK
      </button>

      <button
        className={`fixed top-7 right-7 bg-black text-white border border-black px-5 py-2.5 rounded-full font-['Inter'] text-sm font-medium cursor-pointer transition-all duration-300 z-500 hover:bg-gray-800 ${
          zenMode
            ? "opacity-0 pointer-events-none hover:opacity-100 hover:pointer-events-auto"
            : ""
        }`}
        onClick={() => saveEntry()}
      >
        SAVE ENTRY
      </button>

      {/* Main Journal Stage */}
      <div
        className="h-full w-full flex flex-col items-center pt-12 overflow-y-auto pb-32 md:pb-0 px-4 md:px-0"
        id="stage"
        onClick={handleStageClick}
      >
        <div
          className={`w-full max-w-[100px] h-px bg-gray-200 mb-12 ${
            zenMode ? "opacity-0" : ""
          }`}
        ></div>

        {/* Hero Container - Hide on Mobile if showing todos */}
        <div
          className={`text-center mb-10 cursor-default transition-opacity duration-800 ${
            zenMode
              ? "opacity-0 pointer-events-none hover:opacity-100 hover:pointer-events-auto"
              : showTodos
              ? "md:opacity-20 md:pointer-events-none hidden md:block" // Hide on mobile when todos open
              : "block"
          }`}
        >
          <div
            className={`font-['Inter'] text-sm tracking-widest uppercase mb-2 flex justify-center gap-5 font-semibold ${zenMuted}`}
          >
            <span>{monthYearDisplay}</span>
            <span>{timeDisplay}</span>
          </div>

          <div className="flex items-center justify-center gap-8">
            <button
              className={`bg-transparent border-none text-3xl cursor-pointer transition-all duration-300 font-['Inter'] opacity-50 hover:opacity-100 hover:scale-120 ${zenMuted}`}
              onClick={() => handleChangeDay(-1)}
            >
              ←
            </button>
            <h1
              className={`font-['Playfair_Display'] text-7xl leading-none m-0 ${
                zenMode ? "text-gray-300" : "text-black"
              }`}
            >
              {dayDisplay}
            </h1>
            <button
              className={`bg-transparent border-none text-3xl cursor-pointer transition-all duration-300 font-['Inter'] opacity-50 hover:opacity-100 hover:scale-120 ${zenMuted}`}
              onClick={() => handleChangeDay(1)}
            >
              →
            </button>
          </div>

          <div className="font-['Lora'] italic text-lg text-gray-500 mt-4 opacity-80">
            {prompt}
          </div>
        </div>

        {/* Editor Wrapper */}
        <div className="w-full max-w-[700px] pb-24 relative z-20">
          {/* Journal Switcher */}
          <div
            className={`mb-4 flex items-center gap-3 transition-opacity duration-500 ${
              zenMode ? "opacity-0 pointer-events-none" : ""
            }`}
          >
            <div className="relative" ref={journalListRef}>
              <button
                className={`journal-switcher-btn flex items-center gap-2 px-4 py-2 rounded-lg font-['Inter'] text-sm font-medium transition-all duration-300 ${
                  zenMode
                    ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm"
                }`}
                onClick={() => setShowJournalList(!showJournalList)}
              >
                <span className="text-lg">📓</span>
                <span>{activeJournal?.title || "No Journal"}</span>
                <span
                  className={`text-xs transition-transform ${
                    showJournalList ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
                {journals.length > 1 && (
                  <span
                    className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                      zenMode
                        ? "bg-gray-600 text-gray-300"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {journals.length}
                  </span>
                )}
              </button>

              {/* Journal List Dropdown */}
              {showJournalList && (
                <div
                  className={`absolute top-full left-0 mt-2 py-2 rounded-xl shadow-xl min-w-[280px] z-50 ${
                    zenMode
                      ? "bg-gray-900 border border-white/10"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  {/* Journals List */}
                  <div className="max-h-[300px] overflow-y-auto">
                    {journals.length === 0 ? (
                      <div
                        className={`px-4 py-3 text-center ${
                          zenMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        <span className="text-2xl block mb-2">📝</span>
                        <span className="font-['Inter'] text-sm">
                          No journals yet
                        </span>
                      </div>
                    ) : (
                      journals.map((journal) => (
                        <div
                          key={journal.id}
                          className={`group px-4 py-2.5 flex items-center gap-3 transition-colors cursor-pointer ${
                            journal.id === activeJournalId
                              ? zenMode
                                ? "bg-gray-800"
                                : "bg-gray-100"
                              : zenMode
                              ? "hover:bg-gray-800"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          {editingTitle === journal.id ? (
                            <input
                              type="text"
                              value={newTitle}
                              onChange={(e) => setNewTitle(e.target.value)}
                              onBlur={() => saveRename(journal.id)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveRename(journal.id);
                                if (e.key === "Escape") setEditingTitle(null);
                              }}
                              autoFocus
                              className={`flex-1 px-2 py-1 rounded font-['Inter'] text-sm outline-none ${
                                zenMode
                                  ? "bg-gray-700 text-white border border-gray-600"
                                  : "bg-white text-black border border-gray-300"
                              }`}
                            />
                          ) : (
                            <>
                              <div
                                className="flex-1"
                                onClick={() => switchJournal(journal.id)}
                              >
                                <div
                                  className={`font-['Inter'] text-sm font-medium ${
                                    zenMode ? "text-gray-200" : "text-gray-800"
                                  }`}
                                >
                                  {journal.title}
                                </div>
                                <div
                                  className={`font-['Inter'] text-xs ${
                                    zenMode ? "text-gray-500" : "text-gray-400"
                                  }`}
                                >
                                  {new Date(
                                    journal.updatedAt
                                  ).toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startRenaming(journal);
                                  }}
                                  className={`p-1.5 rounded-md transition-colors ${
                                    zenMode
                                      ? "hover:bg-gray-700 text-gray-400"
                                      : "hover:bg-gray-200 text-gray-500"
                                  }`}
                                  title="Rename"
                                >
                                  ✏️
                                </button>
                                {journals.length > 1 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteJournal(journal.id);
                                    }}
                                    className={`p-1.5 rounded-md transition-colors ${
                                      zenMode
                                        ? "hover:bg-red-900/50 text-red-400"
                                        : "hover:bg-red-100 text-red-500"
                                    }`}
                                    title="Delete"
                                  >
                                    🗑️
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Create New Journal Button */}
                  <div
                    className={`border-t ${
                      zenMode ? "border-gray-700" : "border-gray-200"
                    } mt-2 pt-2 px-2`}
                  >
                    <button
                      onClick={createNewJournal}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-['Inter'] text-sm font-medium transition-all duration-200 ${
                        zenMode
                          ? "bg-white text-black hover:bg-gray-100"
                          : "bg-black text-white hover:bg-gray-800"
                      }`}
                    >
                      <span>+</span>
                      <span>New Journal</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Add Button */}
            <button
              onClick={createNewJournal}
              className={`flex items-center justify-center w-9 h-9 rounded-lg font-['Inter'] text-lg font-medium transition-all duration-300 ${
                zenMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black"
              }`}
              title="New Journal (Ctrl+N)"
            >
              +
            </button>

            {/* Toggle To-Do Button - Desktop Only */}
            <button
              onClick={() => setShowTodos(!showTodos)}
              className={`hidden md:flex items-center justify-center h-9 px-3 rounded-lg font-['Inter'] text-sm font-medium transition-all duration-300 gap-2 ${
                zenMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  : showTodos
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black"
              }`}
              title="Toggle Tasks"
            >
              <span className="text-lg">✓</span>
              <span>Tasks</span>
            </button>

            {/* Hour View Button */}
            <button
              onClick={() => setShowHourView(true)}
              className={`flex items-center justify-center h-9 px-3 rounded-lg font-['Inter'] text-sm font-medium transition-all duration-300 gap-2 ${
                zenMode
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black"
              }`}
              title="Hour View"
            >
              <span className="text-lg">🕒</span>
              <span>Day</span>
            </button>
          </div>

          {/* Task Panel (Desktop Collapsible) */}
          <TaskPanel
            showTodos={showTodos}
            zenMode={zenMode}
            todos={todos}
            onAddTodo={handleAddTodo}
            onToggleTodo={toggleTodo}
            onDeleteTodo={deleteTodo}
            habits={habits}
            onAddHabit={onAddHabit}
            onUpdateHabit={onUpdateHabit}
            onDeleteHabit={onDeleteHabit}
            onAddSubTask={addSubTask}
            onToggleSubTask={toggleSubTask}
            onDeleteSubTask={deleteSubTask}
          />

          {/* Toolbar - Hide on Mobile if showing todos */}
          <div
            className={`flex gap-2 mb-5 border-b pb-4 transition-all duration-500 sticky top-0 z-40 px-2 pt-2 -mx-2 backdrop-blur-md rounded-b-xl ${
              zenMode
                ? "border-white/15 bg-[#050505]/80"
                : "border-black/10 bg-white/80"
            } ${
              showTodos
                ? "md:opacity-20 md:pointer-events-none hidden md:flex"
                : "opacity-100"
            }`}
          >
            <button
              className={`fmt-btn bg-transparent border border-transparent font-['Inter'] text-sm font-medium cursor-pointer px-3 py-1 rounded-md transition-all duration-200 relative ${
                formatState.bold
                  ? zenMode
                    ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                    : "bg-black text-white font-bold"
                  : zenMode
                  ? "text-gray-600 hover:bg-gray-800 hover:text-white"
                  : "text-gray-400 hover:bg-gray-200 hover:text-black"
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => format("bold")}
              title="Bold (Ctrl+B)"
            >
              <b>B</b>
            </button>
            <button
              className={`fmt-btn bg-transparent border border-transparent font-['Inter'] text-sm font-medium cursor-pointer px-3 py-1 rounded-md transition-all duration-200 relative ${
                formatState.italic
                  ? zenMode
                    ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                    : "bg-black text-white font-bold"
                  : zenMode
                  ? "text-gray-600 hover:bg-gray-800 hover:text-white"
                  : "text-gray-400 hover:bg-gray-200 hover:text-black"
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => format("italic")}
              title="Italic (Ctrl+I)"
            >
              <i>I</i>
            </button>
            <button
              className={`fmt-btn bg-transparent border border-transparent font-['Inter'] text-sm font-medium cursor-pointer px-3 py-1 rounded-md transition-all duration-200 relative ${
                formatState.h2
                  ? zenMode
                    ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                    : "bg-black text-white font-bold"
                  : zenMode
                  ? "text-gray-600 hover:bg-gray-800 hover:text-white"
                  : "text-gray-400 hover:bg-gray-200 hover:text-black"
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => format("formatBlock", "H2")}
              title="Heading (Ctrl+H)"
            >
              H1
            </button>
            <button
              className={`fmt-btn bg-transparent border border-transparent font-['Inter'] text-sm font-medium cursor-pointer px-3 py-1 rounded-md transition-all duration-200 relative ${
                formatState.blockquote
                  ? zenMode
                    ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                    : "bg-black text-white font-bold"
                  : zenMode
                  ? "text-gray-600 hover:bg-gray-800 hover:text-white"
                  : "text-gray-400 hover:bg-gray-200 hover:text-black"
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => format("formatBlock", "BLOCKQUOTE")}
              title="Quote"
            >
              ❝
            </button>
            <div
              className={`w-px mx-1 ${zenMode ? "bg-white/15" : "bg-black/10"}`}
            ></div>
            <button
              className={`fmt-btn bg-transparent border border-transparent font-['Inter'] text-sm font-medium cursor-pointer px-3 py-1 rounded-md transition-all duration-200 relative ${
                formatState.justifyLeft
                  ? zenMode
                    ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                    : "bg-black text-white font-bold"
                  : zenMode
                  ? "text-gray-600 hover:bg-gray-800 hover:text-white"
                  : "text-gray-400 hover:bg-gray-200 hover:text-black"
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => format("justifyLeft")}
              title="Align Left (Ctrl+L)"
            >
              ←
            </button>
            <button
              className={`fmt-btn bg-transparent border border-transparent font-['Inter'] text-sm font-medium cursor-pointer px-3 py-1 rounded-md transition-all duration-200 relative ${
                formatState.justifyCenter
                  ? zenMode
                    ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                    : "bg-black text-white font-bold"
                  : zenMode
                  ? "text-gray-600 hover:bg-gray-800 hover:text-white"
                  : "text-gray-400 hover:bg-gray-200 hover:text-black"
              }`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => format("justifyCenter")}
              title="Align Center (Ctrl+E)"
            >
              ↔
            </button>
            <div
              className={`w-px mx-1 ${zenMode ? "bg-white/15" : "bg-black/10"}`}
            ></div>
            {/* List Dropdown */}
            <div className="relative" ref={listDropdownRef}>
              <button
                className={`fmt-btn bg-transparent border border-transparent font-['Inter'] text-sm font-medium cursor-pointer px-3 py-1 rounded-md transition-all duration-200 relative ${
                  formatState.unorderedList || formatState.orderedList
                    ? zenMode
                      ? "bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                      : "bg-black text-white font-bold"
                    : zenMode
                    ? "text-gray-600 hover:bg-gray-800 hover:text-white"
                    : "text-gray-400 hover:bg-gray-200 hover:text-black"
                }`}
                onClick={() => setShowListDropdown(!showListDropdown)}
                onMouseDown={(e) => e.preventDefault()}
                title="Insert List"
              >
                ≡
              </button>
              {showListDropdown && (
                <div
                  className={`absolute top-full left-0 mt-2 py-2 rounded-lg shadow-lg min-w-[160px] z-50 ${
                    zenMode
                      ? "bg-gray-900 border border-white/10"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <button
                    className={`w-full px-4 py-2 text-left font-['Inter'] text-sm flex items-center gap-3 transition-colors ${
                      zenMode
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => handleListInsert("bullet")}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <span className="text-lg">•</span>
                    Bullet List
                  </button>
                  <button
                    className={`w-full px-4 py-2 text-left font-['Inter'] text-sm flex items-center gap-3 transition-colors ${
                      zenMode
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => handleListInsert("numbered")}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <span className="text-lg">1.</span>
                    Numbered List
                  </button>
                  <button
                    className={`w-full px-4 py-2 text-left font-['Inter'] text-sm flex items-center gap-3 transition-colors ${
                      zenMode
                        ? "text-gray-300 hover:bg-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => handleListInsert("checkbox")}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <span className="text-lg">☐</span>
                    Checkbox List
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Editor */}
          {activeJournalId ? (
            <div
              id="editor"
              ref={editorRef}
              contentEditable="true"
              className={`outline-none min-h-[50vh] text-lg leading-relaxed ${
                zenMode ? "text-gray-300" : "text-gray-800"
              } empty:before:content-[attr(placeholder)] empty:before:text-gray-300 transition-opacity duration-300 ${
                showTodos
                  ? "md:opacity-20 md:pointer-events-none hidden md:block"
                  : "opacity-100"
              }`}
              onFocus={handleEditorFocus}
              onKeyUp={checkFormats}
              onMouseUp={checkFormats}
            ></div>
          ) : (
            <div
              className={`text-center py-20 ${
                zenMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              <span className="text-5xl block mb-4">📝</span>
              <p className="font-['Inter'] text-lg mb-4">No journal selected</p>
              <button
                onClick={createNewJournal}
                className={`px-6 py-3 rounded-full font-['Inter'] text-sm font-medium transition-all duration-300 ${
                  zenMode
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                Create Your First Journal
              </button>
            </div>
          )}
        </div>
        {/* Floating Bottom Navbar - Mobile Only */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-full px-1.5 py-1.5 flex items-center gap-1 z-[100] md:hidden">
          <button
            onClick={() => setShowTodos(false)}
            className={`px-5 py-2.5 rounded-full font-['Inter'] text-sm font-medium transition-all duration-300 ${
              !showTodos
                ? "bg-black text-white shadow-md"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Journal
          </button>
          <button
            onClick={() => setShowTodos(true)}
            className={`px-5 py-2.5 rounded-full font-['Inter'] text-sm font-medium transition-all duration-300 ${
              showTodos
                ? "bg-black text-white shadow-md"
                : "text-gray-600 hover:text-black"
            }`}
          >
            Tasks
          </button>
        </div>
      </div>

      {/* Hour View Overlay */}
      {showHourView && (
        <HourView
          currentYear={currentYear}
          currentMonth={currentMonth}
          activeDayNum={activeDayNum}
          onBack={() => setShowHourView(false)}
          zenMode={zenMode}
          todos={todos}
          onAddTodo={handleAddTodo}
          onToggleTodo={toggleTodo}
          onDeleteTodo={deleteTodo}
          // Subtask props
          onAddSubTask={addSubTask}
          onToggleSubTask={toggleSubTask}
          onDeleteSubTask={deleteSubTask}
          // Tag Props
          userTags={userTags}
          dayTags={dayTags}
          onCreateTag={handleCreateTag}
          onDeleteTag={handleDeleteTag}
          onUpdateDayTags={handleUpdateDayTags}
        />
      )}
    </div>
  );
};

export default JournalView;
