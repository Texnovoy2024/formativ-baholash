import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Eye } from "lucide-react";
import "./ClassesPage.css";

const ClassesPage = () => {
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const storageKey = `classes_${currentUser?.id}`;

  const [classes, setClasses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });
  const [newClass, setNewClass] = useState("");

  const handleAddClass = () => {
    if (!newClass.trim()) return;

    const updatedClasses = [
      ...classes,
      {
        id: Date.now(),
        name: newClass,
        students: [],
        tasks: []
      }
    ];

    setClasses(updatedClasses);
    localStorage.setItem(storageKey, JSON.stringify(updatedClasses));
    setNewClass("");
  };

  return (
    <div className="classes-page">
      <h1>Sinflar</h1>

      <div className="add-class">
        <input
          type="text"
          placeholder="Sinf nomi"
          value={newClass}
          onChange={(e) => setNewClass(e.target.value)}
        />
        <button onClick={handleAddClass}>Qo‘shish</button>
      </div>

      <div className="class-list">
        {classes.length === 0 ? (
          <p>Hali sinf yaratmadingiz.</p>
        ) : (
          classes.map((cls) => (
            <div key={cls.id} className="class-card">

              <div className="class-card-header">
                <h3>{cls.name}</h3>
              </div>

              <div className="class-meta">
                <div>
                  <Users size={16} />
                  {cls.students?.length || 0} o‘quvchi
                </div>
              </div>

              <button
                className="view-btn"
                onClick={() =>
                  navigate(`/teacher/classes/${cls.id}`)
                }
              >
                <Eye size={16} />
                Ko‘rish
              </button>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClassesPage;