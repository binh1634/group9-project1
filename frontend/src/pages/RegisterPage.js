import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Thêm Link

// !!!!! THAY ĐỔI IP NÀY BẰNG IP CỦA MÁY 1 !!!!!
const API_URL = "http://172.23.15.226:3000/api";
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function RegisterPage() {
  // State để lưu giá trị nhập vào
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Hook để chuyển trang

  // Hàm xử lý khi nhấn nút Đăng Ký
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn trình duyệt reload
    try {
      // Gọi API đăng ký
      const { data } = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      console.log('Đăng ký thành công:', data);
      alert('Đăng ký thành công!');
      // Chuyển hướng người dùng đến trang đăng nhập
      navigate('/login');
    } catch (error) {
      // Hiển thị lỗi từ server (nếu có)
      console.error('Lỗi đăng ký:', error);
      alert(error.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại.');
    }
  };

  return (
    <div>
      <h2>Đăng Ký Tài Khoản</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Tên:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Đăng Ký</button>
      </form>
      {/* Link để chuyển sang trang đăng nhập */}
      <p>Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
    </div>
  );
}

export default RegisterPage;