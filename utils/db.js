const mongoose = require("mongoose");

const connectMongoose = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
      console.log("Mogoose Connected");
    })
    .catch((err) => {
      console.log(`Mongoose Error : ${err}`);
    });
};

module.exports = connectMongoose;
