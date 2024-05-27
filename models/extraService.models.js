const mongoose = require("mongoose");

const extraServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});
const ExtraService = mongoose.model("ExtraService", extraServiceSchema);
module.exports = ExtraService;
