const express = require("express");
var cors = require("cors");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

const app = express();
const userRouter = require("./routers/userRouter");

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

app.use("/api/user", userRouter);
app.use("/", (req, res) => {
  res.send("Hello Naiem");
});

module.exports = app;
