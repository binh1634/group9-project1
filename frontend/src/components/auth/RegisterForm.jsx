import React, { useState } from "react";
import api from "../../services/api";
import { useToast } from "../../contexts/ToastContext";
import { useNavigate } from "react-router-dom";

const RegisterForm = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.password || form.password.length < 6) {
      setMessage("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (form.password !== confirm) {
      setMessage("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      await api.post("/auth/register", form);
      addToast("Đăng ký thành công!", 'success');
      navigate("/login");
    } catch (err) {
      console.error(err);
      addToast(err.response?.data?.message || "Lỗi khi đăng ký", 'error');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2 className="auth-title">📝 Đăng ký</h2>
        <p className="auth-sub">Tạo tài khoản mới để truy cập các tính năng</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tên</label>
            <input type="text" placeholder="Tên" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input type="password" placeholder="Mật khẩu" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>

          <div className="form-group">
            <label>Xác nhận mật khẩu</label>
            <input type="password" placeholder="Nhập lại mật khẩu" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>

          {message && <p className="status-message">{message}</p>}

          <div className="center">
            <button className="btn" type="submit">Đăng ký</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
