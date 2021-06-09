const mongoose = require("mongoose");

const resetPasswordSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  token: {
    type: String,
  },
});

const ResetPassword = mongoose.model("ResetPassword", resetPasswordSchema);

module.exports = ResetPassword;
