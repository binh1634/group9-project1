import React, { useState, useRef } from "react";
import api from "../../services/api";
import { useToast } from "../../contexts/ToastContext";
import "../../App.css";

export default function AvatarUpload({ currentAvatar, onUploaded }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentAvatar || null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();
  const { addToast } = useToast();

  const onFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleUpload = async () => {
    if (!file) return addToast('Vui lòng chọn ảnh', 'warning');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('avatar', file);
      await api.post('/profile/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' }});
      addToast('Ảnh đại diện đã được upload', 'success');
      if (onUploaded) onUploaded();
    } catch (err) {
      console.error('Upload avatar lỗi:', err);
      addToast(err.response?.data?.message || 'Upload thất bại', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{marginTop:12}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <div style={{width:72,height:72,borderRadius:999,overflow:'hidden',background:'#e6e6e6',display:'flex',alignItems:'center',justifyContent:'center'}}>
          {preview ? <img src={preview} alt="avatar" style={{width:'100%',height:'100%',objectFit:'cover'}} /> : <div style={{fontSize:24,color:'#6b7280'}}>{/* initials fallback */}</div>}
        </div>
        <div style={{display:'flex',gap:8}}>
          <input ref={inputRef} type="file" accept="image/*" onChange={onFileChange} style={{display:'none'}} />
          <button type="button" className="btn" onClick={() => inputRef.current.click()}>Chọn ảnh</button>
          <button type="button" className="btn" onClick={handleUpload} disabled={loading}>{loading ? 'Đang upload...' : 'Upload'}</button>
        </div>
      </div>
    </div>
  );
}
