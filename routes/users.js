const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const validationCheck = require("../middleware/validationCheck");
const router = express.Router();

router.post("/registration", async (req, res, next) => {
  const {
    username,
    firstname,
    lastname,
    email_id,
    password,
    confirm_password,
  } = req.body;
  try {
    const user = await User.findOne({ username, email_id });
    if (user)
      return res
        .status(400)
        .json({ success: 0, message: "User already exists", data: user });
    if (password !== confirm_password)
      return res.status(400).json({
        success: 0,
        message: "password did not match, please re-enter password",
      });
    const newUser = new User({
      username,
      firstname,
      lastname,
      email_id,
      password,
    });
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(password, salt);
    newUser.salt = salt;
    await newUser.save();
    res.status(201).json({
      success: 1,
      message: `${newUser.username} created successfully`,
      data: newUser,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      const verifiedUser = await bcrypt.compare(password, user.password);
      if (verifiedUser) {
        return res.status(200).json({
          success: 1,
          message: "Logged in successfully",
          data: { access_token: user._id },
        });
      }
      res.status(400).json({
        success: 0,
        message: "Login credentials didn't match,Please try again",
        data: { verifiedUser },
      });
    } else {
      res.status(500).json({ success: 0, message: "Internal Server error" });
    }
  } catch (err) {
    next(err);
  }
});

router.get("/get", validationCheck, async (req, res, next) => {
  try {
    const user = await User.findById(req.user_id).select("-password");
    if (user)
      res.status(200).json({
        success: 1,
        messsage: `${user.username}'s details are successfully returned`,
        data: { user },
      });
  } catch (err) {
    next(err);
  }
});

router.put("/delete", validationCheck, async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.user_id);
    if (user)
      res.status(200).json({
        success: 1,
        message: `${user.username} has been deleted successfully`,
        data: user,
      });
  } catch (err) {
    next(err);
  }
});

router.get("/list/:page", async (req, res, next) => {
  const page = parseInt(req.params.page);
  const skip = (page - 1) * 10;
  try {
    const users = await User.find().limit(10).skip(skip).select("-password");
    if (page > users.length)
      return res.status(400).json({
        success: 0,
        message: `Your provided page is greater than the page available in our end`,
      });
    res.status(200).json({
      success: 1,
      message: `Total no of users in this page ${users.length}`,
      data: { users },
    });
  } catch (err) {
    next(new Error("Please put a positive value of page"));
  }
});

module.exports = router;
