const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    desc: {
      type: String,
      required: true,
      unique: true,
    },
    important: {
      type: Boolean,
      default: false,
    },
    complete: {
      type: Boolean,
      default: false,
    },
    startDate: {
      type: Date,
      required: true, // Set to true if a start date is mandatory
    },
    endDate: {
      type: Date,
      required: false, // Set to true if an end date is mandatory
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("task", TaskSchema);
