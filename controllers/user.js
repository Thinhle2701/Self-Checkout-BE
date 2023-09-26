const express = require("express");
const router = express.Router();
const user = require("../models/user");
const argon2 = require("argon2");

router.post("/add_user", async (req, res) => {
  const { username, password, email } = req.body;
  const User = await user.findOne({ username });
  if (User) {
    return res
      .status(400)
      .json({ success: false, message: "Username is already exists" });
  } else {
    let countUser = await user.countDocuments();
    const hashPwd = await argon2.hash(password);
    if (!countUser) {
      newId = "User_01";
    }
    if (countUser < 9) {
      countUser++;
      newId = "User_0" + countUser;
    } else {
      countUser++;
      newId = "User_" + countUser;
    }
    try {
      const userNew = new user({
        userID: newId,
        username: username,
        password: hashPwd,
        email: email,
      });
      await userNew.save();
      res.json({ success: true, message: "Create user successfully" });
    } catch (error) {
      console.log(error);
    }
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Missing user name or password" });
  }
  try {
    const User = await user.findOne({ username });
    if (!User) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect user name or password" });
    }
    const passwordValid = await argon2.verify(User.password, password);
    if (!passwordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect user name or password" });
    }

    res.send(User);

    console.log(User);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
