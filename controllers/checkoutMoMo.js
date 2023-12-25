const express = require("express");
const router = express.Router();
const order = require("../models/order");
const axios = require("axios");

router.post("/atm", async function (request, response) {
  var partnerCode = "MOMO";
  var accessKey = "F8BBA842ECF85";
  var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  var requestId = partnerCode + new Date().getTime();
  var orderId = requestId;
  var orderInfo = "pay with MoMo";

  //local
  // var redirectUrl = "http://localhost:3000/checkoutmomo";
  // var ipnUrl = "http://localhost:3000/checkoutmomo";

  //deploy
  var redirectUrl = "https://selfcheckout.vercel.app/checkoutmomo";
  var ipnUrl = "https://selfcheckout.vercel.app/checkoutmomo";

  var amount = request.body.amount;
  // var requestType = "captureWallet";
  var requestType = "payWithATM";
  var extraData = ""; //pass empty value if your merchant does not have stores
  var rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;
  const crypto = require("crypto");
  var signature = crypto
    .createHmac("sha256", secretkey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    lang: "en",
  });

  const https = require("https");
  const options = {
    hostname: "test-payment.momo.vn",
    port: 443,
    path: "/v2/gateway/api/create",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
  };
  //Send the request and get the response
  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    res.setEncoding("utf8");
    res.on("data", (body) => {
      console.log("Body: ");
      console.log(body);
      console.log("payUrl: ");
      console.log(JSON.parse(body).payUrl);
      response.send(JSON.parse(body).payUrl);
    });
    res.on("end", () => {
      console.log("No more data in response.");
    });
  });

  req.on("error", (e) => {
    console.log(`problem with request: ${e.message}`);
  });
  // write data to request body
  console.log("Sending....");
  req.write(requestBody);

  req.end();
});

router.post("/qrcode", async function (request, response) {
  var partnerCode = "MOMO";
  var accessKey = "F8BBA842ECF85";
  var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  var requestId = partnerCode + new Date().getTime();
  var orderId = requestId;
  var orderInfo = "pay with MoMo";

  deploy
  var redirectUrl = "https://selfcheckout.vercel.app/checkoutmomo";
  var ipnUrl = "https://selfcheckout.vercel.app/checkoutmomo";

  // local;
  // var redirectUrl = "http://localhost:3000/checkoutmomo";
  // var ipnUrl = "http://localhost:3000/checkoutmomo";

  var amount = request.body.amount;
  var requestType = "captureWallet";
  //var requestType = "payWithATM";
  var extraData = ""; //pass empty value if your merchant does not have stores
  var rawSignature =
    "accessKey=" +
    accessKey +
    "&amount=" +
    amount +
    "&extraData=" +
    extraData +
    "&ipnUrl=" +
    ipnUrl +
    "&orderId=" +
    orderId +
    "&orderInfo=" +
    orderInfo +
    "&partnerCode=" +
    partnerCode +
    "&redirectUrl=" +
    redirectUrl +
    "&requestId=" +
    requestId +
    "&requestType=" +
    requestType;
  const crypto = require("crypto");
  var signature = crypto
    .createHmac("sha256", secretkey)
    .update(rawSignature)
    .digest("hex");

  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    accessKey: accessKey,
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    extraData: extraData,
    requestType: requestType,
    signature: signature,
    lang: "en",
  });

  const https = require("https");
  const options = {
    hostname: "test-payment.momo.vn",
    port: 443,
    path: "/v2/gateway/api/create",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody),
    },
  };
  //Send the request and get the response
  const req = https.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers)}`);
    res.setEncoding("utf8");
    res.on("data", (body) => {
      console.log("Body: ");
      console.log(body);
      console.log("payUrl: ");
      console.log(JSON.parse(body).payUrl);
      response.send(JSON.parse(body).payUrl);
    });
    res.on("end", () => {
      console.log("No more data in response.");
    });
  });

  req.on("error", (e) => {
    console.log(`problem with request: ${e.message}`);
  });
  // write data to request body
  console.log("Sending....");
  req.write(requestBody);

  req.end();
});

router.post("/status", async function (request, response) {
  var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
  var rawSignature =
    "accessKey=" +
    "F8BBA842ECF85" +
    "&orderId=" +
    request.body.orderId +
    "&partnerCode=" +
    request.body.partnerCode +
    "&requestId=" +
    request.body.requestId;
  const crypto = require("crypto");
  var signature = crypto
    .createHmac("sha256", secretkey)
    .update(rawSignature)
    .digest("hex");

  var dataObj = {
    partnerCode: request.body.partnerCode,
    requestId: request.body.requestId,
    orderId: request.body.orderId,
    signature: signature,
    lang: "vi",
  };
  axios
    .post("https://test-payment.momo.vn/v2/gateway/api/query", dataObj)
    .then((res) => {
      //console.log(response);
      response.send(res.data);
    });
});

module.exports = router;
