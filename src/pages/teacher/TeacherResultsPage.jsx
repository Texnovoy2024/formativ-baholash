import { useEffect, useState, useMemo } from "react"
import {
  BarChart3,
  Target,
  Trophy,
  AlertTriangle,
  Brain
} from "lucide-react"
import "./TeacherResultsPage.css"

export default function TeacherResultsPage() {

  const [examResults, setExamResults] = useState([])
  const [allExams, setAllExams] = useState([])

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  useEffect(() => {
    const results = JSON.parse(localStorage.getItem("examResults")) || []
    const exams = JSON.parse(localStorage.getItem("allExams")) || []

    // faqat shu teacher examlari
    const myExams = exams.filter(e => e.teacherId === currentUser?.id)

    const myExamIds = myExams.map(e => e.id)

    const filteredResults = results.filter(r =>
      myExamIds.includes(r.examId)
    )

    setExamResults(filteredResults)
    setAllExams(myExams)
  }, [])

  /* ================= GENERAL STATS ================= */

  const totalSubmissions = examResults.length

  const averageScore =
    totalSubmissions > 0
      ? (
          examResults.reduce((a, b) => a + b.score, 0) /
          totalSubmissions
        ).toFixed(1)
      : 0

  /* ================= HARD QUESTIONS ANALYSIS ================= */

  const difficultQuestions = useMemo(() => {
    const stats = {}

    examResults.forEach(result => {
      result.answers?.forEach(ans => {
        if (!stats[ans.questionId]) {
          stats[ans.questionId] = {
            total: 0,
            wrong: 0,
          }
        }

        stats[ans.questionId].total++
        if (!ans.correct) stats[ans.questionId].wrong++
      })
    })

    const merged = Object.entries(stats).map(([id, data]) => {
      const errorRate =
        data.total > 0 ? data.wrong / data.total : 0

      return {
        questionId: id,
        total: data.total,
        wrong: data.wrong,
        errorRate,
      }
    })

    return merged
      .filter(q => q.errorRate >= 0.5)
      .sort((a, b) => b.errorRate - a.errorRate)
  }, [examResults])

  return (
    <div className="tr-container">

      <h1 className="tr-title">
        <BarChart3 size={24} />
        O'qituvchi analitikasi
      </h1>

      {/* ================= SUMMARY ================= */}

      <div className="tr-summary-grid">

        <div className="tr-summary-card">
          <Target />
          <div>
            <p>Topshirilgan testlar</p>
            <h3>{totalSubmissions}</h3>
          </div>
        </div>

        <div className="tr-summary-card">
          <Trophy />
          <div>
            <p>O‘rtacha ball</p>
            <h3>{averageScore}</h3>
          </div>
        </div>

      </div>

      {/* ================= DIFFICULT QUESTIONS ================= */}

      <div className="tr-section">
        <h2>
          <AlertTriangle size={20} />
          Eng qiyin savollar
        </h2>

        {difficultQuestions.length === 0 ? (
          <p className="tr-empty">
            Hozircha qiyin savollar aniqlanmadi.
          </p>
        ) : (
          <div className="tr-grid">
            {difficultQuestions.map((q, index) => (
              <div key={index} className="tr-card">

                <div className="tr-card-header">
                  <Brain size={18} />
                  Savol ID: {q.questionId}
                </div>

                <p>Xato foizi: {(q.errorRate * 100).toFixed(0)}%</p>
                <p>
                  Xato javoblar: {q.wrong} / {q.total}
                </p>

                <div className="tr-progress">
                  <div
                    className="tr-progress-fill"
                    style={{
                      width: `${q.errorRate * 100}%`
                    }}
                  />
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}