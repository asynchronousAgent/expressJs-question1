const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.host_email,
    pass: process.env.host_password,
  },
});
