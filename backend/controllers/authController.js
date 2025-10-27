const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Thư viện mã hóa pass
const jwt = require('jsonwebtoken'); // Thư viện tạo token

// Hàm tạo token (có thể tách ra file utils)
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token hết hạn sau 30 ngày
  });
};

// --- LOGIC ĐĂNG KÝ (REGISTER) ---
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Kiểm tra email đã tồn tại chưa?
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email đã được sử dụng' });
    }

    // 2. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Tạo user mới
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 4. Trả về thông tin user (trừ password) và token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi đăng ký' });
  }
};

// --- LOGIC ĐĂNG NHẬP (LOGIN) ---
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Tìm user theo email
    const user = await User.findOne({ email });

    // 2. Nếu user tồn tại VÀ mật khẩu khớp
    if (user && (await bcrypt.compare(password, user.password))) {
      // 3. Trả về thông tin user và token
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      // Nếu email sai hoặc pass sai
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' }); // 401 Unauthorized
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi đăng nhập' });
  }
};