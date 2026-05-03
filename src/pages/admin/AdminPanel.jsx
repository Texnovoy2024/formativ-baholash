import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import './AdminPanel.css'
import { FiEye, FiEyeOff, FiUser, FiUsers, FiTrash2, FiCheckCircle } from 'react-icons/fi'
import { getAdminClassesFn, addAdminClassFn, getAllClassesFn } from '../../context/authUtils'

const AdminPanel = () => {
  const { addUser, deleteUser, getUsers } = useAuth()

  const [activeTab, setActiveTab] = useState('teacher')
  const [showPassword, setShowPassword] = useState(false)
  const [successModal, setSuccessModal] = useState(false)
  const [confirmModal, setConfirmModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    classId: '',
  })

  const [users, setUsers] = useState([])
  const [newClassName, setNewClassName] = useState('')
  const [availableClasses, setAvailableClasses] = useState([])

  // Barcha sinflarni yig'ish
  const loadAllClasses = async () => {
    return await getAllClassesFn()
  }

  useEffect(() => {
    loadUsers()
    loadClasses()
  }, [])

  const loadUsers = async () => {
    const list = await getUsers()
    setUsers(list)
  }

  const loadClasses = async () => {
    const classes = await loadAllClasses()
    setAvailableClasses(classes)
  }

  const handleChange = (e) => {
    setErrorMessage('')
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    // Yangi sinf yaratish kerak bo'lsa
    let resolvedClassId = form.classId
    if (activeTab === 'student' && form.classId === '__new__') {
      if (!newClassName.trim()) {
        setErrorMessage("Sinf nomini kiriting")
        return
      }
      const newClass = { id: Date.now().toString(), name: newClassName.trim(), teacherName: 'Admin' }
      await addAdminClassFn(newClass)
      resolvedClassId = newClass.id
      const updatedClasses = await loadAllClasses()
      setAvailableClasses(updatedClasses)
      setNewClassName('')
    }

    const result = await addUser({
      name: form.name,
      email: form.email,
      password: form.password,
      role: activeTab,
      classId: activeTab === 'student' ? resolvedClassId || null : null,
    })

    if (!result.success) {
      setErrorMessage(result.message)
      return
    }

    setSuccessModal(true)
    setForm({ name: '', email: '', password: '', classId: '' })
    loadUsers()
  }

  const handleDeleteClick = (userId) => {
    setSelectedUserId(userId)
    setConfirmModal(true)
  }

  const confirmDelete = async () => {
    await deleteUser(selectedUserId)
    loadUsers()
    setConfirmModal(false)
    setSelectedUserId(null)
  }

  // Aktiv tabga mos foydalanuvchilarni filtrlash
  const filteredUsers = users.filter((u) => u.role === activeTab)

  const tabLabel = activeTab === 'teacher' ? "O'qituvchi" : "O'quvchi"
  const listLabel = activeTab === 'teacher' ? "O'qituvchilar" : "O'quvchilar"

  return (
    <div className='admin-panel-container'>

      {/* TAB TANLASH */}
      <div className='admin-tabs'>
        <button
          className={`admin-tab ${activeTab === 'teacher' ? 'active' : ''}`}
          onClick={() => { setActiveTab('teacher'); setErrorMessage('') }}
        >
          O'qituvchi
        </button>
        <button
          className={`admin-tab ${activeTab === 'student' ? 'active' : ''}`}
          onClick={() => { setActiveTab('student'); setErrorMessage('') }}
        >
          O'quvchi
        </button>
      </div>

      {/* FORMA */}
      <div className='teacher-form-card'>
        <div className='form-header'>
          <div className='form-icon'>
            <FiUser size={20} />
          </div>
          <h2>{tabLabel} qo'shish</h2>
        </div>

        <form onSubmit={handleSubmit} className='add-teacher-form'>
          <input
            name='name'
            placeholder='Ism'
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name='email'
            type='email'
            placeholder='Email'
            value={form.email}
            onChange={handleChange}
            required
          />

          <div className='password-field'>
            <input
              name='password'
              type={showPassword ? 'text' : 'password'}
              placeholder='Parol (kamida 6 belgi)'
              value={form.password}
              onChange={handleChange}
              required
              minLength={6}
            />
            <span
              className='eye-icon'
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </span>
          </div>

          {/* Sinf tanlash — faqat student uchun */}
          {activeTab === 'student' && (
            <>
              <select
                name='classId'
                value={form.classId}
                onChange={handleChange}
                className='admin-select'
              >
                <option value=''>Sinf tanlang (ixtiyoriy)</option>
                {availableClasses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} — {c.teacherName}
                  </option>
                ))}
                <option value='__new__'>+ Yangi sinf yaratish</option>
              </select>

              {form.classId === '__new__' && (
                <input
                  placeholder="Yangi sinf nomi (masalan: 11-A)"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                  className='admin-new-class-input'
                />
              )}
            </>
          )}

          {errorMessage && (
            <p className='admin-error-msg'>{errorMessage}</p>
          )}

          <button type='submit' className='primary-btn'>
            + Qo'shish
          </button>
        </form>
      </div>

      {/* RO'YXAT */}
      <div className='teacher-list-card'>
        <div className='list-header'>
          <div className='form-icon'>
            <FiUsers size={20} />
          </div>
          <h3>{listLabel} ro'yxati</h3>
        </div>

        {filteredUsers.length === 0 ? (
          <p className='empty-msg'>Hozircha foydalanuvchilar yo'q</p>
        ) : (
          <>
            {/* DESKTOP TABLE */}
            <table className='teacher-table'>
              <thead>
                <tr>
                  <th>Ism</th>
                  <th>Email</th>
                  <th>Rol</th>
                  {activeTab === 'student' && <th>Sinf</th>}
                  <th>Amal</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge role-${u.role}`}>
                        {u.role === 'teacher' ? "O'qituvchi" : "O'quvchi"}
                      </span>
                    </td>
                    {activeTab === 'student' && (
                      <td>
                        {u.classId
                          ? availableClasses.find(c => String(c.id) === String(u.classId))?.name || '—'
                          : '—'}
                      </td>
                    )}
                    <td>
                      <button
                        className='delete-btn icon'
                        onClick={() => handleDeleteClick(u.id)}
                        title="O'chirish"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* MOBILE CARDS */}
            <div className='teacher-cards'>
              {filteredUsers.map((u) => (
                <div className='teacher-card' key={u.id}>
                  <div className='teacher-left'>
                    <div className='avatar'>
                      {u.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className='teacher-name'>{u.name}</div>
                      <div className='teacher-email'>{u.email}</div>
                      <span className={`role-badge role-${u.role}`}>
                        {u.role === 'teacher' ? "O'qituvchi" : "O'quvchi"}
                      </span>
                      {u.role === 'student' && u.classId && (
                        <div className='teacher-email' style={{ marginTop: 2 }}>
                          Sinf: {availableClasses.find(c => String(c.id) === String(u.classId))?.name || '—'}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    className='delete-btn icon'
                    onClick={() => handleDeleteClick(u.id)}
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* MUVAFFAQIYAT MODALI */}
      {successModal && (
        <div className='modal-overlay'>
          <div className='modal-box success'>
            <div className='modal-icon success'>
              <FiCheckCircle size={22} />
            </div>
            <h3>Muvaffaqiyatli</h3>
            <p>{tabLabel} qo'shildi!</p>
            <div className='modal-actions'>
              <button className='btn-primary' onClick={() => setSuccessModal(false)}>
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TASDIQLASH MODALI */}
      {confirmModal && (
        <div className='modal-overlay'>
          <div className='modal-box delete'>
            <div className='modal-icon delete'>
              <FiTrash2 size={22} />
            </div>
            <h3>O'chirish</h3>
            <p>Rostdan ham foydalanuvchini o'chirmoqchimisiz?</p>
            <div className='modal-actions'>
              <button className='btn-cancel' onClick={() => setConfirmModal(false)}>
                Bekor qilish
              </button>
              <button className='btn-danger' onClick={confirmDelete}>
                Davom etish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPanel
