/**
 * AuthUtils — Firebase Realtime Database bilan ishlaydi.
 * localStorage faqat currentUser sessiyasi uchun ishlatiladi.
 */

import { db } from '../firebase'
import {
  ref,
  get,
  set,
  push,
  remove,
  update,
  child,
} from 'firebase/database'

export const ADMIN_USER = {
  id: 'admin',
  name: 'Admin',
  email: 'qosimovamuxlisaxon04@gmail.com',
  password: 'hasanova4',
  role: 'admin',
}

/* ─────────────────────────────────────────
   YORDAMCHI: Firebase dan users o'qish
───────────────────────────────────────── */
export const getStoredUsers = async () => {
  try {
    const snapshot = await get(ref(db, 'users'))
    if (!snapshot.exists()) return []
    const data = snapshot.val()
    return Object.values(data)
  } catch {
    return []
  }
}

/* ─────────────────────────────────────────
   LOGIN
───────────────────────────────────────── */
export const loginFn = async (email, password) => {
  // Admin tekshiruvi
  if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
    localStorage.setItem('currentUser', JSON.stringify(ADMIN_USER))
    return { success: true, role: 'admin' }
  }

  try {
    const users = await getStoredUsers()
    const foundUser = users.find(
      (u) => u.email === email && u.password === password,
    )

    if (!foundUser) {
      return { success: false, message: "Email yoki parol noto'g'ri" }
    }

    localStorage.setItem('currentUser', JSON.stringify(foundUser))
    return { success: true, role: foundUser.role }
  } catch {
    return { success: false, message: 'Xatolik yuz berdi' }
  }
}

/* ─────────────────────────────────────────
   LOGOUT
───────────────────────────────────────── */
export const logoutFn = () => {
  localStorage.removeItem('currentUser')
}

/* ─────────────────────────────────────────
   ADD USER
───────────────────────────────────────── */
export const addUserFn = async (userData) => {
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

  try {
    const users = await getStoredUsers()
    const existingUser = users.find((u) => u.email === userData.email)
    if (existingUser) {
      return { success: false, message: 'Bu email allaqachon mavjud' }
    }

    const role =
      userData.role === 'teacher' || userData.role === 'student'
        ? userData.role
        : 'student'

    const newUser = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      role,
      ...(role === 'student' && userData.classId
        ? { classId: String(userData.classId) }
        : {}),
    }

    await set(ref(db, `users/${newUser.id}`), newUser)
    return { success: true }
  } catch (err) {
    return { success: false, message: 'Firebase xatoligi: ' + err.message }
  }
}

/* ─────────────────────────────────────────
   DELETE USER
───────────────────────────────────────── */
export const deleteUserFn = async (userId) => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))

  if (!currentUser || currentUser.role !== 'admin') {
    return { success: false, message: "Sizda ruxsat yo'q" }
  }

  if (userId === 'admin') {
    return { success: false, message: "Admin o'chirilmaydi" }
  }

  try {
    await remove(ref(db, `users/${userId}`))
    return { success: true }
  } catch (err) {
    return { success: false, message: 'Firebase xatoligi: ' + err.message }
  }
}

/* ─────────────────────────────────────────
   GET USERS (admin uchun)
───────────────────────────────────────── */
export const getUsersFn = async () => {
  const users = await getStoredUsers()
  return users.filter((u) => u.role !== 'admin')
}

/* ─────────────────────────────────────────
   REGISTER — har doim bloklangan
───────────────────────────────────────── */
export const registerFn = () => {
  return { success: false, message: "Ro'yxatdan o'tish taqiqlangan" }
}

/* ═══════════════════════════════════════════
   SINFLAR (Classes)
═══════════════════════════════════════════ */

/** Admin sinflarini olish */
export const getAdminClassesFn = async () => {
  try {
    const snapshot = await get(ref(db, 'admin_classes'))
    if (!snapshot.exists()) return []
    return Object.values(snapshot.val())
  } catch {
    return []
  }
}

