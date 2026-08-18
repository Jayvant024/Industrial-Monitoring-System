const sensorMonitoringService = require("../services/sensorMonitoringService");
const db = require("../config/db");

const getSensorStatuses = (req, res) => {
    sensorMonitoringService.getLatestSensorStatuses((err, sensors) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: "Failed to fetch sensor statuses"
            });
        }

        res.json({
            success: true,
            data: sensors
        });
    });
};
// Get all sensors with machine and sensor type information
const getAllSensors = (req, res) => {
    const sql = `
        SELECT
            ms.machine_sensor_id,
            ms.machine_id,
            m.machine_name,
            ms.sensor_type_id,
            st.sensor_name,
            st.unit,
            ms.sensor_code,
            ms.sensor_name AS custom_sensor_name,
            ms.installation_date,
            ms.status
        FROM machine_sensors ms
        JOIN machines m
            ON ms.machine_id = m.machine_id
        JOIN sensor_types st
            ON ms.sensor_type_id = st.sensor_type_id
        ORDER BY ms.machine_sensor_id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Get sensors error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch sensors"
            });
        }

        res.json({
            success: true,
            data: results
        });
    });
};


// Get one sensor
const getSensorById = (req, res) => {
    const { id } = req.params;

    const sql = `
        SELECT
            ms.machine_sensor_id,
            ms.machine_id,
            m.machine_name,
            ms.sensor_type_id,
            st.sensor_name,
            st.unit,
            ms.sensor_code,
            ms.sensor_name AS custom_sensor_name,
            ms.installation_date,
            ms.status
        FROM machine_sensors ms
        JOIN machines m
            ON ms.machine_id = m.machine_id
        JOIN sensor_types st
            ON ms.sensor_type_id = st.sensor_type_id
        WHERE ms.machine_sensor_id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error("Get sensor error:", err);
            return res.status(500).json({
                success: false,
                message: "Failed to fetch sensor"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Sensor not found"
            });
        }

        res.json({
            success: true,
            data: results[0]
        });
    });
};


// Add a sensor to a machine
const createSensor = (req, res) => {
    const {
        machine_id,
        sensor_type_id,
        sensor_code,
        sensor_name,
        installation_date,
        status
    } = req.body;

    if (!machine_id || !sensor_type_id) {
        return res.status(400).json({
            success: false,
            message: "machine_id and sensor_type_id are required"
        });
    }

    const sql = `
        INSERT INTO machine_sensors
        (
            machine_id,
            sensor_type_id,
            sensor_code,
            sensor_name,
            installation_date,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            machine_id,
            sensor_type_id,
            sensor_code || null,
            sensor_name || null,
            installation_date || null,
            status || "Active"
        ],
        (err, result) => {
            if (err) {
                console.error("Create sensor error:", err);

                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(409).json({
                        success: false,
                        message: "Sensor code already exists"
                    });
                }

                return res.status(500).json({
                    success: false,
                    message: "Failed to create sensor"
                });
            }

            res.status(201).json({
                success: true,
                message: "Sensor created successfully",
                sensor_id: result.insertId
            });
        }
    );
};


// Update sensor
const updateSensor = (req, res) => {
    const { id } = req.params;

    const {
        machine_id,
        sensor_type_id,
        sensor_code,
        sensor_name,
        installation_date,
        status
    } = req.body;

    const sql = `
        UPDATE machine_sensors
        SET
            machine_id = ?,
            sensor_type_id = ?,
            sensor_code = ?,
            sensor_name = ?,
            installation_date = ?,
            status = ?
        WHERE machine_sensor_id = ?
    `;

    db.query(
        sql,
        [
            machine_id,
            sensor_type_id,
            sensor_code || null,
            sensor_name || null,
            installation_date || null,
            status || "Active",
            id
        ],
        (err, result) => {
            if (err) {
                console.error("Update sensor error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Failed to update sensor"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Sensor not found"
                });
            }

            res.json({
                success: true,
                message: "Sensor updated successfully"
            });
        }
    );
};


// Delete sensor
const deleteSensor = (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM machine_sensors
        WHERE machine_sensor_id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Delete sensor error:", err);

            return res.status(500).json({
                success: false,
                message: "Failed to delete sensor"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Sensor not found"
            });
        }

        res.json({
            success: true,
            message: "Sensor deleted successfully"
        });
    });
};


module.exports = {
    getSensorStatuses,
    getAllSensors,
    getSensorById,
    createSensor,
    updateSensor,
    deleteSensor
};