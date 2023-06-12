const express = require("express");
const router = express.Router();
const RFID = require("../models/rfid");
const axios = require("axios");
const product = require("../models/product");
const mqtt = require("mqtt")
const connectUrl = `mqtt://broker.emqx.io:1883`

const client = mqtt.connect(connectUrl, {
    clientId: "emqx_cloud_" + Math.random().toString(16).substring(2, 8),
    username: 'thinh',
    password: 'thinhbeo2801',
})

router.post("/sendtag", async function (req, res) {
    RFIDdata = req.body.data.RFID.split("||");
    try {
        const result = await product.find({id:RFIDdata[1]});
        const responseData = {
            uuid : RFIDdata[0],
            product :result[0]
        }
        console.log(responseData);
        client.publish("scanRFID",JSON.stringify(responseData))
        res.send(responseData);
      } catch (err) {
        console.log(err.message);
    }
    // console.log(req.body);
    // res.send("success");
});

router.post("/write",async function (req,res){
    let message = "start to write"+ " " + req.body.productID
    client.publish("rfid",message)
    res.send("succes")
})

router.post("/stop_write",async function (req,res){
    let message = "stop to write"+ " " + req.body.productID
    client.publish("rfid",message)
    res.send("succes")
})

router.post("/start_scan",async function (req,res){
    let message = "Start to scan RFID"
    client.publish("scanRFID",message)
    res.send("succes")
})

module.exports = router;