import { useParams, useNavigate } from "react-router-dom"
import { useState } from "react"
import {
  Clock,
  FileText,
  Upload,
  CheckCircle,
  AlertTriangle,
  File
} from "lucide-react"
import "./StudentProjectDetail.css"

export default function StudentProjectDetail() {
  const { projectId } = useParams()
  const navigate = useNavigate()

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const allProjects = JSON.parse(localStorage.getItem("allProjects")) || []
  const projectSubmissions =
    JSON.parse(localStorage.getItem("projectSubmissions")) || []

  const project = allProjects.find(
    p => String(p.id) === String(projectId)
  )

  const existingSubmission = projectSubmissions.find(
    s =>
      String(s.projectId) === String(projectId) &&
      String(s.studentId) === String(currentUser.id)
  )

  const [selectedFile, setSelectedFile] = useState(null)
  const [isSubmitted, setIsSubmitted] = useState(!!existingSubmission)

  if (!project) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Project topilmadi</h2>
      </div>
    )
  }

  const isLate =
    new Date() > new Date(project.deadline) && !isSubmitted

  /* ================= FILE CHANGE ================= */

  const handleFileChange = e => {
    const file = e.target.files[0]
    if (!file) return

    if (
      file.type !== "application/pdf" &&
      file.type !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" &&
      file.type !== "application/msword"
    ) {
      alert("Faqat PDF yoki Word fayl yuklash mumkin!")
      return
    }

    setSelectedFile(file)
  }

  /* ================= SUBMIT ================= */

  const handleSubmit = () => {
    if (!selectedFile) return

    const reader = new FileReader()

    reader.onloadend = () => {
      const newSubmission = {
        projectId: project.id,
        studentId: currentUser.id,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileData: reader.result,
        submittedAt: new Date().toISOString(),
        score: null,
        feedback: ""
      }

      const updatedSubmissions = existingSubmission
        ? projectSubmissions.map(s =>
            s.projectId === project.id &&
            s.studentId === currentUser.id
              ? newSubmission
              : s
          )
        : [...projectSubmissions, newSubmission]

      localStorage.setItem(
        "projectSubmissions",
        JSON.stringify(updatedSubmissions)
      )

      setIsSubmitted(true)
      navigate('/student/tasks')
    }

    reader.readAsDataURL(selectedFile)
  }

  return (
    <div className="spd-container">
      <h1 className="spd-title">{project.title}</h1>

      <div className="spd-card">

        <div className="spd-row">
          <FileText size={18} />
          <p>{project.requirements}</p>
        </div>

        <div className="spd-row">
          <Clock size={18} />
          <span>Muddati: {project.deadline}</span>
        </div>

        <div className="spd-row">
          <strong>Ball:</strong> {project.maxScore}
        </div>

        <div className="spd-status">
          {isSubmitted ? (
            <span className="spd-submitted">
              <CheckCircle size={16} />
              Topshirilgan
            </span>
          ) : isLate ? (
            <span className="spd-late">
              <AlertTriangle size={16} />
              Kechikkan
            </span>
          ) : (
            <span className="spd-pending">
              Kutilmoqda
            </span>
          )}
        </div>

        {!isSubmitted && (
          <div className="spd-upload">

            <label className="spd-file-label">
              <File size={16} />
              Fayl tanlash (PDF/DOC)
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </label>

            {selectedFile && (
              <div className="spd-file-info">
                {selectedFile.name}
              </div>
            )}

            <button onClick={handleSubmit}>
              <Upload size={16} />
              Topshirish
            </button>

          </div>
        )}
      </div>
    </div>
  )
}