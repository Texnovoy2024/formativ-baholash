import React, { useEffect, useState } from "react";
import "./Navbar.css";

import { HiOutlineAcademicCap } from "react-icons/hi";
import { Link, NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {

  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 🔥 Login holatini tekshirish
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    setUser(savedUser);
  }, []);

  // 🔥 Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-wrapper">

        {/* LEFT */}
        <div className="navbar-left" onClick={() => navigate("/")} style={{cursor:"pointer"}}>

          <div className="logo-box">
            <HiOutlineAcademicCap className="logo-icon" />
          </div>

          <div className="logo-text">
            <h3>Formativ Baholash</h3>
            <span>Informatika fani</span>
          </div>

        </div>

        {/* CENTER */}
        <nav className="navbar-center">
          <NavLink to="/">Bosh sahifa</NavLink>
          <NavLink to="/metodika">Metodika</NavLink>
          <NavLink to="/about">Loyiha haqida</NavLink>
        </nav>

        {/* RIGHT */}
        <div className="navbar-right">

          {user ? (
            <>
              <button
                className="login-btn"
                onClick={() => navigate(`/${user.role}`)}
              >
                Boshqaruv paneli
              </button>

              <button
                className="register-btn"
                onClick={handleLogout}
              >
                Chiqish
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="login-btn">
                Kirish
              </Link>

              <Link to="/register" className="register-btn">
                Ro‘yxatdan o‘tish
              </Link>
            </>
          )}

        </div>

      </div>
    </header>
  );
};

export default Navbar;