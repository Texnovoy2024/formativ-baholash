import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './TeacherLayout.css'

export default function TeacherLayout() {
	const [open, setOpen] = useState(false)
	const { logout } = useAuth()
	const [currentUser, setCurrentUser] = useState(null)

	useEffect(() => {
		try {
			const user = JSON.parse(localStorage.getItem('currentUser'))
			setCurrentUser(user)
		} catch {
			setCurrentUser(null)
		}
	}, [])

	const handleLogout = () => {
		logout()
	}

	const handleLinkClick = () => {
		setOpen(false)
	}

	return (
		<div className='teacher-layout'>

			{open && <div className="overlay" onClick={() => setOpen(false)} />}

			<header className='teacher-topbar'>
				<button className='menu-btn' onClick={() => setOpen(!open)}>
					☰
				</button>

				<h3>Mening panelim</h3>

				<div className='user-mini'>{currentUser?.name}</div>
			</header>

			<aside className={`teacher-sidebar ${open ? 'open' : ''}`}>
				<div>
					<h2 className='sidebar-title'>
						{currentUser?.role === 'admin' ? 'Admin oynasi' : "O'qituvchi oynasi"}
					</h2>

					<nav className='sidebar-nav'>
						<NavLink to='/teacher' end onClick={handleLinkClick}>
							Boshqaruv paneli
						</NavLink>

						{/* Admin uchun teacher funksiyalari ko'rsatilmaydi */}
						{currentUser?.role !== 'admin' && (
							<>
								<NavLink to='/teacher/tasks' onClick={handleLinkClick}>
									Topshiriqlar
								</NavLink>

								<NavLink to='/teacher/results' onClick={handleLinkClick}>
									Natijalar
								</NavLink>

								<NavLink to='/teacher/profile' onClick={handleLinkClick}>
									Profil
								</NavLink>
							</>
						)}

						{/* Admin uchun foydalanuvchilar boshqaruvi (Talab 4.1) */}
						{currentUser?.role === 'admin' && (
							<>
								<NavLink to='/teacher/admin' onClick={handleLinkClick}>
									Foydalanuvchilar boshqaruvi
								</NavLink>
								<NavLink to='/teacher/all-users' onClick={handleLinkClick}>
									Barcha foydalanuvchilar
								</NavLink>
							</>
						)}
					</nav>
				</div>

				<div>
					{currentUser && (
						<div className='user-box'>
							<p>{currentUser.name}</p>
							<span>{currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'teacher' ? "O'qituvchi" : "O'quvchi"}</span>
						</div>
					)}

					<button className='logout-btn' onClick={handleLogout}>
						Chiqish
					</button>
				</div>
			</aside>

			<main className='teacher-content'>
				<Outlet />
			</main>
		</div>
	)
}
