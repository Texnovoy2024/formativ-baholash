import React, { useState } from "react";
import "./Login.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  HiOutlineMail,
  HiOutlineLockClosed,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineAcademicCap
} from "react-icons/hi";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setErrorMsg("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true)

    const result = await login(formData.email, formData.password);
    setIsLoading(false)

    if (!result.success) {
      setErrorMsg(result.message);
      return;
    }

    // Rol asosida yo'naltirish
    if (result.role === "admin" || result.role === "teacher") {
      navigate("/teacher");
    } else {
      navigate("/student");
    }
  };

  return (
    <div className="login-page">

      <div className="login-header">
        <div className="login-logo">
          <HiOutlineAcademicCap />
        </div>
        <h1>Tizimga kirish</h1>
        <p>Formativ Baholash platformasiga xush kelibsiz</p>
      </div>

      <form className="login-card" onSubmit={handleLogin}>

        <div className="form-group">
          <label>Email manzil</label>
          <div className="input-box">
            <HiOutlineMail />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Parol</label>
          <div className="input-box">
            <HiOutlineLockClosed />
            <input
              type={showPass ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              required
            />
            <span
              className="eye"
              onClick={() => setShowPass(!showPass)}
            >
              {showPass
                ? <HiOutlineEyeOff />
                : <HiOutlineEye />}
            </span>
          </div>
        </div>

        {/* Xato xabari (Talab 4.4) */}
        {errorMsg && (
          <p className="login-error">{errorMsg}</p>
        )}

        <button
          type="submit"
          className="login-btn"
          disabled={isLoading}
        >
          {isLoading ? 'Yuklanmoqda...' : 'Kirish'}
        </button>

        {/* "Ro'yxatdan o'ting" havolasi olib tashlandi (Talab 3.2) */}

      </form>

      <div
        className="back-link"
        onClick={() => navigate("/")}
      >
        ← Bosh sahifaga qaytish
      </div>

    </div>
  );
};

export default Login;
