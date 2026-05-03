import { useState, useMemo, useEffect } from "react"
import { Pencil, Trash2, Save, X, Search, CalendarDays } from "lucide-react"
import ConfirmModal from "../../components/ui/ConfirmModal"
import "./TeacherTasksPage.css"
import { useNavigate } from "react-router-dom"
import {
  getTasksFn,
  saveTasksFn,
  getAllClassesFn,
} from "../../context/authUtils"

export default function TeacherTasksPage() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const navigate = useNavigate()

  const [tasks, setTasks] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [type, setType] = useState("homework")
  const [selectedClassId, setSelectedClassId] = useState("")

  const [search, setSearch] = useState("")
  const [sortAsc, setSortAsc] = useState(true)

  const [editingId, setEditingId] = useState(null)
  const [editedTitle, setEditedTitle] = useState("")
  const [editedDescription, setEditedDescription] = useState("")

  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    const load = async () => {
      const [t, c] = await Promise.all([
        getTasksFn(currentUser?.id),
        getAllClassesFn(),
      ])
      setTasks(t)
      setClasses(c)
      setLoading(false)
    }
    load()
  }, [])

  const updateStorage = async (updatedTasks) => {
    await saveTasksFn(currentUser?.id, updatedTasks)
  }

  const handleAddTask = async () => {
    if (!title.trim() || !selectedClassId) return

    const newTask = {
      id: Date.now().toString(),
      title,
      description,
      type,
      classId: selectedClassId,
      createdAt: new Date().toISOString(),
      questions: [],
    }

    const updated = [...tasks, newTask]
    setTasks(updated)
    await updateStorage(updated)

    setTitle("")
    setDescription("")
  }

  const startEdit = (task) => {
    setEditingId(task.id)
    setEditedTitle(task.title)
    setEditedDescription(task.description)
  }

  const saveEdit = async () => {
    const updated = tasks.map((t) =>
      t.id === editingId
        ? { ...t, title: editedTitle, description: editedDescription }
        : t
    )
    setTasks(updated)
    await updateStorage(updated)
    setEditingId(null)
  }

  const confirmDelete = async () => {
    const updated = tasks.filter((t) => t.id !== deleteId)
    setTasks(updated)
    await updateStorage(updated)
    setDeleteId(null)
  }

  const filteredTasks = useMemo(() => {
    let data = tasks.filter((t) =>
      t.title.toLowerCase().includes(search.toLowerCase())
    )
    data.sort((a, b) =>
      sortAsc ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
    )
    return data
  }, [tasks, search, sortAsc])

  if (loading) return <div className="teacher-tasks"><p>Yuklanmoqda...</p></div>

  return (
    <div className="teacher-tasks">
      <h1 className="teacher-tasks__title">Topshiriqlar</h1>

      {/* FORM */}
      <div className="teacher-tasks__form">
        <input
          className="teacher-input"
          placeholder="Topshiriq nomi"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="teacher-textarea"
          placeholder="Topshiriq tavsifi"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className="teacher-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="homework">Vazifa</option>
          <option value="test">Test</option>
          <option value="project">Loyiha</option>
        </select>

        <select
          className="teacher-select"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
        >
          <option value="">Sinf tanlang</option>
          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name}
            </option>
          ))}
        </select>

        <button className="teacher-btn-primary" onClick={handleAddTask}>
          Qo'shish
        </button>
      </div>

      {/* SEARCH */}
      <div className="teacher-tasks__controls">
        <div className="teacher-search">
          <Search size={16} />
          <input
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          className="teacher-btn-outline"
          onClick={() => setSortAsc(!sortAsc)}
        >
          {sortAsc ? "A-Z" : "Z-A"}
        </button>
      </div>

      {/* TASK GRID */}
      <div className="teacher-tasks__grid">
        {filteredTasks.map((task) => (
          <div key={task.id} className="teacher-task-card">
            {(task.type === "quiz" || task.type === "test") && (
              <button
                onClick={() => navigate(`/teacher/exam-builder/${task.id}`)}
                className="teacher-btn-secondary"
              >
                Savollarni tuzish
              </button>
            )}

            {task.type === "project" && (
              <>
                <button
                  onClick={() => navigate(`/teacher/project-builder/${task.id}`)}
                  className="teacher-btn-secondary"
                >
                  Loyihani sozlash
                </button>

                <button
                  onClick={() => navigate(`/teacher/project-submissions/${task.id}`)}
                  className="teacher-btn-secondary"
                >
                  Topshirishlarni ko'rish
                </button>
              </>
            )}

            <span className={`teacher-badge teacher-badge--${task.type}`}>
              {task.type === "test"
                ? "Test"
                : task.type === "project"
                ? "Loyiha"
                : task.type === "homework"
                ? "Vazifa"
                : task.type === "quiz"
                ? "Test"
                : task.type}
            </span>

            {editingId === task.id ? (
              <>
                <input
                  className="teacher-input"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
                <textarea
                  className="teacher-textarea"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                />

                <div className="teacher-task-actions">
                  <button onClick={saveEdit}>
                    <Save size={16} />
                  </button>
                  <button onClick={() => setEditingId(null)}>
                    <X size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>{task.title}</h3>
                <p className="teacher-task-desc">
                  {task.description || "Tavsif yo'q"}
                </p>

                <div className="teacher-task-meta">
                  <CalendarDays size={14} />
                  {new Date(task.createdAt).toLocaleDateString()}
                </div>

                <div className="teacher-task-actions">
                  <button onClick={() => startEdit(task)}>
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => setDeleteId(task.id)}
                    className="teacher-delete-btn"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Topshiriqni o'chirish"
        message="Rostdan ham ushbu topshiriqni o'chirmoqchimisiz?"
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
