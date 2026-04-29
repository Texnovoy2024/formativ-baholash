import { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ADMIN_USER,
  loginFn,
  logoutFn,
  addUserFn,
  deleteUserFn,
  getUsersFn,
  registerFn,
} from './authUtils'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // Sahifa yangilanishida sessiyani tiklash
  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('currentUser'))
      if (savedUser) {
        setUser(savedUser)
      }
    } catch {
      // Buzilgan JSON — tizimdan chiqarish
      localStorage.removeItem('currentUser')
      setUser(null)
    }
  }, [])

  const login = (email, password) => {
    const result = loginFn(email, password)
    if (result.success) {
      const savedUser = JSON.parse(localStorage.getItem('currentUser'))
      setUser(savedUser)
    }
    return result
  }

  const logout = () => {
    logoutFn()
    setUser(null)
    navigate('/login')
  }

  const addUser = (userData) => addUserFn(userData)

  const deleteUser = (userId) => deleteUserFn(userId)

  const getUsers = () => getUsersFn()

  const register = () => registerFn()

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        addUser,
        deleteUser,
        getUsers,
        register,
        // Orqaga moslik uchun
        addTeacher: addUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export { ADMIN_USER }
