import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Save,
  CalendarDays,
  Award,
  FileText,
  CheckCircle,
  Send
} from "lucide-react"
import "./ProjectBuilderPage.css"

export default function ProjectBuilderPage() {
  const { taskId } = useParams()
  const navigate = useNavigate()

  const storedUser = localStorage.getItem("currentUser")
  const currentUser = storedUser ? JSON.parse(storedUser) : null
  const tasksKey = `tasks_${currentUser?.id}`

  const tasks = (() => {
    try { return JSON.parse(localStorage.getItem(tasksKey)) || [] } catch { return [] }
  })()
  const task = tasks.find(t => String(t.id) === String(taskId))

  const [deadline, setDeadline] = useState("")
  const [maxScore, setMaxScore] = useState("")
  const [requirements, setRequirements] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [isPublished, setIsPublished] = useState(false)

  /* ================= SAFE DATE FORMAT FUNCTION ================= */
  const formatToInputDate = (dateValue) => {
    if (!dateValue) return ""

    const dateObj = new Date(dateValue)
    if (isNaN(dateObj)) return ""

    return dateObj.toISOString().split("T")[0]
  }

  /* ================= LOAD EXISTING DATA ================= */
  useEffect(() => {
    if (!task) return

    if (task.projectData) {
      setDeadline(formatToInputDate(task.projectData.deadline))
      setMaxScore(task.projectData.maxScore || "")
      setRequirements(task.projectData.requirements || "")
      setIsPublished(task.projectData.isPublished || false)
    }
  }, [task])

  if (!currentUser) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Foydalanuvchi topilmadi</h2>
        <button onClick={() => navigate("/login")}>Login</button>
      </div>
    )
  }

  if (!task) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Project topilmadi</h2>
        <button onClick={() => navigate("/teacher/tasks")}>
          Orqaga qaytish
        </button>
      </div>
    )
  }

  /* ================= SAVE ================= */
  const handleSave = () => {
    const updatedTasks = tasks.map(t =>
      String(t.id) === String(taskId)
        ? {
            ...t,
            projectData: {
              ...t.projectData,
              deadline,
              maxScore,
              requirements,
              isPublished,
              updatedAt: new Date().toISOString(),
            },
          }
        : t
    )

    const updatedUser = { ...currentUser, tasks: updatedTasks }
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    localStorage.setItem(tasksKey, JSON.stringify(updatedTasks))

    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  /* ================= PUBLISH ================= */
  const handlePublish = () => {
    if (!deadline || !maxScore) return

    const updatedTasks = tasks.map(t =>
      String(t.id) === String(taskId)
        ? {
            ...t,
            projectData: {
              ...t.projectData,
              deadline,
              maxScore,
              requirements,
              isPublished: true,
              publishedAt: new Date().toISOString(),
            },
          }
        : t
    )

    const updatedUser = { ...currentUser, tasks: updatedTasks }
    localStorage.setItem("currentUser", JSON.stringify(updatedUser))
    localStorage.setItem(tasksKey, JSON.stringify(updatedTasks))

    /* GLOBAL PROJECT LIST UPDATE */
    const allProjects =
      JSON.parse(localStorage.getItem("allProjects")) || []

    const existingIndex = allProjects.findIndex(
      p => String(p.id) === String(taskId)
    )

    const projectData = {
      id: task.id,
      title: task.title,
      classId: task.classId,
      deadline,
      maxScore,
      requirements,
      isPublished: true,
    }

    if (existingIndex !== -1) {
      allProjects[existingIndex] = projectData
    } else {
      allProjects.push(projectData)
    }

    localStorage.setItem(
      "allProjects",
      JSON.stringify(allProjects)
    )

    setIsPublished(true)
    navigate('/teacher/tasks')
  }

  return (
    <div className="tpb-container">
      <h1 className="tpb-title">Loyiha sozlamalari</h1>

      <div className="tpb-card">

        {/* REQUIREMENTS */}
        <div className="tpb-input-group">
          <FileText size={18} />
          <textarea
            placeholder="Loyiha talablari..."
            value={requirements}
            onChange={e => setRequirements(e.target.value)}
          />
        </div>

        {/* DEADLINE */}
        <div className="tpb-input-group">
          <CalendarDays size={18} />
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* MAX SCORE */}
        <div className="tpb-input-group">
          <Award size={18} />
          <input
            type="number"
            placeholder="Maksimal ball"
            value={maxScore}
            onChange={e => setMaxScore(e.target.value)}
          />
        </div>

        {/* STATUS */}
        <div className="tpb-status">
          {isPublished ? (
            <span className="tpb-published">
              <CheckCircle size={16} />
              E’lon qilingan
            </span>
          ) : (
            <span className="tpb-draft">Qoralama</span>
          )}
        </div>

        {/* ACTIONS */}
        <div className="tpb-actions">
          <button onClick={handleSave} className="tpb-save">
            <Save size={16} />
            Saqlash
          </button>

          <button
            onClick={handlePublish}
            className="tpb-publish"
            disabled={!deadline || !maxScore}
          >
            <Send size={16} />
            E’lon qilish
          </button>
        </div>

        {isSaved && (
          <div className="tpb-saved">
            ✓ Saqlandi
          </div>
        )}
      </div>
    </div>
  )
}