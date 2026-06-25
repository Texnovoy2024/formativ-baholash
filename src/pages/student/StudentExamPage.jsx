import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
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
  const [isSaving, setIsSaving] = useState(false)

  // answers ni ref da ham saqlash — closure muammosini hal qiladi
  const answersRef = useRef({})
  const examRef = useRef(null)
  const isFinishedRef = useRef(false)

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

      // questionsPerStudent sozlamasi bo'lsa — random shuffle qilamiz
      // Har student uchun deterministik bo'lishi uchun studentId + examId seed ishlatamiz
      let finalQuestions = [...(found.questions || [])]
      const qps = Number(found.questionsPerStudent)
      if (qps > 0 && finalQuestions.length > qps) {
        // Fisher-Yates shuffle (studentId + examId seed bilan)
        const seed = String(currentUser?.id) + String(found.id)
        let seedNum = Array.from(seed).reduce((acc, c) => acc + c.charCodeAt(0), 0)
        const seededRandom = () => {
          seedNum = (seedNum * 9301 + 49297) % 233280
          return seedNum / 233280
        }
        for (let i = finalQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(seededRandom() * (i + 1));
          [finalQuestions[i], finalQuestions[j]] = [finalQuestions[j], finalQuestions[i]]
        }
        finalQuestions = finalQuestions.slice(0, qps)
      }

      const examWithSlicedQuestions = { ...found, questions: finalQuestions }
      setExam(examWithSlicedQuestions)
      examRef.current = examWithSlicedQuestions

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
    // questionId ni string ga o'tkazamiz — type mismatch ni oldini olish
    const key = String(questionId)
    setAnswers(prev => {
      const updated = { ...prev, [key]: optionIndex }
      answersRef.current = updated
      return updated
    })
  }

  /* ================= EXAM TUGAGANDA TOZALASH ================= */
  const clearExamStorage = () => {
    const storageKey = `examEndTime_${examId}_${currentUser?.id}`
    localStorage.removeItem(storageKey)
    localStorage.removeItem("activeExamId")
  }

  /* ================= SAVE RESULT ================= */
  const saveResult = async () => {
    // ref dan o'qiymiz — closure muammosidan xoli
    const currentExam = examRef.current
    const currentAnswers = answersRef.current

    if (!currentExam) return

    let score = 0
    currentExam.questions.forEach(q => {
      if (currentAnswers[String(q.id)] === q.correctIndex) {
        score += Number(q.points || 0)
      }
    })

    const result = {
      examId: String(currentExam.id),
      examTitle: currentExam.examTitle,
      teacherId: String(currentExam.teacherId),
      classId: String(currentUser.classId || ""),
      studentId: String(currentUser.id),
      studentName: currentUser.name || currentUser.fullName || "Noma'lum",
      score: Number(score),
      total: Number(currentExam.questions.reduce((sum, q) => sum + Number(q.points || 0), 0)),
      date: new Date().toISOString(),
      answers: currentExam.questions.map(q => ({
        questionId: q.id,
        questionText: q.text,
        options: q.options,
        correct: (currentAnswers[String(q.id)] ?? null) === q.correctIndex,
        chosen: currentAnswers[String(q.id)] ?? null,
        correctIndex: q.correctIndex,
      })),
    }

    const res = await addExamResultFn(result)
    return res
  }

  const finishExam = async () => {
    // Double-submit himoyasi
    if (isFinishedRef.current) return
    isFinishedRef.current = true
    setIsFinished(true)
    setShowModal(false)
    setIsSaving(true)
    clearExamStorage()

    await saveResult()

    setIsSaving(false)
    navigate("/student/results", { replace: true })
  }

  const autoSubmit = async () => {
    await finishExam()
  }

  const confirmFinish = async () => {
    await finishExam()
  }

  if (!exam) return <h2>Yuklanmoqda...</h2>

  if (isSaving) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: "16px" }}>
      <div style={{ width: 48, height: 48, border: "4px solid #e5e7eb", borderTop: "4px solid #2563eb", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "#6b7280", fontSize: 16 }}>Natija saqlanmoqda...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

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
