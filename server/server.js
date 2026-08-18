const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Database Connection
require("./config/db");

// Routes
const machineRoutes = require("./routes/machineRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const sensorRoutes = require("./routes/sensorRoutes");
const path = require('path');
const { startHealthSimulation } = require('./services/machineHealthService');
const { startSensorSimulation } = require('./services/sensorReadingService');

const { authenticate } = require('./middleware/authMiddleware');
const userController = require('./controllers/userController');

const app = express();

app.use(cors());
app.use(express.json());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// User lookup APIs
app.get('/api/roles', authenticate, userController.getRoles);
app.get('/api/departments', authenticate, userController.getDepartments);

// API Routes
app.use("/api/machines", machineRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use("/api/sensors", sensorRoutes);

// Test Route
app.get("/", (req, res) => {
    res.send("🚀 Industrial Monitoring API is Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);

    startHealthSimulation();
    startSensorSimulation();
});