const db = require("../config/db");

const getLatestSensorStatuses = (callback) => {
    const sql = `
        SELECT
            ms.machine_sensor_id,
            ms.machine_id,
            m.machine_name,
            ms.sensor_code,
            COALESCE(ms.sensor_name, st.sensor_name) AS sensor_name,
            st.unit,

            sr.reading_value,
            sr.reading_time,

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

        LEFT JOIN sensor_readings sr
            ON sr.reading_id = (
                SELECT sr2.reading_id
                FROM sensor_readings sr2
                WHERE sr2.machine_sensor_id = ms.machine_sensor_id
                ORDER BY sr2.reading_time DESC
                LIMIT 1
            )

        WHERE ms.status = 'Active'

        ORDER BY ms.machine_id, ms.machine_sensor_id
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Sensor monitoring error:", err);
            return callback(err);
        }

        const sensors = results.map(sensor => {
            let sensorStatus = "No Data";

            if (sensor.reading_value !== null) {

                const value = Number(sensor.reading_value);

                if (
                    sensor.critical_value !== null &&
                    value >= Number(sensor.critical_value)
                ) {
                    sensorStatus = "Critical";

                } else if (
                    sensor.warning_value !== null &&
                    value >= Number(sensor.warning_value)
                ) {
                    sensorStatus = "Warning";

                } else if (
                    sensor.min_value !== null &&
                    value < Number(sensor.min_value)
                ) {
                    sensorStatus = "Critical";

                } else if (
                    sensor.max_value !== null &&
                    value > Number(sensor.max_value)
                ) {
                    sensorStatus = "Critical";

                } else {
                    sensorStatus = "Normal";
                }
            }

            return {
                ...sensor,
                status: sensorStatus
            };
        });

        callback(null, sensors);
    });
};

module.exports = {
    getLatestSensorStatuses
};