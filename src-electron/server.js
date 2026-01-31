const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Static Angular Files
// Adjust path to point to 'dist' folder. 
// Assuming 'ng build' creates 'dist/trafquiz/browser' (Angular 17+) or 'dist/trafquiz'.
// We will check this path later.
const distPath = path.join(__dirname, '../dist/trafquiz/browser');
app.use(express.static(distPath));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/instructors', require('./routes/instructors'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/vehicles', require('./routes/vehicles'));

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running' });
});

// Fallback to index.html for Angular routing
app.get('*', (req, res) => {
    // Only if request is not starting with /api
    if (!req.path.startsWith('/api')) {
         res.sendFile(path.join(distPath, 'index.html'));
    }
});

const http = require('http');
const server = http.createServer(app);

// Socket.io Setup
try {
    const { Server } = require('socket.io');
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:4200", "http://localhost:3000"], 
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);
        
        socket.on('join', (userId) => {
            socket.join(`user_${userId}`);
            console.log(`User ${userId} joined room user_${userId}`);
        });

        socket.on('send-message', (data) => {
            console.log('Broadcasting message:', data);
            // Forward to recipient
            if (data.recipientId) {
                io.to(`user_${data.recipientId}`).emit('new-message', data);
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });

    console.log('Socket.io initialized successfully');
} catch (e) {
    console.warn('Socket.io not found. Run "npm install socket.io" to enable real-time features. Error:', e.message);
}

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    db.init(); // Initialize DB
});
