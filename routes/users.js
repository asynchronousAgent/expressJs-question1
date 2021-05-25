const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const validationCheck = require("../middleware/validationCheck");
const router = express.Router();

router.post("/registration", async (req, res) => {
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
    if (user) return res.status(400).json({ message: "User already exists" });
    if (password !== confirm_password)
      return res
        .status(400)
        .json({ message: "password did not match, please re-enter password" });
    const newUser = new User({
      username,
      firstname,
      lastname,
      email_id,
      password,
    });
    newUser.password = await bcrypt.hash(password, 10);
    newUser.confirm_password = newUser.password;
    await newUser.save();
    res.status(201).json({
      message: `${newUser.username} created successfully`,
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (user) {
      const verifiedUser = await bcrypt.compare(password, user.password);
      if (verifiedUser) {
        return res
          .status(200)
          .json({ msg: "Logged in successfully", access_token: user._id });
      }
      res
        .status(500)
        .json({ msg: "Login credentials didn't match,Please try again" });
    } else {
      res.status(500).json({ msg: "Internal Server error" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/get", validationCheck, async (req, res) => {
  try {
    const user = await User.findById(req.access_token).select("-password");
    if (user) res.status(200).json({ user, isvalid: "Access token is valid" });
    else return res.send("Access token is not valid");
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/delete", validationCheck, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.access_token);
    if (user)
      res.status(200).json({
        isvalid: "Access token is valid",
        msg: `${user.username} has been deleted successfully`,
      });
    else return res.send("Access token is not valid");
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/list/:page", async (req, res) => {
  const page = parseInt(req.params.page);
  const skip = page * 10;
  try {
    const users = await User.find().limit(10).skip(skip).select("-password");
    res
      .status(200)
      .json({ "Total users in this page": users.length, users: users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
