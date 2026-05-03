import { useEffect, useState } from "react";
import { BookOpen, Users, ClipboardList } from "lucide-react";
import {
  getTeacherClassesFn,
  getAdminClassesFn,
  getTasksFn,
  getStoredUsers,
} from "../../context/authUtils";
import "./TeacherDashboard.css";

export default function TeacherDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [classes, setClasses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    const load = async () => {
      // Teacher sinflar
      const teacherClasses = await getTeacherClassesFn(currentUser?.id);
      // Admin sinflar
      const adminClasses = await getAdminClassesFn();
      const merged = [...teacherClasses];
      adminClasses.forEach((c) => {
        if (!merged.find((r) => String(r.id) === String(c.id))) merged.push(c);
      });
      setClasses(merged);

      // Topshiriqlar
      const t = await getTasksFn(currentUser?.id);
      setTasks(t);

      // O'quvchilar soni
      const fromClasses = merged.reduce(
        (acc, cls) => acc + (cls.students?.length || 0),
        0
      );
      const adminClassIds = adminClasses.map((c) => String(c.id));
      const allUsers = await getStoredUsers();
      const fromAdminClasses = allUsers.filter(
        (u) => u.role === "student" && adminClassIds.includes(String(u.classId))
      ).length;
      setTotalStudents(fromClasses + fromAdminClasses);
    };
    load();
  }, []);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Boshqaruv paneli</h1>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-icon blue">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="card-label">Sinflar</p>
            <h2>{classes.length}</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon green">
            <Users size={22} />
          </div>
          <div>
            <p className="card-label">O'quvchilar</p>
            <h2>{totalStudents}</h2>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-icon purple">
            <ClipboardList size={22} />
          </div>
          <div>
            <p className="card-label">Topshiriqlar</p>
            <h2>{tasks.length}</h2>
          </div>
        </div>
      </div>
    </div>
  );
}
