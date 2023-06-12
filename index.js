const express = require("express");
const app = express();
const http = require("http");
var cors = require("cors");
const mongoose = require("mongoose");
const { Router } = require("express");
const server = http.createServer(app);
app.use(express.json());
app.use(cors());

// app.get("/", function (req, res) {
//   res.sendFile(__dirname + "/index.html");
// });

mongoose.connect(
  "mongodb+srv://thinh:123@cluster0.ydjcp.mongodb.net/SelfCheckout",
  (err) => {
    if (!err) console.log("db connected");
    else console.log("db error");
  }
);

const productRouter = require(__dirname + "/controllers/product");
app.use("/api/product", productRouter);

const rfidRouter = require(__dirname + "/controllers/rfid");
app.use("/api/rfid", rfidRouter);

const checkoutRouter = require(__dirname + "/controllers/checkout");
app.use("/api/checkout", checkoutRouter);

app.listen(process.env.PORT || 8000, () =>
  console.log("Listening Port 8000...")
);
