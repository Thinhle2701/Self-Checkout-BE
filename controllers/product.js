const express = require("express");
const router = express.Router();
const product = require("../models/product");
const axios = require("axios");
const RFID = require("../models/rfid");

router.get("/", async (req, res) => {
  try {
    const result = await product.find();
    res.send(result);
  } catch (err) {
    console.log(err.message);
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await product.findOne({ id: id });
    if (result) {
      res.send(result);
    } else {
      throw new Error("not exist product");
    }
  } catch (err) {
    console.log(err.message);
    res.send(400, err.message);
  }
});

router.post("/add_product", async (req, res) => {
  const name = req.body.name;
  const Pro = await product.findOne({ name });
  if (Pro) {
    res.json({ success: false, message: "Your Product is already existed" });
  } else {
    let lastElement = await product.find().sort({ _id: -1 }).limit(1);
    let currentID = lastElement[0].id.split("P")[1];
    let newID = Number(currentID) + 1;

    if (newID < 10) {
      newId = "P00" + newID;
    } else {
      if (newID > 10 && newID < 100) {
        newId = "P0" + newID;
      } else {
        newID = "P" + newID;
      }
    }
    try {
      const newProduct = new product({
        id: newId,
        name: req.body.name,
        image: req.body.image,
        price: req.body.price,
        qty: 0,
      });
      await newProduct.save();
      res.json({
        success: true,
        message: "Create product successfully",
        data: newProduct,
      });
    } catch (err) {
      console.log(err);
    }
  }
});

router.put("/update/:id", (req, res) => {
  var id = req.params.id;
  const { name, image, price } = req.body;
  product.findOne({ id: id }, function (err, foundObject) {
    if (err) {
      console.log(err);
      res.status(500).send();
    } else {
      if (!foundObject) {
        res.status(404).send();
      } else {
        if (req.body) {
          // // foundObject.line = req.body.line_items;
          // foundObject.cartID = req.body.cartID;
          console.log(req.body);
          foundObject.name = name;
          foundObject.image = image;
          foundObject.price = price;
        }
        foundObject.save(function (err, updatedObject) {
          if (err) {
            console.log(err);
            res.status(500).send();
          } else {
            res.send(updatedObject);
            console.log(updatedObject);
          }
        });
      }
    }
  });
});

router.delete("/delete/:productID", async (req, res) => {
  const proID = req.params.productID;
  // res.send(order_id)
  const Pro = await product.findOne({ id: proID });
  if (!Pro) {
    res.status(400).send("Your Product is not exist");
  } else {
    const result = await product.deleteOne({ id: proID });
    await RFID.deleteMany({ productID: proID })
      .then(function () {
        console.log("RFID deleted"); // Success
      })
      .catch(function (error) {
        console.log(error); // Failure
      });
    res.status(200).send({ success: true, message: "Delete Successful" });
  }
});

router.get("/inventory/check_qty", async (req, res) => {
  try {
    const ProductList = await product.find();
    for (let i = 0; i < ProductList.length; i++) {
      const foundObject = await RFID.find({ productID: ProductList[i].id });
      if (foundObject) {
        var newvalues = { $set: { qty: foundObject.length } };
        product.updateOne(
          { id: ProductList[i].id },
          newvalues,
          function (err, res) {
            if (err) throw err;
            console.log("1 document updated");
          }
        );
      }
    }
    const result = await product.find();
    res.send(result);
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;
