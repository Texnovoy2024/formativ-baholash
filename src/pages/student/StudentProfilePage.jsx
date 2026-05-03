import { useState, useEffect } from 'react'
import {
  User, Mail, Lock, Eye, EyeOff,
  CheckCircle, BookOpen, Trophy, TrendingUp, Shield
} from 'lucide-react'
import './StudentProfilePage.css'
import {
  getExamResultsFn,
  getProjectSubmissionsFn,
  getStoredUsers,
  getAllClassesFn,
} from '../../context/authUtils'
import { db } from '../../firebase'
import { ref, update } from 'firebase/database'

export default function StudentProfilePage() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {}

  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwMsg, setPwMsg] = useState(null)

  const [className, setClassName] = useState(null)
  const [stats, setStats] = useState({
    examCount: 0,
    projectCount: 0,
    avgScore: '—',
    passCount: 0,
  })

  useEffect(() => {
    const load = async () => {
      const [examResults, projectSubs, classes] = await Promise.all([
        getExamResultsFn(),
        getProjectSubmissionsFn(),
        getAllClassesFn(),
      ])

      if (currentUser.classId) {
        const found = classes.find(c => String(c.id) === String(currentUser.classId))
        setClassName(found?.name || null)
      }

      const myExams = examResults.filter(r => String(r.studentId) === String(currentUser.id))
      const myProjects = projectSubs.filter(s => String(s.studentId) === String(currentUser.id))

      const avgScore = myExams.length > 0
        ? (myExams.reduce((a, b) => a + b.score, 0) / myExams.length).toFixed(1)
        : '—'
      const passCount = myExams.filter(r => r.total > 0 && r.score / r.total >= 0.6).length

      setStats({
        examCount: myExams.length,
        projectCount: myProjects.length,
        avgScore,
        passCount,
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
    : 'S'

  return (
    <div className="spp-container">
      <h1 className="spp-title">Mening profilim</h1>

      <div className="spp-grid">
        <div className="spp-card">
          <div className="spp-avatar-wrap">
            <div className="spp-avatar">{initials}</div>
            <div>
              <div className="spp-name">{currentUser.name || '—'}</div>
              <span className="spp-role-badge">O'quvchi</span>
            </div>
          </div>

          <div className="spp-info-list">
            <div className="spp-info-row">
              <User size={16} />
              <div>
                <p className="spp-info-label">Ism familiya</p>
                <p className="spp-info-value">{currentUser.name || '—'}</p>
              </div>
            </div>
            <div className="spp-info-row">
              <Mail size={16} />
              <div>
                <p className="spp-info-label">Email (login)</p>
                <p className="spp-info-value">{currentUser.email || '—'}</p>
              </div>
            </div>
            <div className="spp-info-row">
              <BookOpen size={16} />
              <div>
                <p className="spp-info-label">Sinf / Guruh</p>
                <p className="spp-info-value">
                  {className
                    ? <span className="spp-class-badge">{className}</span>
                    : <span style={{ color: '#9ca3af' }}>Belgilanmagan</span>
                  }
                </p>
              </div>
            </div>
            <div className="spp-info-row">
              <Shield size={16} />
              <div>
                <p className="spp-info-label">Rol</p>
                <p className="spp-info-value">O'quvchi</p>
              </div>
            </div>
          </div>
        </div>

        <div className="spp-card">
          <h3 className="spp-section-title">Mening natijalarim</h3>
          <div className="spp-stats-grid">
            <div className="spp-stat">
              <div className="spp-stat-icon blue"><BookOpen size={18} /></div>
              <div>
                <p className="spp-stat-label">Testlar</p>
                <p className="spp-stat-value">{stats.examCount}</p>
              </div>
            </div>
            <div className="spp-stat">
              <div className="spp-stat-icon green"><CheckCircle size={18} /></div>
              <div>
                <p className="spp-stat-label">O'tilgan</p>
                <p className="spp-stat-value">{stats.passCount}</p>
              </div>
            </div>
            <div className="spp-stat">
              <div className="spp-stat-icon purple"><Trophy size={18} /></div>
              <div>
                <p className="spp-stat-label">O'rtacha ball</p>
                <p className="spp-stat-value">{stats.avgScore}</p>
              </div>
            </div>
            <div className="spp-stat">
              <div className="spp-stat-icon orange"><TrendingUp size={18} /></div>
              <div>
                <p className="spp-stat-label">Loyihalar</p>
                <p className="spp-stat-value">{stats.projectCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="spp-card spp-full">
          <h3 className="spp-section-title">
            <Lock size={18} /> Parolni o'zgartirish
          </h3>

          <form onSubmit={handleChangePassword} className="spp-pw-form">
            <div className="spp-pw-field">
              <label>Eski parol</label>
              <div className="spp-pw-input">
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

            <div className="spp-pw-field">
              <label>Yangi parol</label>
              <div className="spp-pw-input">
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

            <div className="spp-pw-field">
              <label>Yangi parolni tasdiqlang</label>
              <div className="spp-pw-input">
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
              <div className={`spp-msg ${pwMsg.type}`}>
                {pwMsg.type === 'success' ? <CheckCircle size={15} /> : null}
                {pwMsg.text}
              </div>
            )}

            <button type="submit" className="spp-save-btn">
              Parolni saqlash
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
