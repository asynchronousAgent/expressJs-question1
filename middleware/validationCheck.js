const AccessToken = require("../models/access_token");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  if (!token)
    return res.status(400).json({
      success: 0,
      message: "No token has been given, authorization denied",
    });
  try {
    const decoded_token = jwt.verify(token, process.env.mySecretKey);
    req.user_id = decoded_token.user;
    next();
  } catch (err) {
    res.status(400).json({
      success: 0,
      message: "Provided token is not valid, please provide a valid token",
    });
  }
};
