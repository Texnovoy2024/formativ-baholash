import React from "react";
import "./CTA.css";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="cta">

      <div className="container cta-wrapper">

        <h2>Formativ baholashni bugunoq joriy qiling</h2>

        <p>
          Informatika fanida zamonaviy baholash tizimini yo‘lga qo‘ying.
          O‘quvchilar natijasini real vaqtda kuzating, tahlil qiling va
          samarali teskari aloqa bering.
        </p>

        <div className="cta-buttons">

          <button
            className="cta-primary"
            onClick={() => navigate("/register")}
          >
            Ro'yhatdan o'tish →
          </button>

          <button
            className="cta-outline"
            onClick={() => navigate("/metodika")}
          >
            Metodik asos bilan tanishish
          </button>

        </div>

      </div>
    </section>
  );
};

export default CTA;