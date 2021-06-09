const express = require("express");
const bodyParser = require("body-parser");
const users = require("./routes/users");

const app = express();
app.use("/uploads", express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/user", users);

app.use((req, res, next) => {
  const err = new Error("Not found");
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  console.log(err);
  res.status(err.status || 400).json({ success: 0, message: err.message });
});

module.exports = app;
