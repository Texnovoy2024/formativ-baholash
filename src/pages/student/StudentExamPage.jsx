import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Clock, CheckCircle, AlertTriangle, Send } from "lucide-react"
import "./StudentExamPage.css"

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
  const allExams = JSON.parse(localStorage.getItem("allExams")) || []
  const found = allExams.find(e => String(e.id) === String(examId))

  if (!found) return navigate("/student/tasks")

  const limit = Number(found.timeLimit)

  if (!limit || limit <= 0) {
    console.error("timeLimit noto‘g‘ri:", found.timeLimit)
    return
  }

  setExam(found)

  const deadline = Date.now() + limit * 60 * 1000
  setEndTime(deadline)

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

  /* ================= ANSWERS ================= */
  const handleSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }))
  }

  /* ================= SAVE RESULT ================= */
  const saveResult = () => {
    let score = 0

    exam.questions.forEach(q => {
      if (answers[q.id] === q.correctIndex) {
        score += q.points
      }
    })

    const results = JSON.parse(localStorage.getItem("examResults")) || []

    results.push({
      examId: exam.id,
      examTitle: exam.examTitle,
      studentId: currentUser.id,
      studentName: currentUser.name || currentUser.fullName || 'Noma\'lum',
      score,
      total: exam.questions.reduce((sum, q) => sum + q.points, 0),
      date: new Date().toISOString(),
      answers: exam.questions.map(q => ({
        questionId: q.id,
        questionText: q.text,
        correct: answers[q.id] === q.correctIndex,
        chosen: answers[q.id],
        correctIndex: q.correctIndex,
      }))
    })

    localStorage.setItem("examResults", JSON.stringify(results))
  }

  const autoSubmit = () => {
    if (isFinished) return
    setIsFinished(true)
    saveResult()
    navigate("/student/results")
  }

  const confirmFinish = () => {
    setIsFinished(true)
    saveResult()
    navigate("/student/results")
  }

  if (!exam) return <h2>Yuklanmoqda...</h2>

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const answeredCount = Object.keys(answers).length
  const progressPercent =
    (answeredCount / exam.questions.length) * 100

  return (
    <div className="se-page">

      {/* ===== STICKY TOP AREA ===== */}
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
            <span>
              Javob berildi: {answeredCount} / {exam.questions.length}
            </span>
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

      {/* ===== QUESTIONS ===== */}
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

      {/* ===== MODAL ===== */}
      {showModal && (
        <div className="se-modal-overlay">
          <div className="se-modal">
            <AlertTriangle size={32} color="#f59e0b" />
            <h3>Imtihonni yakunlamoqchimisiz?</h3>
            <p>{answeredCount} ta savolga javob berdingiz.</p>

            <div className="se-modal-buttons">
              <button onClick={() => setShowModal(false)}>
                Bekor qilish
              </button>

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