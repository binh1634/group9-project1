import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { useToast } from "../../contexts/ToastContext";
import { useLocation, useNavigate } from "react-router-dom";  // 👈 Thêm useNavigate
import "../../App.css";

export default function ResetPasswordForm() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate(); // 👈 Khởi tạo navigate

  // 🔹 Lấy token từ URL (vd: /reset-password?token=abc123)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const t = params.get("token");
    if (t) setToken(t);
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token || !password) {
      return addToast("Vui lòng nhập token và mật khẩu mới", "warning");
    }
    if (password !== confirmPassword) {
      return addToast("Mật khẩu nhập lại không khớp", "error");
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      addToast("Đổi mật khẩu thành công! Hãy đăng nhập lại.", "success");

      // ✅ Sau khi đổi mật khẩu thành công, quay lại trang đăng nhập
      setTimeout(() => {
        navigate("/login");
      }, 1500); // đợi 1.5 giây cho toast hiển thị xong
    } catch (err) {
      console.error("❌ Reset error:", err);
      addToast(err.response?.data?.message || "Đổi mật khẩu thất bại", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2 className="auth-title">Đặt lại mật khẩu</h2>
        <p className="auth-sub">
          Dán token nhận được hoặc dùng link từ email, nhập mật khẩu mới
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Reset token</label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Mật khẩu mới</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Nhập lại mật khẩu</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="center">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? "Đang gửi..." : "Đổi mật khẩu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
