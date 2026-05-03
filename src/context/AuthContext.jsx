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

  // Sahifa yangilanishida sessiyani tiklash (localStorage dan)
  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem('currentUser'))
      if (savedUser) {
        setUser(savedUser)
      }
    } catch {
      localStorage.removeItem('currentUser')
      setUser(null)
    }
  }, [])

  // Login — async
  const login = async (email, password) => {
    const result = await loginFn(email, password)
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

  // addUser — async
  const addUser = async (userData) => addUserFn(userData)

  // deleteUser — async
  const deleteUser = async (userId) => deleteUserFn(userId)

  // getUsers — async
  const getUsers = async () => getUsersFn()

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
        addTeacher: addUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
export { ADMIN_USER }
