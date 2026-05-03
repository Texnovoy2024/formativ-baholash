import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Clock, CheckCircle, AlertTriangle, Send } from "lucide-react"
import "./StudentExamPage.css"
import { getAllExamsFn, addExamResultFn } from "../../context/authUtils"

export default function StudentExamPage() {
  const { examId } = useParams()
  const navigate = useNavigate()

  const [exam, setExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [endTime, setEndTime] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [isFinished, setIsFinished] = useState(false)

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  /* ================= LOAD EXAM ================= */
  useEffect(() => {
    const load = async () => {
      const allExams = await getAllExamsFn()
      const found = allExams.find(e => String(e.id) === String(examId))

      if (!found) return navigate("/student/tasks")

      const limit = Number(found.timeLimit)
      if (!limit || limit <= 0) return

      setExam(found)
      const deadline = Date.now() + limit * 60 * 1000
      setEndTime(deadline)
    }
    load()
  }, [examId])

  /* ================= REAL TIMER ================= */
  useEffect(() => {
    if (!endTime || isFinished) return

    const interval = setInterval(() => {
      const remaining = Math.floor((endTime - Date.now()) / 1000)
      if (remaining <= 0) {
        clearInterval(interval)
        autoSubmit()
      } else {
        setTimeLeft(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [endTime, isFinished])

  const handleSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: optionIndex }))
  }

  /* ================= SAVE RESULT ================= */
  const saveResult = async () => {
    let score = 0
    exam.questions.forEach(q => {
      if (answers[q.id] === q.correctIndex) {
        score += q.points
      }
    })

    const result = {
      examId: exam.id,
      examTitle: exam.examTitle,
      studentId: currentUser.id,
      studentName: currentUser.name || currentUser.fullName || "Noma'lum",
      score,
      total: exam.questions.reduce((sum, q) => sum + q.points, 0),
      date: new Date().toISOString(),
      answers: exam.questions.map(q => ({
        questionId: q.id,
        questionText: q.text,
        correct: answers[q.id] === q.correctIndex,
        chosen: answers[q.id],
        correctIndex: q.correctIndex,
      })),
    }

    await addExamResultFn(result)
  }

  const autoSubmit = async () => {
    if (isFinished) return
    setIsFinished(true)
    await saveResult()
    navigate("/student/results")
  }

  const confirmFinish = async () => {
    setIsFinished(true)
    await saveResult()
    navigate("/student/results")
  }

  if (!exam) return <h2>Yuklanmoqda...</h2>

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const answeredCount = Object.keys(answers).length
  const progressPercent = (answeredCount / exam.questions.length) * 100

  return (
    <div className="se-page">
      <div className="se-sticky">
        <div className="se-header">
          <h2>{exam.examTitle}</h2>
          <div className={`se-timer ${timeLeft < 60 ? "danger" : ""}`}>
            <Clock size={16} />
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </div>

        <div className="se-progress">
          <div className="se-progress-info">
            <span>Javob berildi: {answeredCount} / {exam.questions.length}</span>
            <span>{progressPercent.toFixed(0)}%</span>
          </div>
          <div className="se-progress-bar">
            <div
              className="se-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {exam.questions.map((q, index) => (
        <div key={q.id} className="se-question-card">
          <h4>{index + 1}. {q.text}</h4>
          {q.options.map((opt, idx) => (
            <label key={idx} className="se-option">
              <input
                type="radio"
                name={`question-${q.id}`}
                checked={answers[q.id] === idx}
                onChange={() => handleSelect(q.id, idx)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      ))}

      <button className="se-finish-btn" onClick={() => setShowModal(true)}>
        <Send size={16} />
        Yakunlash
      </button>

      {showModal && (
        <div className="se-modal-overlay">
          <div className="se-modal">
            <AlertTriangle size={32} color="#f59e0b" />
            <h3>Imtihonni yakunlamoqchimisiz?</h3>
            <p>{answeredCount} ta savolga javob berdingiz.</p>
            <div className="se-modal-buttons">
              <button onClick={() => setShowModal(false)}>Bekor qilish</button>
              <button className="confirm-btn" onClick={confirmFinish}>
                <CheckCircle size={16} />
                Ha, yakunlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
