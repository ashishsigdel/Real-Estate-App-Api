import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { dbConnect } from "./app/config/dbConnect.js";
import APIRoute from "./app/routes/index.js";
import { errorHandler } from "./app/utils/error.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

const httpServer = createServer(app);

app.use(
  cors({
    origin: ["*"],
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
  });
});

export default httpServer;
