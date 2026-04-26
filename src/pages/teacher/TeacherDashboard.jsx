import { useMemo } from "react";
import {
  BookOpen,
  Users,
  ClipboardList
} from "lucide-react";
import "./TeacherDashboard.css";

export default function TeacherDashboard() {

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const classes = currentUser?.classes || [];

  /* ================= STATS ================= */

  const totalStudents = useMemo(() => {
    return classes.reduce(
      (acc, cls) => acc + (cls.students?.length || 0),
      0
    );
  }, [classes]);

  const totalTasks = currentUser?.tasks?.length || 0;

  return (
    <div className="dashboard-container">

      <h1 className="dashboard-title">Boshqaruv paneli</h1>

      <div className="dashboard-grid">

        {/* CLASSES */}
        <div className="dashboard-card">
          <div className="card-icon blue">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="card-label">Sinflar</p>
            <h2>{classes.length}</h2>
          </div>
        </div>

        {/* STUDENTS */}
        <div className="dashboard-card">
          <div className="card-icon green">
            <Users size={22} />
          </div>
          <div>
            <p className="card-label">O‘quvchilar</p>
            <h2>{totalStudents}</h2>
          </div>
        </div>

        {/* TASKS */}
        <div className="dashboard-card">
          <div className="card-icon purple">
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="card-label">Topshiriqlar</p>
            <h2>{totalTasks}</h2>
          </div>
        </div>

      </div>

    </div>
  );
}