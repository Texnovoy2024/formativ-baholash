import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import Register from './pages/Register/Register'
import Login from './pages/Login/Login'
import Metodika from './pages/Metodika/Metodika'
import About from './pages/About/About'

/* Teacher */
import TeacherLayout from './pages/teacher/TeacherLayout'
import AddTeacherPage from './pages/teacher/AddTeacherPage'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import ClassesPage from './pages/teacher/ClassesPage'
import ClassDetailPage from './pages/teacher/ClassDetailPage'
import TeacherTasksPage from './pages/teacher/TeacherTasksPage'
import TeacherResultsPage from './pages/teacher/TeacherResultsPage'
import ExamBuilder from './pages/teacher/ExamBuilder'
import ProjectBuilderPage from './pages/teacher/ProjectBuilderPage'
import ProjectSubmissionsPage from './pages/teacher/ProjectSubmissionsPage'

/* Student */
import StudentLayout from './pages/student/StudentLayout'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentTasksPage from './pages/student/StudentTasksPage'
import StudentExamPage from './pages/student/StudentExamPage'
import StudentResultsPage from './pages/student/StudentResultsPage'
import StudentProjectPage from './pages/student/StudentProjectPage'
import StudentProjectDetail from './pages/student/StudentProjectDetail'

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

/* ================= APP ================= */
function App() {
	return (
		<BrowserRouter>
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

				{/* ===== AUTH (Navbar yo‘q) ===== */}
				<Route path='/login' element={<Login />} />
				<Route path='/register' element={<Register />} />

				{/* ================= TEACHER PANEL ================= */}
				<Route
					path='/teacher'
					element={
						<ProtectedRoute allowedRole={['teacher', 'admin']}>
							<TeacherLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<TeacherDashboard />} />
					<Route
						path='add-teacher'
						element={
							<ProtectedRoute allowedRole='admin'>
								<AddTeacherPage />
							</ProtectedRoute>
						}
					/>
					<Route path='classes' element={<ClassesPage />} />
					<Route path='classes/:classId' element={<ClassDetailPage />} />
					<Route path='tasks' element={<TeacherTasksPage />} />
					<Route path='results' element={<TeacherResultsPage />} />
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
					<Route
						path='projects/:projectId'
						element={<StudentProjectDetail />}
					/>
				</Route>
			</Routes>
		</BrowserRouter>
	)
}

export default App
