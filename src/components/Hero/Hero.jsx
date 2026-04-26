import React from "react";
import "./Hero.css";
import heroImg from "../../assets/images/hero.png";

import { useNavigate } from "react-router-dom";

import {
  HiOutlineLightBulb,
  HiOutlineCheckCircle,
  HiOutlineChevronDown
} from "react-icons/hi";

const Hero = () => {

  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="container hero-wrapper">

        {/* LEFT */}
        <div className="hero-left">

          {/* BADGE */}
          <div className="hero-badge">
            <HiOutlineLightBulb className="badge-icon" />
            Test va loyiha asosidagi raqamli baholash platformasi
          </div>

          <h1 className="hero-title">
            Formativ baholashni <br />
            <span>avtomatlashtiring</span>
          </h1>

          <p className="hero-desc">
            O‘qituvchilar uchun test va loyiha yaratish, 
            o‘quvchilar uchun esa real vaqt natijalarini 
            va rivojlanish statistikasini kuzatish imkoniyati.
            Qaysi mavzular qiyin ekanini aniqlang va dars jarayonini
            aniq ma’lumotlar asosida boshqaring.
          </p>

          <div className="hero-buttons">

            <button
              className="btn-primary"
              onClick={() => navigate("/register")}
            >
              Platformani boshlash →
            </button>

            <button 
              className="btn-outline" 
              onClick={() => navigate("/metodika")}
            >
              Qanday ishlaydi →
            </button>

          </div>

          {/* FEATURES */}
          <div className="hero-features">

            <span>
              <HiOutlineCheckCircle />
              Test va loyiha topshiriqlari
            </span>

            <span>
              <HiOutlineCheckCircle />
              Avtomatik baholash tizimi
            </span>

            <span>
              <HiOutlineCheckCircle />
              Qiyin savollar tahlili
            </span>

            <span>
              <HiOutlineCheckCircle />
              Progress va reyting kuzatuvi
            </span>

          </div>
        </div>

        {/* RIGHT */}
        <div className="hero-right">
          <img src={heroImg} alt="hero" className="hero-img" />
        </div>

      </div>

      {/* SCROLL */}
      <div className="scroll-indicator">
        <HiOutlineChevronDown />
      </div>
    </section>
  );
};

export default Hero;