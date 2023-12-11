const express = require("express");
const router = express.Router();
const RFID = require("../models/rfid");
const axios = require("axios");
const product = require("../models/product");
const mqtt = require("mqtt");
const connectUrl = `wss://broker.emqx.io:8084/mqtt`;

const client = mqtt.connect(connectUrl, {
  clientId: "emqx_cloud_" + Math.random().toString(16).substring(2, 8),
  username: "thinh",
  password: "thinhbeo2801",
});

router.post("/sendtag", async function (req, res) {
  RFIDdata = req.body.data.RFID.split("||");
  try {
    const result = await product.find({ id: RFIDdata[1] });
    const responseData = {
      uuid: RFIDdata[0],
      product: result[0],
    };
    console.log(responseData);
    client.publish("scanRFID", JSON.stringify(responseData));
    res.send(responseData);
  } catch (err) {
    console.log(err.message);
  }
  // console.log(req.body);
  // res.send("success");
});

router.post("/write", async function (req, res) {
  let message = "start to write" + " " + req.body.productID;
  client.publish("rfid", message);
  res.send("succes");
});

router.post("/stop_write", async function (req, res) {
  let message = "stop to write" + " " + req.body.productID;
  client.publish("rfid", message);
  res.send("succes");
});

router.post("/start_scan", async function (req, res) {
  res.send("succes");
});

router.post("/verifyTag", async function (req, res) {
  const { uuid, productID } = req.body;
  try {
    const rfidTag = await RFID.findOne({ uuid: uuid, productID: productID });
    if (rfidTag) {
      try {
        const Pro = await product.findOne({ id: productID });
        if (Pro) {
          const responseData = {
            uuid: rfidTag.uuid,
            productID: Pro.id,
            image: Pro.image,
            name: Pro.name,
            price: Pro.price,
          };
          res.send(responseData);
        } else {
          throw new Error("not exist product");
        }
      } catch (err) {
        console.log(err.message);
        res.send(400, err.message);
      }
    } else {
      throw new Error("not exist RFID");
    }
  } catch (err) {
    console.log(err.message);
    res.send(400, err.message);
  }
});

router.post("/add_rfid", async function (req, res) {
  const uuidList = req.body.uuid;
  const productID = req.body.productID;
  const userWrite = req.body.userID;
  for (let i = 0; i < uuidList.length; i++) {
    let uuid = uuidList[i].split("||");
    const foundObject = await RFID.findOne({ uuid: uuid });
    if (foundObject) {
      const oldID = foundObject.productID;
      if (foundObject.productID != productID) {
        foundObject.productID = productID;
        foundObject.deviceID = uuid[1];
        foundObject.createdDate = new Date();
        foundObject.createdBy = userWrite;
        foundObject.save();

        const currentProduct = await product.findOne({
          id: oldID,
        });

        if (currentProduct) {
          const currentValueQTY = currentProduct.qty;
          var newValues = { $set: { qty: currentValueQTY - 1 } };
          product.updateOne({ id: oldID }, newValues, function (err, res) {
            if (err) throw err;
            console.log("1 current updated");
          });
        } else {
          throw new Error("not exist product");
        }

        const newProductWrited = await product.findOne({ id: productID });
        if (newProductWrited) {
          const newProductWritedQTY = newProductWrited.qty;
          var newValues = { $set: { qty: newProductWritedQTY + 1 } };
          product.updateOne({ id: productID }, newValues, function (err, res) {
            if (err) throw err;
          });
        } else {
          throw new Error("not exist product");
        }
      }
    } else {
      const newRFID = new RFID({
        uuid: uuid[0],
        productID: productID,
        deviceID: uuid[1],
        createdDate: new Date(),
        createdBy: userWrite,
      });
      await newRFID.save();
      const newProductWrited = await product.findOne({ id: productID });
      if (newProductWrited) {
        const newProductWritedQTY = newProductWrited.qty;
        var newValues = { $set: { qty: newProductWritedQTY + 1 } };
        product.updateOne({ id: productID }, newValues, function (err, res) {
          if (err) throw err;
        });
      } else {
        throw new Error("not exist product");
      }
    }
  }
  res.send("imported");
});

router.post("/import_inventory", async function (req, res) {
  const importItemList = req.body.importData;
  const userID = req.body.userID;
  console.log(importItemList);
  for (let i = 0; i < importItemList.length; i++) {
    let productID = importItemList[i].id;
    for (let k = 0; k < importItemList[i].uuid.length; k++) {
      //console.log(importItemList[i].uuid[k].split("||")[0]);
      const uuid = importItemList[i].uuid[k].split("||");
      const foundObject = await RFID.findOne({ uuid: uuid[0] });
      if (foundObject) {
        const oldID = foundObject.productID;
        if (foundObject.productID != productID) {
          foundObject.productID = productID;
          foundObject.deviceID = uuid[2];
          foundObject.createdDate = new Date();
          foundObject.createdBy = userID;
          foundObject.save();

          const currentProduct = await product.findOne({
            id: oldID,
          });

          if (currentProduct) {
            const currentValueQTY = currentProduct.qty;
            var newValues = { $set: { qty: currentValueQTY - 1 } };
            product.updateOne({ id: oldID }, newValues, function (err, res) {
              if (err) throw err;
              console.log("1 current updated");
            });
          } else {
            throw new Error("not exist product");
          }

          const newProductWrited = await product.findOne({ id: productID });
          if (newProductWrited) {
            const newProductWritedQTY = newProductWrited.qty;
            var newValues = { $set: { qty: newProductWritedQTY + 1 } };
            product.updateOne(
              { id: productID },
              newValues,
              function (err, res) {
                if (err) throw err;
              }
            );
          }
        }
      } else {
        const newRFID = new RFID({
          uuid: uuid[0],
          productID: productID,
          deviceID: uuid[2],
          createdDate: new Date(),
          createdBy: userID,
        });
        await newRFID.save();
        const newProductWrited = await product.findOne({ id: productID });
        if (newProductWrited) {
          const newProductWritedQTY = newProductWrited.qty;
          var newValues = { $set: { qty: newProductWritedQTY + 1 } };
          product.updateOne({ id: productID }, newValues, function (err, res) {
            if (err) throw err;
          });
        } else {
          throw new Error("not exist product");
        }
      }
    }
  }
  const currentProduct = await product.find();
  res.json({
    success: true,
    message: "Import successfully",
    data: currentProduct,
  });
});

module.exports = router;
