import React, { useState } from "react";
import api from "../../services/api";
import { useToast } from "../../contexts/ToastContext";
import "../../App.css";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState(null);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return addToast('Vui lòng nhập email', 'warning');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      addToast(res.data.message || 'Nếu email tồn tại, một liên kết đã được gửi', 'success');
      if (res.data?.resetToken) setDevToken(res.data.resetToken);
      setEmail('');
    } catch (err) {
      console.error('Lỗi forgot-password:', err);
      addToast(err.response?.data?.message || 'Gửi yêu cầu thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2 className="auth-title">Quên mật khẩu</h2>
        <p className="auth-sub">Nhập email để nhận liên kết đặt lại mật khẩu</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Email của bạn" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="center">
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Đang gửi...' : 'Gửi liên kết'}</button>
          </div>
        </form>
        {devToken && (
          <div style={{marginTop:12}}>
            <p style={{fontSize:13}}>DEV reset token (dùng để test reset):</p>
            <pre style={{background:'#f3f4f6',padding:8,borderRadius:6}}>{devToken}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
