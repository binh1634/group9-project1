import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

export default function HomePage(){
  return (
    <div className="home-hero">
      <div className="home-inner">
        <div className="hero-content">
          <h1 className="hero-title">Ứng dụng Quản lý Người dùng</h1>
          <p className="hero-sub">Quản lý tài khoản, vai trò và thông tin cá nhân - nhanh chóng và an toàn.</p>

          <div className="hero-ctas">
            <Link to="/login" className="btn">Đăng nhập</Link>
            <Link to="/register" className="btn secondary">Tạo tài khoản</Link>
          </div>
        </div>

        <div className="hero-features">
          <div className="feature-card">
            <h4>Quản lý người dùng</h4>
            <p>Thêm, sửa, xóa và phân quyền cho người dùng dễ dàng.</p>
          </div>
          <div className="feature-card">
            <h4>Bảo mật</h4>
            <p>Mật khẩu mã hoá, JWT để bảo vệ endpoint và phân quyền.</p>
          </div>
          <div className="feature-card">
            <h4>Dễ sử dụng</h4>
            <p>Giao diện trực quan, responsive cho mọi thiết bị.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
