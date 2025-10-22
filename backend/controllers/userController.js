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