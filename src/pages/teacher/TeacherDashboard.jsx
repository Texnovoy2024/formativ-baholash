import { useMemo } from "react";
import {
  BookOpen,
  Users,
  ClipboardList
} from "lucide-react";
import "./TeacherDashboard.css";

export default function TeacherDashboard() {

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Teacher o'z sinflari + admin yaratgan sinflar
  const classes = (() => {
    const result = []
    try {
      const tc = JSON.parse(localStorage.getItem(`classes_${currentUser?.id}`)) || []
      tc.forEach(c => result.push(c))
    } catch { /* skip */ }
    try {
      const adminClasses = JSON.parse(localStorage.getItem('admin_classes')) || []
      adminClasses.forEach(c => {
        if (!result.find(r => String(r.id) === String(c.id))) result.push(c)
      })
    } catch { /* skip */ }
    return result
  })();
  const tasks = (() => {
    try { return JSON.parse(localStorage.getItem(`tasks_${currentUser?.id}`)) || [] } catch { return [] }
  })();

  /* ================= STATS ================= */

  const totalStudents = useMemo(() => {
    // Teacher sinflaridagi o'quvchilar (students massivi orqali)
    const fromClasses = classes.reduce(
      (acc, cls) => acc + (cls.students?.length || 0), 0
    )
    // Admin sinflariga biriktirilgan o'quvchilar (users.classId orqali)
    const adminClassIds = (() => {
      try {
        return (JSON.parse(localStorage.getItem('admin_classes')) || []).map(c => String(c.id))
      } catch { return [] }
    })()
    const fromAdminClasses = (() => {
      try {
        const users = JSON.parse(localStorage.getItem('users')) || []
        return users.filter(u => u.role === 'student' && adminClassIds.includes(String(u.classId))).length
      } catch { return 0 }
    })()
    return fromClasses + fromAdminClasses
  }, [classes]);

  const totalTasks = tasks.length || 0;

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