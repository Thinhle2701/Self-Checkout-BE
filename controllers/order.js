const express = require("express");
const router = express.Router();
const order = require("../models/order");
const axios = require("axios");
const product = require("../models/product");
const membership = require("../models/membership");

router.get("/", async (req, res) => {
  try {
    const result = await order.find().sort({ orderDate: -1 });
    res.send(result);
  } catch (err) {
    console.log(err.message);
  }
});

router.post("/add_order", async (req, res) => {
  const transactionID = req.body.transactionID;
  const Ord = await order.findOne({ transactionID });
  if (Ord) {
    res.json({ success: false, message: "Your Order is already existed" });
  } else {
    const {
      transactionID,
      transDate,
      totalPrice,
      orderItem,
      payment,
      paymentMethod,
      orderBy,
    } = req.body;
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
      const dateSort = new Date();
      const newOrder = new order({
        orderID: newId,
        transactionID: transactionID,
        transDate: transDate,
        totalPrice: totalPrice,
        orderItem: orderItem,
        payment: payment,
        paymentMethod: paymentMethod,
        orderDate: dateSort,
        orderBy: orderBy,
      });
      await newOrder.save();
      if (orderBy !== "new customer") {
        const memObject = await membership.findOne({ customerID: orderBy });

        console.log(memObject.point);
        const newValuePoint = memObject.point + Number(totalPrice) / 1000;
        await membership.updateOne(
          { customerID: orderBy },
          {
            $set: {
              point: newValuePoint,
            },
          }
        );
      }

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

router.get("/review_invoice/:ordID", async (req, res) => {
  const orderID = req.params.ordID;
  try {
    const result = await order.findOne({ orderID: orderID });
    if (result) {
      res.send(result);
    } else {
      throw new Error("not exist order");
    }
  } catch (err) {
    console.log(err.message);
    res.send(400, err.message);
  }
});

module.exports = router;
