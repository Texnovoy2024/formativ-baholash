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
  query,
  orderByChild,
  equalTo,
} from 'firebase/database'

export const ADMIN_USER = {
  id: 'admin',
  name: 'Admin',
  email: 'saydullaxonovhasanxonn@gmail.com',
  password: 'kamina2004',
  role: 'admin',
}

// KESHLASH UCHUN GLOBAL O'ZGARUVCHILAR
const _cache = {
  exams: { data: null, time: 0 },
  results: {}, // { [key]: { data, time } }
  projectSubmissions: {}, // { [key]: { data, time } }
  projects: { data: null, time: 0 },
  classes: { data: null, time: 0 },
  users: { data: null, time: 0 },
  lastGlobalUpdate: 0
};

const CACHE_TIMEOUT = 60000; // 1 daqiqa keshda turadi

/* ─────────────────────────────────────────
   YORDAMCHI: Firebase dan users o'qish
───────────────────────────────────────── */
export const getStoredUsers = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && _cache.users.data && (now - _cache.users.time < CACHE_TIMEOUT)) {
    return _cache.users.data;
  }
  try {
    const snapshot = await get(ref(db, 'users'))
    if (!snapshot.exists()) return []
    const data = Object.values(snapshot.val())
    _cache.users = { data, time: now };
    return data
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
    _cache.users.time = 0; // Keshni yangilashga majburlash
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
    _cache.users.time = 0;
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
    _cache.classes.time = 0;
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

/** Admin sinf nomini yangilash */
export const updateAdminClassFn = async (classId, newName) => {
  try {
    await update(ref(db, `admin_classes/${classId}`), { name: newName })
    _cache.classes.time = 0;
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

/**
 * Sinfni kaskad o'chirish:
 * 1. admin_classes dan o'chirish
 * 2. O'sha sinfdagi studentlarni o'chirish
 * 3. O'sha sinfga tegishli tasklar/examlar/projectlarni o'chirish
 * 4. O'sha sinfga tegishli natijalar va topshirishlarni o'chirish
 */
export const deleteClassCascadeFn = async (classId) => {
  try {
    const cId = String(classId)

    // 1. Sinfning o'zini o'chirish
    await remove(ref(db, `admin_classes/${cId}`))

    // 2. O'sha sinfdagi studentlarni topib o'chirish
    const usersSnap = await get(ref(db, 'users'))
    if (usersSnap.exists()) {
      const users = Object.values(usersSnap.val())
      const studentsInClass = users.filter(u => u.role === 'student' && String(u.classId) === cId)
      for (const student of studentsInClass) {
        await remove(ref(db, `users/${student.id}`))
      }
    }

    // 3. allExams dan o'sha sinfga tegishlilarini o'chirish
    const examsSnap = await get(ref(db, 'allExams'))
    if (examsSnap.exists()) {
      const exams = Object.entries(examsSnap.val())
      for (const [key, exam] of exams) {
        if (String(exam.classId) === cId) {
          await remove(ref(db, `allExams/${key}`))
        }
      }
    }

    // 4. allProjects dan o'sha sinfga tegishlilarini o'chirish
    const projectsSnap = await get(ref(db, 'allProjects'))
    if (projectsSnap.exists()) {
      const projects = Object.entries(projectsSnap.val())
      for (const [key, project] of projects) {
        if (String(project.classId) === cId) {
          await remove(ref(db, `allProjects/${key}`))
        }
      }
    }

    // 5. examResults dan o'sha sinfga tegishlilarini o'chirish
    const resultsSnap = await get(ref(db, 'examResults'))
    if (resultsSnap.exists()) {
      const results = Object.entries(resultsSnap.val())
      for (const [key, result] of results) {
        if (String(result.classId) === cId) {
          await remove(ref(db, `examResults/${key}`))
        }
      }
    }

    // 6. projectSubmissions dan o'sha sinfga tegishlilarini o'chirish
    const subsSnap = await get(ref(db, 'projectSubmissions'))
    if (subsSnap.exists()) {
      const subs = Object.entries(subsSnap.val())
      for (const [key, sub] of subs) {
        if (String(sub.classId) === cId) {
          await remove(ref(db, `projectSubmissions/${key}`))
        }
      }
    }

    // Keshni tozalash
    _cache.classes.time = 0
    _cache.users.time = 0
    _cache.exams.time = 0
    _cache.projects.time = 0
    _cache.results = {}
    _cache.projectSubmissions = {}

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
    _cache.classes.time = 0;
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

/** Barcha sinflarni yig'ish (admin + barcha teacherlar) */
export const getAllClassesFn = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && _cache.classes.data && (now - _cache.classes.time < CACHE_TIMEOUT)) {
    return _cache.classes.data;
  }
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
  _cache.classes = { data: result, time: now };
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

export const getAllExamsFn = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && _cache.exams.data && (now - _cache.exams.time < CACHE_TIMEOUT)) {
    return _cache.exams.data;
  }
  try {
    const snapshot = await get(ref(db, 'allExams'))
    if (!snapshot.exists()) return []
    const data = Object.values(snapshot.val())
    _cache.exams = { data, time: now };
    return data
  } catch {
    return []
  }
}

export const saveExamFn = async (examData) => {
  try {
    await set(ref(db, `allExams/${examData.id}`), examData)
    _cache.exams.time = 0;
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

/* ═══════════════════════════════════════════
   LOYIHALAR (Projects)
═══════════════════════════════════════════ */

export const getAllProjectsFn = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && _cache.projects.data && (now - _cache.projects.time < CACHE_TIMEOUT)) {
    return _cache.projects.data;
  }
  try {
    const snapshot = await get(ref(db, 'allProjects'))
    if (!snapshot.exists()) return []
    const data = Object.values(snapshot.val())
    _cache.projects = { data, time: now };
    return data
  } catch {
    return []
  }
}

export const saveProjectFn = async (projectData) => {
  try {
    await set(ref(db, `allProjects/${projectData.id}`), projectData)
    _cache.projects.time = 0;
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

/* ═══════════════════════════════════════════
   TEST NATIJALARI (Exam Results)
═══════════════════════════════════════════ */

export const getExamResultsFn = async (studentId = null, forceRefresh = false, teacherId = null) => {
  const now = Date.now();
  const cacheKey = studentId ? `s_${studentId}` : (teacherId ? `t_${teacherId}` : 'all');
  const entry = _cache.results[cacheKey];
  
  if (!forceRefresh && entry && (now - entry.time < CACHE_TIMEOUT)) {
    return entry.data;
  }

  try {
    const resultsRef = ref(db, 'examResults');
    let data = [];

    // Fallback: Agar indexlar yo'q bo'lsa yoki query ishlamasa, hammasini o'qib filter qilamiz
    // Bu xavfsizroq va natijalar ko'rinmasligi muammosini hal qiladi.
    const snapshot = await get(resultsRef);
    
    if (snapshot.exists()) {
      const allResults = Object.values(snapshot.val());
      
      if (studentId) {
        data = allResults.filter(r => String(r.studentId) === String(studentId));
      } else if (teacherId) {
        data = allResults.filter(r => String(r.teacherId) === String(teacherId));
      } else {
        data = allResults;
      }
    }
    
    _cache.results[cacheKey] = { data, time: now };
    return data;
  } catch (err) {
    console.error("Firebase Fetch Error:", err);
    return [];
  }
}

/** Bitta student ning bitta exam natijasini o'chirish (qayta topshirish uchun) */
export const deleteExamResultFn = async (examId, studentId) => {
  try {
    const snapshot = await get(ref(db, 'examResults'))
    if (!snapshot.exists()) return { success: true }

    const entries = Object.entries(snapshot.val())
    const toDelete = entries.filter(
      ([, r]) => String(r.examId) === String(examId) && String(r.studentId) === String(studentId)
    )

    for (const [key] of toDelete) {
      await remove(ref(db, `examResults/${key}`))
    }

    // Keshni tozalash
    _cache.results = {}
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

export const addExamResultFn = async (result) => {
  try {
    // Ma'lumot turlari aniqligini ta'minlash
    const cleanResult = {
      ...result,
      score: Number(result.score || 0),
      total: Number(result.total || 0),
      studentId: String(result.studentId),
      examId: String(result.examId),
      date: result.date || new Date().toISOString(),
      // answers array ichidagi barcha maydonlarni tozalash
      answers: (result.answers || []).map(a => ({
        ...a,
        questionId: String(a.questionId ?? ''),
        chosen: a.chosen !== null && a.chosen !== undefined ? Number(a.chosen) : null,
        correctIndex: a.correctIndex !== null && a.correctIndex !== undefined ? Number(a.correctIndex) : null,
        correct: Boolean(a.correct),
      })),
    }

    const key = `${cleanResult.examId}_${cleanResult.studentId}_${Date.now()}`
    await set(ref(db, `examResults/${key}`), cleanResult)
    
    // Keshni tozalash
    _cache.results = {};
    _cache.lastGlobalUpdate = Date.now();
    
    return { success: true }
  } catch (err) {
    console.error("Add Result Error:", err)
    return { success: false, message: err.message }
  }
}

/* ═══════════════════════════════════════════
   LOYIHA TOPSHIRISHLARI (Project Submissions)
═══════════════════════════════════════════ */

export const getProjectSubmissionsFn = async (studentId = null, forceRefresh = false, teacherId = null) => {
  const now = Date.now();
  const cacheKey = studentId ? `s_${studentId}` : (teacherId ? `t_${teacherId}` : 'all');
  const entry = _cache.projectSubmissions[cacheKey];

  if (!forceRefresh && entry && (now - entry.time < CACHE_TIMEOUT)) {
    return entry.data;
  }

  try {
    const subsRef = ref(db, 'projectSubmissions');
    let data = [];

    const snapshot = await get(subsRef);
    if (snapshot.exists()) {
      const allSubs = Object.values(snapshot.val());

      if (studentId) {
        data = allSubs.filter(s => String(s.studentId) === String(studentId));
      } else if (teacherId) {
        data = allSubs.filter(s => String(s.teacherId) === String(teacherId));
      } else {
        data = allSubs;
      }
    }

    _cache.projectSubmissions[cacheKey] = { data, time: now };
    return data;
  } catch (err) {
    console.error("Firebase Project Fetch Error:", err);
    return [];
  }
}

export const saveProjectSubmissionFn = async (submission) => {
  try {
    const key = `${submission.projectId}_${submission.studentId}`
    await set(ref(db, `projectSubmissions/${key}`), submission)
    _cache.projectSubmissions = {};
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

export const updateProjectSubmissionFn = async (projectId, studentId, updates) => {
  try {
    const key = `${projectId}_${studentId}`
    await update(ref(db, `projectSubmissions/${key}`), updates)
    _cache.projectSubmissions = {};
    return { success: true }
  } catch (err) {
    return { success: false, message: err.message }
  }
}

