// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import ProfilePage from "./components/profile/ProfilePage";
import ForgotPasswordForm from "./components/auth/ForgotPasswordForm";
import ResetPasswordForm from "./components/auth/ResetPasswordForm";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import AdminUserList from "./components/admin/AdminUserList";
import HomePage from "./pages/HomePage";
import AddUser from "./components/AddUser";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* 🏠 Trang chính */}
          <Route path="/" element={<HomePage />} />


          {/* 🔐 Đăng nhập */}
          <Route path="/login" element={<LoginForm />} />

          {/* 🔑 Quên mật khẩu */}
          <Route path="/forgot-password" element={<ForgotPasswordForm />} />
          <Route path="/reset-password" element={<ResetPasswordForm />} />

          {/* 📝 Đăng ký */}
          <Route path="/register" element={<RegisterForm />} />

          {/* 👤 Hồ sơ cá nhân */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* ⚙️ Quản trị (chỉ dành cho admin) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminUserList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/add"
            element={
              <ProtectedRoute requiredRole="admin">
                <AddUser />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
