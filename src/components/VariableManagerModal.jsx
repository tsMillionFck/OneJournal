import React, { useState, useEffect } from "react";
import {
  getDailyVariables,
  saveDailyVariable,
  deleteDailyVariable,
} from "../data/constants";

const VariableManagerModal = ({ isOpen, onClose }) => {
  const [variables, setVariables] = useState([]);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("boolean"); // 'boolean' or 'string'

  // Load variables on mount or when modal opens
  useEffect(() => {
    if (isOpen) {
      setVariables(getDailyVariables());
    }
  }, [isOpen]);

  const handleAddVariable = () => {
    if (!newName.trim()) return;

    const newVar = {
      id: Date.now(),
      name: newName.trim(),
      type: newType,
    };

    const updated = saveDailyVariable(newVar);
    setVariables(updated);
    setNewName("");
    setNewType("boolean");
  };

  const handleDeleteVariable = (id) => {
    const updated = deleteDailyVariable(id);
    setVariables(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
          ✕
        </button>

        <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-6">
          Daily Log Variables
        </h2>

        {/* Add New Variable Form */}
        <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
          <div className="mb-4">
            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
              Variable Name
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Meditation, Workout, Mood"
              className="w-full px-3 py-2 border-b border-gray-200 bg-transparent focus:border-black outline-none font-['Inter'] text-sm transition-colors"
            />
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setNewType("boolean")}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    newType === "boolean"
                      ? "bg-black text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Checkbox (T/F)
                </button>
                <button
                  onClick={() => setNewType("scale")}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    newType === "scale"
                      ? "bg-black text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Scale (1-10)
                </button>
                <button
                  onClick={() => setNewType("string")}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                    newType === "string"
                      ? "bg-black text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Text Field
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddVariable}
            className="w-full bg-black text-white py-3 rounded-lg font-['Inter'] text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          >
            Add Variable
          </button>
        </div>

        {/* Existing Variables List */}
        <div>
          <h3 className="font-['Inter'] text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 ml-1">
            Active Variables
          </h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {variables.length === 0 && (
              <div className="text-center py-6 text-gray-400 italic text-sm">
                No variables defined yet.
              </div>
            )}
            {variables.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg group hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      v.type === "boolean"
                        ? "bg-blue-400"
                        : v.type === "scale"
                        ? "bg-orange-400"
                        : "bg-purple-400"
                    }`}
                  ></span>
                  <span className="font-medium text-gray-800">{v.name}</span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide bg-gray-100 px-2 py-0.5 rounded">
                    {v.type === "boolean"
                      ? "Check"
                      : v.type === "scale"
                      ? "Scale"
                      : "Text"}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteVariable(v.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-500 rounded-full hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  title="Delete Variable"
                >
                  🗑️
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariableManagerModal;
