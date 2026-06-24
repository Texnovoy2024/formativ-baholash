import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Clock, FileText, CheckCircle, FolderKanban } from "lucide-react"
import "./StudentTasksPage.css"
import {
  getAllExamsFn,
  getAllProjectsFn,
  getExamResultsFn,
  getProjectSubmissionsFn,
} from "../../context/authUtils"

// O'zbekcha sana formatlash: "2026-yil 5-iyun, 14:30"
const UZBEK_MONTHS = [
  "yanvar","fevral","mart","aprel","may","iyun",
  "iyul","avgust","sentabr","oktabr","noyabr","dekabr"
]

function formatDeadlineUz(dateStr) {
  const d = new Date(dateStr)
  const day = d.getDate()
  const month = UZBEK_MONTHS[d.getMonth()]
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, "0")
  const minutes = String(d.getMinutes()).padStart(2, "0")
  return `${year}-yil ${day}-${month}, ${hours}:${minutes}`
}

export default function StudentTasksPage() {
  const [exams, setExams] = useState([])
  const [projects, setProjects] = useState([])
  const [results, setResults] = useState([])
  const [projectSubmissions, setProjectSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {}

  useEffect(() => {
    load()

    // Foydalanuvchi boshqa tab/sahifadan qaytganda natijalarni yangilash
    const onFocus = () => load()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [])

  async function load() {
      setLoading(true)
      try {
        const [allExams, allProjects, allResults, allSubs] = await Promise.all([
          getAllExamsFn(),
          getAllProjectsFn(),
          getExamResultsFn(currentUser.id, true),   // har doim fresh
          getProjectSubmissionsFn(currentUser.id, true),
        ])

        const studentClassId = currentUser?.classId

        const examFilter = e => {
          if (!e.isPublished) return false
          // Student ning classId si bo'lmasa hech narsa ko'rsatma
          if (!studentClassId) return false
          // Exam ning classId si bo'lmasa ko'rsatma (teacher sinf belgilamagan)
          if (!e.classId) return false
          return String(e.classId) === String(studentClassId)
        }

        const projectFilter = p => {
          if (!p.isPublished) return false
          // Student ning classId si bo'lmasa hech narsa ko'rsatma
          if (!studentClassId) return false
          // Project ning classId si bo'lmasa ko'rsatma
          if (!p.classId) return false
          return String(p.classId) === String(studentClassId)
        }

        setExams((allExams || []).filter(examFilter))
        setProjects((allProjects || []).filter(projectFilter))
        setResults(allResults || [])
        setProjectSubmissions(allSubs || [])
      } catch (err) {
        console.error("Load Tasks Error:", err)
      } finally {
        setLoading(false)
      }
  }

  if (loading) {
    return (
      <div className="st-page">
        <h1 className="st-title">Topshiriqlar</h1>
        <div className="st-grid">
          {[1, 2, 3].map(i => (
            <div key={i} className="st-card skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-info"></div>
              <div className="skeleton-btn"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (exams.length === 0 && projects.length === 0) {
    return (
      <div className="st-page st-empty">
        <div className="st-empty-icon"><FileText size={48} /></div>
        <h2>Hozircha topshiriqlar mavjud emas</h2>
        <p>Yangi vazifalar yuklanganda shu yerda ko'rinadi.</p>
      </div>
    )
  }

  return (
    <div className="st-page">
      <h1 className="st-title">Topshiriqlar</h1>

      <div className="st-grid">
        {/* ================= EXAMS ================= */}
        {exams.map(exam => {
          const isDone = results.some(
            r => String(r.examId) === String(exam.id) && String(r.studentId) === String(currentUser.id)
          )

          // Deadline tekshiruvi
          const isExpired = exam.deadline ? new Date(exam.deadline) < new Date() : false

          return (
            <div key={exam.id} className={`st-card ${isExpired && !isDone ? "st-card--expired" : ""}`}>
              <div className="st-card-header">
                <h3>{exam.examTitle}</h3>
                {isDone && (
                  <span className="st-badge">
                    <CheckCircle size={14} /> Topshirilgan
                  </span>
                )}
                {isExpired && !isDone && (
                  <span className="st-badge st-badge--expired">
                    Muddat tugadi
                  </span>
                )}
              </div>

              <div className="st-info">
                <p>
                  <Clock size={16} />
                  {exam.timeLimit} daqiqa
                </p>
                <p>
                  <FileText size={16} />
                  {exam.questions?.length || 0} savol
                </p>
                {exam.deadline && (
                  <p className={`st-deadline-info ${isExpired ? "st-deadline-info--expired" : ""}`}>
                    <Clock size={16} />
                    Muddat: {formatDeadlineUz(exam.deadline)}
                  </p>
                )}
              </div>

              <button
                className={`st-btn ${isDone ? "st-done" : isExpired ? "st-expired" : "st-start"}`}
                disabled={isDone || isExpired}
                onClick={() => !isDone && !isExpired && navigate(`/student/exam/${exam.id}`)}
              >
                {isDone ? "Yakunlangan" : isExpired ? "Muddat tugadi" : "Boshlash"}
              </button>
            </div>
          )
        })}

        {/* ================= PROJECTS ================= */}
        {projects.map(project => {
          const isSubmitted = projectSubmissions.some(
            s =>
              String(s.projectId) === String(project.id) &&
              String(s.studentId) === String(currentUser.id)
          )

          return (
            <div key={project.id} className="st-card">
              <div className="st-card-header">
                <h3>{project.title}</h3>
                {isSubmitted && (
                  <span className="st-badge">
                    <CheckCircle size={14} /> Topshirilgan
                  </span>
                )}
              </div>

              <div className="st-info">
                <p>
                  <Clock size={16} />
                  Muddati: {project.deadline}
                </p>
                <p>
                  <FileText size={16} />
                  Ball: {project.maxScore}
                </p>
              </div>

              <button
                className={`st-btn ${isSubmitted ? "st-done" : "st-start"}`}
                onClick={() => navigate(`/student/projects/${project.id}`)}
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
