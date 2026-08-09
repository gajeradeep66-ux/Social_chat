import { Server } from 'socket.io'
import http from 'http'
import express from 'express'
import { ENV } from './env.js'
import { socketAuthMiddleware } from '../middleware/socketAuthMiddleware.js'

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            callback(null, origin || true);
        },
        credentials: true,
    }
})

// apply authentication middleware to all socket connection
io.use(socketAuthMiddleware)

//we will use this function to check if the user is onlineor not
export function getReceiverSocketId(userId) {
    return userSocketMap[userId]
}

// this is for storing online users
const userSocketMap = {}

io.on('connection', (socket) => {
    console.log("A user connected", socket.user.fullName)

    const userId = socket.userId
    userSocketMap[userId] = socket.id

    // io.emit() is used to send events to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    // with socket.on we listen for events from client
    socket.on("disconnect", () => {
        console.log("User disconnected", socket.user.fullName)
        delete userSocketMap[userId]
        io.emit("getOnlineUsers", Object.keys(userSocketMap))
    })
})

export { io, app, server };