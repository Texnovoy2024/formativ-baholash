import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'

/* Layout Components */
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'

/* Home sections */
import Hero from './components/Hero/Hero'
import Stats from './components/Stats/Stats'
import Features from './components/Features/Features'
import Steps from './components/Steps/Steps'
import Methodology from './components/Methodology/Methodology'
import CTA from './components/CTA/CTA'

/* Pages */
import Login from './pages/Login/Login'
import Metodika from './pages/Metodika/Metodika'
import About from './pages/About/About'

/* Teacher */
import TeacherLayout from './pages/teacher/TeacherLayout'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherTasksPage from './pages/teacher/TeacherTasksPage'
import TeacherResultsPage from './pages/teacher/TeacherResultsPage'
import TeacherProfilePage from './pages/teacher/TeacherProfilePage'
import ExamBuilder from './pages/teacher/ExamBuilder'
import ProjectBuilderPage from './pages/teacher/ProjectBuilderPage'
import ProjectSubmissionsPage from './pages/teacher/ProjectSubmissionsPage'

/* Admin */
import AdminPanel from './pages/admin/AdminPanel'
import AdminDashboard from './pages/admin/AdminDashboard'
import AllUsersPage from './pages/admin/AllUsersPage'

/* Student */
import StudentLayout from './pages/student/StudentLayout'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentTasksPage from './pages/student/StudentTasksPage'
import StudentExamPage from './pages/student/StudentExamPage'
import StudentResultsPage from './pages/student/StudentResultsPage'
import StudentProjectPage from './pages/student/StudentProjectPage'
import StudentProjectDetail from './pages/student/StudentProjectDetail'
import StudentProfilePage from './pages/student/StudentProfilePage'

/* ================= HOME ================= */
function Home() {
	return (
		<>
			<Hero />
			<Stats />
			<Features />
			<Steps />
			<Methodology />
			<CTA />
		</>
	)
}

/* ================= MAIN LAYOUT ================= */
function MainLayout({ children }) {
	return (
		<>
			<Navbar />
			{children}
			<Footer />
		</>
	)
}

/* ================= TEACHER OR ADMIN DASHBOARD ================= */
function TeacherOrAdminDashboard() {
	const currentUser = JSON.parse(localStorage.getItem('currentUser'))
	if (currentUser?.role === 'admin') return <AdminDashboard />
	return <TeacherDashboard />
}

/* ================= APP ================= */
function App() {
	return (
		<BrowserRouter>
			<AuthProvider>
			<Routes>
				{/* ===== PUBLIC (Navbar + Footer bor) ===== */}
				<Route
					path='/'
					element={
						<MainLayout>
							<Home />
						</MainLayout>
					}
				/>

				<Route
					path='/metodika'
					element={
						<MainLayout>
							<Metodika />
						</MainLayout>
					}
				/>

				<Route
					path='/about'
					element={
						<MainLayout>
							<About />
						</MainLayout>
					}
				/>

				{/* ===== AUTH (Navbar yo'q) ===== */}
				<Route path='/login' element={<Login />} />
				{/* /register bloklangan — /login ga yo'naltirish (Talab 3.1, 3.4) */}
				<Route path='/register' element={<Navigate to='/login' replace />} />

				{/* ================= TEACHER PANEL ================= */}
				<Route
					path='/teacher'
					element={
						<ProtectedRoute allowedRole={['teacher', 'admin']}>
							<TeacherLayout />
						</ProtectedRoute>
					}
				>
					<Route
						index
						element={<TeacherOrAdminDashboard />}
					/>
					{/* Admin paneli — foydalanuvchilarni boshqarish (Talab 2, 5) */}
					<Route
						path='admin'
						element={
							<ProtectedRoute allowedRole='admin'>
								<AdminPanel />
							</ProtectedRoute>
						}
					/>
					<Route
						path='all-users'
						element={
							<ProtectedRoute allowedRole='admin'>
								<AllUsersPage />
							</ProtectedRoute>
						}
					/>
					<Route path='tasks' element={<TeacherTasksPage />} />
					<Route path='results' element={<TeacherResultsPage />} />
					<Route path='profile' element={<TeacherProfilePage />} />
					<Route path='exam-builder/:taskId' element={<ExamBuilder />} />
					<Route
						path='project-builder/:taskId'
						element={<ProjectBuilderPage />}
					/>
					<Route
						path='project-submissions/:projectId'
						element={<ProjectSubmissionsPage />}
					/>
				</Route>

				{/* ================= STUDENT PANEL ================= */}
				<Route
					path='/student'
					element={
						<ProtectedRoute allowedRole='student'>
							<StudentLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<StudentDashboard />} />
					<Route path='tasks' element={<StudentTasksPage />} />
					<Route path='exam/:examId' element={<StudentExamPage />} />
					<Route path='results' element={<StudentResultsPage />} />
					<Route path='projects' element={<StudentProjectPage />} />
					<Route path='projects/:projectId' element={<StudentProjectDetail />} />
					<Route path='profile' element={<StudentProfilePage />} />
				</Route>
			</Routes>
			</AuthProvider>
		</BrowserRouter>
	)
}

export default App
