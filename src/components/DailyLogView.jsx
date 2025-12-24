import React, { useState, useEffect } from "react";
import {
  getDailyVariables,
  getDailyValues,
  saveDailyValues,
  formatDateKey,
} from "../data/constants";
import VariableManagerModal from "./VariableManagerModal";

const DailyLogView = ({
  currentYear,
  currentMonth,
  activeDayNum,
  onBack,
  isActive,
}) => {
  const [variables, setVariables] = useState([]);
  const [values, setValues] = useState({});
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  // Date constants
  const dateKey = formatDateKey(currentYear, currentMonth, activeDayNum);
  const dateObj = new Date(currentYear, currentMonth, activeDayNum);
  const displayDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    if (isActive) {
      setVariables(getDailyVariables());
      setValues(getDailyValues(dateKey));
    }
  }, [isActive, dateKey, isManagerOpen]); // Reload when manager closes/updates

  const handleValueChange = (variableId, value) => {
    const newValues = { ...values, [variableId]: value };
    setValues(newValues);
    saveDailyValues(dateKey, newValues);
  };

  return (
    <div
      id="daily-log-view"
      className={`view-section ${
        isActive ? "active" : "hidden"
      } bg-gray-50 flex flex-col items-center pt-8`}
    >
      <VariableManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
      />

      <header className="w-full max-w-4xl px-8 mb-12 flex justify-between items-center">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-black transition-colors font-['Inter'] text-sm uppercase tracking-widest"
        >
          ← Back
        </button>
        <div className="text-center">
          <h1 className="font-['Playfair_Display'] text-4xl font-black mb-2">
            Daily Log
          </h1>
          <p className="font-['Inter'] text-xs text-gray-400 uppercase tracking-widest">
            {displayDate}
          </p>
        </div>
        <button
          onClick={() => setIsManagerOpen(true)}
          className="text-gray-400 hover:text-black transition-colors font-['Inter'] text-sm uppercase tracking-widest"
        >
          Manage
        </button>
      </header>

      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-10 border border-gray-100 animate-fadeIn">
        {variables.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 font-['Inter'] text-sm mb-4">
              No variables defined yet.
            </p>
            <p className="text-xs text-gray-300">
              Click "Manage" (top right) to add variables.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Checkboxes Group */}
            {variables.some((v) => v.type === "boolean") && (
              <div className="animate-slideUp delay-100">
                <h3 className="font-['Inter'] text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
                  Checklist
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {variables
                    .filter((v) => v.type === "boolean")
                    .map((variable) => (
                      <div
                        key={variable.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() =>
                          handleValueChange(variable.id, !values[variable.id])
                        }
                      >
                        <span className="font-['Playfair_Display'] text-lg font-medium text-gray-800">
                          {variable.name}
                        </span>
                        <div
                          className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${
                            values[variable.id]
                              ? "bg-black border-black text-white"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {values[variable.id] && (
                            <span className="text-sm">✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Scales Group */}
            {variables.some((v) => v.type === "scale") && (
              <div className="animate-slideUp delay-200">
                <h3 className="font-['Inter'] text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
                  Scales (1-10)
                </h3>
                <div className="space-y-6">
                  {variables
                    .filter((v) => v.type === "scale")
                    .map((variable) => (
                      <div key={variable.id}>
                        <div className="flex justify-between mb-3">
                          <span className="font-['Playfair_Display'] text-xl font-medium text-gray-800">
                            {variable.name}
                          </span>
                          <span className="font-['Inter'] text-2xl font-bold">
                            {values[variable.id] || "-"}
                          </span>
                        </div>
                        <div className="flex justify-between gap-1">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <button
                              key={num}
                              onClick={() =>
                                handleValueChange(variable.id, num)
                              }
                              className={`flex-1 aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                                values[variable.id] === num
                                  ? "bg-black text-white scale-110 shadow-lg"
                                  : "bg-gray-50 text-gray-400 hover:bg-gray-200 hover:text-black"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Text Entries Group */}
            {variables.some((v) => v.type === "string") && (
              <div className="animate-slideUp delay-300">
                <h3 className="font-['Inter'] text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
                  Notes
                </h3>
                <div className="grid grid-cols-1 gap-6">
                  {variables
                    .filter((v) => v.type === "string")
                    .map((variable) => (
                      <div key={variable.id}>
                        <label className="block font-['Playfair_Display'] text-lg font-medium text-gray-800 mb-2">
                          {variable.name}
                        </label>
                        <input
                          type="text"
                          value={values[variable.id] || ""}
                          onChange={(e) =>
                            handleValueChange(variable.id, e.target.value)
                          }
                          placeholder="Type here..."
                          className="w-full bg-gray-50 border-b-2 border-transparent focus:border-black px-4 py-3 rounded-t-lg outline-none font-['Inter'] transition-all hover:bg-gray-100"
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyLogView;
