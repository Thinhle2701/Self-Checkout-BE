const express = require("express");
const router = express.Router();
const checkoutCart = require("../models/checkoutCart");
const ShortUniqueId = require("short-unique-id");
const { trusted } = require("mongoose");
const moment = require("moment");
const mobileCart = require("../models/mobileCart");

router.get("/:cartID", async (req, res) => {
  const cartID = req.params.cartID;
  try {
    const result = await checkoutCart.findOne({ cartID: cartID });
    if (result) {
      res.send(result);
    } else {
      throw new Error("not exist cart");
    }
  } catch (err) {
    console.log(err.message);
    res.send(400, err.message);
  }
});

router.post("/add_cart", async (req, res) => {
  const uid = new ShortUniqueId({ length: 7 });
  try {
    const newCheckoutCart = new checkoutCart({
      cartID: uid.rnd(),
      cartItem: {},
      totalPrice: 0,
      RFID: [],
      createdDate: new Date(),
      deviceID: req.body.deviceID,
      scanned: false,
    });
    await newCheckoutCart.save();
    res.json({
      success: true,
      message: "Create Checkout Cart successfully",
      data: newCheckoutCart,
    });
  } catch (err) {
    console.log(err);
  }
});

router.post("/verify_cart_expire", async (req, res) => {
  const cartID = req.body.cartID;
  try {
    const result = await checkoutCart.findOne({ cartID: cartID });
    if (result) {
      const createdDate = result.createdDate;
      let currDate = new Date();
      var a = moment(currDate); //now
      var b = moment(createdDate);
      if (a.diff(b, "minutes") > 60) {
        const message = "expire cart";
        res.send(message);
      } else {
        res.send(result);
      }
    } else {
      throw new Error("not exist cart");
    }
  } catch (err) {
    console.log(err.message);
    res.send(400, err.message);
  }
});

router.post("/update_cart", async (req, res) => {
  const cartID = req.body.cartID;
  const cartItem = req.body.cartItem;
  const RFIDArr = req.body.RFID;
  const totalPrice = req.body.totalPrice;

  const checkoutCartObject = await checkoutCart.findOne({ cartID: cartID });
  if (checkoutCartObject) {
    checkoutCartObject.cartItem = cartItem;
    checkoutCartObject.totalPrice = totalPrice;
    checkoutCartObject.RFID = RFIDArr;
    checkoutCartObject.save(function (err, updatedObject) {
      if (err) {
        console.log(err);
        res.status(500).send();
      } else {
        res.send(updatedObject);
      }
    });
  } else {
    res.status(404).send();
  }
});
router.post("/verify/:mobilecartID", async (req, res) => {
  var cartID = req.params.mobilecartID;
  mobileCart.findOne({ cartID: cartID }, async function (err, foundObject) {
    if (err) {
      console.log(err);
      res.status(500).send();
    } else {
      if (!foundObject) {
        res.status(404).send();
      } else {
        foundObject.verify = true;
        foundObject.save(async function (err, updatedObject) {
          if (err) {
            console.log(err);
            res.status(500).send();
          } else {
            const newCheckoutCart = new checkoutCart({
              cartID: cartID,
              cartItem: foundObject.cartItem,
              totalPrice: foundObject.totalPrice,
              RFID: foundObject.RFID,
              createdDate: new Date(),
              deviceID: req.body.deviceID,
              scanned: true,
            });
            await newCheckoutCart.save();
            res.send(newCheckoutCart);
          }
        });
      }
    }
  });
});
module.exports = router;
