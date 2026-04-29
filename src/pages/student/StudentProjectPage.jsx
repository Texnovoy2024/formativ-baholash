import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Clock, FileText, CheckCircle, FolderKanban } from "lucide-react"

export default function StudentProjectPage() {
  const [projects, setProjects] = useState([])
  const navigate = useNavigate()
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {}

  useEffect(() => {
    const allProjects = JSON.parse(localStorage.getItem("allProjects")) || []
    const studentClassId = currentUser?.classId

    const filtered = allProjects.filter(p => {
      if (!p.isPublished) return false
      if (!studentClassId) return true
      return !p.classId || String(p.classId) === String(studentClassId)
    })
    setProjects(filtered)
  }, [])

  const projectSubmissions = JSON.parse(localStorage.getItem("projectSubmissions")) || []

  if (projects.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
        <FolderKanban size={48} style={{ margin: "0 auto 12px" }} />
        <p>Hozircha loyihalar mavjud emas</p>
      </div>
    )
  }

  return (
    <div style={{ padding: "32px 24px", maxWidth: 900, margin: "auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Loyihalar</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {projects.map(project => {
          const isSubmitted = projectSubmissions.some(
            s => s.projectId === project.id && String(s.studentId) === String(currentUser.id)
          )
          return (
            <div key={project.id} style={{ background: "white", borderRadius: 16, padding: 20, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
              <h3 style={{ fontWeight: 600, marginBottom: 12 }}>{project.title}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={14} /> Muddati: {project.deadline}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <FileText size={14} /> Ball: {project.maxScore}
                </span>
              </div>
              {isSubmitted && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#dcfce7", color: "#15803d", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                  <CheckCircle size={13} /> Topshirilgan
                </span>
              )}
              <button
                onClick={() => navigate(`/student/projects/${project.id}`)}
                style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: isSubmitted ? "#f1f5f9" : "linear-gradient(90deg,#3b82f6,#2563eb)", color: isSubmitted ? "#374151" : "white", fontWeight: 600, cursor: "pointer" }}
              >
                {isSubmitted ? "Ko'rish" : "Boshlash"}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}