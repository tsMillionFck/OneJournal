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

// Generate unique journal ID
export const generateJournalId = () =>
  `journal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Storage key for journals list (per day)
export const getJournalsListKey = (dateKey) => `journals_list_${dateKey}`;

// Storage key for individual journal content
export const getJournalContentKey = (journalId) =>
  `journal_content_${journalId}`;

// Legacy storage key (for migration)
export const getStorageKey = (dateKey) => `journal_${dateKey}`;

// Get all journals for a date
export const getJournalsForDate = (dateKey) => {
  const listKey = getJournalsListKey(dateKey);
  const journalsList = localStorage.getItem(listKey);

  if (journalsList) {
    return JSON.parse(journalsList);
  }

  // Check for legacy single journal and migrate
  const legacyKey = getStorageKey(dateKey);
  const legacyContent = localStorage.getItem(legacyKey);

  if (legacyContent) {
    // Migrate legacy journal to new format
    const newJournalId = generateJournalId();
    const newJournal = {
      id: newJournalId,
      title: "Journal 1",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Save migrated data
    localStorage.setItem(listKey, JSON.stringify([newJournal]));
    localStorage.setItem(getJournalContentKey(newJournalId), legacyContent);
    localStorage.removeItem(legacyKey); // Clean up legacy

    return [newJournal];
  }

  return [];
};

// Save journal metadata to list
export const saveJournalToList = (dateKey, journal) => {
  const listKey = getJournalsListKey(dateKey);
  const journals = getJournalsForDate(dateKey);

  const existingIndex = journals.findIndex((j) => j.id === journal.id);
  if (existingIndex >= 0) {
    journals[existingIndex] = {
      ...journals[existingIndex],
      ...journal,
      updatedAt: Date.now(),
    };
  } else {
    journals.push(journal);
  }

  localStorage.setItem(listKey, JSON.stringify(journals));
  return journals;
};

// Delete journal
export const deleteJournal = (dateKey, journalId) => {
  const listKey = getJournalsListKey(dateKey);
  const journals = getJournalsForDate(dateKey);

  const filtered = journals.filter((j) => j.id !== journalId);
  localStorage.setItem(listKey, JSON.stringify(filtered));
  localStorage.removeItem(getJournalContentKey(journalId));

  return filtered;
};

// Storage key for todos list (per day)
export const getTodosKey = (dateKey) => `todos_${dateKey}`;

// Get todos for a date
export const getTodosForDate = (dateKey) => {
  const key = getTodosKey(dateKey);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Save todos for a date
export const saveTodosForDate = (dateKey, todos) => {
  const key = getTodosKey(dateKey);
  localStorage.setItem(key, JSON.stringify(todos));
  return todos;
};

// --- Tags System ---

// Global User Tags (Definitions)
export const getUserTagsKey = () => "user_defined_tags";

export const getUserTags = () => {
  const data = localStorage.getItem(getUserTagsKey());
  return data ? JSON.parse(data) : [];
};

export const saveUserTag = (tag) => {
  const tags = getUserTags();
  const updated = [...tags, tag];
  localStorage.setItem(getUserTagsKey(), JSON.stringify(updated));
  return updated;
};

export const deleteUserTag = (tagId) => {
  const tags = getUserTags();
  const updated = tags.filter((t) => t.id !== tagId);
  localStorage.setItem(getUserTagsKey(), JSON.stringify(updated));
  return updated;
};

// Daily Tag Allocations (Hour -> TagId)
export const getDayTagsKey = (dateKey) => `day_tags_${dateKey}`;

export const getDayTags = (dateKey) => {
  const data = localStorage.getItem(getDayTagsKey(dateKey));
  return data ? JSON.parse(data) : {};
};

export const saveDayTags = (dateKey, tagsMap) => {
  localStorage.setItem(getDayTagsKey(dateKey), JSON.stringify(tagsMap));
  return tagsMap;
};
