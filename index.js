require("dotenv/config");

const mongoose = require("mongoose");

const app = require("./app");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to Mongodb."))
  .catch((err) => console.log("Connection Failed."));

const port = process.env.PORT || 7500;

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
