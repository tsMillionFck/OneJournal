// Quotes for the left side panel
export const quotes = [
  {
    text: "We write to taste life twice, in the moment and in retrospect.",
    author: "Anaïs Nin",
  },
  {
    text: "What we achieve inwardly will change outer reality.",
    author: "Plutarch",
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
  },
  {
    text: "The scariest moment is always just before you start.",
    author: "Stephen King",
  },
];

// Random prompts shown in the hero section
export const prompts = [
  "What is weighing on your mind right now?",
  "What is the one thing you must accomplish today?",
  "What lesson did failure teach you recently?",
  "If today was your last day, what would you do?",
];

// Framework tips for the right side panel
export const frameworks = {
  standard: [
    { title: "The Event", desc: "What actually happened?" },
    { title: "The Emotion", desc: "How did it make you feel?" },
    { title: "The Lesson", desc: "What did you learn?" },
  ],
  stoic: [
    { title: "Virtue Check", desc: "Did I act with wisdom and courage?" },
    { title: "Gratitude", desc: "What went well despite the chaos?" },
  ],
  idea: [
    { title: "The Problem", desc: "What needs solving?" },
    { title: "The Solution", desc: "How can I fix it?" },
  ],
};

// Helper functions
export const getRandomQuote = () =>
  quotes[Math.floor(Math.random() * quotes.length)];
export const getRandomPrompt = () =>
  prompts[Math.floor(Math.random() * prompts.length)];

// Date formatting helpers
export const formatDateKey = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;

export const getStorageKey = (dateKey) => `journal_${dateKey}`;
