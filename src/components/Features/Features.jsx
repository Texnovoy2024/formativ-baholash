import React from "react";
import "./Features.css";

import {
  HiOutlineAcademicCap,
  HiOutlineChatBubbleLeftRight,
  HiOutlineClipboardDocumentList,
  HiOutlineArrowTrendingUp,
  HiOutlineShieldCheck,
  HiOutlineStar
} from "react-icons/hi2";

const Features = () => {
  return (
    <section className="features">
      <div className="container">

        <div className="features-header">
          <span className="features-badge">Imkoniyatlar</span>
          <h2>Raqamli baholash ekotizimi</h2>
          <p>
            Testlar, loyihalar va o‘quvchi natijalarini boshqarish uchun
            yagona platforma
          </p>
        </div>

        <div className="features-grid">

          <div className="feature-card">
            <div className="icon-box blue">
              <HiOutlineAcademicCap />
            </div>
            <h3>Test yaratish va boshqarish</h3>
            <p>
              O‘qituvchi test savollarini qo‘shadi, vaqt va ball limitini belgilaydi
              hamda imtihonni bir tugma orqali e’lon qiladi.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon-box teal">
              <HiOutlineChatBubbleLeftRight />
            </div>
            <h3>Avtomatik natija va feedback</h3>
            <p>
              Test yakunlangach natijalar avtomatik hisoblanadi va o‘quvchiga
              individual tavsiyalar ko‘rsatiladi.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon-box purple">
              <HiOutlineClipboardDocumentList />
            </div>
            <h3>Loyiha baholash tizimi</h3>
            <p>
              O‘qituvchi loyiha topshiriqlarini baholaydi, ball va yozma
              fikr-mulohaza qoldiradi.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon-box yellow">
              <HiOutlineArrowTrendingUp />
            </div>
            <h3>Progress va analitika</h3>
            <p>
              O‘quvchi ballari grafigi, o‘rtacha natija va umumiy
              rivojlanish dinamikasi real vaqtda ko‘rsatiladi.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon-box teal">
              <HiOutlineShieldCheck />
            </div>
            <h3>Rol asosida kirish</h3>
            <p>
              O‘qituvchi va o‘quvchi uchun alohida boshqaruv panellari
              va xavfsiz ma’lumotlar boshqaruvi.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon-box yellow">
              <HiOutlineStar />
            </div>
            <h3>Qiyin savollar tahlili</h3>
            <p>
              O‘quvchilar eng ko‘p xato qilgan savollar aniqlanadi va
              keyingi dars rejasini shakllantirishga yordam beradi.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;