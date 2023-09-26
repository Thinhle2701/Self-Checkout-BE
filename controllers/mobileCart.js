const express = require("express");
const router = express.Router();
const mobileCart = require("../models/mobileCart");
const ShortUniqueId = require("short-unique-id");
const { trusted } = require("mongoose");

router.get("/:cartID", async (req, res) => {
  const cartID = req.params.cartID;
  try {
    const result = await mobileCart.findOne({ cartID: cartID });
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

router.get("/check_verify/:cartID", async (req, res) => {
  const cartID = req.params.cartID;
  try {
    const result = await mobileCart.findOne({ cartID: cartID });
    if (result) {
      if (result.verify == true) {
        res.json({
          success: true,
          message: "Your Cart is verified",
          cartData: result,
        });
      } else {
        res.json({
          success: false,
          message: "Your Cart is not verified",
        });
      }
    } else {
      throw new Error("not exist cart");
    }
  } catch (err) {
    console.log(err.message);
    res.send(400, err.message);
  }
});

router.get("/verify/:cartID", (req, res) => {
  var cartID = req.params.cartID;
  mobileCart.findOne({ cartID: cartID }, function (err, foundObject) {
    if (err) {
      console.log(err);
      res.status(500).send();
    } else {
      if (!foundObject) {
        res.status(404).send();
      } else {
        foundObject.verify = true;
        foundObject.save(function (err, updatedObject) {
          if (err) {
            console.log(err);
            res.status(500).send();
          } else {
            res.send(updatedObject);
          }
        });
      }
    }
  });
});

router.post("/add_cart", async (req, res) => {
  const uid = new ShortUniqueId({ length: 7 });
  try {
    const newMobileCart = new mobileCart({
      cartID: uid.rnd(),
      cartItem: req.body.cartItem,
      totalPrice: req.body.totalPrice,
      RFID: req.body.RFID,
      verify: false,
    });
    await newMobileCart.save();
    res.json({
      success: true,
      message: "Create Cart successfully",
      data: newMobileCart,
    });
  } catch (err) {
    console.log(err);
  }
});

router.delete("/delete/:cartID", async (req, res) => {
  const cartID = req.params.cartID;
  // res.send(order_id)
  const Cart = await mobileCart.findOne({ cartID: cartID });
  if (!Cart) {
    res.status(400).send("Your Cart is not exist");
  } else {
    await mobileCart.deleteOne({ cartID: cartID });
    res.status(200).send({ success: true, message: "Delete Cart Successful" });
  }
});
module.exports = router;
