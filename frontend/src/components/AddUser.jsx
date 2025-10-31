import React, { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../contexts/ToastContext";

function AddUser() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) return addToast('Vui lòng điền đủ thông tin', 'warning');
    if (password.length < 6) return addToast('Mật khẩu phải có ít nhất 6 ký tự', 'warning');

    api.post("/users", { name, email, password, role })
      .then(() => {
        addToast('Tạo user thành công', 'success');
        navigate("/admin");
      })
      .catch(err => {
        console.error(err);
        addToast(err.response?.data?.message || 'Lỗi khi tạo user', 'error');
      });
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2 className="auth-title">Thêm người dùng mới</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Quyền</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div className="center">
            <button className="btn" type="submit">Thêm</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddUser;
