import { NavLink, Outlet, useNavigate } from "react-router-dom"
import "./StudentLayout.css"

export default function StudentLayout() {
	const navigate = useNavigate()

	const handleLogout = () => {
		localStorage.removeItem("currentUser")
		navigate("/")
	}

	return (
		<div className="student-layout">

			{/* SIDEBAR */}
			<div className="student-sidebar">
				
				<div>
					<h2>O'quvchi oynasi</h2>

					<NavLink to="/student" end>
						Boshqaruv paneli
					</NavLink>

					<NavLink to="/student/tasks">
						Topshiriqlar
					</NavLink>

					<NavLink to="/student/results">
						Natijalar
					</NavLink>
				</div>

				{/* LOGOUT */}
				<button className="logout-btn" onClick={handleLogout}>
					Asosiy sahifaga qaytish
				</button>

			</div>

			{/* MAIN CONTENT */}
			<div className="student-main">
				<Outlet />
			</div>

		</div>
	)
}