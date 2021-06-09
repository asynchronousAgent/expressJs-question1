const mongoose = require("mongoose");
const http = require("http");
require("dotenv").config();
const app = require("./app");

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.guzol.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
  )
  .then(() => console.log("Connected to mongodb"))
  .catch((err) => console.log(err));

const server = http.createServer(app);

const port = process.env.PORT || 8000;
server.listen(port);
