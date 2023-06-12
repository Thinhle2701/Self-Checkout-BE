const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const rfidSchema = new Schema({
  uuid:{
    type: String,
    required: true
  },
  productID:{
    type:String,
    required: true,
  }
});

module.exports = mongoose.model("RFID", rfidSchema);