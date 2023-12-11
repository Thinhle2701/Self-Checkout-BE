const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decoded);

    next();
  } catch (error) {
    console.log("err: ", error);
    return res.sendStatus(403);
  }
};

const generateToken = (payload) => {
  const userID = payload.userID;
  const username = payload.username;
  const accessToken = jwt.sign(
    { userID, username },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "60s",
    }
  );
  const refreshToken = jwt.sign(
    { userID, username },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "1h",
    }
  );
  return { accessToken, refreshToken };
};

module.exports = verifyToken;
module.exports = generateToken;
