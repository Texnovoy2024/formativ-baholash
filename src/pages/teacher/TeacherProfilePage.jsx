import { useState, useEffect } from 'react'
import {
  User, Mail, Lock, Eye, EyeOff,
  CheckCircle, BookOpen, Users, BarChart3, Shield
} from 'lucide-react'
import './TeacherProfilePage.css'
import {
  getTasksFn,
  getAllExamsFn,
  getExamResultsFn,
  getStoredUsers,
} from '../../context/authUtils'
import { db } from '../../firebase'
import { ref, update } from 'firebase/database'

export default function TeacherProfilePage() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {}

  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMsg, setPwMsg] = useState(null)

  const [stats, setStats] = useState({
    taskCount: 0,
    studentCount: 0,
    avgScore: '—',
    examCount: 0,
  })

  useEffect(() => {
    const load = async () => {
      const [tasks, exams, results] = await Promise.all([
        getTasksFn(currentUser.id),
        getAllExamsFn(),
        getExamResultsFn(),
      ])

      const myExamIds = exams.filter(e => e.teacherId === currentUser.id).map(e => e.id)
      const myResults = results.filter(r => myExamIds.includes(r.examId))
      const uniqueStudents = new Set(myResults.map(r => r.studentId)).size
      const avgScore = myResults.length > 0
        ? (myResults.reduce((a, b) => a + b.score, 0) / myResults.length).toFixed(1)
        : '—'

      setStats({
        taskCount: tasks.length,
        studentCount: uniqueStudents,
        avgScore,
        examCount: myExamIds.length,
      })
    }
    load()
  }, [])

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPwMsg(null)

    const users = await getStoredUsers()
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

    await update(ref(db, `users/${currentUser.id}`), { password: newPassword })
    localStorage.setItem('currentUser', JSON.stringify({ ...currentUser, password: newPassword }))

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
