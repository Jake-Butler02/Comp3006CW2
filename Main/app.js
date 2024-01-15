const express = require('express');
const { MongoClient } = require('mongodb');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Intigrate public files into database
app.use(express.static(path.join(__dirname, 'images'))); // Intigrate Images into the database
app.use(express.static(path.join(__dirname, 'Styles'))); // Intigrate styles into the database

const server = http.createServer(app);
const io = socketIo(server);
const client = new MongoClient('mongodb+srv://VSC:Test@jakebutler02.iepxjuj.mongodb.net', { useNewUrlParser: true, useUnifiedTopology: true });
let db;
client.connect().then(() => {
  console.log('Connected to MongoDB');
  db = client.db('yourDatabaseName'); // Replace 'yourDatabaseName' with your actual database name
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});
// Routes for Registration and login
app.post('/auth', async (req, res) => {
  const { action, username, password } = req.body;
  if (action === 'register') {
    // Encrypting Password Data
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection('users').insertOne({
      username,
      password: hashedPassword,
    });
    res.send('Registration successful!');
  } else if (action === 'login') {
    const user = await db.collection('users').findOne({ username });
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        res.send('Login successful!');
      } else {
        res.status(401).send('Invalid password');
      }
    } else {
      res.status(404).send('User not found');
    }
  } else {
    res.status(400).send('Invalid action');
  }
});
io.on('connection', (socket) => {
  socket.emit("moviesUpdated");
});
// Allows naviagtion to Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});
// Allows naviagtion to Movies page
app.get('/movies', (req, res) => {
  res.sendFile(path.join(__dirname, 'movies.html'));
});
// Allows naviagtion to Login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});
server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
