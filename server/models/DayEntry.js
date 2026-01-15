const mongoose = require("mongoose");

const DayEntrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  date: {
    type: String,
    required: true, // Format: YYYY-MM-DD
  },
  todos: [
    {
      id: String,
      text: String,
      completed: Boolean,
    },
  ],
  tagAllocations: {
    type: Map,
    of: String, // hour -> tagId
  },
  variableValues: {
    type: Map,
    of: String, // variableId -> value
  },
});

DayEntrySchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("dayEntry", DayEntrySchema);
