const AccessToken = require("../models/access_token");
const User = require("../models/user");

module.exports = async (req, res, next) => {
  const access_token = req.header("Access-Token");
  try {
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
    next();
  } catch (err) {
    next(err);
  }
};
