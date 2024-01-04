const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const scannedItemsSchema = new Schema({
  cartID: {
    type: String,
    required: true,
  },
  productID: {
    type: String,
  },
  name: {
    type: String,
  },
  image: {
    type: String,
  },
  price: {
    type: Number,
  },
  uuid: {
    type: String,
  },
  scanned: {
    type: Boolean,
  },
  displayModal: {
    type: Boolean,
  },
  validTag: {
    type: Boolean,
  },
});

module.exports = mongoose.model("scannedItems", scannedItemsSchema);
