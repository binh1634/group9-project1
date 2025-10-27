const multer = require('multer');
const path = require('path');

// Cấu hình lưu trữ (dùng bộ nhớ tạm - memoryStorage)
// Chúng ta không lưu file ra đĩa server, mà lưu vào RAM
// để đẩy thẳng lên Cloudinary
const storage = multer.memoryStorage();

// Hàm lọc file (chỉ cho phép ảnh)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  // Nếu không phải ảnh, báo lỗi
  cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png)!'));
};

// Khởi tạo và export multer
// 'upload' chính là biến mà file route của bạn cần
const upload = multer({ 
  storage: storage, 
  fileFilter: fileFilter 
});

module.exports = upload; // <-- Export biến 'upload'
