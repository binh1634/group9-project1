const express = require('express');
const router = express.Router();

// 1. Import Controller
const userController = require('../controllers/userController');

// 2. Import Middlewares (Rất quan trọng cho Buổi 5)
// (Bạn phải tạo 2 file này dựa theo hướng dẫn ở Hoạt động 2, 3, 4)
const { authenticateToken, authorizeAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload'); // Middleware để upload file

/* -------------------------------------------------------------------------- */
/* HOẠT ĐỘNG 1: AUTH                             */
/* -------------------------------------------------------------------------- */
// Đây là các route công khai (public)
router.post('/signup', userController.signup);
router.post('/login', userController.login);

/* -------------------------------------------------------------------------- */
/* HOẠT ĐỘNG 2: USER PROFILE                         */
/* -------------------------------------------------------------------------- */
// Các route này cần xác thực (phải login)
// middleware 'authenticateToken' sẽ chạy trước
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);

/* -------------------------------------------------------------------------- */
/* HOẠT ĐỘNG 3: ADMIN                            */
/* -------------------------------------------------------------------------- */
// Các route này yêu cầu quyền Admin
// Phải chạy 'authenticateToken' (để biết user là ai) 
// VÀ 'authorizeAdmin' (để kiểm tra có phải admin không)
router.get('/users', [authenticateToken, authorizeAdmin], userController.getAllUsers);
router.delete('/users/:id', [authenticateToken, authorizeAdmin], userController.deleteUser);

/* -------------------------------------------------------------------------- */
/* HOẠT ĐỘNG 4: NÂNG CAO                          */
/* -------------------------------------------------------------------------- */
// Quên mật khẩu (public)
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password/:token', userController.resetPassword);

// Upload Avatar (cần login)
// 'upload.single('avatar')' là middleware xử lý file
router.put(
  '/profile/avatar',
  authenticateToken,
  upload.single('avatar'), // Tên field phải là 'avatar'
  userController.uploadAvatar
);

// Xuất router
module.exports = router;