import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { dbConnect } from "./app/config/dbConnect.js";

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

app.use("/api", (req, res) => {
  res.json({ message: "Welcome to API" });
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
