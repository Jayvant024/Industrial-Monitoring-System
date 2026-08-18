const db = require("../config/db");

const getMachineSelectSql = () => `
    SELECT
        m.machine_id,
        m.machine_code,
        m.machine_name,
        mc.category_name,
        m.manufacturer,
        m.model,
        m.serial_number,
        m.location,
        m.status,
        m.machine_health,
        m.running_hours,
        m.last_health_update,
        m.image_url
    FROM machines m
    JOIN machine_categories mc
    ON m.category_id = mc.category_id
`;

// =========================
// GET ALL MACHINES
// =========================
exports.getAllMachines = (req, res) => {

    const sql = getMachineSelectSql();

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true,
            count: results.length,
            data: results
        });

    });

};

// =========================
// GET MACHINE BY ID
// =========================
exports.getMachineById = (req, res) => {

    const { id } = req.params;

    const sql = `${getMachineSelectSql()} WHERE m.machine_id = ?`;

    db.query(sql, [id], (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Machine not found"
            });
        }

        res.json({
            success: true,
            data: results[0]
        });

    });

};

// =========================
// ADD MACHINE
// =========================
exports.addMachine = (req, res) => {
    const {
        machine_code,
        machine_name,
        category_id,
        manufacturer,
        model,
        serial_number,
        location,
        status,
        image_url
    } = req.body;

    // Determine image priority: uploaded file takes precedence over provided URL
    let finalImageUrl = null;
    if (req.file && req.file.filename) {
        finalImageUrl = `/uploads/machines/${req.file.filename}`;
    } else if (image_url) {
        finalImageUrl = image_url;
    }

    const sql = `
        INSERT INTO machines
        (
            machine_code,
            machine_name,
            category_id,
            manufacturer,
            model,
            serial_number,
            location,
            status,
            image_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            machine_code,
            machine_name,
            category_id,
            manufacturer,
            model,
            serial_number,
            location,
            status,
            finalImageUrl
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Machine Added Successfully",
                machineId: result.insertId
            });

        }
    );

};

// =========================
// UPDATE MACHINE
// =========================
exports.updateMachine = (req, res) => {

    const { id } = req.params;

    const {
        machine_code,
        machine_name,
        category_id,
        manufacturer,
        model,
        serial_number,
        location,
        status,
        image_url
    } = req.body;

    // Determine image priority
    let finalImageUrl = null;
    if (req.file && req.file.filename) {
        finalImageUrl = `/uploads/machines/${req.file.filename}`;
    } else if (image_url) {
        finalImageUrl = image_url;
    }

    const sql = `
        UPDATE machines
        SET
            machine_code = ?,
            machine_name = ?,
            category_id = ?,
            manufacturer = ?,
            model = ?,
            serial_number = ?,
            location = ?,
            status = ?,
            image_url = ?
        WHERE machine_id = ?
    `;

    db.query(
        sql,
        [
            machine_code,
            machine_name,
            category_id,
            manufacturer,
            model,
            serial_number,
            location,
            status,
            finalImageUrl,
            id
        ],
        (err) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: "Machine Updated Successfully"
            });

        }
    );

};

// =========================
// DELETE MACHINE
// =========================
exports.deleteMachine = (req, res) => {

    const { id } = req.params;

    const sql = `DELETE FROM machines WHERE machine_id = ?`;

    db.query(sql, [id], (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                error: err.message
            });
        }

        res.json({
            success: true,
            message: "Machine Deleted Successfully"
        });

    });

};