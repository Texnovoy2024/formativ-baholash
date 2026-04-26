import React from "react";
import "./Methodology.css";
import { useNavigate } from "react-router-dom";   // 🔥

import {
  HiOutlineBookOpen,
  HiOutlineChevronRight,
  HiOutlineCheckCircle,
  HiOutlineUserGroup
} from "react-icons/hi";

const Methodology = () => {
    const navigate = useNavigate();  // 🔥
  
  return (
    <section className="methodology">

      <div className="container methodology-wrapper">

        {/* LEFT */}
        <div className="methodology-left">

          <span className="method-badge">Metodika</span>

          <h2>
            Ilmiy asoslangan <br /> metodika
          </h2>

          <p className="method-desc">
            Formativ baholash nazariyasi va amaliyotini chuqur o'rganing.
            Informatika faniga moslashtirilgan maxsus metodika va vositalar to'plami.
          </p>

          {/* LIST */}

          <div className="method-list">

            {[
              "Formativ baholash asoslari",
              "Rubrika va deskriptorlar",
              "Informatika fanida amaliyot",
              "Onlayn baholash tizimi"
            ].map((item, i) => (
              <div key={i} className="method-item">

                <div className="method-item-left">
                  <HiOutlineBookOpen />
                  <div>
                    <h4>{item}</h4>
                    <span>Nazariya</span>
                  </div>
                </div>

                <HiOutlineChevronRight />

              </div>
            ))}

          </div>

          <button className="method-btn" onClick={() => navigate("/metodika")}>
            To'liq metodikani ko'rish →
          </button>

        </div>

        {/* RIGHT */}
        <div className="methodology-right">

          {/* TEACHER */}
          <div className="method-card teacher">

            <div className="method-card-header">
              <HiOutlineBookOpen />
              <div>
                <h3>O'qituvchi</h3>
                <span>Teacher panel</span>
              </div>
            </div>

            <ul>
              <li><HiOutlineCheckCircle /> Sinflarni boshqarish</li>
              <li><HiOutlineCheckCircle /> Topshiriqlar yaratish</li>
              <li><HiOutlineCheckCircle /> Ishlarni baholash</li>
              <li><HiOutlineCheckCircle /> Hisobotlar ko'rish</li>
            </ul>

            <button onClick={() => navigate("/register")}>O'qituvchi sifatida kirish</button>

          </div>

          {/* STUDENT */}
          <div className="method-card student">

            <div className="method-card-header">
              <HiOutlineUserGroup />
              <div>
                <h3>O'quvchi</h3>
                <span>Student panel</span>
              </div>
            </div>

            <ul>
              <li><HiOutlineCheckCircle /> Topshiriqlarni bajarish</li>
              <li><HiOutlineCheckCircle /> Natijalarni ko'rish</li>
              <li><HiOutlineCheckCircle /> Teskari aloqa olish</li>
              <li><HiOutlineCheckCircle /> Taraqqiyotni kuzatish</li>
            </ul>

            <button onClick={() => navigate("/register")}>O'quvchi sifatida kirish</button>

          </div>

        </div>

      </div>
    </section>
  );
};

export default Methodology;