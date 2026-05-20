const express = require('express');
const { register, login, logout, getMe, getUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/users', protect, authorize('admin', 'doctor', 'receptionist'), getUsers);

module.exports = router;
