import { useEffect, useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"
import "./StudentDashboard.css"
import {
  getExamResultsFn,
  getProjectSubmissionsFn,
  getStoredUsers,
} from "../../context/authUtils"

const StudentDashboard = () => {
  const [chartData, setChartData] = useState([])
  const [ranking, setRanking] = useState([])

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  useEffect(() => {
    const load = async () => {
      const [allExamResults, allProjectSubmissions, allUsers] =
        await Promise.all([
          getExamResultsFn(),
          getProjectSubmissionsFn(),
          getStoredUsers(),
        ])

      const myExamResults = allExamResults.filter(
        r => r.studentId === currentUser?.id
      )
      const myProjectResults = allProjectSubmissions.filter(
        s =>
          String(s.studentId) === String(currentUser?.id) &&
          s.score !== null
      )

      const formattedExams = myExamResults.map((r, index) => ({
        name: `Test ${index + 1}`,
        score: r.score,
      }))
      const formattedProjects = myProjectResults.map((p, index) => ({
        name: `Loyiha ${index + 1}`,
        score: p.score,
      }))

      setChartData([...formattedExams, ...formattedProjects])

      const rankingData = allUsers
        .filter(u => u.role === "student")
        .map(student => {
          const studentExams = allExamResults.filter(
            r => r.studentId === student.id
          )
          const studentProjects = allProjectSubmissions.filter(
            s => String(s.studentId) === String(student.id) && s.score !== null
          )
          const allScores = [
            ...studentExams.map(r => r.score),
            ...studentProjects.map(p => p.score),
          ]
          const avg =
            allScores.length > 0
              ? allScores.reduce((a, b) => a + b, 0) / allScores.length
              : 0
          return { name: student.name, avg }
        })
        .sort((a, b) => b.avg - a.avg)

      setRanking(rankingData)
    }
    load()
  }, [])

  const totalTasks = chartData.length
  const average =
    totalTasks > 0
      ? (chartData.reduce((a, b) => a + b.score, 0) / totalTasks).toFixed(1)
      : 0

  return (
    <div className="dashboard-container">
      <h1>Boshqaruv paneli</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Umumiy topshiriqlar</h3>
          <p>{totalTasks}</p>
        </div>
        <div className="stat-card">
          <h3>O'rtacha ball</h3>
          <p>{average}</p>
        </div>
      </div>

      {totalTasks > 0 && (
        <div className="chart-container">
          <h3>Ball o'sish grafigi</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#2563eb"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard
