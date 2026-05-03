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

export default function StudentTasksPage() {
  const [exams, setExams] = useState([])
  const [projects, setProjects] = useState([])
  const [results, setResults] = useState([])
  const [projectSubmissions, setProjectSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {}

  useEffect(() => {
    const load = async () => {
      const [allExams, allProjects, allResults, allSubs] = await Promise.all([
        getAllExamsFn(),
        getAllProjectsFn(),
        getExamResultsFn(),
        getProjectSubmissionsFn(),
      ])

      const studentClassId = currentUser?.classId

      const examFilter = e => {
        if (!e.isPublished) return false
        if (!studentClassId) return true
        return !e.classId || String(e.classId) === String(studentClassId)
      }

      const projectFilter = p => {
        if (!p.isPublished) return false
        if (!studentClassId) return true
        return !p.classId || String(p.classId) === String(studentClassId)
      }

      setExams(allExams.filter(examFilter))
      setProjects(allProjects.filter(projectFilter))
      setResults(allResults)
      setProjectSubmissions(allSubs)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="st-page"><p>Yuklanmoqda...</p></div>

  if (exams.length === 0 && projects.length === 0) {
    return (
      <div className="st-page st-empty">
        <h2>Hozircha topshiriqlar mavjud emas</h2>
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
            r => r.examId === exam.id && r.studentId === currentUser.id
          )

          return (
            <div key={exam.id} className="st-card">
              <div className="st-card-header">
                <h3>{exam.examTitle}</h3>
                {isDone && (
                  <span className="st-badge">
                    <CheckCircle size={14} /> Topshirilgan
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
              </div>

              <button
                className={`st-btn ${isDone ? "st-done" : "st-start"}`}
                disabled={isDone}
                onClick={() => navigate(`/student/exam/${exam.id}`)}
              >
                {isDone ? "Yakunlangan" : "Boshlash"}
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
