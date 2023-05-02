const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectMongoose = require("./utils/db");
const cors = require("cors");

// ------------------------------------Middleware --------------------------------
dotenv.config();
app.use(express.json());
app.use(cors({ credentials: true }));
connectMongoose();

// ------------------------------------User Routers --------------------------------
const userRouter = require("./routes/userAuth");
const usersRouter = require("./routes/users");
const adminRouter = require("./routes/adminAuth");
const productsRouter = require("./routes/products");
const walletsRouter = require("./routes/wallets");
const paymentsRouter = require("./routes/payments");
const bidsRouter = require("./routes/bids");
const uploadsRouter = require("./routes/uploads");

// ---------------------------------- Api Routes --------------------------------
app.use("/api/user", userRouter);
app.use("/api/users", usersRouter);
app.use("/api/admin", adminRouter);
app.use("/api/upload", uploadsRouter);
app.use("/api/products", productsRouter);
app.use("/api/wallets", walletsRouter);
app.use("/api/payments", paymentsRouter);
app.use("/api/bids", bidsRouter);
app.use("/uploads", express.static("uploads"));
app.use("/awake", (req, res) => {
  res.status(200).json("A wake");
});

// KEEP IT AWAKE ----------------------------------------

setInterval(() => {
  console.log("Working");
}, 120000);

// ------------------------------------ PORT LISTNER  --------------------------------
app.listen(process.env.PORT, () => {
  console.log("listening on port " + process.env.PORT + "");
});
