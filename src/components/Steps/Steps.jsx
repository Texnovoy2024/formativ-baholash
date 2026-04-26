import React from "react";
import "./Steps.css";

const Steps = () => {
  return (
    <section className="steps">
      <div className="container">

        <div className="steps-header">
          <span className="steps-badge">Qanday ishlaydi</span>
          <h2>4 bosqichda raqamli baholash</h2>
          <p>Bir necha daqiqada test yarating va natijalarni kuzating</p>
        </div>

        <div className="steps-grid">

          <div className="step-card">
            <div className="step-number">01</div>
            <h3>Ro‘yxatdan o‘ting</h3>
            <p>
              O‘qituvchi yoki o‘quvchi sifatida tizimga kiring va
              shaxsiy boshqaruv paneliga ega bo‘ling.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <h3>Test yoki loyiha yarating</h3>
            <p>
              Savollar qo‘shing, ball va vaqt limitini belgilang
              hamda topshiriqni e’lon qiling.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <h3>O‘quvchilar topshiradi</h3>
            <p>
              O‘quvchilar testni bajaradi yoki loyiha yuklaydi.
              Natijalar avtomatik saqlanadi.
            </p>
          </div>

          <div className="step-card">
            <div className="step-number">04</div>
            <h3>Natijalarni tahlil qiling</h3>
            <p>
              O‘rtacha ball, progress grafigi va eng qiyin savollarni
              ko‘rib, keyingi dars rejasini shakllantiring.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default Steps;