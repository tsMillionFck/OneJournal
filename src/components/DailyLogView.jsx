import React, { useState, useEffect } from "react";

const DailyLogView = ({ isActive, onBack }) => {
  const [logs, setLogs] = useState([]);
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("neutral"); // 'positive', 'negative', 'neutral'

  // Load logs from localStorage on startup
  useEffect(() => {
    const savedLogs = localStorage.getItem("daily_logs");
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, [isActive]);

  // Save logs to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("daily_logs", JSON.stringify(logs));
  }, [logs]);

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-50 text-gray-800 p-8 flex flex-col items-center">
      {/* Back Button */}
      <div className="w-full max-w-4xl px-4 flex justify-between items-center mb-12">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-black transition-colors font-['Inter'] text-sm uppercase tracking-widest"
        >
          ← Back
        </button>
        <button
          onClick={clearLogs}
          className="text-gray-400 hover:text-red-500 transition-colors font-['Inter'] text-xs uppercase tracking-widest underline"
        >
          Clear Logs
        </button>
      </div>

      <div className="w-full max-w-2xl">
        <header className="mb-10 text-center">
          <h1 className="font-['Playfair_Display'] text-4xl font-black mb-4 text-gray-900">
            System Log
          </h1>

          {/* Scoreboard */}
          <div className="flex justify-center gap-8 mb-4">
            <div className="text-center">
              <span className="block font-['Playfair_Display'] text-2xl font-bold text-gray-900">
                {stats.positive}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-['Inter']">
                Positive
              </span>
            </div>
            <div className="text-center">
              <span className="block font-['Playfair_Display'] text-2xl font-bold text-gray-900">
                {stats.negative}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-['Inter']">
                Negative
              </span>
            </div>
            <div className="text-center">
              <span className="block font-['Playfair_Display'] text-2xl font-bold text-gray-900">
                {stats.neutral}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-gray-400 font-['Inter']">
                Neutral
              </span>
            </div>
          </div>

          <p className="font-['Inter'] text-xs text-gray-400 uppercase tracking-widest">
            {logs.length} Total Entries • Operational
          </p>
        </header>

        <form
          onSubmit={addLog}
          className="mb-16 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
        >
          <div className="space-y-6">
            <div>
              <label className="block font-['Inter'] text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold">
                Log Heading
              </label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                placeholder="E.G. SERVER_DEPLOYMENT_01"
                className="w-full bg-gray-50 border-b-2 border-transparent focus:border-black px-4 py-3 rounded-lg outline-none font-['Inter'] text-sm transition-all hover:bg-gray-100"
              />
            </div>

            {/* Type Selector */}
            <div>
              <label className="block font-['Inter'] text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold">
                Sentiment
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setType("positive")}
                  className={`flex-1 py-2 rounded-lg text-xs uppercase tracking-widest font-bold border transition-all ${
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
                  className={`flex-1 py-2 rounded-lg text-xs uppercase tracking-widest font-bold border transition-all ${
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
                  className={`flex-1 py-2 rounded-lg text-xs uppercase tracking-widest font-bold border transition-all ${
                    type === "negative"
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
                  }`}
                >
                  Negative
                </button>
              </div>
            </div>

            <div>
              <label className="block font-['Inter'] text-xs uppercase tracking-widest text-gray-400 mb-2 font-bold">
                Details
              </label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter log data here..."
                className="w-full bg-gray-50 border-b-2 border-transparent focus:border-black px-4 py-3 rounded-lg outline-none font-['Inter'] text-sm transition-all hover:bg-gray-100"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white font-['Inter'] font-bold py-3 rounded-lg text-xs uppercase tracking-[0.2em] transition-all hover:bg-gray-800 active:scale-95 shadow-md"
            >
              Add Entry
            </button>
          </div>
        </form>

        <div className="space-y-0 relative">
          {/* Vertical line connecting all nodes */}
          <div className="absolute left-[19px] top-6 bottom-6 w-px bg-gray-200 z-0"></div>

          {logs.map((log) => (
            <div key={log.id} className="relative pl-12 py-2 group">
              {/* Node dot */}
              <div className="absolute left-[15px] top-[28px] w-2.5 h-2.5 bg-white border-2 border-gray-300 rounded-full z-10 group-hover:border-black transition-colors shadow-sm"></div>

              <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-md transition-shadow relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-['Inter'] text-[10px] uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded">
                      {log.time}
                    </span>
                  </div>
                  {/* Sentiment Icon */}
                  <div className="text-gray-400">
                    {log.type === "positive" && <span title="Positive">✓</span>}
                    {log.type === "negative" && <span title="Negative">×</span>}
                    {(!log.type || log.type === "neutral") && (
                      <span title="Neutral">○</span>
                    )}
                  </div>
                </div>
                <h3 className="font-['Playfair_Display'] text-xl font-bold text-gray-900 mb-2">
                  {log.heading}
                </h3>
                <p className="font-['Lora'] text-gray-600 leading-relaxed text-sm">
                  {log.description}
                </p>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center py-20">
              <p className="font-['Inter'] text-sm text-gray-400">
                No system logs recorded yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyLogView;
