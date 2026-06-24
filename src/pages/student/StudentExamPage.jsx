import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import { Clock, CheckCircle, AlertTriangle, Send } from "lucide-react"
import "./StudentExamPage.css"
import { getAllExamsFn, addExamResultFn, getExamResultsFn } from "../../context/authUtils"

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
      const [allExams] = await Promise.all([
        getAllExamsFn(),
      ])
      
      const found = allExams.find(e => String(e.id) === String(examId))
      if (!found) return navigate("/student/tasks")

      // Deadline tekshiruvi — muddat o'tgan bo'lsa bloklash
      if (found.deadline && new Date(found.deadline) < new Date()) {
        alert("Bu testning muddati tugagan. Topshira olmaysiz.")
        return navigate("/student/tasks")
      }

      // Check if already taken — forceRefresh bilan yangi ma'lumot olish
      const freshResults = await getExamResultsFn(currentUser?.id, true)
      const alreadyTaken = freshResults.some(
        r => String(r.examId) === String(examId) && String(r.studentId) === String(currentUser?.id)
      )
      if (alreadyTaken) {
        alert("Siz bu imtihonni topshirib bo'lgansiz!")
        return navigate("/student/results")
      }

      const limit = Number(found.timeLimit)
      if (!limit || limit <= 0) return

      setExam(found)

      // Refresh da vaqtni tiklash: localStorage da saqlanган endTime bor bo'lsa ishlatamiz
      const storageKey = `examEndTime_${examId}_${currentUser?.id}`
      const savedEndTime = localStorage.getItem(storageKey)

      let resolvedEndTime
      if (savedEndTime && Number(savedEndTime) > Date.now()) {
        // Avval boshlangan — qolgan vaqtdan davom etish
        resolvedEndTime = Number(savedEndTime)
      } else {
        // Yangi boshlanish — endTime ni hisoblab localStorage ga yozish
        resolvedEndTime = Date.now() + limit * 60 * 1000
        localStorage.setItem(storageKey, String(resolvedEndTime))
      }

      // Aktiv exam ni localStorage ga belgilash (sidebar bloki uchun)
      localStorage.setItem("activeExamId", examId)

      setEndTime(resolvedEndTime)
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

  /* ================= EXAM TUGAGANDA TOZALASH ================= */
  const clearExamStorage = () => {
    const storageKey = `examEndTime_${examId}_${currentUser?.id}`
    localStorage.removeItem(storageKey)
    localStorage.removeItem("activeExamId")
  }

  /* ================= SAVE RESULT ================= */
  const saveResult = async () => {
    let score = 0
    exam.questions.forEach(q => {
      if (answers[q.id] === q.correctIndex) {
        score += Number(q.points || 0)
      }
    })

    const result = {
      examId: String(exam.id),
      examTitle: exam.examTitle,
      teacherId: String(exam.teacherId), // String ga o'tkazish
      classId: String(currentUser.classId || ""), // String ga o'tkazish
      studentId: String(currentUser.id),
      studentName: currentUser.name || currentUser.fullName || "Noma'lum",
      score: Number(score),
      total: Number(exam.questions.reduce((sum, q) => sum + Number(q.points || 0), 0)),
      date: new Date().toISOString(),
      answers: exam.questions.map(q => ({
        questionId: q.id,
        questionText: q.text,
        options: q.options,
        correct: (answers[q.id] ?? null) === q.correctIndex,
        chosen: answers[q.id] ?? null,
        correctIndex: q.correctIndex,
      })),
    }

    await addExamResultFn(result)
  }

  const autoSubmit = async () => {
    if (isFinished) return
    setIsFinished(true)
    clearExamStorage()
    await saveResult()
    // Keshni tozalab natijalar sahifasiga o'tish
    navigate("/student/results", { replace: true })
  }

  const confirmFinish = async () => {
    if (isFinished) return
    setIsFinished(true)
    setShowModal(false)
    clearExamStorage()
    await saveResult()
    // Keshni tozalab natijalar sahifasiga o'tish
    navigate("/student/results", { replace: true })
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
