import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import messageRoutes from "./routes/message.js";
import followReq from "./routes/followRoutes.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { app, server } from './lib/socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = ENV.PORT || 9056;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
const allowedOrigins = [
    ENV.CLIENT_URL,
    "https://social-chat-frontend.onrender.com",
    "http://localhost:5173",
    "http://localhost:9056"
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || true) {
            return callback(null, origin || true);
        }
        return callback(null, true);
    },
    credentials: true
}));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/follow", followReq);
app.use("/api/follow-requests", followReq);

// Catch-all 404 handler for unknown API routes
app.use("/api/*", (req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

// Serve frontend in production
if (ENV.NODE_ENV === "production" || process.env.NODE_ENV === "production") {
    const distPath = path.join(__dirname, "../frontend/dist");
    app.use(express.static(distPath));

    app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
    });
}

server.listen(PORT, () => {
    console.log("Server running on port: " + PORT);
    connectDB();
});