const mongoose = require("mongoose");

const UserConfigSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
    unique: true,
  },
  tags: [
    {
      id: String,
      name: String,
      color: String,
    },
  ],
  variables: [
    {
      id: String,
      name: String,
      type: String,
    },
  ],
  habits: [
    {
      id: String,
      name: String,
      history: [String], // Array of date strings
    },
  ],
});

module.exports = mongoose.model("userConfig", UserConfigSchema);
