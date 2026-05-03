import { useEffect, useState, useMemo } from "react"
import {
  BarChart3, Target, Trophy, AlertTriangle, Brain,
  Users, Clock, TrendingUp, ChevronDown, ChevronUp,
  Medal, Search, BookOpen,
} from "lucide-react"
import "./TeacherResultsPage.css"
import {
  getExamResultsFn,
  getProjectSubmissionsFn,
  getAllExamsFn,
  getAllProjectsFn,
  getTasksFn,
  getAllClassesFn,
  getStoredUsers,
} from "../../context/authUtils"

export default function TeacherResultsPage() {
  const [examResults, setExamResults] = useState([])
  const [allExams, setAllExams] = useState([])
  const [allClasses, setAllClasses] = useState([])
  const [studentMap, setStudentMap] = useState({})
  const [loading, setLoading] = useState(true)

  const [selectedExam, setSelectedExam] = useState("all")
  const [selectedClass, setSelectedClass] = useState("all")
  const [search, setSearch] = useState("")
  const [expandedStudent, setExpandedStudent] = useState(null)

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  useEffect(() => {
    const load = async () => {
      const [results, exams, projectSubs, projects, tasks, classes, users] =
        await Promise.all([
          getExamResultsFn(),
          getAllExamsFn(),
          getProjectSubmissionsFn(),
          getAllProjectsFn(),
          getTasksFn(currentUser?.id),
          getAllClassesFn(),
          getStoredUsers(),
        ])

      // Student map
      const map = {}
      users.filter(u => u.role === "student").forEach(u => {
        map[String(u.id)] = u
      })
      setStudentMap(map)
      setAllClasses(classes)

      const myExams = exams.filter(e => e.teacherId === currentUser?.id)
      const myExamIds = myExams.map(e => e.id)

      const examFiltered = results.filter(r => myExamIds.includes(r.examId))

      const myProjectTaskIds = tasks
        .filter(t => t.type === "project")
        .map(t => String(t.id))

      const projectResults = projectSubs
        .filter(s => myProjectTaskIds.includes(String(s.projectId)))
        .map(s => {
          const project = projects.find(p => String(p.id) === String(s.projectId))
          const student = users.find(u => String(u.id) === String(s.studentId))
          return {
            examId: s.projectId,
            examTitle: project?.title || "Loyiha",
            studentId: s.studentId,
            studentName: student?.name || s.studentName || "Noma'lum",
            score: s.score || 0,
            total: Number(project?.maxScore) || 100,
            date: s.submittedAt,
            type: "project",
            answers: [],
          }
        })

      const combined = [...examFiltered, ...projectResults]

      const projectExamEntries = tasks
        .filter(t => t.type === "project")
        .map(t => ({ id: t.id, examTitle: t.title }))

      setExamResults(combined)
      setAllExams([...myExams, ...projectExamEntries])
      setLoading(false)
    }
    load()
  }, [])

  const getClassName = (classId) => {
    if (!classId) return null
    return allClasses.find(c => String(c.id) === String(classId))?.name || null
  }

  const filtered = useMemo(() => {
    return examResults.filter(r => {
      const examMatch = selectedExam === "all" || String(r.examId) === String(selectedExam)
      const student = studentMap[String(r.studentId)]
      const classMatch = selectedClass === "all" ||
        String(student?.classId) === String(selectedClass)
      const searchMatch = !search ||
        (r.studentName || "").toLowerCase().includes(search.toLowerCase())
      return examMatch && classMatch && searchMatch
    })
  }, [examResults, selectedExam, selectedClass, search, studentMap])

  const totalSubmissions = filtered.length
  const averageScore = totalSubmissions > 0
    ? (filtered.reduce((a, b) => a + b.score, 0) / totalSubmissions).toFixed(1) : 0
  const highestScore = totalSubmissions > 0 ? Math.max(...filtered.map(r => r.score)) : 0
  const passCount = filtered.filter(r => r.total > 0 && r.score / r.total >= 0.6).length
  const passRate = totalSubmissions > 0 ? ((passCount / totalSubmissions) * 100).toFixed(0) : 0

  const uniqueStudents = useMemo(() => {
    const map = {}
    filtered.forEach(r => {
      if (!map[r.studentId]) {
        const student = studentMap[String(r.studentId)]
        map[r.studentId] = {
          studentId: r.studentId,
          studentName: r.studentName || "Noma'lum",
          classId: student?.classId || null,
          attempts: [],
        }
      }
      map[r.studentId].attempts.push(r)
    })
    return Object.values(map).sort((a, b) => {
      const aMax = Math.max(...a.attempts.map(x => x.score))
      const bMax = Math.max(...b.attempts.map(x => x.score))
      return bMax - aMax
    })
  }, [filtered, studentMap])

  const difficultQuestions = useMemo(() => {
    const stats = {}
    filtered.forEach(result => {
      result.answers?.forEach(ans => {
        const key = ans.questionId
        if (!stats[key]) stats[key] = { total: 0, wrong: 0, text: ans.questionText || `Savol ID: ${key}` }
        stats[key].total++
        if (!ans.correct) stats[key].wrong++
      })
    })
    return Object.entries(stats)
      .map(([id, data]) => ({ questionId: id, ...data, errorRate: data.wrong / data.total }))
      .filter(q => q.wrong >= 3)
      .sort((a, b) => b.wrong - a.wrong)
  }, [filtered])

  const scoreDistribution = useMemo(() => {
    const buckets = { "0-20%": 0, "21-40%": 0, "41-60%": 0, "61-80%": 0, "81-100%": 0 }
    filtered.forEach(r => {
      if (!r.total) return
      const pct = (r.score / r.total) * 100
      if (pct <= 20) buckets["0-20%"]++
      else if (pct <= 40) buckets["21-40%"]++
      else if (pct <= 60) buckets["41-60%"]++
      else if (pct <= 80) buckets["61-80%"]++
      else buckets["81-100%"]++
    })
    const max = Math.max(...Object.values(buckets), 1)
    return Object.entries(buckets).map(([label, count]) => ({ label, count, pct: (count / max) * 100 }))
  }, [filtered])

  const formatDate = iso => {
    if (!iso) return "—"
    const d = new Date(iso)
    return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
  }

  const medalColor = i => ["#f59e0b", "#9ca3af", "#b45309"][i] || "#e5e7eb"

  if (loading) return <div className="tr-container"><p>Yuklanmoqda...</p></div>

  return (
    <div className="tr-container">
      <div className="tr-header-row">
        <h1 className="tr-title">
          <BarChart3 size={24} />
          Natijalar analitikasi
        </h1>
      </div>

      <div className="tr-toolbar">
        <div className="tr-search-box">
          <Search size={15} className="tr-search-icon" />
          <input
            placeholder="O'quvchi ismi bo'yicha qidirish..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <select
          className="tr-exam-select"
          value={selectedExam}
          onChange={e => setSelectedExam(e.target.value)}
        >
          <option value="all">Barcha imtihonlar</option>
          {allExams.map(e => (
            <option key={e.id} value={e.id}>{e.examTitle}</option>
          ))}
        </select>

        <select
          className="tr-exam-select"
          value={selectedClass}
          onChange={e => setSelectedClass(e.target.value)}
        >
          <option value="all">Barcha sinflar</option>
          {allClasses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="tr-summary-grid">
        <div className="tr-summary-card">
          <div className="tr-card-icon blue"><Target size={20} /></div>
          <div><p>Topshirilgan testlar</p><h3>{totalSubmissions}</h3></div>
        </div>
        <div className="tr-summary-card">
          <div className="tr-card-icon green"><Trophy size={20} /></div>
          <div><p>O'rtacha ball</p><h3>{averageScore}</h3></div>
        </div>
        <div className="tr-summary-card">
          <div className="tr-card-icon purple"><TrendingUp size={20} /></div>
          <div><p>O'tish foizi</p><h3>{passRate}%</h3></div>
        </div>
        <div className="tr-summary-card">
          <div className="tr-card-icon orange"><Medal size={20} /></div>
          <div><p>Eng yuqori ball</p><h3>{highestScore}</h3></div>
        </div>
      </div>

      {totalSubmissions === 0 ? (
        <div className="tr-no-data">
          <BarChart3 size={48} />
          <p>
            {search || selectedExam !== "all" || selectedClass !== "all"
              ? "Filtr bo'yicha natijalar topilmadi"
              : "Hozircha natijalar yo'q"}
          </p>
        </div>
      ) : (
        <>
          <div className="tr-section">
            <h2><BarChart3 size={20} /> Ball taqsimoti</h2>
            <div className="tr-distribution">
              {scoreDistribution.map(({ label, count, pct }) => (
                <div key={label} className="tr-dist-row">
                  <span className="tr-dist-label">{label}</span>
                  <div className="tr-dist-bar-wrap">
                    <div className="tr-dist-bar" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="tr-dist-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="tr-section">
            <h2><Users size={20} /> O'quvchilar natijalari</h2>
            <div className="tr-student-list">
              {uniqueStudents.map((s, i) => {
                const best = Math.max(...s.attempts.map(x => x.score))
                const latest = [...s.attempts].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
                const pct = latest.total > 0 ? Math.round((best / latest.total) * 100) : 0
                const isExpanded = expandedStudent === s.studentId
                const className = getClassName(s.classId)

                return (
                  <div key={s.studentId} className="tr-student-card">
                    <div
                      className="tr-student-header"
                      onClick={() => setExpandedStudent(isExpanded ? null : s.studentId)}
                    >
                      <div className="tr-student-left">
                        <div className="tr-avatar" style={{ background: i < 3 ? medalColor(i) + "33" : "#e0ecff" }}>
                          {i < 3
                            ? <Medal size={16} color={medalColor(i)} />
                            : <span>{s.studentName.slice(0, 2).toUpperCase()}</span>
                          }
                        </div>
                        <div>
                          <div className="tr-student-name">{s.studentName}</div>
                          <div className="tr-student-meta">
                            {s.attempts.length} ta topshiriq · Eng yaxshi: {best} ball
                            {className && (
                              <span className="tr-class-badge">
                                <BookOpen size={11} />
                                {className}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="tr-student-right">
                        <div className={`tr-pct-badge ${pct >= 60 ? "pass" : "fail"}`}>{pct}%</div>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="tr-student-attempts">
                        {[...s.attempts]
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((attempt, ai) => (
                            <div key={ai} className="tr-attempt-row">
                              <div className="tr-attempt-exam">{attempt.examTitle || "Imtihon"}</div>
                              <div className="tr-attempt-score">{attempt.score} / {attempt.total} ball</div>
                              <div className="tr-attempt-date">
                                <Clock size={13} />
                                {formatDate(attempt.date)}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="tr-section">
            <h2><AlertTriangle size={20} /> Eng qiyin savollar <span className="tr-threshold">(3+ xato)</span></h2>
            {difficultQuestions.length === 0 ? (
              <p className="tr-empty">Hozircha 3 va undan ko'p xato bo'lgan savollar yo'q.</p>
            ) : (
              <div className="tr-hard-list">
                {difficultQuestions.map((q, i) => (
                  <div key={i} className="tr-hard-card">
                    <div className="tr-hard-top">
                      <Brain size={16} />
                      <span className="tr-hard-text">{q.text}</span>
                    </div>
                    <div className="tr-hard-stats">
                      <span className="tr-wrong-badge">{q.wrong} xato / {q.total} urinish</span>
                      <span className="tr-error-rate">{(q.errorRate * 100).toFixed(0)}% xato</span>
                    </div>
                    <div className="tr-progress">
                      <div className="tr-progress-fill" style={{ width: `${q.errorRate * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
