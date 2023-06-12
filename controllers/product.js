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

module.exports = router;