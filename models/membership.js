const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const membershipSchema = new Schema({
  customerID: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    require: true,
  },
  phoneNumber: {
    type: String,
    require: true,
  },
  point: {
    type: Number,
  },
  email: {
    type: String,
  },
});

module.exports = mongoose.model("membership", membershipSchema);
