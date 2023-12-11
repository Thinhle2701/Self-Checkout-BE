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
      image:{
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
  paymentMethod: {
    type: String,
  },
  orderDate:{
    type: Date,
  },
});

module.exports = mongoose.model("order", orderSchema);
