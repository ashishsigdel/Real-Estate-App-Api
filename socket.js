import { Server as SocketIOServer } from "socket.io";

const setupSocket = (httpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: ["*"],
      methods: ["POST", "GET", "DELETE", "PUT"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export default setupSocket;
