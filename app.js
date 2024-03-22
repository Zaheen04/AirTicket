// app.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const Flight = require('./models/flight');
const Booking = require('./models/Booking');

const app = express();

app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://khanzaheen682:Dynasty%4004@cluster0.rensclz.mongodb.net//air_ticket_booking', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Unauthorized' });
    req.userId = decoded.id;
    next();
  });
};

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ message: 'Invalid password' });
    const token = jwt.sign({ id: user._id }, 'secret_key', { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Flights endpoints
// Get all flights
app.get('/api/flights', async (req, res) => {
  try {
    const flights = await Flight.find();
    res.status(200).json(flights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a specific flight by ID
app.get('/api/flights/:id', async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.status(200).json(flight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new flight
app.post('/api/flights', verifyToken, async (req, res) => {
  try {
    const flight = new Flight(req.body);
    await flight.save();
    res.status(201).json({ message: 'Flight added successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update flight
app.put('/api/flights/:id', verifyToken, async (req, res) => {
  try {
    await Flight.findByIdAndUpdate(req.params.id, req.body);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete flight
app.delete('/api/flights/:id', verifyToken, async (req, res) => {
  try {
    await Flight.findByIdAndDelete(req.params.id);
    res.status(202).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Booking endpoints
// Book a flight
app.post('/api/booking', verifyToken, async (req, res) => {
  try {
    const booking = new Booking(req.body);
    await booking.save();
    res.status(201).json({ message: 'Booking successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all bookings
app.get('/api/dashboard', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find().populate('user').populate('flight');
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking
app.put('/api/dashboard/:id', verifyToken, async (req, res) => {
  try {
    await Booking.findByIdAndUpdate(req.params.id, req.body);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete booking
app.delete('/api/dashboard/:id', verifyToken, async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.status(202).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
