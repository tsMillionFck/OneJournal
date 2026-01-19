import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";

const HabitSuccessModal = ({ habit, onClose, onSave }) => {
  const [reflection, setReflection] = useState("");

  useEffect(() => {
    // Trigger confetti on mount
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      zIndex: 99999,
    });
  }, []);

  const handleSave = () => {
    onSave(habit.id, reflection);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative transform transition-all scale-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
        >
          ×
        </button>

        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="font-['Playfair_Display'] text-2xl font-bold mb-1">
            Habit Complete!
          </h2>
          <p className="text-gray-500 text-sm uppercase tracking-wider font-bold">
            {habit.name}
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold uppercase text-gray-400 mb-2">
            How was your experience?
          </label>
          <textarea
            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black/10 transition-all resize-none font-['Inter']"
            rows="4"
            placeholder="I felt focused and energized..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            autoFocus
          ></textarea>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-black text-white py-3 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transform active:scale-[0.99] transition-all shadow-lg hover:shadow-xl"
        >
          Save Reflection
        </button>
      </div>
    </div>
  );
};

export default HabitSuccessModal;
