const mongoose = require("mongoose");

const accessToken_schema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
  },
  access_token: {
    type: String,
  },
  expiry: {
    type: Date,
  },
});

const AccessToken = mongoose.model("AccessToken", accessToken_schema);

module.exports = AccessToken;
