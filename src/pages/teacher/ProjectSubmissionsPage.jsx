import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import {
  CheckCircle,
  Clock,
  FileText,
  User,
  Award,
  Download,
  ArrowLeft
} from "lucide-react"
import "./ProjectSubmissionsPage.css"

export default function ProjectSubmissionsPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const users = JSON.parse(localStorage.getItem("users")) || []
  const submissions =
    JSON.parse(localStorage.getItem("projectSubmissions")) || []

  const projectSubmissions = submissions.filter(
    s => String(s.projectId) === String(projectId)
  )

  const [localSubmissions, setLocalSubmissions] =
    useState(projectSubmissions)

  const handleGrade = (studentId, score, feedback) => {
    const updated = submissions.map(s =>
      String(s.projectId) === String(projectId) &&
      String(s.studentId) === String(studentId)
        ? {
            ...s,
            score: Number(score),
            feedback,
            gradedAt: new Date().toISOString(),
          }
        : s
    )

    localStorage.setItem(
      "projectSubmissions",
      JSON.stringify(updated)
    )

    setLocalSubmissions(
      updated.filter(
        s => String(s.projectId) === String(projectId)
      )
    )
  }

  if (localSubmissions.length === 0) {
    return (
      <div className="tp-empty">
        <button className="tp-back-btn" onClick={() => navigate('/teacher/tasks')}>
          <ArrowLeft size={16} /> Topshiriqlarga qaytish
        </button>
        <h2>Hali hech kim topshirmagan</h2>
      </div>
    )
  }

  return (
    <div className="tp-container">
      <div className="tp-header-row">
        <button className="tp-back-btn" onClick={() => navigate('/teacher/tasks')}>
          <ArrowLeft size={16} /> Orqaga
        </button>
        <h1 className="tp-title">Topshirilgan Projectlar</h1>
      </div>

      <div className="tp-grid">
        {localSubmissions.map(sub => {
          const student = users.find(
            u => String(u.id) === String(sub.studentId)
          )

          return (
            <div key={sub.studentId} className="tp-card">

              <div className="tp-card-header">
                <User size={18} />
                <h3>{student?.name || "Student"}</h3>
              </div>

              <div className="tp-meta">
                <p>
                  <FileText size={14} />
                  {sub.fileName}
                </p>

                <p>
                  <Clock size={14} />
                  {new Date(sub.submittedAt).toLocaleDateString()}
                </p>
              </div>

              {/* 🔥 FILE PREVIEW */}
              {sub.fileType === "application/pdf" && (
                <iframe
                  src={sub.fileData}
                  title="PDF Preview"
                  className="tp-preview"
                />
              )}

              {sub.fileType !== "application/pdf" && (
                <a
                  href={sub.fileData}
                  download={sub.fileName}
                  className="tp-download"
                >
                  <Download size={16} />
                  Faylni yuklab olish
                </a>
              )}

              {sub.score !== null ? (
                <div className="tp-graded">
                  <div className="tp-grade-badge">
                    <Award size={16} />
                    {sub.score} ball
                  </div>

                  <div className="tp-feedback">
                    <CheckCircle size={16} />
                    <span>{sub.feedback}</span>
                  </div>
                </div>
              ) : (
                <GradingForm
                  submission={sub}
                  onGrade={handleGrade}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function GradingForm({ submission, onGrade }) {
  const [score, setScore] = useState("")
  const [feedback, setFeedback] = useState("")

  return (
    <div className="tp-form">
      <input
        className="tp-input"
        type="number"
        placeholder="Ball"
        value={score}
        onChange={e => setScore(e.target.value)}
      />

      <textarea
        className="tp-textarea"
        placeholder="Fikr yozing..."
        value={feedback}
        onChange={e => setFeedback(e.target.value)}
      />

      <button
        className="tp-btn"
        onClick={() =>
          onGrade(submission.studentId, score, feedback)
        }
      >
        Baholash
      </button>
    </div>
  )
}