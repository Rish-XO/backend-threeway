const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");
const { Socket } = require("socket.io");
const moment = require("moment");
const authRouter = require("./controllers/auth");
const chatRouter = require("./controllers/chatPoints")

const io = require("socket.io")(3001, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    transports: ["websocket", "polling"],
    credentials: true,
  },
});

// psql connection
pool.connect();

// base middlewares
app.use(cors());
app.use(express.json());

// home page testing
app.get("/", (req, res) => {
  res.send("Hello world!!");
});

//register and login
app.use("/", authRouter);


// chat endpoints
app.use("/", chatRouter)

// socket io chat
let currentRoom = null;
io.on("connection", (socket) => {
  // joining a room
  socket.on("joinRoom", ({ orderID }) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      console.log("leaving the room");
    }
    socket.join(orderID);
    console.log("joining a room");
    currentRoom = orderID;
    console.log("the current room", currentRoom);
    const clients = io.sockets.adapter.rooms.get(orderID);
    console.log(clients, "cccccccccccccccccccccccccccccc");
  });

  socket.on("chatMessage", ({ orderID, message }) => {
    console.log(orderID, message, "*****************************s");
    io.to(orderID).emit("chatMessage", message);
  });

  socket.on("leaveRoom", () => {
    if (currentRoom) {
      socket.leave(currentRoom);
    }
    console.log("socket Closed :::::::::::");
    currentRoom = null;
  });
});

app.listen(5000, () => {
  console.log("listening on 5000");
});
