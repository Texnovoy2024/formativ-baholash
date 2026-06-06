import { useEffect, useState, useMemo } from "react"
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import {
  BarChart3,
  Trophy,
  TrendingDown,
  Target,
  Brain,
  FolderKanban,
  CheckCircle,
  Layers
} from "lucide-react"
import "./StudentResultsPage.css"
import { getExamResultsFn, getProjectSubmissionsFn } from "../../context/authUtils"

export default function StudentResultsPage() {
  const [examResults, setExamResults] = useState([])
  const [projectResults, setProjectResults] = useState([])
  const [loading, setLoading] = useState(true)

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  useEffect(() => {
    if (!currentUser?.id) return

    const load = async () => {
      setLoading(true)
      try {
        const [allResults, allProjectSubs] = await Promise.all([
          getExamResultsFn(currentUser.id, true), // forceRefresh: true
          getProjectSubmissionsFn(currentUser.id, true), // forceRefresh: true
        ])

        const myResults = (allResults || []).filter(r => String(r.studentId) === String(currentUser.id))
        setExamResults(myResults)

        const myProjectResults = (allProjectSubs || []).filter(
          s => String(s.studentId) === String(currentUser.id) && s.score !== null
        )
        setProjectResults(myProjectResults)
      } catch (err) {
        console.error("Load Results Error:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentUser?.id])

  const allScores = useMemo(() => {
    return [
      ...examResults.map(r => Number(r.score || 0)),
      ...projectResults.map(p => Number(p.score || 0)),
    ]
  }, [examResults, projectResults])

  const totalTasks = allScores.length
  const average =
    totalTasks > 0
      ? (allScores.reduce((a, b) => a + b, 0) / totalTasks).toFixed(1)
      : 0
  const bestScore = totalTasks > 0 ? Math.max(...allScores) : 0
  const worstScore = totalTasks > 0 ? Math.min(...allScores) : 0
  const maxPossible = Math.max(bestScore, 10)

  const pieData = [
    { name: "O'rtacha", value: Number(average) },
    { name: "Qolgan", value: Math.max(maxPossible - Number(average), 0) },
  ]
  const COLORS = ["#2563eb", "#e5e7eb"]

  const generateFeedback = (score, total) => {
    const percent = (score / total) * 100
    if (percent >= 90) return "Zo'r natija! Siz mavzuni mukammal o'zlashtirgansiz."
    if (percent >= 75) return "Yaxshi! Biroz mashq qilsangiz yanada yuqori natija."
    if (percent >= 60) return "O'rtacha natija. Ba'zi mavzularni qayta ko'rib chiqing."
    return "E'tibor bering! Asosiy tushunchalarni yana bir bor o'rganing."
  }

  const [selectedResult, setSelectedResult] = useState(null)

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="sr-container">
        <div className="sr-title skeleton-title"></div>
        <div className="sr-dashboard">
          <div className="sr-stats">
            {[1, 2, 3, 4].map(i => <div key={i} className="sr-stat-card skeleton"></div>)}
          </div>
          <div className="sr-chart-card skeleton"></div>
        </div>
        <div className="sr-grid">
          {[1, 2, 3].map(i => <div key={i} className="sr-card skeleton"></div>)}
        </div>
      </div>
    )
  }

  if (totalTasks === 0) {
    return (
      <div className="sr-container sr-empty-page">
        <div className="sr-empty-icon"><Layers size={48} /></div>
        <h2>Natijalar hozircha mavjud emas</h2>
        <p>Topshiriqlarni bajarganingizdan so'ng hisobotlar shu yerda paydo bo'ladi.</p>
      </div>
    )
  }

  return (
    <div className="sr-container">
      <h2 className="sr-title">
        <Layers size={22} /> Natijalar
      </h2>

      <div className="sr-dashboard">
        <div className="sr-stats">
          <div className="sr-stat-card">
            <BarChart3 />
            <div>
              <p>Topshirilgan</p>
              <h3>{totalTasks}</h3>
            </div>
          </div>
          <div className="sr-stat-card">
            <Target />
            <div>
              <p>O'rtacha</p>
              <h3>{average}</h3>
            </div>
          </div>
          <div className="sr-stat-card">
            <Trophy />
            <div>
              <p>Eng yaxshi</p>
              <h3>{bestScore}</h3>
            </div>
          </div>
          <div className="sr-stat-card">
            <TrendingDown />
            <div>
              <p>Eng past</p>
              <h3>{worstScore}</h3>
            </div>
          </div>
        </div>

        <div className="sr-chart-card">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" outerRadius={100}>
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {projectResults.length > 0 && (
        <div className="sr-project-section">
          <h3 className="sr-section-title">
            <FolderKanban size={20} />
            Loyiha natijalari
          </h3>
          <div className="sr-grid">
            {projectResults.map((p, i) => (
              <div key={i} className="sr-card">
                <h4>Loyiha #{p.projectId}</h4>
                <p className="sr-score">
                  <CheckCircle size={16} />
                  {p.score} ball
                </p>
                {p.feedback && (
                  <div className="sr-feedback">
                    <Brain size={16} />
                    {p.feedback}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {examResults.length > 0 && (
        <div className="sr-section">
          <h3 className="sr-section-title">
            <BarChart3 size={20} />
            Test natijalari
          </h3>
          <div className="sr-grid">
            {examResults.map((r, i) => (
              <div key={i} className="sr-card">
                <h4>{r.examTitle || `Test ${i + 1}`}</h4>
                <p>Ball: {r.score} / {r.total}</p>
                <p>Foiz: {((r.score / r.total) * 100).toFixed(0)}%</p>
                <div className="sr-feedback">
                  <Brain size={16} />
                  {generateFeedback(r.score, r.total)}
                </div>
                
                <button 
                  className="sr-details-btn"
                  onClick={() => setSelectedResult(r)}
                >
                  <Target size={14} />
                  Natijalarni ko'rish
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAILED MODAL */}
      {selectedResult && (
        <div className="sr-modal-overlay" onClick={() => setSelectedResult(null)}>
          <div className="sr-modal sr-printable" onClick={e => e.stopPropagation()}>
            <div className="sr-modal-header">
              <div className="sr-modal-title-group">
                <h3>{selectedResult.examTitle} - Batafsil</h3>
                <p>
                  {currentUser?.name} · Ball: {selectedResult.score}/{selectedResult.total} ({((selectedResult.score/selectedResult.total)*100).toFixed(0)}%)
                </p>
              </div>
              <div className="sr-modal-actions">
                <button
                  className="sr-print-btn"
                  onClick={() => handlePrint(selectedResult)}
                  title="PDF sifatida saqlash"
                >
                  ⬇ PDF
                </button>
                <button className="sr-close-btn" onClick={() => setSelectedResult(null)}>&times;</button>
              </div>
            </div>
            <div className="sr-modal-content">
              {/* Print uchun header — faqat print da ko'rinadi */}
              <div className="sr-print-header">
                <h2>{selectedResult.examTitle}</h2>
                <p>O'quvchi: <strong>{currentUser?.name}</strong></p>
                <p>Ball: <strong>{selectedResult.score} / {selectedResult.total}</strong> &nbsp;|&nbsp; Foiz: <strong>{((selectedResult.score/selectedResult.total)*100).toFixed(0)}%</strong></p>
                <p>Sana: {selectedResult.date ? new Date(selectedResult.date).toLocaleString("uz-UZ") : "—"}</p>
                <hr />
              </div>

              {selectedResult.answers ? (
                selectedResult.answers.map((ans, idx) => (
                  <div key={idx} className={`sr-ans-card ${ans.correct ? 'correct' : 'wrong'}`}>
                    <div className="sr-ans-q">
                      <strong>{idx + 1}. {ans.questionText}</strong>
                    </div>
                    <div className="sr-ans-options">
                      {ans.options?.map((opt, oIdx) => {
                        let statusClass = "";
                        if (oIdx === ans.correctIndex) statusClass = "correct-opt";
                        if (oIdx === ans.chosen && !ans.correct) statusClass = "wrong-opt";
                        return (
                          <div key={oIdx} className={`sr-ans-opt ${statusClass}`}>
                            <span className="sr-opt-marker">
                              {oIdx === 0 ? 'A' : oIdx === 1 ? 'B' : oIdx === 2 ? 'C' : 'D'})
                            </span>
                            {opt}
                            {oIdx === ans.correctIndex && <CheckCircle size={14} className="sr-opt-icon" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <p>Bu natija uchun batafsil ma'lumotlar saqlanmagan.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
