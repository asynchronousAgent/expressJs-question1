const express = require("express");
const bcrypt = require("bcryptjs");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const imgur = require("imgur");
const sgMail = require("@sendgrid/mail");
const nodemailer = require("nodemailer");
require("dotenv").config();
const User = require("../models/user");
const validationCheck = require("../middleware/validationCheck");
const AccessToken = require("../models/access_token");
const Address = require("../models/address");
const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "_" + file.originalname
    );
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Invalid mimetype"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 3,
  },
  fileFilter: fileFilter,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.host_email,
    pass: process.env.host_password,
  },
});

router.post("/registration", async (req, res, next) => {
  const {
    username,
    firstname,
    lastname,
    email_id,
    password,
    confirm_password,
  } = req.body;
  const mailOptions = {
    from: process.env.host_email,
    to: email_id,
    subject: "Registration",
    text: `Hi ${username}, your registration succeeded`,
  };
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
    await transporter.sendMail(mailOptions);
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
        const payload = {
          user: user._id,
        };
        const token = jwt.sign(payload, process.env.mySecretKey, {
          expiresIn: 3600,
        });
        return res.status(200).json({
          success: 1,
          message: "Logged in successfully",
          data: { user_id: user.id, token: "Bearer " + token },
        });
      }
      res.status(400).json({
        success: 0,
        message: "Login credentials didn't match,Please try again",
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

router.post("/address", validationCheck, async (req, res, next) => {
  const { address, city, state, pinCode, phoneNumber } = req.body;
  try {
    const userAddress = new Address({
      user_id: req.user_id,
      address,
      city,
      state,
      pinCode,
      phoneNumber,
    });
    await userAddress.save();
    await User.findByIdAndUpdate(req.user_id, {
      $push: { address: userAddress.id },
    });
    res.status(201).json({
      success: 1,
      message: "Address field has been created successfully",
      data: userAddress,
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/address", validationCheck, async (req, res) => {
  let { address_id } = req.body;
  address_id = address_id.split(",");
  try {
    const address = await Address.deleteMany({ _id: { $in: address_id } });
    if (!address)
      return res.status(404).json({
        success: 0,
        message:
          "provided address_id is not valid, please provide a valid address_id",
      });
    const user = await User.findByIdAndUpdate(
      req.user_id,
      { $pull: { address: { $in: address_id } } },
      { new: true }
    );
    res.status(200).json({
      success: 1,
      message: "requested address has been deleted successfully",
      data: user,
    });
  } catch (err) {
    throw err;
  }
});

router.post("/forgot-password", async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({
        success: 0,
        message: "Please give proper username",
      });
    const payload = {
      user: username,
      email: user.email_id,
    };
    const token = jwt.sign(payload, process.env.mySecretKey, {
      expiresIn: 600,
    });
    const mailOptions = {
      from: process.env.host_email,
      to: user.email_id,
      subject: "Reset password",
      text: `Hi ${username}, your request to reset password has been processed. Please open the following link to reset your password, please noted this link is valid only for 10 minutes. Link-> ${process.env.reset_link}/${token}`,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: 1,
      message: "Token for reset password has been generated successfully",
      data: token,
    });
  } catch (err) {
    throw err;
  }
});

router.post(
  "/verify-reset-password/:password_reset_token",
  async (req, res) => {
    const token = req.params.password_reset_token;
    let { password, confirm_password } = req.body;
    try {
      const decoded = jwt.verify(token, process.env.mySecretKey);
      if (password !== confirm_password)
        return res.status(400).json({
          success: 0,
          message: "password did not match, please re-enter correctly",
        });
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
      const reset_successful = await User.findOneAndUpdate(
        { username: decoded.user },
        { $set: { password, salt } },
        { new: true }
      ).select("-password -salt");
      const mailOptions = {
        from: process.env.host_email,
        to: decoded.email,
        subject: "Password Changed",
        text: `Hi ${decoded.user}, your Password has been Changed successfully`,
      };
      await transporter.sendMail(mailOptions);
      res.status(200).json({
        success: 1,
        message: "Password changed successfully",
        data: reset_successful,
      });
    } catch (err) {
      res.status(400).json({ success: 0, message: "Token expired" });
    }
  }
);

router.post(
  "/profile-image",
  validationCheck,
  upload.single("profile_img"),
  async (req, res) => {
    const profile_img = req.file.path;
    try {
      // Implementation 1.upload in folder
      await User.findByIdAndUpdate(
        req.user_id,
        { $set: { profile_img } },
        { new: true }
      );
      // Implementation 2.upload in online storage
      const url = await imgur.uploadFile(`./${profile_img}`);
      const user = await User.findByIdAndUpdate(
        req.user_id,
        { $set: { profile_img_online_storage: url.link } },
        { new: true }
      ).select("-password -salt");
      res.status(200).json({
        success: 1,
        message: "Profile photo updated successfully",
        data: user,
      });
    } catch (err) {
      throw err;
    }
  }
);

router.get("/get/:userid", async (req, res, next) => {
  try {
    const userData = await User.findById(req.params.userid).populate("address");
    if (!userData)
      return res.status(400).json({
        success: 0,
        message: "Please provide a valid userid to see your details",
      });
    res.status(200).json({
      success: 1,
      message: "UserData has been fetched successfully",
      data: userData,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
