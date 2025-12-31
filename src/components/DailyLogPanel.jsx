import React, { useState, useEffect } from "react";

const DailyLogPanel = ({ isActive }) => {
  const [logs, setLogs] = useState([]);
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("neutral"); // 'positive', 'negative', 'neutral'
  const [currentTime, setCurrentTime] = useState(
    new Date().toLocaleTimeString()
  );

  // Load logs from localStorage on startup
  useEffect(() => {
    const savedLogs = localStorage.getItem("daily_logs");
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, [isActive]);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("daily_logs", JSON.stringify(logs));
  }, [logs]);

  // Update time every second
  useEffect(() => {
    if (!isActive) return;

    setCurrentTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive]);

  // Calculate stats
  const stats = {
    positive: logs.filter((l) => l.type === "positive").length,
    negative: logs.filter((l) => l.type === "negative").length,
    neutral: logs.filter((l) => !l.type || l.type === "neutral").length,
  };

  const addLog = (e) => {
    e.preventDefault();
    if (!heading.trim() || !description.trim()) return;

    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleString(),
      heading: heading.toUpperCase(),
      description: description,
      type: type,
    };

    setLogs([newLog, ...logs]); // Newest logs first
    setHeading("");
    setDescription("");
    setType("neutral");
  };

  const clearLogs = () => {
    if (confirm("Clear all logs?")) setLogs([]);
  };

  if (!isActive) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 mb-20 animate-fadeIn">
      <header className="mb-8 border-b border-gray-200 pb-4">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="font-['Playfair_Display'] text-2xl font-bold text-gray-900 mb-1">
              System Log
            </h2>
            <p className="font-['Inter'] text-[10px] text-gray-400 uppercase tracking-widest">
              {logs.length} Entries Recorded
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-['Inter'] text-[10px] text-gray-400 uppercase tracking-widest mb-1">
              {currentTime}
            </span>
            <button
              onClick={clearLogs}
              className="text-gray-400 hover:text-red-500 transition-colors font-['Inter'] text-[10px] uppercase tracking-widest"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="flex gap-6">
          <div className="text-center">
            <span className="block font-['Playfair_Display'] text-xl font-bold text-gray-900">
              {stats.positive}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-gray-400 font-['Inter']">
              Pos
            </span>
          </div>
          <div className="text-center">
            <span className="block font-['Playfair_Display'] text-xl font-bold text-gray-900">
              {stats.negative}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-gray-400 font-['Inter']">
              Neg
            </span>
          </div>
          <div className="text-center">
            <span className="block font-['Playfair_Display'] text-xl font-bold text-gray-900">
              {stats.neutral}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-gray-400 font-['Inter']">
              Neu
            </span>
          </div>
        </div>
      </header>

      <form
        onSubmit={addLog}
        className="mb-12 bg-gray-50 p-6 rounded-xl border border-gray-100"
      >
        <div className="space-y-4">
          <div>
            <input
              type="text"
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Log Heading..."
              className="w-full bg-transparent border-b border-gray-300 focus:border-black py-2 outline-none font-['Playfair_Display'] text-lg font-bold text-gray-800 placeholder-gray-400 transition-colors"
            />
          </div>

          {/* Type Selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType("positive")}
              className={`px-3 py-1 rounded text-[10px] uppercase tracking-widest font-bold border transition-all ${
                type === "positive"
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
              }`}
            >
              Positive
            </button>
            <button
              type="button"
              onClick={() => setType("neutral")}
              className={`px-3 py-1 rounded text-[10px] uppercase tracking-widest font-bold border transition-all ${
                type === "neutral"
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
              }`}
            >
              Neutral
            </button>
            <button
              type="button"
              onClick={() => setType("negative")}
              className={`px-3 py-1 rounded text-[10px] uppercase tracking-widest font-bold border transition-all ${
                type === "negative"
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
              }`}
            >
              Negative
            </button>
          </div>

          <div>
            <textarea
              rows="2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Log details..."
              className="w-full bg-transparent border-none py-2 outline-none font-['Inter'] text-sm text-gray-600 placeholder-gray-400 resize-none"
            ></textarea>
          </div>
          <div className="text-right">
            <button
              type="submit"
              className="bg-black text-white px-6 py-2 rounded-full font-['Inter'] text-[10px] uppercase tracking-widest font-bold hover:bg-gray-800 transition-all active:scale-95"
            >
              Add Entry
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-0 relative pl-2">
        {/* Vertical line connecting nodes */}
        <div className="absolute left-[11px] top-2 bottom-6 w-px bg-gray-200"></div>

        {logs.map((log) => (
          <div
            key={log.id}
            className="group relative pl-8 py-4 hover:bg-gray-50/50 rounded-lg transition-colors"
          >
            {/* Node Dot */}
            <div className="absolute left-[7px] top-[24px] w-2 h-2 bg-white border-2 border-gray-300 rounded-full group-hover:border-black transition-colors z-10"></div>

            <div className="flex justify-between items-start">
              <div>
                <span className="font-['Inter'] text-[10px] text-gray-400 uppercase tracking-widest block mb-1">
                  {log.time}
                </span>
                <h3 className="font-['Playfair_Display'] text-lg font-bold text-gray-900 mb-1">
                  {log.heading}
                </h3>
              </div>
              {/* Sentiment Icon */}
              <div className="text-gray-400 pr-2">
                {log.type === "positive" && <span title="Positive">✓</span>}
                {log.type === "negative" && <span title="Negative">×</span>}
                {(!log.type || log.type === "neutral") && (
                  <span title="Neutral">○</span>
                )}
              </div>
            </div>

            <p className="font-['Lora'] text-gray-600 text-sm leading-relaxed">
              {log.description}
            </p>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl">
            <p className="font-['Inter'] text-xs text-gray-400">
              System log is empty
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyLogPanel;
