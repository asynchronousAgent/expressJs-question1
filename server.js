const mongoose = require("mongoose");
const http = require("http");
const app = require("./app");

mongoose
  .connect("mongodb://localhost:27017/excellenceUsers")
  .then(() => console.log("Connected to mongodb"))
  .catch((err) => console.log(err));

const server = http.createServer(app);

const port = process.env.PORT || 8000;
server.listen(port);
