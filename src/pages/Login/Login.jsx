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

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

const handleLogin = (e) => {
  e.preventDefault();

  const result = login(formData.email, formData.password);

  if (!result.success) {
    alert(result.message);
    return;
  }

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

        <button
          type="submit"
          className="login-btn"
        >
          Kirish
        </button>

        <p className="switch-text">
          Hisobingiz yo'qmi?
          <span onClick={() => navigate("/register")}>
            Ro'yxatdan o'ting
          </span>
        </p>

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