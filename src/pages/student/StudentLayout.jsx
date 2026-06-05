import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import "./StudentLayout.css"

export default function StudentLayout() {
	const navigate = useNavigate()
	const location = useLocation()
	const [open, setOpen] = useState(false)
	const [activeExamId, setActiveExamId] = useState(null)

	// Har render da aktiv exam borligini tekshir
	useEffect(() => {
		const examId = localStorage.getItem("activeExamId")
		setActiveExamId(examId || null)
	}, [location.pathname])

	// Exam sahifasida emasligini aniqlash
	const isOnExam = location.pathname.startsWith("/student/exam/")

	// Aktiv exam bor va exam sahifasida emas — qaytarish
	useEffect(() => {
		if (activeExamId && !isOnExam) {
			navigate(`/student/exam/${activeExamId}`, { replace: true })
		}
	}, [activeExamId, isOnExam])

	const handleLogout = () => {
		localStorage.removeItem("currentUser")
		navigate("/")
	}

	const handleNavClick = (e) => {
		if (activeExamId && !isOnExam) {
			e.preventDefault()
			return
		}
		setOpen(false)
	}

	return (
		<div className="student-layout">

			<header className="student-topbar">
				<button onClick={() => setOpen(!open)}>☰</button>

				<h3>Mening panelim</h3>

				<div className="user-mini">{JSON.parse(localStorage.getItem('currentUser'))?.name || "O'quvchi"}</div>
			</header>

			<aside className={`student-sidebar ${open ? "open" : ""}`}>
				
				<div>
					<h2>O'quvchi oynasi</h2>

					{/* Aktiv exam banner */}
					{activeExamId && (
						<div className="sidebar-exam-warning">
							⚠️ Test jarayonida sahifalarni almashtirish mumkin emas
						</div>
					)}

					<nav className={`sidebar-nav ${activeExamId ? "sidebar-nav--locked" : ""}`}>
						<NavLink
							to="/student"
							end
							onClick={handleNavClick}
							className={activeExamId ? "nav-locked" : ""}
						>
							Boshqaruv paneli
						</NavLink>

						<NavLink
							to="/student/tasks"
							onClick={handleNavClick}
							className={activeExamId ? "nav-locked" : ""}
						>
							Topshiriqlar
						</NavLink>

						<NavLink
							to="/student/results"
							onClick={handleNavClick}
							className={activeExamId ? "nav-locked" : ""}
						>
							Natijalar
						</NavLink>

						<NavLink
							to="/student/profile"
							onClick={handleNavClick}
							className={activeExamId ? "nav-locked" : ""}
						>
							Profil
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