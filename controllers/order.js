const express = require("express");
const router = express.Router();
const order = require("../models/order");
const axios = require("axios");

router.post("/add_order", async (req, res) => {
  const transactionID = req.body.transactionID;
  const Ord = await order.findOne({ transactionID });
  if (Ord) {
    res.json({ success: false, message: "Your Order is already existed" });
  } else {
    const { transactionID, transDate, totalPrice, orderItem, payment } =
      req.body;
    let countOrd = await order.countDocuments();
    if (!countOrd) {
      newId = "Ord_01";
    }
    if (countOrd < 9) {
      countOrd++;
      newId = "Ord_0" + countOrd;
    } else {
      countOrd++;
      newId = "Ord_" + countOrd;
    }
    try {
      const newOrder = new order({
        orderID: newId,
        transactionID: transactionID,
        transDate: transDate,
        totalPrice: totalPrice,
        orderItem: orderItem,
        payment: payment,
      });
      await newOrder.save();
      res.json({
        success: true,
        message: "Create order successfully",
        data: newOrder,
      });
    } catch (err) {
      console.log(err);
    }
  }
});

router.post("/find_transaction", async (req, res) => {
  const transactionID = req.body.transactionID;
  const Ord = await order.findOne({ transactionID });
  if (Ord) {
    res.json({
      success: true,
      message: "Your Order is already existed",
      orderData: Ord,
    });
  } else {
    res.json({ success: false, message: "Your Order does not existed" });
  }
});

module.exports = router;
