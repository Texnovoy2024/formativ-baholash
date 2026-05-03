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

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  useEffect(() => {
    const load = async () => {
      const [allExams, allProjects] = await Promise.all([
        getExamResultsFn(),
        getProjectSubmissionsFn(),
      ])

      setExamResults(allExams.filter(r => r.studentId === currentUser?.id))
      setProjectResults(
        allProjects.filter(
          s => String(s.studentId) === String(currentUser?.id) && s.score !== null
        )
      )
    }
    load()
  }, [])

  const allScores = useMemo(() => {
    return [
      ...examResults.map(r => r.score),
      ...projectResults.map(p => p.score),
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

  return (
    <div className="sr-container">
      <h2 className="sr-title">
        <Layers size={22} /> Natijalar
      </h2>

      {totalTasks === 0 ? (
        <p className="sr-empty">Hozircha natijalar mavjud emas.</p>
      ) : (
        <>
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
                    <h4>Test {i + 1}</h4>
                    <p>Ball: {r.score} / {r.total}</p>
                    <p>Foiz: {((r.score / r.total) * 100).toFixed(0)}%</p>
                    <div className="sr-feedback">
                      <Brain size={16} />
                      {generateFeedback(r.score, r.total)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
