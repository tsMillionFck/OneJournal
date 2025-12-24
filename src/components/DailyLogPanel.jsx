import React, { useState, useEffect } from "react";
import {
  getDailyVariables,
  getDailyValues,
  saveDailyValues,
} from "../data/constants";

const DailyLogPanel = ({ dateKey, isActive }) => {
  const [variables, setVariables] = useState([]);
  const [values, setValues] = useState({});

  // Load variables and values when date or active state changes
  useEffect(() => {
    if (isActive) {
      setVariables(getDailyVariables());
      setValues(getDailyValues(dateKey));
    }
  }, [dateKey, isActive]);

  const handleValueChange = (variableId, value) => {
    const newValues = { ...values, [variableId]: value };
    setValues(newValues);
    saveDailyValues(dateKey, newValues);
  };

  if (!isActive || variables.length === 0) return null;

  return (
    <div className="w-full max-w-[700px] mt-8 mb-12 animate-fadeIn bg-gray-50/50 rounded-xl p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-200 pb-2">
        <h3 className="font-['Playfair_Display'] font-bold text-lg text-gray-800">
          Daily Log
        </h3>
        <span className="text-xs text-gray-400 font-medium uppercase tracking-widest mt-1">
          {variables.length} Metrics
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {variables.map((variable) => (
          <div
            key={variable.id}
            className="flex items-center justify-between group"
          >
            <label className="font-['Inter'] text-sm text-gray-600 font-medium truncate pr-4">
              {variable.name}
            </label>

            {variable.type === "boolean" ? (
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!!values[variable.id]}
                  onChange={(e) =>
                    handleValueChange(variable.id, e.target.checked)
                  }
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
              </label>
            ) : (
              <input
                type="text"
                value={values[variable.id] || ""}
                onChange={(e) => handleValueChange(variable.id, e.target.value)}
                placeholder="Value..."
                className="w-24 text-right bg-transparent border-b border-gray-200 focus:border-black outline-none text-sm font-['Inter'] transition-colors"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyLogPanel;
