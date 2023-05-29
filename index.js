const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectMongoose = require("./utils/db");
const cors = require("cors");
const { Server } = require("socket.io");

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
const notificationsRouter = require("./routes/notifications");
const statsRouter = require("./routes/stats");
const reportsRouter = require("./routes/reports");
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
app.use("/api/notifications", notificationsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/reports", reportsRouter);
app.use("/uploads", express.static("uploads"));
app.use("/awake", (req, res) => {
  res.status(200).json("A wake");
});

// KEEP IT AWAKE ----------------------------------------

setInterval(() => {
  console.log("Working");
}, 120000);

// ------------------------------------ PORT LISTNER  --------------------------------
const server = app.listen(process.env.PORT, () => {
  console.log("listening on port " + process.env.PORT + "");
});

// -------------------------------- SOCKET CONNECTION --------------------------------

const io = new Server({
  cors: {
    origin: "*",
  },
});

let users = [];

// ----------------------------------- SOCKET FUNCTIONS --------------------------------
const AddUsers = ({ userId, socketId }) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const RemoveUsers = (socketId) => {
  users = users.filter((item) => item.socketId !== socketId);
};

const GetUser = (recieverId) => {
  return users.find((item) => item.userId === recieverId);
};

// ----------------------------------- SOCKET FUNCTIONS --------------------------------

io.on("connection", (socket) => {
  console.log("user connected");

  socket.on("addUser", (user) => {
    AddUsers({ userId: user?._id, socketId: socket.id });
  });

  socket.on("SendNotification", (notification) => {
    console.log(notification);
    io.emit("GetNotifications", notification);
  });

  socket.on("disconnect", () => {
    RemoveUsers(socket.id);
    console.log("user disconnected");
  });
});

io.listen(server);
