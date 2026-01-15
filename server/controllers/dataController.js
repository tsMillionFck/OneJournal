const DayEntry = require("../models/DayEntry");
const Journal = require("../models/Journal");
const UserConfig = require("../models/UserConfig");

// Get all data for a specific date
exports.getDayData = async (req, res) => {
  try {
    const { date } = req.params;

    // Convert Mongoose Map to object for JSON response if needed,
    // but .lean() or default JSON serialization usually handles it.
    const dayEntry = await DayEntry.findOne({ user: req.user.id, date });
    const journals = await Journal.find({ user: req.user.id, date });

    res.json({
      dayEntry: dayEntry || {
        todos: [],
        tagAllocations: {},
        variableValues: {},
      },
      journals: journals || [],
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Update Day Entry (Todos, Tags, Vars)
exports.updateDayEntry = async (req, res) => {
  try {
    const { date, todos, tagAllocations, variableValues } = req.body;

    const fields = {};
    if (todos) fields.todos = todos;
    if (tagAllocations) fields.tagAllocations = tagAllocations;
    if (variableValues) fields.variableValues = variableValues;

    // Upsert DayEntry
    let dayEntry = await DayEntry.findOneAndUpdate(
      { user: req.user.id, date },
      { $set: fields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json(dayEntry);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Create or Update Journal
exports.saveJournal = async (req, res) => {
  try {
    const { id, date, title, content } = req.body;

    let journal;
    if (id) {
      // Update existing
      journal = await Journal.findById(id);
      if (!journal) return res.status(404).json({ msg: "Journal not found" });
      if (journal.user.toString() !== req.user.id)
        return res.status(401).json({ msg: "Not authorized" });

      journal = await Journal.findByIdAndUpdate(
        id,
        { $set: { title, content, updatedAt: Date.now() } },
        { new: true }
      );
    } else {
      // Create new (Optional: Client usually sends ID, but for Mongo we might let Mongo generate ID or store Client ID.
      // Let's assume we create new if no _id provided, but if client expects specific ID usage, we should check.)

      // Simpler: Just create new
      journal = new Journal({
        user: req.user.id,
        date,
        title,
        content,
      });
      await journal.save();
    }

    res.json(journal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Delete Journal
exports.deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);
    if (!journal) return res.status(404).json({ msg: "Journal not found" });
    if (journal.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "Not authorized" });

    await journal.remove();
    res.json({ msg: "Journal removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Get User Config
exports.getUserConfig = async (req, res) => {
  try {
    let config = await UserConfig.findOne({ user: req.user.id });
    if (!config) {
      // Return empty default
      return res.json({ tags: [], variables: [], habits: [] });
    }
    res.json(config);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};

// Update User Config
exports.updateUserConfig = async (req, res) => {
  try {
    const { tags, variables, habits } = req.body;
    const fields = {};
    if (tags) fields.tags = tags;
    if (variables) fields.variables = variables;
    if (habits) fields.habits = habits;

    const config = await UserConfig.findOneAndUpdate(
      { user: req.user.id },
      { $set: fields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(config);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
};
