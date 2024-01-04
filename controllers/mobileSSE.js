const express = require("express");
const router = express.Router();
const SEND_INTERVAL = 2000;
const mobileCart = require("../models/mobileCart");
const RFID = require("../models/rfid");
const axios = require("axios");
const product = require("../models/product");
const scannedItems = require("../models/scannedItems");

const productTag = {
  productID: "",
  name: "",
  image: "",
  price: 0,
  uuid: "",
  scanned: false,
  cartID: "",
  displayModal: false,
};

router.post("/transfer_rfid_tag", async (req, res) => {
  if (req.body.RFID === "") {
    await scannedItems.updateOne(
      { cartID: cartID },
      {
        $set: {
          productID: "invalid tag",
          name: "",
          image: "",
          price: 0,
          uuid: "",
          scanned: false,
          displayModal: false,
          validTag: false,
        },
      }
    );
  } else {
    const cartID = req.body.data.mobileCartID;
    try {
      const mobileCartObject = await mobileCart.findOne({ cartID: cartID });
      if (mobileCartObject) {
        const uuid = req.body.data.RFID.split("||")[0];
        const productID = req.body.data.RFID.split("||")[1];
        try {
          const rfidTag = await RFID.findOne({
            uuid: uuid,
            productID: productID,
          });

          if (rfidTag) {
            try {
              const Pro = await product.findOne({ id: productID });
              if (Pro) {
                await scannedItems.updateOne(
                  { cartID: cartID },
                  {
                    $set: {
                      productID: Pro.id,
                      name: Pro.name,
                      image: Pro.image,
                      price: Pro.price,
                      uuid: rfidTag.uuid,
                      scanned: false,
                      displayModal: false,
                      validTag: true,
                    },
                  }
                );
              } else {
                throw new Error("not exist product");
              }
            } catch (err) {
              console.log(err.message);
            }
          } else {
            console.log("invalid tag");
            await scannedItems.updateOne(
              { cartID: cartID },
              {
                $set: {
                  productID: "invalid tag",
                  name: "",
                  image: "",
                  price: 0,
                  uuid: "",
                  scanned: false,
                  displayModal: false,
                  validTag: false,
                },
              }
            );
          }
        } catch (err) {
          console.log(err.message);
        }
      } else {
        throw new Error("not exist cart");
      }
    } catch (err) {
      console.log(err.message);
    }
    //console.log(req.body);
  }

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

  let itemValue = {};

  setInterval(async () => {
    let item = {};
    const result = await scannedItems.findOne({ cartID: cartID });
    if (result) {
      item = result;
      itemValue = result;
    }
    if (item.cartID === cartID && item.scanned === false) {
      writeEvent(res, sseId, JSON.stringify(item));
    }
  }, SEND_INTERVAL);

  writeEvent(res, sseId, JSON.stringify(productTag));
};

router.get("/:mobileCartID", (req, res) => {
  const cartID = req.params.mobileCartID;
  if (req.headers.accept === "text/event-stream") {
    sendEvent(req, res, cartID);
  } else {
    res.json({ message: "Ok" });
  }
});

router.get("/update_display_modal/:mobileCartID", (req, res) => {
  const cartID = req.params.mobileCartID;
  if (cartID === productTag.cartID) {
    productTag.displayModal = true;
    productTag.scanned = true;
  }
  res.json({ message: "updated" });
});

router.get("/update_restart_scan/:mobileCartID", async (req, res) => {
  const cartID = req.params.mobileCartID;
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
  res.json({ message: "Restart Scanning" });
});

module.exports = router;
