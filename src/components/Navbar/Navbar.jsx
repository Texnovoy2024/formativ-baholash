import React, { useEffect, useState } from "react";
import "./Navbar.css";

import { HiOutlineAcademicCap, HiMenu, HiX } from "react-icons/hi";
import { Link, NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ currentUser bilan ishlaymiz
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("currentUser"));
    setUser(savedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-wrapper">

        {/* LEFT */}
        <div
          className="navbar-left"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <div className="logo-box">
            <HiOutlineAcademicCap className="logo-icon" />
          </div>

          <div className="logo-text">
            <h3>Formativ Baholash</h3>
            <span>Informatika fani</span>
          </div>
        </div>

        {/* CENTER (DESKTOP) */}
        <nav className="navbar-center">
          <NavLink to="/">Bosh sahifa</NavLink>
          <NavLink to="/metodika">Metodika</NavLink>
          <NavLink to="/about">Loyiha haqida</NavLink>
        </nav>

        {/* RIGHT (DESKTOP) */}
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

        {/* 🔥 MOBILE ICON */}
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <HiX /> : <HiMenu />}
        </div>
      </div>

      {/* 🔥 MOBILE MENU */}
      {menuOpen && (
        <div className="mobile-menu">
          <NavLink to="/" onClick={() => setMenuOpen(false)}>Bosh sahifa</NavLink>
          <NavLink to="/metodika" onClick={() => setMenuOpen(false)}>Metodika</NavLink>
          <NavLink to="/about" onClick={() => setMenuOpen(false)}>Loyiha haqida</NavLink>

          {user ? (
            <>
              <button onClick={() => {
                navigate(`/${user.role}`);
                setMenuOpen(false);
              }}>
                Boshqaruv paneli
              </button>

              <button onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}>
                Chiqish
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)}>Kirish</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}>Ro‘yxatdan o‘tish</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;