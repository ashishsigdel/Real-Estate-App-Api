import { Server as SocketIOServer } from "socket.io";

const setupSocket = (httpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [process.env.CORS_ORIGIN_ONE, process.env.CORS_ORIGIN_TWO],
      methods: ["POST", "GET", "DELETE", "PUT"],
      credentials: true,
    },
  });

  const userSocketMap = {};

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
      for (const userId in userSocketMap) {
        if (userSocketMap[userId] === socket.id) {
          delete userSocketMap[userId];
          break;
        }
      }
    });

    socket.on("setUserId", (userId) => {
      userSocketMap[userId] = socket.id;
    });
  });

  const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
  };

  return { io, getReceiverSocketId };
};

export default setupSocket;
