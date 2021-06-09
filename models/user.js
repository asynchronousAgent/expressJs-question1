const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    maxlength: 15,
    minlength: 7,
    required: true,
  },
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  email_id: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 7,
    maxlength: 255,
    required: true,
  },
  salt: {
    type: String,
  },
  address: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Address",
  },
  profile_img: {
    type: String,
  },
  profile_img_online_storage: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
