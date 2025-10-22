import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';


const API_URL = "http://192.168.1.18:3000/api";

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // Hàm lấy danh sách user
  const fetchUsers = async () => {
    try {
      console.log("Đang gọi API để lấy users...");
      // DÒNG 19: Đã sửa (Dùng dấu huyền `)
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
      console.log("Lấy users thành công:", response.data);
    } catch (error) {
      console.error("Lỗi khi lấy users:", error);
      alert("Không thể kết nối tới server. Hãy kiểm tra IP và đảm bảo server (Máy 1) đang chạy.");
    }
  };

  // Tự động gọi hàm fetchUsers khi component được tải
  useEffect(() => {
    fetchUsers();
  }, []);

  // Hàm xử lý khi nhấn nút Thêm
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newUser = { name, email };
      
      await axios.post(`${API_URL}/users`, newUser);
      fetchUsers(); // Tải lại danh sách
      setName('');
      setEmail('');
    } catch (error) {
      console.error("Lỗi khi tạo user:", error);
    }
  };

  return (
    <div className="App">
      <h1>Quản lý User (React App)</h1>

      <form onSubmit={handleSubmit}>
        <h3>Thêm User Mới</h3>
        <input
          type="text"
          placeholder="Tên"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Thêm</button>
      </form>

      <h3>Danh sách User </h3>
      <ul>
        {/* Chúng ta dùng user.id (từ mảng tạm) hoặc user._id (từ MongoDB sau này) */}
        {users.map(user => (
          <li key={user.id || user._id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;