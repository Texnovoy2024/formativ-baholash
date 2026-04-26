import React, { useState } from "react";
import "./Metodika.css";
import { topics } from "./data";
import {
  HiOutlineBookOpen,
  HiOutlineMagnifyingGlass
} from "react-icons/hi2";

const Metodika = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [search, setSearch] = useState("");

  const activeTopic = topics[activeIndex];

  const filteredTopics = topics.filter(t =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = ["ASOSLAR", "AMALIYOT", "METODIKA"];

  return (
    <div className="metodika-page">

      {/* HERO */}
      <section className="metodika-hero">
        <div className="container">
          <div className="hero-badge">
            Ilmiy-metodologik qo‘llanma
          </div>
          <h1>Metodika</h1>
          <p>
            Formativ baholashni informatika fanida joriy etish
            bo‘yicha metodologik qo‘llanma
          </p>
        </div>
      </section>

      {/* CONTENT */}
      <section className="metodika-content container">

        {/* SIDEBAR */}
        <aside className="sidebar">

          {/* SEARCH */}
          <div className="search-box">
            <HiOutlineMagnifyingGlass />
            <input
              type="text"
              placeholder="Qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* GROUPED TOPICS */}
          {grouped.map(group => (
            <div key={group}>
              <h4>{group}</h4>

              {filteredTopics
                .filter(t => t.category === group)
                .map((t) => {
                  const realIndex = topics.findIndex(
                    item => item.id === t.id
                  );

                  return (
                    <div
                      key={t.id}
                      className={`item ${
                        realIndex === activeIndex ? "active" : ""
                      }`}
                      onClick={() => setActiveIndex(realIndex)}
                    >
                      <HiOutlineBookOpen />
                      <span>{t.title}</span>
                    </div>
                  );
                })}
            </div>
          ))}

        </aside>

        {/* ARTICLE */}
        <article className="article">

          <div className="breadcrumb">
            Metodika › {activeTopic.category} ›
            <span> {activeTopic.title}</span>
          </div>

          <h2>{activeTopic.title}</h2>
          <p>{activeTopic.content}</p>

          <div className="topic-nav">
            {activeIndex !== 0 && (
              <button onClick={() => setActiveIndex(activeIndex - 1)}>
                ← Oldingi mavzu
              </button>
            )}

            {activeIndex !== topics.length - 1 && (
              <button onClick={() => setActiveIndex(activeIndex + 1)}>
                Keyingi mavzu →
              </button>
            )}
          </div>

        </article>

      </section>
    </div>
  );
};

export default Metodika;