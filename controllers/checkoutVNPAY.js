const express = require("express");
const router = express.Router();
const product = require("../models/product");
const axios = require("axios");
const moment = require("moment");

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

router.post("/create_payment_url", function (req, res, next) {
  process.env.TZ = "Asia/Ho_Chi_Minh";

  let date = new Date();
  let createDate = moment(date).format("YYYYMMDDHHmmss");

  let ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;
  let config = require("config");
  let tmnCode = config.get("vnp_TmnCode");
  let secretKey = config.get("vnp_HashSecret");
  let vnpUrl = config.get("vnp_Url");
  let returnUrl = config.get("vnp_ReturnUrl");
  let orderId = moment(date).format("DDHHmmss");
  let amount = req.body.amount;
  let bankCode = req.body.bankCode;

  let locale = req.body.language;
  if (locale === null || locale === "") {
    locale = "vn";
  }
  let currCode = "VND";
  let vnp_Params = {};
  vnp_Params["vnp_Version"] = "2.1.0";
  vnp_Params["vnp_Command"] = "pay";
  vnp_Params["vnp_TmnCode"] = tmnCode;
  vnp_Params["vnp_Locale"] = "vn";
  vnp_Params["vnp_CurrCode"] = currCode;
  vnp_Params["vnp_TxnRef"] = orderId;
  vnp_Params["vnp_OrderInfo"] = "Thanh toan cho ma GD:" + orderId;
  vnp_Params["vnp_OrderType"] = "other";
  vnp_Params["vnp_Amount"] = amount * 100;
  vnp_Params["vnp_ReturnUrl"] = returnUrl;
  vnp_Params["vnp_IpAddr"] = ipAddr;
  vnp_Params["vnp_CreateDate"] = createDate;
  if (bankCode !== null && bankCode !== "") {
    vnp_Params["vnp_BankCode"] = bankCode;
  }

  vnp_Params = sortObject(vnp_Params);

  let querystring = require("qs");
  let signData = querystring.stringify(vnp_Params, { encode: false });
  let crypto = require("crypto");
  let hmac = crypto.createHmac("sha512", secretKey);
  let signed = hmac.update(new Buffer(signData, "utf-8")).digest("hex");
  vnp_Params["vnp_SecureHash"] = signed;
  vnpUrl += "?" + querystring.stringify(vnp_Params, { encode: false });

  console.log("tmnCode: ", tmnCode);
  console.log("orderID: ", orderId);
  console.log("ammount: ", amount);
  console.log("bank code: ", bankCode);
  console.log("IP address: ", ipAddr);

  res.send(vnpUrl);
});

router.post("/querydr", function (req, res, next) {
  process.env.TZ = "Asia/Ho_Chi_Minh";
  let date = new Date();

  let config = require("config");
  let crypto = require("crypto");

  let vnp_TmnCode = config.get("vnp_TmnCode");
  let secretKey = config.get("vnp_HashSecret");
  let vnp_Api = config.get("vnp_Api");

  let vnp_TxnRef = req.body.orderId;
  let vnp_TransactionDate = req.body.transDate;

  let vnp_RequestId = moment(date).format("HHmmss");
  let vnp_Version = "2.1.0";
  let vnp_Command = "querydr";
  let vnp_OrderInfo = "Truy van GD ma:" + vnp_TxnRef;

  let vnp_IpAddr =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress;

  let currCode = "VND";
  let vnp_CreateDate = moment(date).format("YYYYMMDDHHmmss");

  // let data =
  //   vnp_RequestId +
  //   "|" +
  //   vnp_Version +
  //   "|" +
  //   vnp_Command +
  //   "|" +
  //   vnp_TmnCode +
  //   "|" +
  //   vnp_TxnRef +
  //   "|" +
  //   vnp_TransactionDate +
  //   "|" +
  //   vnp_CreateDate +
  //   "|" +
  //   vnp_IpAddr +
  //   "|" +
  //   vnp_OrderInfo;

  let data =
    vnp_RequestId +
    "|" +
    vnp_Version +
    "|" +
    vnp_Command +
    "|" +
    vnp_TmnCode +
    "|" +
    vnp_TxnRef +
    "|" +
    vnp_TransactionDate +
    "|" +
    vnp_CreateDate +
    "|" +
    "::1" +
    "|" +
    vnp_OrderInfo;

  let hmac = crypto.createHmac("sha512", secretKey);
  let vnp_SecureHash = hmac.update(new Buffer(data, "utf-8")).digest("hex");

  let dataObj = {
    vnp_RequestId: vnp_RequestId,
    vnp_Version: vnp_Version,
    vnp_Command: vnp_Command,
    vnp_TmnCode: vnp_TmnCode,
    vnp_TxnRef: vnp_TxnRef,
    vnp_OrderInfo: vnp_OrderInfo,
    vnp_TransactionDate: vnp_TransactionDate,
    vnp_CreateDate: vnp_CreateDate,
    vnp_IpAddr: "::1",
    vnp_SecureHash: vnp_SecureHash,
  };
  console.log(dataObj);

  axios.post(vnp_Api, dataObj, { vnp_Command: "querydr" }).then((response) => {
    //console.log(response);
    const objVNP = {
      vnpCallData: dataObj,
      apiLink: vnp_Api,
      response: response.data,
    };
    res.send(objVNP);
  });
});

module.exports = router;
