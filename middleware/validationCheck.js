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
<<<<<<< HEAD
    const decoded_token = jwt.verify(token, process.env.mySecretKey);
    req.user_id = decoded_token.user;
=======
    const valid_token = await AccessToken.findOne({ access_token });
    if (!valid_token)
      return res.status(400).json({
        success: 0,
        message: "Provided token is not valid, please provide a valid token",
      });
    if (new Date() > valid_token.expiry) {
      await AccessToken.findByIdAndRemove(valid_token._id);
      return res.status(400).json({
        success: 0,
        message: "Session has expired,please login again",
      });
    }
    req.user_id = valid_token.user_id;
>>>>>>> 0fa7de15045e2b35550e4c4026e1e1d8268fa179
    next();
  } catch (err) {
    res.status(400).json({
      success: 0,
      message: "Provided token is not valid, please provide a valid token",
    });
  }
};
