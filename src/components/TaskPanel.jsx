import React, { useState } from "react";

const TaskItem = ({
  todo,
  onToggleTodo,
  onDeleteTodo,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSubInput, setShowSubInput] = useState(false);
  const [subTaskText, setSubTaskText] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleDoubleClick = () => {
    setShowSubInput(true);
    setIsExpanded(true);
  };

  const handleAddSubTask = (e) => {
    if (e.key === "Enter" && subTaskText.trim()) {
      onAddSubTask(todo.id, subTaskText);
      setSubTaskText("");
    }
  };

  const handleMouseMove = (e) => {
    if (todo.hour && typeof todo.hour === "object" && todo.hour.timeRange) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  return (
    <li className="mb-2 last:mb-0 group animate-fadeIn relative">
      <div
        className="flex items-start gap-3"
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Toggle / Checkbox */}
        <button
          onClick={() => onToggleTodo(todo.id)}
          className={`mt-0.5 min-w-[16px] h-4 rounded border flex items-center justify-center transition-all duration-200 ${
            todo.completed
              ? "bg-black border-black text-white"
              : "border-gray-300 hover:border-black"
          }`}
        >
          {todo.completed && <span className="text-[10px]">✓</span>}
        </button>

        {/* Text */}
        <span
          className={`text-sm flex-1 leading-tight transition-all duration-200 cursor-pointer ${
            todo.completed
              ? "text-gray-400 line-through decoration-gray-300"
              : "text-gray-700"
          }`}
          title="Double click to add sub-task"
        >
          {todo.text}
          {/* Static Time Badge if preferred, but user asked for hover toast */}
        </span>

        {/* Time Metadata Indicator - REMOVED */}
        {/* {todo.hour && typeof todo.hour === 'object' && todo.hour.timeRange && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded flex items-center">
                🕒
            </span>
        )} */}

        {/* Dropdown Toggle for Subtasks */}
        {todo.subTasks && todo.subTasks.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-black text-[10px] px-1"
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        )}

        {/* Delete */}
        <button
          onClick={() => onDeleteTodo(todo.id)}
          className="text-gray-300 hover:text-red-500 opacity-100 transition-all duration-200 px-2"
          title="Delete task"
        >
          🗑️
        </button>
      </div>

      {/* Floating Tooltip / Toast */}
      {showTooltip &&
        todo.hour &&
        typeof todo.hour === "object" &&
        todo.hour.timeRange && (
          <div
            className="fixed z-[9999] pointer-events-none bg-black text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap font-medium"
            style={{
              top: mousePos.y + 15,
              left: mousePos.x + 15,
            }}
          >
            {todo.hour.timeRange}
          </div>
        )}

      {/* Subtasks Container */}
      {(isExpanded || showSubInput) && (
        <div className="pl-7 mt-2 space-y-2">
          {/* Subtask List */}
          {todo.subTasks?.map((st) => (
            <div
              key={st.id}
              className="flex items-center gap-2 text-xs text-gray-600"
            >
              <button
                onClick={() => onToggleSubTask(todo.id, st.id)}
                className={`w-3 h-3 rounded border flex items-center justify-center ${
                  st.completed
                    ? "bg-gray-600 border-gray-600 text-white"
                    : "border-gray-300"
                }`}
              >
                {st.completed && <span className="text-[8px]">✓</span>}
              </button>
              <span
                className={st.completed ? "line-through text-gray-400" : ""}
              >
                {st.text}
              </span>
              <button
                onClick={() => onDeleteSubTask(todo.id, st.id)}
                className="text-gray-300 hover:text-red-500 ml-auto opacity-0 group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}

          {/* Input or Add Button */}
          {showSubInput ? (
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-xs">↳</span>
              <input
                className="bg-transparent border-b border-gray-200 text-xs w-full outline-none focus:border-black"
                placeholder="Sub-task..."
                value={subTaskText}
                onChange={(e) => setSubTaskText(e.target.value)}
                onKeyDown={handleAddSubTask}
                autoFocus
                onBlur={() => {
                  if (!subTaskText) setShowSubInput(false);
                }}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowSubInput(true)}
              className="text-[10px] text-gray-400 hover:text-black flex items-center gap-1"
            >
              <span>+</span> Add sub-task
            </button>
          )}
        </div>
      )}
    </li>
  );
};

const TaskPanel = ({
  showTodos,
  zenMode,
  todos,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  habits = [],
  onAddHabit,
  onUpdateHabit,
  onDeleteHabit,

  hideHabits = false,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask,
}) => {
  // Local state for adding new task
  const [newTodo, setNewTodo] = useState("");

  // Local state for adding new habit
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitVelocity, setNewHabitVelocity] = useState(1);
  const [newHabitGoal, setNewHabitGoal] = useState(100);
  const [showHabitForm, setShowHabitForm] = useState(false);

  const handleAddTodoKeyDown = (e) => {
    if (e.key === "Enter" && newTodo.trim()) {
      onAddTodo(newTodo);
      setNewTodo("");
    }
  };

  const handleQuickAddHabit = (e) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const habit = {
      id: Date.now(),
      name: newHabitName,
      m: Number(newHabitVelocity) || 1,
      b: 0,
      goal: Number(newHabitGoal) || 100,
      x: 0,
    };
    onAddHabit(habit);
    setNewHabitName("");
    // Optional: close form or keep open. Keeping open as per previous logic
  };

  return (
    <div
      className={`transition-all duration-500 scrollbar-hide ${
        showTodos
          ? "md:max-h-[500px] md:opacity-100 md:mb-6 max-h-[80vh] opacity-100 mb-6 overflow-y-auto"
          : "max-h-0 opacity-0 mb-0 overflow-hidden"
      }`}
    >
      <div
        className={`bg-gray-50/50 rounded-xl p-6 border border-gray-100 ${
          !showTodos ? "hidden md:block" : ""
        }`}
      >
        <div className="relative mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={handleAddTodoKeyDown}
            placeholder="Add a new task..."
            className="w-full bg-transparent border-b border-gray-200 py-2 text-sm outline-none focus:border-black transition-colors"
          />
        </div>
        <ul className="list-none p-0 m-0 max-h-[60vh] md:max-h-[300px] overflow-y-auto">
          {todos.length === 0 && (
            <li className="text-sm text-gray-400 italic text-center py-2">
              No tasks added yet.
            </li>
          )}
          {todos.map((todo) => (
            <TaskItem
              key={todo.id}
              todo={todo}
              onToggleTodo={onToggleTodo}
              onDeleteTodo={onDeleteTodo}
              onAddSubTask={onAddSubTask}
              onToggleSubTask={onToggleSubTask}
              onDeleteSubTask={onDeleteSubTask}
            />
          ))}
        </ul>
      </div>

      {/* Habits Section in Task Tab */}
      {!hideHabits && (
        <div
          className={`bg-gray-50/50 rounded-xl p-6 border border-gray-100 mt-4 ${
            !showTodos ? "hidden md:block" : ""
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-['Playfair_Display'] font-bold text-lg">
              Habits
            </h3>
            <button
              onClick={() => setShowHabitForm(!showHabitForm)}
              className="text-xs uppercase tracking-widest text-gray-400 hover:text-black"
            >
              {showHabitForm ? "- Close" : "+ New"}
            </button>
          </div>

          {showHabitForm && (
            <div className="mb-6 p-4 bg-white border border-gray-100 rounded-lg">
              <input
                type="text"
                placeholder="Habit Name"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                className="w-full text-sm border-b border-gray-200 py-2 mb-2 outline-none focus:border-black"
              />
              <div className="flex gap-2 mb-3">
                <div className="flex-1">
                  <label className="text-[9px] uppercase font-bold text-gray-400">
                    Velocity
                  </label>
                  <input
                    type="number"
                    value={newHabitVelocity}
                    onChange={(e) => setNewHabitVelocity(e.target.value)}
                    className="w-full text-sm border-b border-gray-200 py-1 outline-none focus:border-black"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[9px] uppercase font-bold text-gray-400">
                    Goal
                  </label>
                  <input
                    type="number"
                    value={newHabitGoal}
                    onChange={(e) => setNewHabitGoal(e.target.value)}
                    className="w-full text-sm border-b border-gray-200 py-1 outline-none focus:border-black"
                  />
                </div>
              </div>
              <button
                onClick={handleQuickAddHabit}
                className="w-full bg-black text-white text-xs uppercase tracking-widest py-2 hover:bg-gray-800"
              >
                Add Habit
              </button>
            </div>
          )}

          <div className="space-y-3">
            {habits.length === 0 && !showHabitForm && (
              <div className="text-sm text-gray-400 italic text-center py-2">
                No habits yet.
              </div>
            )}
            {habits.map((habit) => {
              const currentY = habit.m * habit.x + parseFloat(habit.b);
              const progress = Math.min((currentY / habit.goal) * 100, 100);

              return (
                <div
                  key={habit.id}
                  className="group flex items-center justify-between gap-3 bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <div className="flex items-baseline gap-2 overflow-hidden">
                        <span className="font-medium text-sm truncate">
                          {habit.name}
                        </span>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wide flex-shrink-0">
                          m: {habit.m}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateHabit(habit.id)}
                      disabled={currentY >= habit.goal}
                      className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded hover:bg-black hover:text-white hover:border-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title={`+${habit.m}`}
                    >
                      +
                    </button>
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPanel;
