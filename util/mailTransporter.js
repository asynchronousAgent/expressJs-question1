const nodemailer = require("nodemailer");

module.exports = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.host_email,
    pass: process.env.host_password,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
