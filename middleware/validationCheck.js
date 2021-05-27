const User = require("../models/user");

module.exports = async (req, res, next) => {
  const access_token = req.header("Access-Token");
  try {
    const valid_user = await User.findById(access_token);
    if (!valid_user)
      return res.status(400).json({
        status: 0,
        message: "Provided token is not valid, please provide a valid token",
      });
    else {
      req.user_id = access_token;
      next();
    }
  } catch (err) {
    next(err);
  }
};
