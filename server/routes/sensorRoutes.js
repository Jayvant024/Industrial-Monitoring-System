const express = require("express");

const router = express.Router();

const {
    getAllSensors,
    getSensorStatuses,
    getSensorById,
    createSensor,
    updateSensor,
    deleteSensor
} = require("../controllers/sensorController");

// Get all sensors
router.get("/", getAllSensors);

// Get live sensor statuses
router.get("/statuses", getSensorStatuses);

// Get one sensor
router.get("/:id", getSensorById);

// Create sensor
router.post("/", createSensor);

// Update sensor
router.put("/:id", updateSensor);

// Delete sensor
router.delete("/:id", deleteSensor);

module.exports = router;