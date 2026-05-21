require('dotenv').config();
const { validateEnv } = require('./src/config/env');
validateEnv();

const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const { setupSocket } = require('./src/socket');

const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: FRONTEND_URL,
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

setupSocket(io, app);
app.set('io', io);

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT} 🚀`);
    console.log(`WebSocket ready for real-time chat`);
});
