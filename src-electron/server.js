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

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    db.init(); // Initialize DB
});
