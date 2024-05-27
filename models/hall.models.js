const mongoose = require("mongoose");

const hallSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  images: [
    {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
  ],
});
const Hall = mongoose.model("Hall", hallSchema);
module.exports = Hall;
