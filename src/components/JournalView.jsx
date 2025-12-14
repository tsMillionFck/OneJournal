import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  frameworks,
  getRandomQuote,
  getRandomPrompt,
  formatDateKey,
  getStorageKey,
} from "../data/constants";

const JournalView = ({
  currentYear,
  currentMonth,
  activeDayNum,
  onBack,
  onChangeDay,
  zenMode,
  onSetZenMode,
  isActive,
}) => {
  // State for dynamic content
  const [quote, setQuote] = useState(getRandomQuote());
  const [prompt, setPrompt] = useState(getRandomPrompt());
  const [activeFramework, setActiveFramework] = useState("standard");
  const [currentTime, setCurrentTime] = useState(new Date());

  // Editor state
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    h2: false,
    justifyLeft: false,
    justifyCenter: false,
  });

  const editorRef = useRef(null);

  // Get the current date key for localStorage
  const dateKey = formatDateKey(currentYear, currentMonth, activeDayNum);
  const storageKey = getStorageKey(dateKey);

  // Format date display
  const dateObj = new Date(currentYear, currentMonth, activeDayNum);
  const monthYearDisplay = dateObj
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })
    .toUpperCase();
  const dayDisplay = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
  });

  // Load content on mount and when date changes
  useEffect(() => {
    const savedContent = localStorage.getItem(storageKey) || "";
    if (editorRef.current) {
      editorRef.current.innerHTML = savedContent;
    }
  }, [storageKey]);

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

  // Save entry
  const saveEntry = useCallback(
    (showAlert = true) => {
      if (!editorRef.current) return;

      const content = editorRef.current.innerHTML;
      const plainText = editorRef.current.innerText.trim();

      if (!plainText) {
        localStorage.removeItem(storageKey);
      } else {
        localStorage.setItem(storageKey, content);
      }

      if (showAlert) {
        alert("Entry Saved.");
        onSetZenMode(false);
      }
    },
    [storageKey, onSetZenMode]
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
    document.execCommand(command, false, value);
    editorRef.current?.focus();
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
    });
  };

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
          default:
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [saveEntry]);

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

  return (
    <div
      id="journal-view"
      className={`view-section ${
        isActive ? "active" : "hidden"
      } font-['Lora'] ${zenBg} ${zenText}`}
    >
      {/* Left Side Panel - Quotes */}
      <aside
        className={`fixed top-1/2 -translate-y-[45%] left-0 w-70 p-10 text-right border-r border-black/5 z-50 transition-opacity duration-800 ${
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
        className="h-full w-full flex flex-col items-center pt-12 overflow-y-auto"
        id="stage"
        onClick={handleStageClick}
      >
        {/* Hero Container */}
        <div
          className={`text-center mb-10 cursor-default transition-opacity duration-800 ${
            zenMode
              ? "opacity-0 pointer-events-none hover:opacity-100 hover:pointer-events-auto"
              : ""
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
          {/* Toolbar */}
          <div
            className={`flex gap-2 mb-5 border-b pb-4 transition-colors duration-500 ${
              zenMode ? "border-white/15" : "border-black/10"
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
              onClick={() => format("formatBlock", "H2")}
              title="Heading (Ctrl+H)"
            >
              H1
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
              onClick={() => format("justifyCenter")}
              title="Align Center (Ctrl+E)"
            >
              ↔
            </button>
          </div>

          {/* Editor */}
          <div
            id="editor"
            ref={editorRef}
            contentEditable="true"
            placeholder="Start writing..."
            className="text-xl leading-loose outline-none min-h-[400px] whitespace-pre-wrap"
            onFocus={handleEditorFocus}
            onKeyUp={checkFormats}
            onMouseUp={checkFormats}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default JournalView;
