const User = require('../models/User'); // Import User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail'); // (Bạn sẽ tạo file này ở Bước 3)
const cloudinary = require('../config/cloudinary'); // (Bạn sẽ tạo file này ở Bước 4)

/* -------------------------------------------------------------------------- */
/* HOẠT ĐỘNG 1: SIGNUP & LOGIN (Đăng ký & Đăng nhập)                          */
/* -------------------------------------------------------------------------- */

// POST /signup
exports.signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1. Kiểm tra email đã tồn tại chưa
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // 2. Tạo user mới và Băm mật khẩu
    user = new User({
      name,
      email,
      password,
      // role sẽ tự động 'user' (nhờ default trong Schema)
    });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 3. Lưu vào DB
    await user.save();

    // 4. Tạo và trả về JWT Token
    const payload = {
      id: user._id,
      role: user.role,
    };
    
    // Bạn phải có JWT_SECRET trong file .env
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); 

    res.status(201).json({ token, role: user.role });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Kiểm tra email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Tạo và trả về JWT Token
    const payload = {
      id: user._id,
      role: user.role,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/* -------------------------------------------------------------------------- */
/* HOẠT ĐỘNG 2: PROFILE (Xem & Cập nhật thông tin cá nhân)                      */
/* -------------------------------------------------------------------------- */

// GET /profile
exports.getProfile = async (req, res) => {
  try {
    // req.user.id được lấy từ middleware 'authenticateToken'
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /profile
exports.updateProfile = async (req, res) => {
  const { name, email } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true } // {new: true} để trả về bản ghi đã cập nhật
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/* -------------------------------------------------------------------------- */
/* HOẠT ĐỘNG 3: ADMIN (Quản lý User)                                           */
/* -------------------------------------------------------------------------- */

// GET /users (Admin Only)
exports.getAllUsers = async (req, res) => {
  try {
    // Chỉ Admin mới gọi được hàm này (nhờ middleware 'authorizeAdmin')
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /users/:id (Admin Only)
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/* -------------------------------------------------------------------------- */
/* HOẠT ĐỘNG 4: NÂNG CAO (Quên MK & Upload Avatar)                             */
/* -------------------------------------------------------------------------- */

// POST /forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Luôn trả về 200 để bảo mật, tránh lộ email nào đã đăng ký
      return res.status(200).json({ message: 'Email sent (if user exists)' });
    }

    // 1. Tạo token reset
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Băm token và lưu vào DB (thời hạn 10 phút)
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 phút
    await user.save();

    // 3. Tạo link reset (trỏ về Máy 2 - Frontend)
    // Thay [IP_MAY_2] bằng IP của Máy 2, ví dụ: 'http://192.168.1.10:3000'
    const resetUrl = `http:172.23.15.246:3000/reset-password/${resetToken}`;

    const message = `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu reset mật khẩu. Vui lòng click vào link sau để đặt lại mật khẩu: \n\n ${resetUrl} \n\n Link này sẽ hết hạn sau 10 phút.`;

    // 4. Gửi mail
    await sendEmail({
      email: user.email,
      subject: 'Yêu cầu Reset Mật khẩu',
      message: message,
    });

    res.status(200).json({ message: 'Email sent' });
  } catch (err) {
    // Xóa token nếu có lỗi
    console.error(err);
    // Cần rollback lại user save nếu có lỗi
    res.status(500).json({ message: 'Error sending email' });
  }
};

// POST /reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    // 1. Băm token từ URL để so sánh với DB
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // 2. Tìm user có token hợp lệ (còn hạn)
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }, // $gt: lớn hơn
    });

    if (!user) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }

    // 3. Đặt mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(req.body.password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /profile/avatar
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an image' });
    }

    // 1. Chuyển buffer (từ memoryStorage của multer) sang base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;

    // 2. Upload lên Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'avatars', // Thư mục trên Cloudinary
      public_id: req.user.id, // Đặt tên file theo user id
      overwrite: true,
      crop: "fill", 
      width: 150, 
      height: 150
    });

    // 3. Lưu URL (result.secure_url) vào DB
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error while uploading avatar' });
  }
};