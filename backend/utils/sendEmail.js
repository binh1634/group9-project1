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