/**
 * AuthContext mantiqini sof funksiyalar sifatida eksport qiladi.
 * Bu funksiyalar React Context-dan mustaqil ravishda test qilinishi mumkin.
 */

export const ADMIN_USER = {
  id: 'admin',
  name: 'Admin',
  email: 'qosimovamuxlisaxon04@gmail.com',
  password: 'hasanova4',
  role: 'admin',
}

/**
 * localStorage-dan users massivini xavfsiz o'qiydi
 */
export const getStoredUsers = () => {
  try {
    return JSON.parse(localStorage.getItem('users')) || []
  } catch {
    return []
  }
}

/**
 * login(email, password) → { success, role?, message? }
 */
export const loginFn = (email, password) => {
  if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
    localStorage.setItem('currentUser', JSON.stringify(ADMIN_USER))
    return { success: true, role: 'admin' }
  }

  const users = getStoredUsers()
  const foundUser = users.find(
    (u) => u.email === email && u.password === password,
  )

  if (!foundUser) {
    return { success: false, message: "Email yoki parol noto'g'ri" }
  }

  localStorage.setItem('currentUser', JSON.stringify(foundUser))
  return { success: true, role: foundUser.role }
}

/**
 * logoutFn() → void
 */
export const logoutFn = () => {
  localStorage.removeItem('currentUser')
}

/**
 * addUserFn(userData) → { success, message? }
 */
export const addUserFn = (userData) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))

  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, message: "Sizda ruxsat yo'q" }
  }

  if (!userData.password || userData.password.length < 6) {
    return {
      success: false,
      message: "Parol kamida 6 belgidan iborat bo'lishi kerak",
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(userData.email)) {
    return { success: false, message: "Noto'g'ri email format" }
  }

  if (userData.email === ADMIN_USER.email) {
    return { success: false, message: 'Bu email allaqachon mavjud' }
  }

  const users = getStoredUsers()
  const existingUser = users.find((u) => u.email === userData.email)
  if (existingUser) {
    return { success: false, message: 'Bu email allaqachon mavjud' }
  }

  const role =
    userData.role === 'teacher' || userData.role === 'student'
      ? userData.role
      : 'student'

  const newUser = {
    id: Date.now(),
    name: userData.name,
    email: userData.email,
    password: userData.password,
    role,
    ...(role === 'student' && userData.classId ? { classId: userData.classId } : {}),
  }

  users.push(newUser)
  localStorage.setItem('users', JSON.stringify(users))

  return { success: true }
}

/**
 * deleteUserFn(userId) → { success, message? }
 */
export const deleteUserFn = (userId) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))

  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, message: "Sizda ruxsat yo'q" }
  }

  if (userId === 'admin') {
    return { success: false, message: "Admin o'chirilmaydi" }
  }

  const users = getStoredUsers()
  const exists = users.find((u) => u.id === userId)
  if (!exists) {
    return { success: false, message: 'Foydalanuvchi topilmadi' }
  }

  const updated = users.filter((u) => u.id !== userId)
  localStorage.setItem('users', JSON.stringify(updated))

  return { success: true }
}

/**
 * getUsersFn() → User[]
 */
export const getUsersFn = () => {
  const users = getStoredUsers()
  return users.filter((u) => u.role !== 'admin')
}

/**
 * registerFn() → { success: false }
 * Har doim bloklangan
 */
export const registerFn = () => {
  return { success: false, message: "Ro'yxatdan o'tish taqiqlangan" }
}
