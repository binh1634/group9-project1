import React from 'react';
// 1. Import các thành phần cần thiết từ react-router-dom
import { BrowserRouter, Routes, Route, useNavigate, Link } from 'react-router-dom';
import './App.css';
import ProfilePage from './pages/ProfilePage'; 
// 2. Import các component trang (bạn sẽ tạo chúng ở bước tiếp theo)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
// import ProfilePage from './pages/ProfilePage'; // Cho Hoạt động 2

// --- Component Nút Logout Tạm Thời ---
function LogoutButton() {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('token'); // Xóa token
    alert('Đã đăng xuất!');
    navigate('/login'); // Chuyển về trang login
  };
  // Chỉ hiển thị nút Logout nếu có token trong localStorage
  return localStorage.getItem('token') ? (
    <button onClick={handleLogout} style={{ position: 'absolute', top: 10, right: 10 }}>
      Đăng xuất
    </button>
  ) : null;
}
// ------------------------------------

function App() {
  return (
    // 3. Bọc toàn bộ ứng dụng trong BrowserRouter
    <BrowserRouter>
      {/* Bao gồm nút Logout tạm thời */}
      <LogoutButton />
      <div className="container">
        {/* 4. Định nghĩa các routes (đường dẫn) bên trong <Routes> */}
        <Routes>
          {/* Khi URL là /login, hiển thị LoginPage */}
          <Route path="/login" element={<LoginPage />} />
          {/* Khi URL là /register, hiển thị RegisterPage */}
          <Route path="/register" element={<RegisterPage />} />
          {/* Route cho ProfilePage (sẽ dùng ở Hoạt động 2) */}
          { <Route path="/profile" element={<ProfilePage />} /> }
          {/* Route mặc định (ví dụ: chuyển về trang login nếu không khớp path nào) */}
          <Route path="/" element={<LoginPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;