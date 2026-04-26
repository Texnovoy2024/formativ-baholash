import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './TeacherLayout.css'

export default function TeacherLayout() {
	const navigate = useNavigate()
	const [currentUser, setCurrentUser] = useState(null)

	useEffect(() => {
		const user = JSON.parse(localStorage.getItem('currentUser'))
		setCurrentUser(user)
	}, [])

	const handleLogout = () => {
		localStorage.removeItem('currentUser')
		navigate('/')
	}

	return (
		<div className='teacher-layout'>
			<aside className='teacher-sidebar'>
				<div>
					<h2 className='sidebar-title'>O'qituvchi oynasi</h2>

					<nav className='sidebar-nav'>
						<NavLink to='/teacher' end>
							Boshqaruv paneli
						</NavLink>

						<NavLink to='/teacher/classes'>
							Sinflar
						</NavLink>

						<NavLink to='/teacher/tasks'>
							Topshiriqlar
						</NavLink>

						<NavLink to='/teacher/results'>
							Natijalar
						</NavLink>

						{currentUser?.role === 'admin' && (
							<NavLink to='/teacher/add-teacher'>
								O'qituvchi qo'shish
							</NavLink>
						)}
					</nav>
				</div>

				{currentUser && (
					<div style={{ marginTop: '20px', fontSize: '13px', opacity: 0.7 }}>
						<p>{currentUser.name}</p>
						<p style={{ fontSize: '12px' }}>{currentUser.role}</p>
					</div>
				)}

				<button className='logout-btn' onClick={handleLogout}>
					Asosiy sahifaga qaytish
				</button>
			</aside>

			<main className='teacher-content'>
				<Outlet />
			</main>
		</div>
	)
}