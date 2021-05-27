const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const users = require("./routes/users");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());
require("./middleware/passport")(passport);

app.use("/user", users);

app.use((req, res, next) => {
  const err = new Error("Not found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  res.status(err.status || 400).json({ success: 0, message: err.message });
});

module.exports = app;
