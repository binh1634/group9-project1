const jwt = require('jsonwebtoken');

// Middleware 1: Xác thực Token (Kiểm tra xem đã login chưa)
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 

  if (token == null) {
    // 401: Unauthorized (Chưa xác thực)
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // 403: Forbidden (Bị cấm - Token hỏng/hết hạn)
      return res.status(403).json({ message: 'Forbidden: Invalid token' });
    }
    
    // Gán thông tin (id, role) đã giải mã vào req để các hàm sau dùng
    req.user = user; 
    next(); // Cho đi tiếp
  });
};

// Middleware 2: Phân quyền Admin (Kiểm tra xem có phải Admin không)
const authorizeAdmin = (req, res, next) => {
  // Hàm này phải chạy SAU 'authenticateToken'
  if (req.user.role !== 'admin') {
    // 403: Forbidden (Bị cấm - Không phải admin)
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next(); // Là admin, cho đi tiếp
};

// Export cả hai hàm
module.exports = { 
  authenticateToken, 
  authorizeAdmin 
};