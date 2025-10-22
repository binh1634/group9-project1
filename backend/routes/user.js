const express = require('express');
const router = express.Router();

// Import controller mà chúng ta vừa tạo ở Bước 1
const userController = require('../controllers/userController');

// Định nghĩa các đường dẫn (endpoints)

// Khi ai đó truy cập (GET) vào '/users',
// nó sẽ gọi hàm 'getUsers' từ controller
router.get('/users', userController.getUsers);

// Khi ai đó gửi (POST) đến '/users',
// nó sẽ gọi hàm 'createUser' từ controller
router.post('/users', userController.createUser);

// Xuất router này ra để file server.js có thể dùng
module.exports = router;