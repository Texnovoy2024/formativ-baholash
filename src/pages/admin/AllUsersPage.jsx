import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '../../context/AuthContext'
import { FiSearch, FiUsers, FiTrash2, FiUser, FiUserCheck } from 'react-icons/fi'
import './AllUsersPage.css'
import { getAllClassesFn } from '../../context/authUtils'

export default function AllUsersPage() {
  const { getUsers, deleteUser } = useAuth()

  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('all')
  const [confirmId, setConfirmId] = useState(null)
  const [allClasses, setAllClasses] = useState([])

  useEffect(() => {
    const load = async () => {
      const [list, classes] = await Promise.all([
        getUsers(),
        getAllClassesFn(),
      ])
      setUsers(list)
      setAllClasses(classes)
    }
    load()
  }, [])

  const loadUsers = async () => {
    const list = await getUsers()
    setUsers(list)
  }

  const getClassName = (classId) => {
    if (!classId) return null
    return allClasses.find(c => String(c.id) === String(classId))?.name || null
  }

  const handleDelete = async () => {
    await deleteUser(confirmId)
    loadUsers()
    setConfirmId(null)
  }

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchRole = filter === 'all' || u.role === filter
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      const matchClass = classFilter === 'all' ||
        (classFilter === 'none' ? !u.classId : String(u.classId) === String(classFilter))
      return matchRole && matchSearch && matchClass
    })
  }, [users, search, filter, classFilter])

  const teacherCount = users.filter((u) => u.role === 'teacher').length
  const studentCount = users.filter((u) => u.role === 'student').length

  return (
    <div className='all-users-container'>
      <h1 className='all-users-title'>Barcha foydalanuvchilar</h1>

      {/* STATISTIKA */}
      <div className='users-stats'>
        <div className='users-stat-card'>
          <div className='stat-icon blue'>
            <FiUserCheck size={18} />
          </div>
          <div>
            <p className='stat-label'>O'qituvchilar</p>
            <span className='stat-count'>{teacherCount}</span>
          </div>
        </div>
        <div className='users-stat-card'>
          <div className='stat-icon green'>
            <FiUsers size={18} />
          </div>
          <div>
            <p className='stat-label'>O'quvchilar</p>
            <span className='stat-count'>{studentCount}</span>
          </div>
        </div>
        <div className='users-stat-card'>
          <div className='stat-icon purple'>
            <FiUser size={18} />
          </div>
          <div>
            <p className='stat-label'>Jami</p>
            <span className='stat-count'>{users.length}</span>
          </div>
        </div>
      </div>

      {/* SEARCH + FILTER */}
      <div className='users-toolbar'>
        <div className='search-box'>
          <FiSearch size={16} className='search-icon' />
          <input
            type='text'
            placeholder="Ism yoki email bo'yicha qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className='filter-tabs'>
          {['all', 'teacher', 'student'].map((role) => (
            <button
              key={role}
              className={`filter-tab ${filter === role ? 'active' : ''}`}
              onClick={() => setFilter(role)}
            >
              {role === 'all' ? 'Barchasi' : role === 'teacher' ? "O'qituvchi" : "O'quvchi"}
            </button>
          ))}
        </div>

        {/* Sinf filtri — faqat student yoki all tanlanganda */}
        {(filter === 'all' || filter === 'student') && allClasses.length > 0 && (
          <select
            className='class-filter-select'
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
          >
            <option value='all'>Barcha sinflar</option>
            {allClasses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value='none'>Sinfsiz</option>
          </select>
        )}
      </div>

      {/* RO'YXAT */}
      {filtered.length === 0 ? (
        <div className='users-empty'>
          <FiUsers size={40} />
          <p>Foydalanuvchilar topilmadi</p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE */}
          <div className='users-table-wrap'>
            <table className='users-table'>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ism</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Sinf</th>
                  <th>Amal</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td className='row-num'>{i + 1}</td>
                    <td>
                      <div className='user-name-cell'>
                        <div className='avatar-sm'>
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        {u.name}
                      </div>
                    </td>
                    <td className='email-cell'>{u.email}</td>
                    <td>
                      <span className={`role-badge role-${u.role}`}>
                        {u.role === 'teacher' ? "O'qituvchi" : "O'quvchi"}
                      </span>
                    </td>
                    <td>
                      {u.role === 'student' && u.classId
                        ? <span className='class-badge'>{getClassName(u.classId)}</span>
                        : <span className='no-class'>—</span>
                      }
                    </td>
                    <td>
                      <button
                        className='delete-btn icon'
                        onClick={() => setConfirmId(u.id)}
                        title="O'chirish"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className='users-cards'>
            {filtered.map((u) => (
              <div className='user-card' key={u.id}>
                <div className='user-card-left'>
                  <div className='avatar-sm'>
                    {u.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className='user-card-name'>{u.name}</div>
                    <div className='user-card-email'>{u.email}</div>
                    <span className={`role-badge role-${u.role}`}>
                      {u.role === 'teacher' ? "O'qituvchi" : "O'quvchi"}
                    </span>
                    {u.role === 'student' && u.classId && (
                      <span className='class-badge' style={{ marginLeft: 6 }}>
                        {getClassName(u.classId)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className='delete-btn icon'
                  onClick={() => setConfirmId(u.id)}
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* TASDIQLASH MODALI */}
      {confirmId && (
        <div className='modal-overlay'>
          <div className='modal-box delete'>
            <div className='modal-icon delete'>
              <FiTrash2 size={22} />
            </div>
            <h3>O'chirish</h3>
            <p>Rostdan ham bu foydalanuvchini o'chirmoqchimisiz?</p>
            <div className='modal-actions'>
              <button className='btn-cancel' onClick={() => setConfirmId(null)}>
                Bekor qilish
              </button>
              <button className='btn-danger' onClick={handleDelete}>
                O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
