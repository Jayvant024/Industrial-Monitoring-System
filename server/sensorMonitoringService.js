const db = require("../config/db");

/**
 * Get latest sensor readings and calculate their status
 *
 * Normal    -> reading is below warning_value
 * Warning   -> reading >= warning_value
 * Critical  -> reading >= critical_value
 */
const getLatestSensorStatuses = (callback) => {
    const sql = `
        SELECT
            sr.reading_id,
            sr.machine_sensor_id,
            ms.machine_id,
            m.machine_name,

            ms.sensor_code,
            ms.sensor_name AS custom_sensor_name,

            st.sensor_name,
            st.unit,

            sr.reading_value,
            sr.reading_time,

            sth.min_value,
            sth.max_value,
            sth.warning_value,
            sth.critical_value

        FROM sensor_readings sr

        JOIN machine_sensors ms
            ON sr.machine_sensor_id = ms.machine_sensor_id

        JOIN machines m
            ON ms.machine_id = m.machine_id

        JOIN sensor_types st
            ON ms.sensor_type_id = st.sensor_type_id

        LEFT JOIN sensor_thresholds sth
            ON sr.machine_sensor_id = sth.machine_sensor_id

        INNER JOIN (
            SELECT
                machine_sensor_id,
                MAX(reading_time) AS latest_time
            FROM sensor_readings
            GROUP BY machine_sensor_id
        ) latest
            ON sr.machine_sensor_id = latest.machine_sensor_id
            AND sr.reading_time = latest.latest_time

        WHERE ms.status = 'Active'

        ORDER BY m.machine_id, ms.machine_sensor_id
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Sensor monitoring error:", err);
            return callback(err);
        }

        const sensors = results.map(sensor => {
            let status = "Normal";

            const value = Number(sensor.reading_value);
            const warning = Number(sensor.warning_value);
            const critical = Number(sensor.critical_value);

            if (!Number.isNaN(critical) && value >= critical) {
                status = "Critical";
            } else if (!Number.isNaN(warning) && value >= warning) {
                status = "Warning";
            }

            return {
                ...sensor,
                status
            };
        });

        callback(null, sensors);
    });
};

module.exports = {
    getLatestSensorStatuses
};