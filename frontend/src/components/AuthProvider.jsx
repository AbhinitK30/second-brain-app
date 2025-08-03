"use client"

import { useState, useEffect } from "react"
import { AuthContext } from "../contexts/AuthContext"
import { API_ENDPOINTS } from "../config/api"

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load auth state from localStorage
    const storedUser = localStorage.getItem("user")
    const storedToken = localStorage.getItem("token")
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const res = await fetch(API_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (res.ok) {
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", data.token)
      return { success: true }
    } else {
      return { success: false, msg: data.msg }
    }
  }

  const register = async (name, email, password) => {
    const res = await fetch(API_ENDPOINTS.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (res.ok) {
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", data.token)
      return { success: true }
    } else {
      return { success: false, msg: data.msg }
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem("user")
    localStorage.removeItem("token")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>{children}</AuthContext.Provider>
  )
}
