const express = require("express");
const router = express.Router();
const SEND_INTERVAL = 2000;
const checkoutCart = require("../models/checkoutCart");
const RFID = require("../models/rfid");
const axios = require("axios");
const product = require("../models/product");
const donation = {
  user: 0,
  amount: 0,
};

router.post("/transfer_rfid_tag", async (req, res) => {
  // const cartID = req.body.data.cartID;
  // try {
  //   const checkoutCartObject = await checkoutCart.findOne({ cartID: cartID });
  //   if (checkoutCartObject) {
  //     const uuid = req.body.data.RFID.split("||")[0];
  //     const productID = req.body.data.RFID.split("||")[1];
  //     try {
  //       const rfidTag = await RFID.findOne({
  //         uuid: uuid,
  //         productID: productID,
  //       });

  //       if (rfidTag) {
  //         try {
  //           const Pro = await product.findOne({ id: productID });
  //           if (Pro) {
  //             if (checkoutCartObject.RFID.length === 0) {
  //               console.log("insert");
  //               var uuidArr = [];
  //               await uuidArr.push(rfidTag.uuid);
  //               const cartItem = [
  //                 {
  //                   id: "item_" + Number(checkoutCartObject.RFID.length + 1),
  //                   itemnumber: Number(checkoutCartObject.RFID.length + 1),
  //                   name: Pro.name,
  //                   productID: productID,
  //                   image: Pro.image,
  //                   quantity: 1,
  //                   price: Pro.price,
  //                   uuid: uuidArr,
  //                 },
  //               ];

  //               const totalPrice = Pro.price;
  //               const RFIDArr = [];
  //               RFIDArr.push(rfidTag.uuid);

  //               await checkoutCart.updateOne(
  //                 { cartID: cartID },
  //                 {
  //                   $set: {
  //                     cartItem: cartItem,
  //                     totalPrice: totalPrice,
  //                     RFID: RFIDArr,
  //                     scanned: true,
  //                   },
  //                 }
  //               );
  //               console.log("insert successfully");
  //             } else {
  //               var found = checkoutCartObject.RFID.includes(uuid);
  //               console.log(found);
  //               if (found === true) {
  //                 console.log("exist item");
  //               } else {
  //                 var checkExistItem = false;
  //                 for (let i = 0; i < checkoutCartObject.cartItem.length; i++) {
  //                   if (
  //                     checkoutCartObject.cartItem[i].productID === productID
  //                   ) {
  //                     checkExistItem = true;
  //                     console.log("add quantity");

  //                     var insertQTYobj = checkoutCartObject;
  //                     var currUUIDArr = insertQTYobj.cartItem[i].uuid;
  //                     insertQTYobj.cartItem[i].quantity =
  //                       Number(insertQTYobj.cartItem[i].quantity) + 1;
  //                     insertQTYobj.cartItem[i].price =
  //                       Number(insertQTYobj.cartItem[i].price) +
  //                       Number(Pro.price);
  //                     currUUIDArr.push(rfidTag.uuid);
  //                     insertQTYobj.totalPrice =
  //                       Number(insertQTYobj.totalPrice) + Number(Pro.price);
  //                     insertQTYobj.cartItem[i].uuid = currUUIDArr;
  //                     var RFIDArr = [];
  //                     RFIDArr.push(rfidTag.uuid);
  //                     await checkoutCart.updateOne(
  //                       { cartID: cartID },
  //                       {
  //                         $set: {
  //                           cartItem: insertQTYobj.cartItem,
  //                           totalPrice: insertQTYobj.totalPrice,
  //                           RFID: RFIDArr,
  //                         },
  //                       }
  //                     );
  //                   }
  //                 }
  //                 if (checkExistItem === false) {
  //                   console.log("add new item");
  //                   var insertNewObj = checkoutCartObject;
  //                   var itemArr = insertNewObj.cartItem;
  //                   var uuidArr = [];
  //                   await uuidArr.push(rfidTag.uuid);

  //                   var newElementItem = {
  //                     id:
  //                       "item_" +
  //                       Number(checkoutCartObject.cartItem.length + 1),
  //                     itemnumber: Number(
  //                       checkoutCartObject.cartItem.length + 1
  //                     ),
  //                     name: Pro.name,
  //                     productID: productID,
  //                     image: Pro.image,
  //                     quantity: 1,
  //                     price: Pro.price,
  //                     uuid: uuidArr,
  //                   };
  //                   itemArr.push(newElementItem);
  //                   insertNewObj.totalPrice =
  //                     Number(insertNewObj.totalPrice) + Number(Pro.price);
  //                   var RFIDArr = insertNewObj.RFID;
  //                   RFIDArr.push(rfidTag.uuid);
  //                   await checkoutCart.updateOne(
  //                     { cartID: cartID },
  //                     {
  //                       $set: {
  //                         cartItem: itemArr,
  //                         totalPrice: insertNewObj.totalPrice,
  //                         RFID: RFIDArr,
  //                       },
  //                     }
  //                   );
  //                 }
  //               }
  //             }
  //           } else {
  //             throw new Error("not exist product");
  //           }
  //         } catch (err) {
  //           console.log(err.message);
  //         }
  //       } else {
  //         throw new Error("not exist RFID");
  //       }
  //     } catch (err) {
  //       console.log(err.message);
  //     }
  //   } else {
  //     throw new Error("not exist cart");
  //   }
  // } catch (err) {
  //   console.log(err.message);
  // }

  console.log(req.body);

  return res.json({ message: "Success" });
});

const writeEvent = (res, sseId, data) => {
  res.write(`id: ${sseId}\n`);
  res.write(`data: ${data}\n\n`);
};

const sendEvent = async (req, res, cartID) => {
  res.writeHead(200, {
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
  });

  const sseId = new Date().toDateString();

  let cartValue = {};

  setInterval(async () => {
    let cart = {};
    const result = await checkoutCart.findOne({ cartID: cartID });
    if (result) {
      cart = result;
      cartValue = result;
    }
    writeEvent(res, sseId, JSON.stringify(cart));
  }, SEND_INTERVAL);

  writeEvent(res, sseId, JSON.stringify(cartValue));
};

router.get("/:cartID", (req, res) => {
  const cartID = req.params.cartID;
  if (req.headers.accept === "text/event-stream") {
    sendEvent(req, res, cartID);
  } else {
    res.json({ message: "Ok" });
  }
});

module.exports = router;
