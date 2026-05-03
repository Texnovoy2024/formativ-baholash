import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { FiUsers, FiUser, FiUserCheck } from 'react-icons/fi'
import './AdminDashboard.css'

export default function AdminDashboard() {
  const { getUsers } = useAuth()
  const [users, setUsers] = useState([])

  useEffect(() => {
    const load = async () => {
      const list = await getUsers()
      setUsers(list)
    }
    load()
  }, [])

  const teacherCount = users.filter((u) => u.role === 'teacher').length
  const studentCount = users.filter((u) => u.role === 'student').length
  const totalCount = users.length

  return (
    <div className='admin-dashboard-container'>
      <h1 className='admin-dashboard-title'>Boshqaruv paneli</h1>

      <div className='admin-dashboard-grid'>

        {/* O'QITUVCHILAR */}
        <div className='admin-dashboard-card'>
          <div className='admin-card-icon blue'>
            <FiUserCheck size={22} />
          </div>
          <div>
            <p className='admin-card-label'>O'qituvchilar</p>
            <h2>{teacherCount}</h2>
          </div>
        </div>

        {/* O'QUVCHILAR */}
        <div className='admin-dashboard-card'>
          <div className='admin-card-icon green'>
            <FiUsers size={22} />
          </div>
          <div>
            <p className='admin-card-label'>O'quvchilar</p>
            <h2>{studentCount}</h2>
          </div>
        </div>

        {/* JAMI */}
        <div className='admin-dashboard-card'>
          <div className='admin-card-icon purple'>
            <FiUser size={22} />
          </div>
          <div>
            <p className='admin-card-label'>Jami foydalanuvchilar</p>
            <h2>{totalCount}</h2>
          </div>
        </div>

      </div>
    </div>
  )
}
