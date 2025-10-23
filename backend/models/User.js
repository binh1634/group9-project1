const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },

    // --- BẮT ĐẦU THÊM CODE MỚI ---
    password: {
        type: String,
        required: true // Mật khẩu là bắt buộc
    },
    role: {
        type: String,
        enum: ['user', 'admin'], // Chỉ cho phép 1 trong 2 giá trị này
        default: 'user'         // Mặc định là 'user'
    }
    // --- KẾT THÚC THÊM CODE MỚI ---

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);