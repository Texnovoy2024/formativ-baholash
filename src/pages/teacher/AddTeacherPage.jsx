import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import './AddTeacherPage.css'
import { FiEye, FiEyeOff } from "react-icons/fi";

const AddTeacherPage = () => {
  const { addTeacher } = useAuth()

  const [showPassword, setShowPassword] = useState(false)
  const [successModal, setSuccessModal] = useState(false) // 🔥 NEW

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })

  const [teachers, setTeachers] = useState([])

  useEffect(() => {
    loadTeachers()
  }, [])

  const loadTeachers = () => {
    const users = JSON.parse(localStorage.getItem('users')) || []
    const onlyTeachers = users.filter(u => u.role === 'teacher')
    setTeachers(onlyTeachers)
  }

  const handleChange = e => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = e => {
    e.preventDefault()

    const res = addTeacher(form)

    if (!res.success) {
      alert(res.message)
      return
    }

    // ❌ alert olib tashlandi
    setSuccessModal(true) // ✅ modal

    setForm({
      name: '',
      email: '',
      password: '',
    })

    loadTeachers()
  }

  const handleDelete = id => {
    if (id === 'main-teacher') {
      alert('Main Teacher o‘chirilmaydi ❌')
      return
    }

    const users = JSON.parse(localStorage.getItem('users')) || []
    const updated = users.filter(u => u.id !== id)

    localStorage.setItem('users', JSON.stringify(updated))
    loadTeachers()
  }

  return (
    <div className='add-teacher-container'>
      <h2 className='add-teacher-title'>O'qituvchi qo‘shish</h2>

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
          placeholder='Email'
          value={form.email}
          onChange={handleChange}
          required
        />

        <div className="password-field">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Parol"
            value={form.password}
            onChange={handleChange}
            required
          />

          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        <button type='submit'>Qo‘shish</button>
      </form>

      {/* LIST */}
      <div style={{ marginTop: '40px' }}>
        <h3>O'qituvchilar ro‘yxati</h3>

        {teachers.length === 0 ? (
          <p>Hozircha o'qituvchi yo'q</p>
        ) : (
          <table className='teacher-table'>
            <thead>
              <tr>
                <th>Ism</th>
                <th>Email</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {teachers.map(t => (
                <tr key={t.id}>
                  <td>{t.name}</td>
                  <td>{t.email}</td>
                  <td>
                    <button
                      className='delete-btn'
                      disabled={t.id === 'main-teacher'}
                      onClick={() => handleDelete(t.id)}
                    >
                      O‘chirish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 🔥 MODAL */}
      {successModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>✅ Muvaffaqiyatli</h3>
            <p>O‘qituvchi qo‘shildi!</p>

            <button onClick={() => setSuccessModal(false)}>
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddTeacherPage