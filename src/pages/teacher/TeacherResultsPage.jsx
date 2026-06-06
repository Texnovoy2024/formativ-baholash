import { useEffect, useState, useMemo } from "react"
import {
  BarChart3, Target, Trophy, AlertTriangle, Brain,
  Users, Clock, TrendingUp, ChevronDown, ChevronUp,
  Medal, Search, BookOpen, CheckCircle
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
  deleteExamResultFn,
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
  const [selectedResult, setSelectedResult] = useState(null)

  // Qayta topshirish
  const [retakeTarget, setRetakeTarget] = useState(null) // { examId, studentId, studentName, examTitle }
  const [isRetaking, setIsRetaking] = useState(false)

  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  useEffect(() => {
    if (!currentUser) return // Auth check

    const load = async () => {
      setLoading(true)
      try {
        const [results, exams, projectSubs, projects, tasks, classes, users] =
          await Promise.all([
            getExamResultsFn(null, true, currentUser.id),
            getAllExamsFn(),
            getProjectSubmissionsFn(null, true, currentUser.id),
            getAllProjectsFn(),
            getTasksFn(currentUser.id),
            getAllClassesFn(),
            getStoredUsers(),
          ])

        // 🚀 OPTIMIZATION: Use Maps for O(1) lookups
        const uMap = {}
        if (users && Array.isArray(users)) {
          users.forEach(u => { uMap[String(u.id)] = u })
        }
        setStudentMap(uMap)
        setAllClasses(classes || [])

        const myExams = (exams || []).filter(e => String(e.teacherId) === String(currentUser.id))
        const myExamIdSet = new Set(myExams.map(e => String(e.id)))
        const examFiltered = (results || []).filter(r => myExamIdSet.has(String(r.examId)))

        const projectsMap = {}
        if (projects && Array.isArray(projects)) {
          projects.forEach(p => { projectsMap[String(p.id)] = p })
        }

        const projectTaskMap = {}
        if (tasks && Array.isArray(tasks)) {
          tasks.filter(t => t.type === "project").forEach(t => { projectTaskMap[String(t.id)] = t })
        }

      const projectResults = (projectSubs || [])
        .filter(s => !!projectTaskMap[String(s.projectId)])
        .map(s => {
          const project = projectsMap[String(s.projectId)]
          const student = uMap[String(s.studentId)]
          const task = projectTaskMap[String(s.projectId)]
          return {
            examId: s.projectId,
            examTitle: task?.title || project?.title || "Loyiha",
            studentId: s.studentId,
            studentName: student?.name || "Noma'lum",
            score: s.score || 0,
            total: Number(project?.maxScore) || 100,
            date: s.submittedAt || new Date().toISOString(),
            type: "project",
            answers: [],
          }
        })

      const combined = [...examFiltered, ...projectResults]
      const projectExamEntries = Object.values(projectTaskMap).map(t => ({ id: t.id, examTitle: t.title }))

      setExamResults(combined)
      setAllExams([...myExams, ...projectExamEntries])
    } catch (err) {
      console.error("Teacher Load Error:", err)
    } finally {
      setLoading(false)
    }
  }
  load()
}, [currentUser?.id])

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

  const confirmRetake = async () => {
    if (!retakeTarget) return
    setIsRetaking(true)
    const res = await deleteExamResultFn(retakeTarget.examId, retakeTarget.studentId)
    if (res.success) {
      // Local state dan ham o'chirish
      setExamResults(prev => prev.filter(
        r => !(String(r.examId) === String(retakeTarget.examId) && String(r.studentId) === String(retakeTarget.studentId))
      ))
    }
    setIsRetaking(false)
    setRetakeTarget(null)
  }

  const formatDate = iso => {
    if (!iso) return "—"
    const d = new Date(iso)
    return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1).toString().padStart(2, "0")}.${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
  }

  const handlePrint = (result) => {
    const pct = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0
    const date = formatDate(result.date)

    const answersHtml = result.answers?.map((ans, idx) => {
      const opts = ans.options?.map((opt, oIdx) => {
        let bg = '#ffffff'; let color = '#374151'; let border = '#e5e7eb'
        if (oIdx === ans.correctIndex) { bg = '#ecfdf5'; color = '#065f46'; border = '#10b981' }
        if (oIdx === ans.chosen && !ans.correct) { bg = '#fef2f2'; color = '#991b1b'; border = '#ef4444' }
        const letter = ['A','B','C','D'][oIdx] || oIdx
        const check = oIdx === ans.correctIndex ? ' ✓' : ''
        return `<div style="padding:8px 12px;border-radius:8px;border:1px solid ${border};background:${bg};color:${color};margin-bottom:6px;font-size:13px"><b>${letter})</b> ${opt}${check}</div>`
      }).join('') || ''

      const cardBg = ans.correct ? '#f0fdf4' : '#fef2f2'
      const cardBorder = ans.correct ? '#10b981' : '#ef4444'
      return `
        <div style="background:${cardBg};border:1px solid #e5e7eb;border-left:5px solid ${cardBorder};border-radius:10px;padding:16px;margin-bottom:14px;page-break-inside:avoid">
          <div style="font-weight:600;font-size:14px;margin-bottom:12px;color:#0f172a">${idx+1}. ${ans.questionText || ''}</div>
          ${opts}
        </div>`
    }).join('') || '<p>Ma\'lumotlar mavjud emas.</p>'

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <title>${result.examTitle} - ${result.studentName}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px 32px; color: #0f172a; }
        h1 { font-size: 20px; margin: 0 0 6px; }
        .meta { font-size: 13px; color: #6b7280; margin-bottom: 4px; }
        hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
        @media print { @page { margin: 18mm 14mm; size: A4; } }
      </style>
    </head><body>
      <h1>${result.examTitle}</h1>
      <p class="meta">O'quvchi: <b>${result.studentName}</b></p>
      <p class="meta">Ball: <b>${result.score} / ${result.total}</b> &nbsp;|&nbsp; Foiz: <b>${pct}%</b></p>
      <p class="meta">Sana: ${date}</p>
      <hr>
      ${answersHtml}
      <script>document.addEventListener('DOMContentLoaded',function(){window.print();window.onafterprint=function(){window.close()}})<\/script>
    </body></html>`

    const w = window.open('', '_blank', 'width=800,height=700')
    w.document.write(html)
    w.document.close()
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
                              <div className="tr-attempt-actions">
                                <button 
                                  className="tr-view-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedResult(attempt);
                                  }}
                                >
                                  Natijalar
                                </button>
                                {attempt.type !== "project" && (
                                  <button
                                    className="tr-retake-btn"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setRetakeTarget({
                                        examId: attempt.examId,
                                        studentId: s.studentId,
                                        studentName: s.studentName,
                                        examTitle: attempt.examTitle,
                                      })
                                    }}
                                  >
                                    Qayta topshirish
                                  </button>
                                )}
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

      {/* QAYTA TOPSHIRISH MODALI */}
      {retakeTarget && (
        <div className="tr-modal-overlay" onClick={() => !isRetaking && setRetakeTarget(null)}>
          <div className="tr-modal tr-retake-modal" onClick={e => e.stopPropagation()}>
            <div className="tr-modal-header">
              <h3>Qayta topshirish</h3>
              {!isRetaking && (
                <button className="tr-close-modal" onClick={() => setRetakeTarget(null)}>&times;</button>
              )}
            </div>
            {isRetaking ? (
              <div className="tr-retake-progress">
                <div className="tr-retake-spinner" />
                <p>Natija o'chirilmoqda...</p>
              </div>
            ) : (
              <>
                <p className="tr-retake-info">
                  <strong>{retakeTarget.studentName}</strong> uchun{" "}
                  <strong>"{retakeTarget.examTitle}"</strong> testi natijasi o'chirilib,
                  student qayta topshirish imkoniyatiga ega bo'ladi.
                </p>
                <p className="tr-retake-warn">
                  ⚠️ Eski natija butunlay o'chib ketadi!
                </p>
                <div className="tr-retake-actions">
                  <button className="tr-retake-cancel" onClick={() => setRetakeTarget(null)}>
                    Bekor qilish
                  </button>
                  <button className="tr-retake-confirm" onClick={confirmRetake}>
                    Ha, ruxsat berish
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* DETAILED RESULTS MODAL */}
      {selectedResult && (
        <div className="tr-modal-overlay" onClick={() => setSelectedResult(null)}>
          <div className="tr-modal tr-printable" onClick={e => e.stopPropagation()}>
            <div className="tr-modal-header">
              <div className="tr-modal-title-group">
                <h3>{selectedResult.studentName}</h3>
                <p>{selectedResult.examTitle} · {formatDate(selectedResult.date)}</p>
              </div>
              <div className="tr-modal-header-actions">
                <button
                  className="tr-print-btn"
                  onClick={() => handlePrint(selectedResult)}
                  title="PDF sifatida saqlash"
                >
                  ⬇ PDF
                </button>
                <button className="tr-close-modal" onClick={() => setSelectedResult(null)}>&times;</button>
              </div>
            </div>
            
            <div className="tr-modal-content">
              {/* Print uchun header */}
              <div className="tr-print-header">
                <h2>{selectedResult.examTitle}</h2>
                <p>O'quvchi: <strong>{selectedResult.studentName}</strong></p>
                <p>Ball: <strong>{selectedResult.score} / {selectedResult.total}</strong> &nbsp;|&nbsp; Foiz: <strong>{selectedResult.total > 0 ? Math.round((selectedResult.score / selectedResult.total) * 100) : 0}%</strong></p>
                <p>Sana: {formatDate(selectedResult.date)}</p>
                <hr />
              </div>

              <div className="tr-modal-score-summary">
                <div className="tr-score-stat">
                  <span>To'plangan ball</span>
                  <strong>{selectedResult.score} / {selectedResult.total}</strong>
                </div>
                <div className="tr-score-stat">
                  <span>Foiz ko'rsatkichi</span>
                  <strong>{selectedResult.total > 0 ? Math.round((selectedResult.score / selectedResult.total) * 100) : 0}%</strong>
                </div>
              </div>

              <div className="tr-ans-list">
                {selectedResult.answers && selectedResult.answers.length > 0 ? (
                  selectedResult.answers.map((ans, idx) => (
                    <div key={idx} className={`tr-ans-card ${ans.correct ? 'correct' : 'wrong'}`}>
                      <div className="tr-ans-q">
                        <span className="tr-q-num">Savol {idx + 1}:</span>
                        <strong>{ans.questionText || 'Savol matni mavjud emas'}</strong>
                      </div>
                      
                      <div className="tr-ans-options">
                        {ans.options?.map((opt, oIdx) => {
                          let statusClass = "";
                          if (oIdx === ans.correctIndex) statusClass = "correct-opt";
                          if (oIdx === ans.chosen && !ans.correct) statusClass = "wrong-opt";

                          return (
                            <div key={oIdx} className={`tr-ans-opt ${statusClass}`}>
                              <span className="tr-opt-marker">
                                {oIdx === 0 ? 'A' : oIdx === 1 ? 'B' : oIdx === 2 ? 'C' : 'D'})
                              </span>
                              <span className="tr-opt-text">{opt}</span>
                              {oIdx === ans.correctIndex && <CheckCircle size={14} className="tr-opt-icon" />}
                            </div>
                          )
                        })}
                        
                        {!ans.options && (
                          <div className="tr-ans-no-opt">
                             <div className={`tr-ans-box ${ans.correct ? 'correct' : 'wrong'}`}>
                               <div>Tanlangan: <strong>{ans.chosen !== null ? String.fromCharCode(65 + ans.chosen) : '—'}</strong></div>
                               <div>To'g'ri: <strong>{String.fromCharCode(65 + ans.correctIndex)}</strong></div>
                             </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="tr-no-details">
                    <AlertTriangle size={40} color="#94a3b8" />
                    <p>Bu urinish uchun batafsil test natijalari saqlanmagan.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
