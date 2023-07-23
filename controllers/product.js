const express = require("express");
const router = express.Router();
const product = require("../models/product");
const axios = require("axios");

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
    const result = await product.findOne({ id : id });
    if (result) {
      res.send(result);
    } else {
      throw new Error("not exist product");
    }
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
});

router.post("/add_product", async (req, res) => {
  const name = req.body.name;
  const Pro = await product.findOne({ name });
  if (Pro) {
    res.json({ success: false, message: "Your Product is already existed" });
  } else {
    let countProduct = await product.countDocuments();
    if (!countProduct) {
      newId = "P001";
    }
    if (countProduct < 9) {
      countProduct++;
      newId = "P00" + countProduct;
    } else {
      countProduct++;
      newId = "P0" + countProduct;
    }
    try {
      const newProduct =  new product({
        id: newId,
        name: req.body.name,
        image: req.body.image,
        price: req.body.price
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

module.exports = router;