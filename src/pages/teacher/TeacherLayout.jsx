import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import './TeacherLayout.css'

export default function TeacherLayout() {
	const [open, setOpen] = useState(false)
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
					<h2 className='sidebar-title'>O'qituvchi oynasi</h2>

					<nav className='sidebar-nav'>
						<NavLink to='/teacher' end onClick={handleLinkClick}>
							Boshqaruv paneli
						</NavLink>

						<NavLink to='/teacher/classes' onClick={handleLinkClick}>
							Sinflar
						</NavLink>

						<NavLink to='/teacher/tasks' onClick={handleLinkClick}>
							Topshiriqlar
						</NavLink>

						<NavLink to='/teacher/results' onClick={handleLinkClick}>
							Natijalar
						</NavLink>

						{currentUser?.role === 'admin' && (
							<NavLink to='/teacher/add-teacher' onClick={handleLinkClick}>
								O'qituvchi qo'shish
							</NavLink>
						)}
					</nav>
				</div>

				<div>
					{currentUser && (
						<div className='user-box'>
							<p>{currentUser.name}</p>
							<span>{currentUser.role}</span>
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