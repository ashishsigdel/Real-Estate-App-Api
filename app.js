import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { dbConnect } from "./app/config/dbConnect.js";
import APIRoute from "./app/routes/index.js";
import { errorHandler } from "./app/utils/error.js";
import { uploadsDir } from "./app/services/fileStorageService.js";
import setupSocket from "./socket.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

const httpServer = createServer(app);

// Initialize socket.io
const io = setupSocket(httpServer);

app.use("/", express.static(uploadsDir)); // serve static files

app.use(
  cors({
    origin: [process.env.CORS_ORIGIN_ONE],
    methods: ["POST", "GET", "DELETE", "PUT"],
    credentials: true,
  })
);

dbConnect();

app.use("/api", APIRoute);

app.use("*", (req, res, next) => {
  return next(errorHandler(404, "Request not found."));
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server error!!!";
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    fullMessage: err,
  });
});

export default httpServer;
