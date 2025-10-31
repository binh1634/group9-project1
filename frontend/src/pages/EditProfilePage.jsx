// src/components/EditProfileForm.jsx
import React, { useState } from 'react';
import API from '../services/api';

export default function EditProfileForm({ user, onUpdated }) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, email };
      if (avatarUrl) payload.avatarUrl = avatarUrl;
      if (newPassword) {
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      await API.put('/profile', payload);
      alert('Cập nhật thành công');
      onUpdated();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Lỗi');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name</label><br/>
        <input value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label>Email</label><br/>
        <input value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div>
        <label>Avatar URL</label><br/>
        <input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} />
      </div>
      <hr />
      <h4>Đổi mật khẩu</h4>
      <div>
        <label>Current Password</label><br/>
        <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
      </div>
      <div>
        <label>New Password</label><br/>
        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
      </div>

      <button type="submit">Lưu thay đổi</button>
    </form>
  );
}
