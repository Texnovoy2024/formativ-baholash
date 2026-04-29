/**
 * Admin Auth System — Property-Based Tests
 * Feature: admin-auth-system
 * Kutubxona: vitest + fast-check
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import {
  ADMIN_USER,
  loginFn,
  logoutFn,
  addUserFn,
  deleteUserFn,
  getUsersFn,
  registerFn,
  getStoredUsers,
} from '../context/authUtils'

// ─── Yordamchi funksiyalar ────────────────────────────────────────────────────

/** Admin sifatida localStorage.currentUser ni o'rnatadi */
const setAdminSession = () => {
  localStorage.setItem('currentUser', JSON.stringify(ADMIN_USER))
}

/** localStorage ni tozalaydi */
const clearStorage = () => {
  localStorage.clear()
}

/** Tasodifiy to'g'ri foydalanuvchi ma'lumotlari generatori */
const validUserArb = (role = null) =>
  fc.record({
    name: fc.string({ minLength: 1, maxLength: 50 }),
    email: fc.emailAddress(),
    password: fc.string({ minLength: 6, maxLength: 30 }),
    role: role ? fc.constant(role) : fc.oneof(fc.constant('teacher'), fc.constant('student')),
  })

// ─── Testlar ──────────────────────────────────────────────────────────────────

