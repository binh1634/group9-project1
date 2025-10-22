import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// !!!!! THAY ĐỔI IP NÀY BẰNG IP CỦA MÁY 1 !!!!!
const API_URL = "http://192.168.1.18:3000/api"; // Giữ IP của bạn
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // State mới để biết chúng ta đang SỬA user nào (null = đang Thêm mới)
  const [editingUser, setEditingUser] = useState(null);

  // 1. Hàm lấy danh sách user (Không đổi)
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error("Lỗi khi lấy users:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Hàm xử lý khi nhấn nút Thêm hoặc Cập nhật
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userData = { name, email };

    if (editingUser) {
      // ------ LOGIC CẬP NHẬT (PUT) ------
      try {
        // Gọi API PUT, gửi kèm ID và data mới
        await axios.put(`${API_URL}/users/${editingUser._id}`, userData);
        setEditingUser(null); // Xong, quay lại mode "Thêm mới"
      } catch (error) {
        console.error("Lỗi khi cập nhật user:", error);
      }
    } else {
      // ------ LOGIC THÊM MỚI (POST) (Như cũ) ------
      try {
        await axios.post(`${API_URL}/users`, userData);
      } catch (error) {
        console.error("Lỗi khi tạo user:", error);
      }
    }
    fetchUsers(); // Tải lại danh sách
    // Reset form
    setName('');
    setEmail('');
  };

  // 3. Hàm xử lý Xóa
  const handleDelete = async (userId) => {
    // Hỏi xác nhận trước khi xóa
    if (window.confirm("Bạn có chắc muốn xóa user này?")) {
      try {
        await axios.delete(`${API_URL}/users/${userId}`);
        fetchUsers(); // Tải lại danh sách
      } catch (error) {
        console.error("Lỗi khi xóa user:", error);
      }
    }
  };

  // 4. Hàm xử lý khi nhấn nút "Sửa"
  const handleEdit = (user) => {
    setEditingUser(user); // Đánh dấu là đang sửa user này
    setName(user.name);     // Đưa data của user lên form
    setEmail(user.email);
  };

  return (
    <div className="App">
      <h1>Quản lý User (React App)</h1>

      <form onSubmit={handleSubmit}>
        {/* Tiêu đề form thay đổi tùy theo state */}
        <h3>{editingUser ? 'Đang sửa User' : 'Thêm User Mới'}</h3>
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
        {/* Nút bấm thay đổi tùy theo state */}
        <button type="submit">{editingUser ? 'Cập nhật' : 'Thêm'}</button>
        
        {/* Nút Hủy (chỉ hiện khi đang sửa) */}
        {editingUser && (
          <button type="button" onClick={() => {
            setEditingUser(null);
            setName('');
            setEmail('');
          }}>
            Hủy
          </button>
        )}
      </form>

      <h3>Danh sách User (Từ MongoDB)</h3>
      <ul>
        {/* Dùng _id của MongoDB */}
        {users.map(user => (
          <li key={user._id}>
            {user.name} - {user.email}
            {/* Thêm 2 nút Sửa / Xóa */}
            <button onClick={() => handleEdit(user)}>Sửa</button>
            <button onClick={() => handleDelete(user._id)}>Xóa</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;