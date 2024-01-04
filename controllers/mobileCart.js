const express = require("express");
const router = express.Router();
const mobileCart = require("../models/mobileCart");
const ShortUniqueId = require("short-unique-id");
const { trusted } = require("mongoose");
const moment = require("moment");
const scannedItems = require("../models/scannedItems");

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

router.post("/create_new_cart", async (req, res) => {
  const uid = new ShortUniqueId({ length: 7 });
  try {
    const cartID = uid.rnd();
    const newMobileCart = new mobileCart({
      cartID: cartID,
      cartItem: {},
      totalPrice: 0,
      RFID: [],
      createdDate: new Date(),
      deviceID: req.body.deviceID,
      scanned: false,
      verify: false,
    });
    await newMobileCart.save();
    const newScannedItem = new scannedItems({
      cartID: cartID,
      name: "",
      image: "",
      price: 0,
      uuid: "",
      scanned: false,
      displayModal: false,
    });
    await newScannedItem.save();

    console.log(newMobileCart);
    await res.json({
      success: true,
      message: "Create Cart successfully",
      data: newMobileCart,
    });
  } catch (err) {
    console.log(err);
  }
});

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

const emptyScannedItem = async (cartID) => {
  await scannedItems.updateOne(
    { cartID: cartID },
    {
      $set: {
        productID: "",
        name: "",
        image: "",
        price: "",
        uuid: "",
        scanned: false,
        displayModal: false,
        validTag: false,
      },
    }
  );
};

router.post("/add_item_to_cart", async (req, res) => {
  const cartID = req.body.cartID;
  const insertItem = req.body.item;
  console.log("cartID: ", cartID);
  try {
    const mobileCartObject = await mobileCart.findOne({ cartID: cartID });
    if (mobileCartObject) {
      if (mobileCartObject.RFID.length === 0) {
        console.log("insert");
        var uuidArr = [];
        await uuidArr.push(insertItem.uuid);
        const cartItem = [
          {
            id: "item_" + Number(mobileCartObject.RFID.length + 1),
            itemnumber: Number(mobileCartObject.RFID.length + 1),
            name: insertItem.name,
            productID: insertItem.productID,
            image: insertItem.image,
            quantity: 1,
            price: insertItem.price,
            uuid: uuidArr,
          },
        ];

        const totalPrice = insertItem.price;
        const RFIDArr = [];
        RFIDArr.push(insertItem.uuid);

        await mobileCart.updateOne(
          { cartID: cartID },
          {
            $set: {
              cartItem: cartItem,
              totalPrice: totalPrice,
              RFID: RFIDArr,
              scanned: true,
            },
          }
        );

        const newMobileCart = await mobileCart.findOne({ cartID: cartID });
        await emptyScannedItem(cartID);
        res.send(newMobileCart);
        console.log("insert successfully");
      } else {
        var found = mobileCartObject.RFID.includes(insertItem.uuid);
        console.log(found);
        if (found === true) {
          await emptyScannedItem(cartID);
          res.send("exist item");
        } else {
          var checkExistItem = false;
          for (let i = 0; i < mobileCartObject.cartItem.length; i++) {
            if (
              mobileCartObject.cartItem[i].productID === insertItem.productID
            ) {
              checkExistItem = true;
              console.log("add quantity");

              var insertQTYobj = mobileCartObject;
              var currUUIDArr = insertQTYobj.cartItem[i].uuid;
              insertQTYobj.cartItem[i].quantity =
                Number(insertQTYobj.cartItem[i].quantity) + 1;
              insertQTYobj.cartItem[i].price =
                Number(insertQTYobj.cartItem[i].price) +
                Number(insertItem.price);
              currUUIDArr.push(insertItem.uuid);
              insertQTYobj.totalPrice =
                Number(insertQTYobj.totalPrice) + Number(insertItem.price);
              insertQTYobj.cartItem[i].uuid = currUUIDArr;
              var RFIDArr = insertQTYobj.RFID;
              RFIDArr.push(insertItem.uuid);
              await mobileCart.updateOne(
                { cartID: cartID },
                {
                  $set: {
                    cartItem: insertQTYobj.cartItem,
                    totalPrice: insertQTYobj.totalPrice,
                    RFID: RFIDArr,
                  },
                }
              );
              const newMobileCart = await mobileCart.findOne({
                cartID: cartID,
              });
              await emptyScannedItem(cartID);
              res.send(newMobileCart);
            }
          }
          if (checkExistItem === false) {
            console.log("add new item");
            var insertNewObj = mobileCartObject;
            var itemArr = insertNewObj.cartItem;
            var uuidArr = [];
            await uuidArr.push(insertItem.uuid);

            var newElementItem = {
              id: "item_" + Number(mobileCartObject.cartItem.length + 1),
              itemnumber: Number(mobileCartObject.cartItem.length + 1),
              name: insertItem.name,
              productID: insertItem.productID,
              image: insertItem.image,
              quantity: 1,
              price: insertItem.price,
              uuid: uuidArr,
            };
            itemArr.push(newElementItem);
            insertNewObj.totalPrice =
              Number(insertNewObj.totalPrice) + Number(insertItem.price);
            var RFIDArr = insertNewObj.RFID;
            RFIDArr.push(insertItem.uuid);
            await mobileCart.updateOne(
              { cartID: cartID },
              {
                $set: {
                  cartItem: itemArr,
                  totalPrice: insertNewObj.totalPrice,
                  RFID: RFIDArr,
                },
              }
            );

            const newMobileCart = await mobileCart.findOne({ cartID: cartID });
            await emptyScannedItem(cartID);
            res.send(newMobileCart);
          }
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
});

router.post("/update_cart_item", async (req, res) => {
  const cartID = req.body.cartID;
  const cartItem = req.body.cartItem;
  const RFIDArr = req.body.RFID;
  const totalPrice = req.body.totalPrice;

  const mobileCartObject = await mobileCart.findOne({ cartID: cartID });
  if (mobileCart) {
    mobileCartObject.cartItem = cartItem;
    mobileCartObject.totalPrice = totalPrice;
    mobileCartObject.RFID = RFIDArr;
    mobileCartObject.save(function (err, updatedObject) {
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

router.post("/verify_mobile_cart_expire", async (req, res) => {
  const cartID = req.body.cartID;
  try {
    const result = await mobileCart.findOne({ cartID: cartID });
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

module.exports = router;
