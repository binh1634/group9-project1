import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Thêm Link

// !!!!! THAY ĐỔI IP NÀY BẰNG IP CỦA MÁY 1 !!!!!
const API_URL = "http://172.23.15.226:3000/api";
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Gọi API đăng nhập
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      console.log('Đăng nhập thành công:', data);

      // ----- LƯU TOKEN VÀO LOCAL STORAGE -----
      localStorage.setItem('token', data.token);
      // ----------------------------------------

      alert('Đăng nhập thành công!');
      // Chuyển hướng đến trang profile
      navigate('/profile'); // Chúng ta sẽ tạo trang này ở HĐ2
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      alert(error.response?.data?.message || 'Đăng nhập thất bại, vui lòng thử lại.');
    }
  };

  return (
    <div>
      <h2>Đăng Nhập</h2>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Đăng Nhập</button>
      </form>
      {/* Link để chuyển sang trang đăng ký */}
      <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
    </div>
  );
}

export default LoginPage;