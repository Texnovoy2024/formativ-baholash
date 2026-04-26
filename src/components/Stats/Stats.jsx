import React from "react";
import "./Stats.css";

import {
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineBookOpen,
  HiOutlineStar
} from "react-icons/hi";

const Stats = () => {
  return (
    <section className="home-stats">
      <div className="container home-stats-wrapper">

        {/* ITEM */}
        <div className="home-stat-card">
          <div className="home-stat-icon">
            <HiOutlineAcademicCap />
          </div>
          <h2>500+</h2>
          <p>Maktablar</p>
        </div>

        <div className="home-stat-card">
          <div className="home-stat-icon">
            <HiOutlineUsers />
          </div>
          <h2>12,000+</h2>
          <p>O‘quvchilar</p>
        </div>

        <div className="home-stat-card">
          <div className="home-stat-icon">
            <HiOutlineBookOpen />
          </div>
          <h2>850+</h2>
          <p>O‘qituvchilar</p>
        </div>

        <div className="home-stat-card">
          <div className="home-stat-icon">
            <HiOutlineStar />
          </div>
          <h2>98%</h2>
          <p>Muvaffaqiyat darajasi</p>
        </div>

      </div>
    </section>
  );
};

export default Stats;