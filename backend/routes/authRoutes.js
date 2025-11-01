// backend/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const RefreshToken = require('../models/refreshToken'); // mới
const cookieParser = require('cookie-parser'); // nếu cần
const crypto = require('crypto'); // nếu chưa có
require("dotenv").config();
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

// ==========================
// ☁️ Cấu hình Cloudinary
// ========================== 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ==========================
// 📌 Đăng ký tài khoản
// ==========================
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã được sử dụng" });
    }

    const newUser = new User({
      name,
      email,
      password,
      role: "user",
    });

    await newUser.save();

    const userData = newUser.toObject();
    delete userData.password;

    res.status(201).json({
      message: "Đăng ký thành công!",
      user: userData,
    });
  } catch (err) {
    console.error("❌ Lỗi đăng ký:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ==========================
// 🔐 Đăng nhập
// ==========================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log("Login attempt for email:", email);
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ Thiếu JWT_SECRET trong file .env");
      return res.status(500).json({ message: "Lỗi cấu hình máy chủ" });
    }

    // access token (short-lived)
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    });

    // create refresh token, store hashed in DB, and send raw in httpOnly cookie
    const { raw: refreshRaw } = await createAndStoreRefreshToken(user._id);

    const cookieOptions = {
      httpOnly: true,
      sameSite: process.env.COOKIE_SAME_SITE || 'Lax',
      secure: process.env.COOKIE_SECURE === 'true', // true in prod with https
      maxAge: (Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7) * 24 * 60 * 60 * 1000,
    };

    res.cookie('refreshToken', refreshRaw, cookieOptions);

    const userData = user.toObject();
    delete userData.password;

    // In development return the raw refresh token in the response body to
    // make testing easier (do NOT return this in production).
    const responsePayload = {
      message: "Đăng nhập thành công!",
      accessToken,
      user: userData,
    };

    if (process.env.NODE_ENV !== 'production') {
      responsePayload.refreshToken = refreshRaw;
    }

    res.json(responsePayload);
  } catch (err) {
    console.error("❌ Lỗi đăng nhập:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ==========================
// 🚪 Logout
// ==========================
router.post("/logout", async (req, res) => {
  try {
    const raw = req.cookies?.refreshToken;
    if (raw) {
      const hash = crypto.createHash('sha256').update(raw).digest('hex');
      await RefreshToken.findOneAndUpdate({ tokenHash: hash }, { revoked: true });
    }
    // Clear cookie on client
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: process.env.COOKIE_SAME_SITE || 'Lax' });
    res.json({ message: "Đăng xuất thành công" });
  } catch (err) {
    console.error('Logout error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================
// 🔁 Quên mật khẩu - gửi token reset
// ==========================
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.json({ message: "Nếu email tồn tại, một liên kết đã được gửi" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 giờ
    await user.save({ validateBeforeSave: false }); // ✅ FIX lỗi password required

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: "Đặt lại mật khẩu",
        text: `Nhấn vào liên kết sau để đặt lại mật khẩu: ${resetUrl}`,
      });

      return res.json({ message: "Email đặt lại mật khẩu đã được gửi" });
    }

    // 🧪 Dev fallback
    res.json({ message: "Reset token created", resetToken, resetUrl });
  } catch (err) {
    console.error("❌ Lỗi forgot-password:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ==========================
// 🔐 Reset mật khẩu bằng token
// ==========================
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ message: "Thiếu token hoặc mật khẩu mới" });

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });

    user.password = password; // pre-save sẽ hash
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("❌ Lỗi reset-password:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ==========================
// 🔄 Tạo và lưu Refresh Token
// ==========================
const createAndStoreRefreshToken = async (userId) => {
  const raw = crypto.randomBytes(64).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  const days = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS) || 7;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  await RefreshToken.create({ user: userId, tokenHash: hash, expiresAt });
  return { raw, expiresAt };
};

// ==========================
// 🔄 Làm mới Access Token bằng Refresh Token
// ==========================
router.post('/refresh', async (req, res) => {
  try {
    const raw = req.cookies?.refreshToken;
    if (!raw) return res.status(401).json({ message: 'No refresh token' });

    const hash = crypto.createHash('sha256').update(raw).digest('hex');

    const dbToken = await RefreshToken.findOne({ tokenHash: hash }).populate('user');
    if (!dbToken || dbToken.revoked || dbToken.expiresAt < Date.now()) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const user = dbToken.user;
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Issue new access token
    const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '15m'
    });

    // Optionally: rotate refresh token (create new one, revoke old)
    // For simplicity here we keep refresh token the same. To rotate, createAndStoreRefreshToken(user._id) then mark dbToken.revoked=true

    res.json({ accessToken });
  } catch (err) {
    console.error('Refresh token error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
