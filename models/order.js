const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  orderID: {
    type: String,
    required: true,
  },
  transactionID: {
    type: String,
    required: true,
  },
  transDate: {
    type: String,
  },
  totalPrice: {
    type: String,
    require: true,
  },
  orderItem: [
    {
      productID: {
        type: String,
      },
      productName: {
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
  payment: {
    type: Boolean,
  },
});

module.exports = mongoose.model("order", orderSchema);
