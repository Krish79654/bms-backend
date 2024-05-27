const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  hall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hall",
    required: true,
  },
  menu: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Menu",
    required: true,
  },
  extraServices: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExtraService",
    },
  ],

  eventDate: {
    type: Date,
    required: true,
  },
  shift: {
    type: String,
    enum: ["morning", "evening", "whole_day"],
    required: true,
  },
  guests: {
    type: Number,
    required: true,
  },
  eventType: {
    type: String,
    required: true,
  },

  totalCharge: {
    type: Number,
    required: true,
  },
  advancePaid: {
    type: Boolean,
    default: false,
  },
  advanceAmount: {
    type: Number,
    default: 0,
  },
  pidx: {
    type: String,
  },
});
const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