/** Admin sinf qo'shish */
export const addAdminClassFn = async (classData) => {
  try {
    await set(ref(db, `admin_classes/${classData.id}`), classData)
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

/** Teacher sinflarini olish */
export const getTeacherClassesFn = async (teacherId) => {
  try {
    const snapshot = await get(ref(db, `classes/${teacherId}`))
    if (!snapshot.exists()) return []
    return Object.values(snapshot.val())
  } catch {
    return []
  }
}

/** Teacher sinf saqlash (to'liq massiv) */
export const saveTeacherClassesFn = async (teacherId, classes) => {
  try {
    const obj = {}
    classes.forEach((c) => { obj[c.id] = c })
    await set(ref(db, `classes/${teacherId}`), obj)
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

/** Barcha sinflarni yig'ish (admin + barcha teacherlar) */
export const getAllClassesFn = async () => {
  const result = []
  try {
    const adminClasses = await getAdminClassesFn()
    adminClasses.forEach((c) => result.push(c))
  } catch { /* skip */ }
  try {
    const snapshot = await get(ref(db, 'classes'))
    if (snapshot.exists()) {
      const data = snapshot.val()
      Object.values(data).forEach((teacherClasses) => {
        Object.values(teacherClasses).forEach((c) => {
          if (!result.find((r) => String(r.id) === String(c.id))) {
            result.push(c)
          }
        })
      })
    }
  } catch { /* skip */ }
  return result
}

/* ═══════════════════════════════════════════
   TOPSHIRIQLAR (Tasks)
═══════════════════════════════════════════ */

export const getTasksFn = async (teacherId) => {
  try {
    const snapshot = await get(ref(db, `tasks/${teacherId}`))
    if (!snapshot.exists()) return []
    return Object.values(snapshot.val())
  } catch {
    return []
  }
}

export const saveTasksFn = async (teacherId, tasks) => {
  try {
    const obj = {}
    tasks.forEach((t) => { obj[t.id] = t })
    await set(ref(db, `tasks/${teacherId}`), obj)
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

/* ═══════════════════════════════════════════
   TESTLAR (Exams)
═══════════════════════════════════════════ */

export const getAllExamsFn = async () => {
  try {
    const snapshot = await get(ref(db, 'allExams'))
    if (!snapshot.exists()) return []
    return Object.values(snapshot.val())
  } catch {
    return []
  }
}

export const saveExamFn = async (examData) => {
  try {
    await set(ref(db, `allExams/${examData.id}`), examData)
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

/* ═══════════════════════════════════════════
   LOYIHALAR (Projects)
═══════════════════════════════════════════ */

export const getAllProjectsFn = async () => {
  try {
    const snapshot = await get(ref(db, 'allProjects'))
    if (!snapshot.exists()) return []
    return Object.values(snapshot.val())
  } catch {
    return []
  }
}

export const saveProjectFn = async (projectData) => {
  try {
    await set(ref(db, `allProjects/${projectData.id}`), projectData)
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

/* ═══════════════════════════════════════════
   TEST NATIJALARI (Exam Results)
═══════════════════════════════════════════ */

export const getExamResultsFn = async () => {
  try {
    const snapshot = await get(ref(db, 'examResults'))
    if (!snapshot.exists()) return []
    return Object.values(snapshot.val())
  } catch {
    return []
  }
}

export const addExamResultFn = async (result) => {
  try {
    const key = `${result.examId}_${result.studentId}_${Date.now()}`
    await set(ref(db, `examResults/${key}`), result)
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

/* ═══════════════════════════════════════════
   LOYIHA TOPSHIRISHLARI (Project Submissions)
═══════════════════════════════════════════ */

export const getProjectSubmissionsFn = async () => {
  try {
    const snapshot = await get(ref(db, 'projectSubmissions'))
    if (!snapshot.exists()) return []
    return Object.values(snapshot.val())
  } catch {
    return []
  }
}

export const saveProjectSubmissionFn = async (submission) => {
  try {
    const key = `${submission.projectId}_${submission.studentId}`
    await set(ref(db, `projectSubmissions/${key}`), submission)
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

export const updateProjectSubmissionFn = async (projectId, studentId, updates) => {
  try {
    const key = `${projectId}_${studentId}`
    await update(ref(db, `projectSubmissions/${key}`), updates)
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}
