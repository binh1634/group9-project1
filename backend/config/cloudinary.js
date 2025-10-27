const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Cấu hình transporter (dịch vụ gửi mail)
  // DÙNG MAILTRAP.IO (Rất khuyên dùng để test)
  // Đăng ký Mailtrap.io, lấy thông tin SMTP
  const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  // 2. Định nghĩa nội dung mail
  const mailOptions = {
    from: 'Your App <noreply@yourapp.com>', // Tên người gửi
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Gửi mail
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
Long
// backend/config/cloudinary.js
const cloudinary = require('cloudinary').v2;

// Kết nối với tài khoản Cloudinary của bạn
// (Các biến này phải có trong file .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
