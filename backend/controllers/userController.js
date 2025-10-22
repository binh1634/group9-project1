// Bước 2: Tạo mảng tạm users (theo đề bài)
// Chúng ta dùng một mảng tạm để lưu trữ dữ liệu (làm giả database)
let users = [
    { id: 1, name: "User Mẫu 1", email: "user1@example.com" },
    { id: 2, name: "User Mẫu 2", email: "user2@example.com" }
];
let nextId = 3; // Biến này để mô phỏng ID tự tăng

// Bước 3: Viết API GET /users
// --- Logic để LẤY TẤT CẢ users ---
exports.getUsers = (req, res) => {
    // Trả về toàn bộ mảng 'users' dưới dạng JSON
    // status 200 nghĩa là OK
    res.status(200).json(users);
};

// Bước 3: Viết API POST /users
// --- Logic để TẠO MỚI một user ---
exports.createUser = (req, res) => {
    // Lấy 'name' và 'email' từ <body> của request
    const { name, email } = req.body;

    // Kiểm tra đơn giản
    if (!name || !email) {
        return res.status(400).json({ message: "Vui lòng cung cấp name và email" });
    }

    // Tạo một user mới
    const newUser = {
        id: nextId++,
        name: name,
        email: email
    };

    // Thêm user mới vào mảng
    users.push(newUser);

    // Trả về user vừa tạo (status 201 nghĩa là Created)
    res.status(201).json(newUser);
};