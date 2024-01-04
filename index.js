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

app.get("/", function (req, res) {
  res.send("Hello World");
});

mongoose.connect(
  "mongodb+srv://thinh:123@cluster0.ydjcp.mongodb.net/SelfCheckout",
  (err) => {
    if (!err) console.log("db connected");
    else console.log("db error");
  }
);

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  next();
});

const productRouter = require(__dirname + "/controllers/product");
app.use("/api/product", productRouter);

const rfidRouter = require(__dirname + "/controllers/rfid");
app.use("/api/rfid", rfidRouter);

const checkoutVNPAYRouter = require(__dirname + "/controllers/checkoutVNPAY");
app.use("/api/checkoutvnp", checkoutVNPAYRouter);

const orderRouter = require(__dirname + "/controllers/order");
app.use("/api/order", orderRouter);

const checkoutMoMoRouter = require(__dirname + "/controllers/checkoutMoMo");
app.use("/api/checkoutmomo", checkoutMoMoRouter);

const userRouter = require(__dirname + "/controllers/user");
app.use("/api/user", userRouter);

const cartRouter = require(__dirname + "/controllers/mobileCart");
app.use("/api/cart", cartRouter);

const sseRouter = require(__dirname + "/controllers/sse");
app.use("/api/sse", sseRouter);

const checkoutCartRouter = require(__dirname + "/controllers/checkoutCart");
app.use("/api/checkoutcart", checkoutCartRouter);

const mobileSSERouter = require(__dirname + "/controllers/mobileSSE");
app.use("/api/mobilesse", mobileSSERouter);

// const quickpayRouter = require(__dirname + "/controllers/QuickpayMomo");
// app.use("/api/qpmomo", quickpayRouter);

app.listen(process.env.PORT || 8000, () =>
  console.log("Listening Port 8000...")
);
