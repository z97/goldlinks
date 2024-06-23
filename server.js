const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 3000;
require('dotenv').config();

const TASKS_FILE = 'tasks.json';

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(session({
    secret: 'your_secret_key', // Change to a strong secret
    resave: false,
    saveUninitialized: true
}));

// Serve the admin login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Endpoint to check if the user is an admin
app.get('/isAdmin', (req, res) => {
    res.json({ isAdmin: !!req.session.isAdmin });
});

// Load tasks from the file
function loadTasks() {
    try {
        const data = fs.readFileSync(TASKS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// Save tasks to the file
function saveTasks(tasks) {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2));
}

let tasks = loadTasks();

app.post('/addTask', (req, res) => {
    const { task } = req.body;

    // Validate task
    if (!task.startsWith("https://www.instagram.com/") || task.split(' ').length > 1 || task.includes('?')) {
        return res.status(400).send('Task must consist of one word, begin with "https://www.instagram.com/", and not contain "?".');
    }

    // Enforce 10-link limit
    if (tasks.length >= 10) {
        return res.status(400).send('Cannot add more than 10 links.');
    }

    tasks.push(task);
    saveTasks(tasks);
    res.status(200).send();
});

app.post('/deleteTask', (req, res) => {
    if (req.session.isAdmin) {
        const { task } = req.body;
        tasks = tasks.filter(t => t !== task);
        saveTasks(tasks);
        res.status(200).send();
    } else {
        res.status(403).send('Unauthorized');
    }
});

app.get('/tasks', (req, res) => {
    res.json(tasks);
});

app.post('/adminLogin', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        req.session.isAdmin = true;
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
