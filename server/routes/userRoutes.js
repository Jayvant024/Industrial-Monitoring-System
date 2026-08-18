const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const users = require('../controllers/userController');
const { authenticate } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads', 'users'));
  },

  filename: function (req, file, cb) {
    cb(
      null,
      `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`
    );
  },
});

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/jpg',
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(
        new Error('Only JPG, JPEG, PNG, and WEBP images are allowed.')
      );
    }

    cb(null, true);
  },
});

router.use(authenticate);

router.get('/roles', users.getRoles);
router.get('/departments', users.getDepartments);

router.get('/', users.getAllUsers);
router.get('/:id', users.getUserById);

router.post('/', upload.single('profile_image'), users.createUser);
router.put('/:id', upload.single('profile_image'), users.updateUser);
router.delete('/:id', users.deleteUser);

router.post(
  '/',
  upload.single('profile_image'),
  users.createUser
);

router.put(
  '/:id',
  upload.single('profile_image'),
  users.updateUser
);

router.delete(
  '/:id',
  users.deleteUser
);

module.exports = router;