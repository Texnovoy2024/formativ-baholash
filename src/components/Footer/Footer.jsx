import React from "react";
import "./Footer.css";
import { useNavigate } from "react-router-dom";  
import {
  HiOutlineLocationMarker,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineAcademicCap
} from "react-icons/hi";

import {
  FaFacebookF,
  FaTelegramPlane,
  FaYoutube
} from "react-icons/fa";

const Footer = () => {
  const navigate = useNavigate();  // 🔥
  return (
    <footer className="footer">

      <div className="container footer-wrapper">

        {/* LEFT */}
        <div className="footer-about">

          <div className="footer-logo">

            <div className="logo-box">
              <HiOutlineAcademicCap className="logo-icon" />
            </div>

            <div className="logo-text">
              <h3>Formativ Baholash</h3>
              <span>Informatika fani</span>
            </div>

          </div>

          <p>
            Umumta'lim maktablarida "Informatika va axborot
            texnologiyalari" fanida formativ baholash tizimini
            joriy etish metodikasini ishlab chiqish loyihasi.
          </p>

          <div className="footer-socials">
            <a href="#"><FaFacebookF /></a>
            <a href="#"><FaYoutube /></a>
            <a href="#"><FaTelegramPlane /></a>
          </div>

        </div>

        {/* LINKS */}
        <div className="footer-links">

          <h4>Sahifalar</h4>

          <a onClick={() => navigate("/")}>Bosh sahifa</a>
          <a onClick={() => navigate("/metodika")}>Metodika</a>
          <a onClick={() => navigate("/about")}>Loyiha haqida</a>
          <a onClick={() => navigate("/login")}>Tizimga kirish</a>
        </div>

        {/* CONTACT */}
        <div className="footer-contact">

          <h4>Aloqa</h4>

          <p>
            <HiOutlineLocationMarker />
            O'zbekiston, Farg'ona shahri
          </p>

          <p>
            <HiOutlineMail />
            info@formativ.uz
          </p>

          <p>
            <HiOutlinePhone />
            +998 (71) 123-45-67
          </p>

        </div>

      </div>

      {/* BOTTOM */}
      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>
            © 2025 Formativ Baholash. Barcha huquqlar himoyalangan.
          </p>
          <span>Ilmiy-metodologik loyiha</span>
        </div>
      </div>

    </footer>
  );
};

export default Footer;