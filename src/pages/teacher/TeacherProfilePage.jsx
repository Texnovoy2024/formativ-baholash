import { useState, useMemo } from 'react'
import {
  User, Mail, Lock, Eye, EyeOff,
  CheckCircle, BookOpen, Users, BarChart3, Shield
} from 'lucide-react'
import './TeacherProfilePage.css'

export default function TeacherProfilePage() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {}

  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMsg, setPwMsg] = useState(null) // { type: 'success'|'error', text }

  // Statistika
  const stats = useMemo(() => {
    const tasksKey = `tasks_${currentUser.id}`
    const tasks = (() => {
      try { return JSON.parse(localStorage.getItem(tasksKey)) || [] } catch { return [] }
    })()

    const examResults = JSON.parse(localStorage.getItem('examResults')) || []
    const allExams = JSON.parse(localStorage.getItem('allExams')) || []
    const myExamIds = allExams.filter(e => e.teacherId === currentUser.id).map(e => e.id)
    const myResults = examResults.filter(r => myExamIds.includes(r.examId))

    const uniqueStudents = new Set(myResults.map(r => r.studentId)).size
    const avgScore = myResults.length > 0
      ? (myResults.reduce((a, b) => a + b.score, 0) / myResults.length).toFixed(1)
      : '—'

    return {
      taskCount: tasks.length,
      studentCount: uniqueStudents,
      avgScore,
      examCount: myExamIds.length,
    }
  }, [currentUser.id])

  const handleChangePassword = (e) => {
    e.preventDefault()
    setPwMsg(null)

    // Eski parolni tekshirish
    const users = JSON.parse(localStorage.getItem('users')) || []
    const user = users.find(u => String(u.id) === String(currentUser.id))

    if (!user || user.password !== oldPassword) {
      setPwMsg({ type: 'error', text: "Eski parol noto'g'ri" })
      return
    }

    if (newPassword.length < 6) {
      setPwMsg({ type: 'error', text: "Yangi parol kamida 6 belgidan iborat bo'lishi kerak" })
      return
    }

    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: "Yangi parollar mos kelmaydi" })
      return
    }

    // Parolni yangilash
    const updatedUsers = users.map(u =>
      String(u.id) === String(currentUser.id) ? { ...u, password: newPassword } : u
    )
    localStorage.setItem('users', JSON.stringify(updatedUsers))

    // currentUser ni ham yangilash
    const updatedCurrent = { ...currentUser, password: newPassword }
    localStorage.setItem('currentUser', JSON.stringify(updatedCurrent))

    setPwMsg({ type: 'success', text: "Parol muvaffaqiyatli o'zgartirildi" })
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const initials = currentUser.name
    ? currentUser.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'T'

  return (
    <div className="tpp-container">
      <h1 className="tpp-title">Mening profilim</h1>

      <div className="tpp-grid">

        {/* ── PROFIL KARTASI ── */}
        <div className="tpp-card">
          <div className="tpp-avatar-wrap">
            <div className="tpp-avatar">{initials}</div>
            <div>
              <div className="tpp-name">{currentUser.name || '—'}</div>
              <span className="tpp-role-badge">O'qituvchi</span>
            </div>
          </div>

          <div className="tpp-info-list">
            <div className="tpp-info-row">
              <User size={16} />
              <div>
                <p className="tpp-info-label">Ism familiya</p>
                <p className="tpp-info-value">{currentUser.name || '—'}</p>
              </div>
            </div>
            <div className="tpp-info-row">
              <Mail size={16} />
              <div>
                <p className="tpp-info-label">Email (login)</p>
                <p className="tpp-info-value">{currentUser.email || '—'}</p>
              </div>
            </div>
            <div className="tpp-info-row">
              <Shield size={16} />
              <div>
                <p className="tpp-info-label">Rol</p>
                <p className="tpp-info-value">O'qituvchi</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── STATISTIKA ── */}
        <div className="tpp-card">
          <h3 className="tpp-section-title">Faoliyat statistikasi</h3>
          <div className="tpp-stats-grid">
            <div className="tpp-stat">
              <div className="tpp-stat-icon blue"><BookOpen size={18} /></div>
              <div>
                <p className="tpp-stat-label">Topshiriqlar</p>
                <p className="tpp-stat-value">{stats.taskCount}</p>
              </div>
            </div>
            <div className="tpp-stat">
              <div className="tpp-stat-icon green"><Users size={18} /></div>
              <div>
                <p className="tpp-stat-label">O'quvchilar</p>
                <p className="tpp-stat-value">{stats.studentCount}</p>
              </div>
            </div>
            <div className="tpp-stat">
              <div className="tpp-stat-icon purple"><BarChart3 size={18} /></div>
              <div>
                <p className="tpp-stat-label">O'rtacha ball</p>
                <p className="tpp-stat-value">{stats.avgScore}</p>
              </div>
            </div>
            <div className="tpp-stat">
              <div className="tpp-stat-icon orange"><CheckCircle size={18} /></div>
              <div>
                <p className="tpp-stat-label">Imtihonlar</p>
                <p className="tpp-stat-value">{stats.examCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── PAROL O'ZGARTIRISH ── */}
        <div className="tpp-card tpp-full">
          <h3 className="tpp-section-title">
            <Lock size={18} /> Parolni o'zgartirish
          </h3>

          <form onSubmit={handleChangePassword} className="tpp-pw-form">
            <div className="tpp-pw-field">
              <label>Eski parol</label>
              <div className="tpp-pw-input">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="Eski parolni kiriting"
                  required
                />
                <span onClick={() => setShowOld(!showOld)}>
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              </div>
            </div>

            <div className="tpp-pw-field">
              <label>Yangi parol</label>
              <div className="tpp-pw-input">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Kamida 6 belgi"
                  required
                />
                <span onClick={() => setShowNew(!showNew)}>
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              </div>
            </div>

            <div className="tpp-pw-field">
              <label>Yangi parolni tasdiqlang</label>
              <div className="tpp-pw-input">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Parolni qayta kiriting"
                  required
                />
                <span onClick={() => setShowConfirm(!showConfirm)}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </span>
              </div>
            </div>

            {pwMsg && (
              <div className={`tpp-msg ${pwMsg.type}`}>
                {pwMsg.type === 'success' ? <CheckCircle size={15} /> : null}
                {pwMsg.text}
              </div>
            )}

            <button type="submit" className="tpp-save-btn">
              Parolni saqlash
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
