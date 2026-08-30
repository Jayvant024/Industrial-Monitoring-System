const db = require("../config/db");

// Generate a realistic sensor value based on sensor type
const generateReading = (sensorName, threshold) => {
    const min = Number(threshold.min_value ?? 0);
    const max = Number(threshold.max_value ?? 100);

    let value;

    switch (sensorName.toLowerCase()) {
        case "temperature":
            // Normal operating temperature
            value = 50 + Math.random() * 35;
            break;

        case "vibration":
            // Normal vibration with occasional higher values
            value = 1 + Math.random() * 5;
            break;

        case "pressure":
            // Normal operating pressure
            value = 4 + Math.random() * 4;
            break;

        case "current":
            // Normal motor current
            value = 20 + Math.random() * 20;
            break;

        case "rpm":
            // Normal machine RPM
            value = 1500 + Math.random() * 1000;
            break;

        default:
            // Generic fallback
            value = min + Math.random() * (max - min);
    }

    // Keep value inside configured min/max range
    value = Math.max(min, Math.min(max, value));

    return Number(value.toFixed(2));
};


// Get status based on threshold
const getReadingStatus = (value, threshold) => {
    const warning = Number(threshold.warning_value);
    const critical = Number(threshold.critical_value);
    const max = Number(threshold.max_value);

    if (!Number.isNaN(critical) && value >= critical) {
        return "Critical";
    }

    if (!Number.isNaN(warning) && value >= warning) {
        return "Warning";
    }

    if (!Number.isNaN(max) && value > max) {
        return "Critical";
    }

    return "Normal";
};


// Generate readings for all running machines
const generateSensorReadings = () => {
    const sql = `
        SELECT
            ms.machine_sensor_id,
            ms.machine_id,
            m.machine_name,
            m.status AS machine_status,
            ms.status AS sensor_status,
            st.sensor_name,
            st.unit,
            th.min_value,
            th.max_value,
            th.warning_value,
            th.critical_value
        FROM machine_sensors ms

        JOIN machines m
            ON ms.machine_id = m.machine_id

        JOIN sensor_types st
            ON ms.sensor_type_id = st.sensor_type_id

        LEFT JOIN sensor_thresholds th
            ON ms.machine_sensor_id = th.machine_sensor_id

       WHERE m.status IN ('Running', 'Maintenance')
AND ms.status = 'Active'

        ORDER BY ms.machine_sensor_id
    `;

    db.query(sql, (err, sensors) => {
    if (err) {
        console.error("❌ SENSOR QUERY ERROR:", err);
        return;
    }

    console.log("📡 SENSOR QUERY RESULT:", sensors.length);

    if (!sensors || sensors.length === 0) {
        console.log("ℹ️ No running machines with active sensors.");
        return;
    }

    sensors.forEach((sensor) => {
            const threshold = {
                min_value: sensor.min_value ?? 0,
                max_value: sensor.max_value ?? 100,
                warning_value: sensor.warning_value ?? 80,
                critical_value: sensor.critical_value ?? 90
            };

            const reading = generateReading(
                sensor.sensor_name,
                threshold
            );

            const readingStatus = getReadingStatus(
                reading,
                threshold
            );

            const insertSql = `
                INSERT INTO sensor_readings
                (
                    machine_sensor_id,
                    reading_value,
                    reading_time
                )
                VALUES (?, ?, NOW())
            `;

            db.query(
                insertSql,
                [
                    sensor.machine_sensor_id,
                    reading
                ],
                (insertErr) => {
                    if (insertErr) {
                        console.error(
                            `❌ Failed to save ${sensor.sensor_name} reading:`,
                            insertErr
                        );
                        return;
                    }

                    console.log(
                        `📡 ${sensor.machine_name} | ` +
                        `${sensor.sensor_name}: ${reading} ${sensor.unit} | ` +
                        `Status: ${readingStatus}`
                    );
                }
            );
        });
    });
};


// Start automatic sensor simulation
const startSensorSimulation = () => {
    console.log("📡 Sensor simulation started");

    // Generate first readings shortly after server starts
    setTimeout(() => {
        generateSensorReadings();
    }, 2000);

    // Generate new readings every 10 seconds
    setInterval(() => {
        generateSensorReadings();
    }, 10000);
};


module.exports = {
    generateSensorReadings,
    startSensorSimulation
};