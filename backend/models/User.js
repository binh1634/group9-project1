const mongoose = require('mongoose');

// Đây là "bản thiết kế" cho User trong CSDL
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true // Bắt buộc phải có tên
    },
    email: {
        type: String,
        required: true, // Bắt buộc phải có email
        unique: true // Email không được trùng
    }
}, { timestamps: true }); // Tự động thêm 2 trường: createdAt và updatedAt

module.exports = mongoose.model('User', UserSchema);