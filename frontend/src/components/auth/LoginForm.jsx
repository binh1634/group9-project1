import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import api from "../../services/api"; // axios có baseURL: http://localhost:5000/api

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      console.log('Login response:', res.data); // thêm log này
      const { accessToken, user } = res.data;

      if (!user || !user._id) {
        throw new Error('Invalid user data from server');
      }

      localStorage.setItem("token", accessToken);
      localStorage.setItem("userId", user._id);
      login(accessToken, user);  // đảm bảo user có đầy đủ thông tin

      addToast("Đăng nhập thành công!", 'success');
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/profile");
      }
    } catch (err) {
      console.error("❌ Lỗi đăng nhập:", err);
      addToast(err.response?.data?.message || "Đăng nhập thất bại", 'error');
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2 className="auth-title">Đăng nhập</h2>
        <p className="auth-sub">Đăng nhập để tiếp tục đến trang cá nhân</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <input type="password" placeholder="Mật khẩu" onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="center">
            <button className="btn" type="submit">Đăng nhập</button>
          </div>
        </form>

        <div style={{textAlign:'center', marginTop:12}}>
          <Link to="/forgot-password" style={{fontSize:13,color:'#4f46e5'}}>Quên mật khẩu?</Link>
        </div>
        {/* toasts handle messages */}
      </div>
    </div>
  );
}
