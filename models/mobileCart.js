const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mobileCartSchema = new Schema({
  cartID: {
    type: String,
    required: true,
  },
  cartItem: [
    {
      id: {
        type: String,
      },
      itemnumber: {
        type: String,
      },
      name: {
        type: String,
      },
      productID: {
        type: String,
      },
      image: {
        type: String,
      },
      quantity: {
        type: Number,
      },
      price: {
        type: String,
      },
      uuid: [
        {
          type: String,
        },
      ],
    },
  ],
  totalPrice: {
    type: String,
  },
  RFID: {
    type: Array,
  },
  verify: {
    type: Boolean,
  },
});

module.exports = mongoose.model("mobileCart", mobileCartSchema);
