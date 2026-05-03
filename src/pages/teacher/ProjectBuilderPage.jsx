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
import { getTasksFn, saveTasksFn, saveProjectFn } from "../../context/authUtils"

export default function ProjectBuilderPage() {
  const { taskId } = useParams()
  const navigate = useNavigate()

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  const [tasks, setTasks] = useState([])
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)

  const [deadline, setDeadline] = useState("")
  const [maxScore, setMaxScore] = useState("")
  const [requirements, setRequirements] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [isPublished, setIsPublished] = useState(false)

  const formatToInputDate = (dateValue) => {
    if (!dateValue) return ""
    const dateObj = new Date(dateValue)
    if (isNaN(dateObj)) return ""
    return dateObj.toISOString().split("T")[0]
  }

  useEffect(() => {
    const load = async () => {
      if (!currentUser) { setLoading(false); return }
      const t = await getTasksFn(currentUser.id)
      setTasks(t)
      const found = t.find(x => String(x.id) === String(taskId))
      setTask(found || null)
      if (found?.projectData) {
        setDeadline(formatToInputDate(found.projectData.deadline))
        setMaxScore(found.projectData.maxScore || "")
        setRequirements(found.projectData.requirements || "")
        setIsPublished(found.projectData.isPublished || false)
      }
      setLoading(false)
    }
    load()
  }, [taskId])

  if (!currentUser) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Foydalanuvchi topilmadi</h2>
        <button onClick={() => navigate("/login")}>Login</button>
      </div>
    )
  }

  if (loading) return <div style={{ padding: 40 }}><p>Yuklanmoqda...</p></div>

  if (!task) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Project topilmadi</h2>
        <button onClick={() => navigate("/teacher/tasks")}>Orqaga qaytish</button>
      </div>
    )
  }

  /* ================= SAVE ================= */
  const handleSave = async () => {
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
    await saveTasksFn(currentUser.id, updatedTasks)
    setTasks(updatedTasks)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  /* ================= PUBLISH ================= */
  const handlePublish = async () => {
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

    await saveTasksFn(currentUser.id, updatedTasks)

    const projectData = {
      id: task.id,
      title: task.title,
      classId: task.classId,
      deadline,
      maxScore,
      requirements,
      isPublished: true,
    }

    await saveProjectFn(projectData)

    setIsPublished(true)
    navigate('/teacher/tasks')
  }

  return (
    <div className="tpb-container">
      <h1 className="tpb-title">Loyiha sozlamalari</h1>

      <div className="tpb-card">
        <div className="tpb-input-group">
          <FileText size={18} />
          <textarea
            placeholder="Loyiha talablari..."
            value={requirements}
            onChange={e => setRequirements(e.target.value)}
          />
        </div>

        <div className="tpb-input-group">
          <CalendarDays size={18} />
          <input
            type="date"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="tpb-input-group">
          <Award size={18} />
          <input
            type="number"
            placeholder="Maksimal ball"
            value={maxScore}
            onChange={e => setMaxScore(e.target.value)}
          />
        </div>

        <div className="tpb-status">
          {isPublished ? (
            <span className="tpb-published">
              <CheckCircle size={16} />
              E'lon qilingan
            </span>
          ) : (
            <span className="tpb-draft">Qoralama</span>
          )}
        </div>

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
            E'lon qilish
          </button>
        </div>

        {isSaved && <div className="tpb-saved">✓ Saqlandi</div>}
      </div>
    </div>
  )
}
