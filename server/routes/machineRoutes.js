const express = require("express");

const router = express.Router();

const upload = require('../middleware/machineImageUpload');

const {
        getAllMachines,
        getMachineById,
        addMachine,
        updateMachine,
        deleteMachine
} = require("../controllers/machineController");

// Wrapper to handle multer errors and return JSON
const handleUpload = (req, res, next) => {
    const single = upload.single('image');
    single(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, error: 'File too large. Max size is 5MB.' });
            }
            return res.status(400).json({ success: false, error: err.message });
        }
        next();
    });
};

// GET All Machines
router.get("/", getAllMachines);

// GET Machine By ID
router.get("/:id", getMachineById);

// ADD Machine (supports image upload or image_url)
router.post("/", handleUpload, addMachine);

// UPDATE Machine (supports image upload or image_url)
router.put("/:id", handleUpload, updateMachine);

// DELETE Machine
router.delete("/:id", deleteMachine);

module.exports = router;