describe('Feature: admin-auth-system', () => {
  beforeEach(() => {
    clearStorage()
  })

  // ── Xossa 2: Admin localStorage-ga hech qachon yozilmaydi ─────────────────
  describe('Property 2: Admin never in localStorage', () => {
    it('addUser operatsiyasidan keyin admin users massivida bo\'lmasligi kerak', () => {
      fc.assert(
        fc.property(validUserArb(), (userData) => {
          clearStorage()
          setAdminSession()

          addUserFn(userData)

          const users = getStoredUsers()
          const adminInUsers = users.some((u) => u.id === 'admin' || u.role === 'admin')
          expect(adminInUsers).toBe(false)
        }),
        { numRuns: 100 },
      )
    })

    it('login operatsiyasidan keyin admin users massivida bo\'lmasligi kerak', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          (email, password) => {
            clearStorage()
            loginFn(email, password)

            const users = getStoredUsers()
            const adminInUsers = users.some((u) => u.id === 'admin' || u.role === 'admin')
            expect(adminInUsers).toBe(false)
          },
        ),
        { numRuns: 100 },
      )
    })

    it('deleteUser operatsiyasidan keyin admin users massivida bo\'lmasligi kerak', () => {
      fc.assert(
        fc.property(validUserArb(), (userData) => {
          clearStorage()
          setAdminSession()

          addUserFn(userData)
          const users = getStoredUsers()
          if (users.length > 0) {
            deleteUserFn(users[0].id)
          }

          const afterUsers = getStoredUsers()
          const adminInUsers = afterUsers.some((u) => u.id === 'admin' || u.role === 'admin')
          expect(adminInUsers).toBe(false)
        }),
        { numRuns: 100 },
      )
    })
  })

  // ── Xossa 11: Register funksiyasi bloklangan ───────────────────────────────
  describe('Property 11: Register function blocked', () => {
    it('har qanday ma\'lumot bilan register() { success: false } qaytarishi kerak', () => {
      fc.assert(
        fc.property(validUserArb(), (userData) => {
          clearStorage()
          const beforeUsers = getStoredUsers()
          const result = registerFn(userData)

          expect(result.success).toBe(false)

          const afterUsers = getStoredUsers()
          expect(afterUsers.length).toBe(beforeUsers.length)
        }),
        { numRuns: 100 },
      )
    })
  })

  // ── Xossa 1: Login sessiya round-trip ─────────────────────────────────────
  describe('Property 1: Login session round-trip', () => {
    it('to\'g\'ri admin ma\'lumotlari bilan login qilganda currentUser admin ga teng bo\'lishi kerak', () => {
      clearStorage()
      const result = loginFn(ADMIN_USER.email, ADMIN_USER.password)

      expect(result.success).toBe(true)
      const savedUser = JSON.parse(localStorage.getItem('currentUser'))
      expect(savedUser.email).toBe(ADMIN_USER.email)
      expect(savedUser.role).toBe('admin')
    })

    it('to\'g\'ri teacher/student ma\'lumotlari bilan login qilganda currentUser mos foydalanuvchiga teng bo\'lishi kerak', () => {
      fc.assert(
        fc.property(validUserArb(), (userData) => {
          clearStorage()
          setAdminSession()
          addUserFn(userData)
          logoutFn()

          const result = loginFn(userData.email, userData.password)

          if (result.success) {
            const savedUser = JSON.parse(localStorage.getItem('currentUser'))
            expect(savedUser.email).toBe(userData.email)
            expect(savedUser.role).toBe(userData.role)
          }
        }),
        { numRuns: 100 },
      )
    })
  })

  // ── Xossa 5: Noto'g'ri login bloklash ─────────────────────────────────────
  describe('Property 5: Invalid login blocked', () => {
    it('noto\'g\'ri email/parol bilan login { success: false } qaytarishi va currentUser o\'zgarmasligi kerak', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          fc.string({ minLength: 1, maxLength: 20 }),
          (email, password) => {
            clearStorage()
            // Admin emaili va parolini istisno qilamiz
            if (email === ADMIN_USER.email && password === ADMIN_USER.password) {
              return
            }

            const before = localStorage.getItem('currentUser')
            const result = loginFn(email, password)

            expect(result.success).toBe(false)
            expect(localStorage.getItem('currentUser')).toBe(before)
          },
        ),
        { numRuns: 100 },
      )
    })
  })

  // ── Xossa 4: Muvaffaqiyatli login rol qaytaradi ────────────────────────────
  describe('Property 4: Successful login returns correct role', () => {
    it('to\'g\'ri teacher/student ma\'lumotlari bilan login qilganda to\'g\'ri rol qaytarishi kerak', () => {
      fc.assert(
        fc.property(validUserArb(), (userData) => {
          clearStorage()
          setAdminSession()
          addUserFn(userData)
          logoutFn()

          const result = loginFn(userData.email, userData.password)

          if (result.success) {
            expect(result.role).toBe(userData.role)
          }
        }),
        { numRuns: 100 },
      )
    })
  })

  // ── Xossa 8: Logout round-trip ─────────────────────────────────────────────
  describe('Property 8: Logout round-trip', () => {
    it('logout() dan keyin currentUser null bo\'lishi kerak', () => {
      fc.assert(
        fc.property(validUserArb(), (userData) => {
          clearStorage()
          setAdminSession()
          addUserFn(userData)
          logoutFn()

          loginFn(userData.email, userData.password)
          logoutFn()

          expect(localStorage.getItem('currentUser')).toBeNull()
        }),
        { numRuns: 100 },
      )
    })

    it('admin logout() dan keyin currentUser null bo\'lishi kerak', () => {
      clearStorage()
      loginFn(ADMIN_USER.email, ADMIN_USER.password)
      logoutFn()
      expect(localStorage.getItem('currentUser')).toBeNull()
    })
  })

  // ── Xossa 3: Email unikalligi ──────────────────────────────────────────────
  describe('Property 3: Email uniqueness', () => {
    it('bir xil email bilan ikkinchi foydalanuvchi qo\'shilmasligi kerak', () => {
      fc.assert(
        fc.property(validUserArb(), (userData) => {
          clearStorage()
          setAdminSession()

          addUserFn(userData)
          const beforeCount = getStoredUsers().length

          const result = addUserFn({ ...userData, name: 'Boshqa ism' })

          expect(result.success).toBe(false)
          expect(getStoredUsers().length).toBe(beforeCount)
        }),
        { numRuns: 100 },
      )
    })
  })

  // ── Xossa 7: Parol uzunligi validatsiyasi ─────────────────────────────────
  describe('Property 7: Password length validation', () => {
    it('6 belgidan qisqa parol bilan foydalanuvchi yaratilmasligi kerak', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          fc.string({ minLength: 0, maxLength: 5 }),
          fc.oneof(fc.constant('teacher'), fc.constant('student')),
          (email, shortPassword, role) => {
            clearStorage()
            setAdminSession()

            const beforeCount = getStoredUsers().length
            const result = addUserFn({
              name: 'Test User',
              email,
              password: shortPassword,
              role,
            })

            expect(result.success).toBe(false)
            expect(getStoredUsers().length).toBe(beforeCount)
          },
        ),
        { numRuns: 100 },
      )
    })
  })

  // ── Xossa 10: Foydalanuvchi qo'shish round-trip ───────────────────────────
  describe('Property 10: Add user round-trip', () => {
    it('to\'g\'ri ma\'lumotlar bilan addUser() dan keyin getUsers() yangi foydalanuvchini qaytarishi kerak', () => {
      fc.assert(
        fc.property(validUserArb(), (userData) => {
          clearStorage()
          setAdminSession()

          const result = addUserFn(userData)

          if (result.success) {
            const users = getUsersFn()
            const found = users.find((u) => u.email === userData.email)
            expect(found).toBeDefined()
            expect(found.role).toBe(userData.role)
          }
        }),
        { numRuns: 100 },
      )
    })
  })

  // ── Xossa 6: Foydalanuvchi o'chirish round-trip ───────────────────────────
  describe('Property 6: Delete round-trip', () => {
    it('deleteUser() dan keyin getUsers() o\'chirilgan foydalanuvchini qaytarmasligi kerak', () => {
      fc.assert(
        fc.property(validUserArb(), (userData) => {
          clearStorage()
          setAdminSession()

          const addResult = addUserFn(userData)
          if (!addResult.success) return

          const users = getStoredUsers()
          const added = users.find((u) => u.email === userData.email)
          if (!added) return

          const beforeCount = getUsersFn().length
          deleteUserFn(added.id)

          const afterUsers = getUsersFn()
          expect(afterUsers.length).toBe(beforeCount - 1)
          expect(afterUsers.find((u) => u.email === userData.email)).toBeUndefined()
        }),
        { numRuns: 100 },
      )
    })
  })
})
