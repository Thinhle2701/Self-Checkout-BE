require("dotenv").config();
const express = require("express");
const router = express.Router();
const user = require("../models/user");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middleware/auth");
const generateToken = require("../middleware/auth");

router.get("/test/token", async (req, res) => {
  const hello = generateToken();
  res.send(hello);
});

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

    const Token = generateToken(User);

    user.updateOne(
      { userID: User.userID },
      { $set: { token: Token.refreshToken } },
      function (err, res) {
        if (err) throw err;
        console.log("1 document updated");
      }
    );

    const responseData = {
      userData: User,
      token: Token,
    };

    res.send(responseData);

    console.log(User);
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/forgot_password", async (req, res) => {
  const { email } = req.body;
  const User = await user.findOne({ email });
  if (User) {
    var token = jwt.sign({ User }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "300s",
    });

    const response = {
      userData: User,
      token: token,
    };
    res.send(response);
  }
});

router.post("/change_password", verifyToken, async (req, res) => {
  const { userID, password } = req.body;
  user.findOne({ userID: userID }, async function (err, foundObject) {
    if (err) {
      console.log(err);
      res.status(500).send();
    } else {
      if (!foundObject) {
        res.status(404).send("User is not exist");
      } else {
        if (password) {
          const hashPwd = await argon2.hash(password);
          foundObject.password = hashPwd;
        }
        foundObject.save(function (err, updatedObject) {
          if (err) {
            res.status(500).send();
          } else {
            res.send(updatedObject);
          }
        });
      }
    }
  });
});

router.post("/get_token", async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    res.sendStatus(401);
  }

  const User = await user.findOne({ token: refreshToken });
  if (!User) {
    res.sendStatus(403);
  } else {
    try {
      jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      var newAccessToken = jwt.sign({ User }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "30s",
      });

      res.send({ newAccessToken: newAccessToken });
    } catch (error) {
      console.log(error);
      res.sendStatus(403);
    }
  }
});

module.exports = router;
