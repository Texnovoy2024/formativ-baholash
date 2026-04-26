import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useState } from "react"
import "./StudentLayout.css"

export default function StudentLayout() {
	const navigate = useNavigate()
	const [open, setOpen] = useState(false)

	const handleLogout = () => {
		localStorage.removeItem("currentUser")
		navigate("/")
	}

	return (
		<div className="student-layout">

			<header className="student-topbar">
				<button onClick={() => setOpen(!open)}>☰</button>

				<h3>Mening panelim</h3>

				<div className="user-mini">Student</div>
			</header>

			<aside className={`student-sidebar ${open ? "open" : ""}`}>
				
				<div>
					<h2>O'quvchi oynasi</h2>

					<nav className="sidebar-nav">
						<NavLink to="/student" end onClick={() => setOpen(false)}>
							Boshqaruv paneli
						</NavLink>

						<NavLink to="/student/tasks" onClick={() => setOpen(false)}>
							Topshiriqlar
						</NavLink>

						<NavLink to="/student/results" onClick={() => setOpen(false)}>
							Natijalar
						</NavLink>
					</nav>
				</div>

				<button className="logout-btn" onClick={handleLogout}>
					Asosiy sahifaga qaytish
				</button>

			</aside>

			{open && <div className="overlay" onClick={() => setOpen(false)} />}

			<main className="student-main">
				<Outlet />
			</main>

		</div>
	)
}