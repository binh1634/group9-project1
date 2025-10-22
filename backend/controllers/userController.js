const User = require('../models/User'); // Import Model User từ Bước 4

// Logic: Lấy tất cả user từ DB
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find(); // Tìm tất cả user trong DB
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Logic: Tạo user mới vào DB
exports.createUser = async (req, res) => {
    // Tạo một đối tượng User mới từ model
    const newUser = new User({
        name: req.body.name,
        email: req.body.email
    });
    
    try {
        const savedUser = await newUser.save(); // Lưu user mới vào DB
        res.status(201).json(savedUser);
    } catch (err) {
        // Nếu lỗi (ví dụ: trùng email), báo lỗi 400
        res.status(400).json({ message: err.message });
    }
};
// --- Logic để CẬP NHẬT user (PUT) ---
exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id, // Lấy id từ URL (ví dụ: .../api/users/12345)
            req.body,      // Lấy data mới từ body (ví dụ: { name: "Tên Mới" })
            { new: true }  // Tùy chọn: trả về user sau khi đã update
        );
        // Nếu không tìm thấy user có id đó
        if (!updatedUser) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }
        res.status(200).json(updatedUser); // Trả về user đã cập nhật
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// --- Logic để XÓA user (DELETE) ---
// DELETE /api/users/:id
exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        // Nếu không tìm thấy user có id đó
        if (!deletedUser) {
            return res.status(404).json({ message: "Không tìm thấy user" });
        }
        res.status(200).json({ message: "User đã được xóa" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};