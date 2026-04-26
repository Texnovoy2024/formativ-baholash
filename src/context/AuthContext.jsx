import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)

	useEffect(() => {
		let users = JSON.parse(localStorage.getItem('users'))

		if (!users || users.length === 0) {
			const defaultTeacher = {
				id: 'main-teacher',
				name: 'Main Teacher',
				email: 'qosimovamuxlisaxon04@gmail.com',
				password: 'hasanova4',
				role: 'admin',
			}

			users = [defaultTeacher]
			localStorage.setItem('users', JSON.stringify(users))
		}

		const savedUser = JSON.parse(localStorage.getItem('currentUser'))
		if (savedUser) {
			setUser(savedUser)
		}
	}, [])
	const register = userData => {
		const users = JSON.parse(localStorage.getItem('users')) || []

		const existingUser = users.find(u => u.email === userData.email)
		if (existingUser) {
			return { success: false, message: 'Bu email allaqachon mavjud' }
		}

		if (userData.role === 'teacher') {
			return {
				success: false,
				message: "Teacher sifatida ro'yxatdan o'tish mumkin emas",
			}
		}

		const newUser = {
			id: Date.now(),
			...userData,
			role: 'student',
		}

		users.push(newUser)
		localStorage.setItem('users', JSON.stringify(users))

		return { success: true }
	}

	const addTeacher = teacherData => {
		const currentUser = JSON.parse(localStorage.getItem('currentUser'))

		if (!currentUser || currentUser.role !== 'admin') {
			return { success: false, message: 'Sizda ruxsat yo‘q ❌' }
		}

		const users = JSON.parse(localStorage.getItem('users')) || []

		const existingUser = users.find(u => u.email === teacherData.email)
		if (existingUser) {
			return { success: false, message: 'Bu email allaqachon mavjud' }
		}

		const newTeacher = {
			id: Date.now(),
			name: teacherData.name,
			email: teacherData.email,
			password: teacherData.password,
			role: 'teacher',
		}

		users.push(newTeacher)
		localStorage.setItem('users', JSON.stringify(users))

		return { success: true }
	}
	const login = (email, password) => {
		const users = JSON.parse(localStorage.getItem('users')) || []

		const foundUser = users.find(
			u => u.email === email && u.password === password,
		)

		if (!foundUser) {
			return { success: false, message: 'Email yoki parol noto‘g‘ri' }
		}

		localStorage.setItem('currentUser', JSON.stringify(foundUser))
		setUser(foundUser)

		return { success: true, role: foundUser.role }
	}

	const logout = () => {
		localStorage.removeItem('currentUser')
		setUser(null)
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				register,
				login,
				logout,
				addTeacher,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}

export const useAuth = () => useContext(AuthContext)
