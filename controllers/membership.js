const express = require("express");
const router = express.Router();
const membership = require("../models/membership");
const argon2 = require("argon2");

router.get("/", async (req, res) => {
  try {
    const result = await membership.find();
    res.send(result);
  } catch (err) {
    console.log(err.message);
  }
});

router.post("/membership_checkout", async (req, res) => {
  const phoneNumber = req.body.phoneNumber;
  try {
    const result = await membership.find({ phoneNumber });
    res.send(result);
  } catch (err) {
    console.log(err.message);
  }
});

router.post("/add_member", async (req, res) => {
  const { customerName, password, phoneNumber, email } = req.body;
  const membershipAccount = await membership.findOne({ phoneNumber });
  if (membershipAccount) {
    return res
      .status(400)
      .json({ success: false, message: "Membership is already exists" });
  } else {
    let countMember = await membership.countDocuments();
    const hashPwd = await argon2.hash(password);
    if (!countMember) {
      newId = "Member_01";
    }
    if (countMember < 9) {
      countMember++;
      newId = "Member_0" + countMember;
    } else {
      countMember++;
      newId = "Member_" + countMember;
    }
    try {
      const membershipNew = new membership({
        customerID: newId,
        customerName: customerName,
        password: hashPwd,
        phoneNumber: phoneNumber,
        point: 0,
        email: email,
      });
      await membershipNew.save();
      res.json({ success: true, message: "Create membership successfully" });
    } catch (error) {
      console.log(error);
    }
  }
});

router.post("/login", async (req, res) => {
  const { phoneNumber, password } = req.body;
  if (!phoneNumber || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing phone number or password" });
  }
  try {
    const Member = await membership.findOne({ phoneNumber });
    if (!Member) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect user name or password" });
    }
    const passwordValid = await argon2.verify(Member.password, password);
    if (!passwordValid) {
      return res.status(400).json({
        success: false,
        message: "Incorrect phone number or password",
      });
    }
    res.send(Member);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
