import React, { useState, useEffect } from "react";

const GraphView = ({
  onBack,
  isActive,
  habits = [],
  onAddHabit,
  onUpdateHabit,
  onDeleteHabit,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [newHabit, setNewHabit] = useState({
    name: "",
    m: 1, // Velocity (units per day)
    b: 0, // Starting point
    goal: 100, // Goal target
  });

  const addHabit = (e) => {
    e.preventDefault();
    if (!newHabit.name) return;
    const habit = { ...newHabit, id: Date.now(), x: 0 };
    onAddHabit(habit);
    setNewHabit({ name: "", m: 1, b: 0, goal: 100 });
    setShowForm(false);
  };

  const updateX = (id) => {
    onUpdateHabit(id);
  };

  const deleteHabit = (id) => {
    onDeleteHabit(id);
  };

  return (
    <div
      id="graph-view"
      className={`view-section ${
        isActive ? "active" : "hidden"
      } bg-gray-50 flex flex-col h-full absolute inset-0 w-full z-20 overflow-hidden`}
    >
      {/* Header */}
      <header className="px-4 md:px-15 py-6 md:py-10 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-200 bg-white shadow-sm z-10 shrink-0">
        <div>
          <h1 className="font-['Playfair_Display'] text-4xl md:text-6xl leading-none m-0 font-black tracking-tight">
            HABIT GRAPH
          </h1>
          <p className="text-xs uppercase tracking-[3px] mt-2 text-gray-400 pl-1">
            Mathematical tracking: y = mx + b
          </p>
        </div>

        <div className="flex gap-4 mt-4 md:mt-0">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-black text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            {showForm ? "Close Form" : "+ New Habit"}
          </button>
          <button
            onClick={onBack}
            className="md:block bg-transparent border border-gray-200 px-6 py-2 text-xs uppercase tracking-widest text-gray-400 hover:text-black hover:border-black transition-all duration-300"
          >
            Close
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-15 overflow-y-auto">
        {showForm && (
          <form
            onSubmit={addHabit}
            className="bg-white p-6 md:p-8 border border-gray-200 shadow-sm mb-12 grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">
                Habit Name
              </label>
              <input
                required
                className="w-full bg-gray-50 border-b border-gray-200 p-3 focus:outline-none focus:border-black transition-colors font-serif"
                value={newHabit.name}
                onChange={(e) =>
                  setNewHabit({ ...newHabit, name: e.target.value })
                }
                placeholder="e.g. Reading"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">
                Velocity (m)
              </label>
              <input
                type="number"
                className="w-full bg-gray-50 border-b border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                value={newHabit.m}
                onChange={(e) =>
                  setNewHabit({ ...newHabit, m: parseFloat(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">
                Start (b)
              </label>
              <input
                type="number"
                className="w-full bg-gray-50 border-b border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                value={newHabit.b}
                onChange={(e) =>
                  setNewHabit({ ...newHabit, b: parseFloat(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2">
                Goal (y)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="w-full bg-gray-50 border-b border-gray-200 p-3 focus:outline-none focus:border-black transition-colors"
                  value={newHabit.goal}
                  onChange={(e) =>
                    setNewHabit({
                      ...newHabit,
                      goal: parseFloat(e.target.value),
                    })
                  }
                />
                <button className="bg-black text-white px-6 text-xs uppercase tracking-widest hover:bg-gray-800 transition-colors">
                  Add
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-20">
          {habits.map((h) => (
            <HabitCard
              key={h.id}
              habit={h}
              onStep={() => updateX(h.id)}
              onDelete={() => deleteHabit(h.id)}
            />
          ))}
          {habits.length === 0 && !showForm && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="font-serif italic text-xl mb-4">
                "We are what we repeatedly do."
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="text-xs uppercase tracking-widest border-b border-gray-300 pb-1 hover:text-black hover:border-black transition-colors"
              >
                Create your first habit
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const HabitCard = ({ habit, onStep, onDelete }) => {
  const currentY = habit.m * habit.x + parseFloat(habit.b);
  const totalDaysNeeded = Math.ceil((habit.goal - habit.b) / habit.m);
  const daysLeft = Math.max(0, totalDaysNeeded - habit.x);

  // Date Prediction Logic
  const finishDate = new Date();
  finishDate.setDate(finishDate.getDate() + daysLeft);
  const dateStr = finishDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Graph Scaling
  const w = 500;
  const h = 250;
  const pad = 40;
  // Ensure we show at least the goal range, or the current progress if it exceeds
  const xRange = Math.max(totalDaysNeeded, habit.x, 1);

  const getX = (val) => pad + (val * (w - pad * 2)) / xRange;
  // Ensure y scale accommodates goal
  const getY = (val) => h - pad - (val * (h - pad * 2)) / habit.goal;

  let progressPath = `M ${getX(0)} ${getY(habit.b)}`;
  for (let i = 1; i <= habit.x; i++) {
    progressPath += ` L ${getX(i)} ${getY(habit.m * i + parseFloat(habit.b))}`;
  }

  return (
    <div className="bg-white p-8 border border-gray-200 relative group shadow-sm hover:shadow-md transition-shadow duration-300 rounded-none md:rounded-sm">
      <button
        onClick={onDelete}
        className="absolute top-6 right-6 text-gray-300 hover:text-red-500 transition-colors"
        title="Delete Habit"
      >
        <span className="text-xl">×</span>
      </button>

      <h2 className="text-2xl font-bold text-black mb-1 font-['Playfair_Display']">
        {habit.name}
      </h2>
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-100 pb-2 inline-block">
        Velocity: {habit.m} / day
      </p>

      <div className="bg-gray-50 p-4 mb-6 border border-gray-100 relative">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          className="w-full h-auto overflow-visible"
        >
          {/* Target Finish Line */}
          <line
            x1={pad}
            y1={getY(habit.goal)}
            x2={w - pad}
            y2={getY(habit.goal)}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="4"
          />
          <text
            x={w - pad + 5}
            y={getY(habit.goal) + 4}
            className="text-[9px] font-black fill-gray-300 uppercase tracking-widest"
          >
            Goal
          </text>

          {/* Axes */}
          <line
            x1={pad}
            y1={h - pad}
            x2={w - pad}
            y2={h - pad}
            stroke="#000"
            strokeWidth="1"
          />
          <line
            x1={pad}
            y1={pad}
            x2={pad}
            y2={h - pad}
            stroke="#000"
            strokeWidth="1"
          />

          {/* Ghost Path (The ideal math) */}
          <line
            x1={getX(0)}
            y1={getY(habit.b)}
            x2={getX(totalDaysNeeded)}
            y2={getY(habit.goal)}
            stroke="#d1d5db"
            strokeWidth="1"
            strokeDasharray="2"
          />

          {/* Actual Path */}
          <path
            d={progressPath}
            fill="none"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx={getX(habit.x)}
            cy={getY(currentY)}
            r="4"
            fill="black"
            className=""
          />
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-100 p-3 text-center">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
            Current
          </p>
          <p className="text-lg font-light text-black font-serif">
            {currentY.toFixed(1)}
          </p>
        </div>
        <div className="bg-white border border-gray-100 p-3 text-center">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
            Days Left
          </p>
          <p className="text-lg font-light text-black font-serif">{daysLeft}</p>
        </div>
        <div className="bg-black p-3 text-center">
          <p className="text-[9px] font-black text-gray-500 uppercase tracking-wider">
            Finish By
          </p>
          <p className="text-[11px] font-bold text-white mt-1 leading-tight tracking-wide">
            {dateStr}
          </p>
        </div>
      </div>

      <button
        onClick={onStep}
        disabled={currentY >= habit.goal}
        className="w-full bg-transparent border border-black text-black text-xs font-bold uppercase tracking-[2px] py-4 hover:bg-black hover:text-white transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-black"
      >
        {currentY >= habit.goal ? "Goal Met" : `Record (+${habit.m})`}
      </button>
    </div>
  );
};

export default GraphView;
