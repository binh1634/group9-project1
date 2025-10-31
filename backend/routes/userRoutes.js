const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const userController = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// Middleware kiểm tra admin dựa trên user được đính vào req bởi `protect`
const isAdmin = (req, res, next) => {
  // bảo đảm req.user đến từ DB (protect đã đảm nhiệm)
  console.debug(`userRoutes.isAdmin: checking user ${req.user?._id} role=${req.user?.role}`);
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Yêu cầu quyền admin" });
  }
  next();
};

// 📘 GET /api/users/profile – Lấy thông tin user
router.get("/profile", protect, async (req, res) => {
  try {
    // protect đã load user từ DB và loại bỏ password
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ✏️ PUT /api/users/profile – Cập nhật thông tin
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const update = { name, email };
    // Nếu có password, let controller/model or caller handle hashing
    if (password) update.password = password;

    // findByIdAndUpdate bypasses pre-save hooks, so if password provided we should
    // hash it here or use save(). For simplicity we'll use findById then set fields and save.
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    if (password) user.password = password; // userModel pre('save') sẽ hash

    await user.save();
    const result = user.toObject();
    delete result.password;

    res.json({ message: "Cập nhật thông tin thành công", user: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// --- Admin routes: quản lý users ---
// GET /api/users/  -> danh sách tất cả người dùng (admin)
router.get("/", protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// POST /api/users  -> tạo user mới (admin)
router.post("/", protect, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Tên, email và mật khẩu là bắt buộc" });

    const newUser = new User({ name, email, password, role: role || 'user' });
    await newUser.save();
    const userData = newUser.toObject();
    delete userData.password;
    res.status(201).json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// DELETE /api/users/:id  -> xóa user (admin)
router.delete("/:id", protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Không tìm thấy user" });
    res.json({ message: "Đã xóa user" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// PUT /api/users/:id -> cập nhật user (admin)
router.put("/:id", protect, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    user.name = name ?? user.name;
    user.email = email ?? user.email;
    if (typeof role !== 'undefined') user.role = role;
    if (password) user.password = password; // pre-save will hash

    await user.save();
    const result = user.toObject();
    delete result.password;

    res.json({ message: "Cập nhật thành công", user: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;

