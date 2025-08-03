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
    console.log("Attempting login...")
    const res = await fetch(API_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    console.log("Login response:", data)
    if (res.ok) {
      console.log("Login successful, setting user state...")
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", data.token)
      console.log("User state set:", data.user)
      return { success: true }
    } else {
      console.log("Login failed:", data.msg)
      return { success: false, msg: data.msg }
    }
  }

  const register = async (name, email, password) => {
    console.log("Attempting registration...")
    const res = await fetch(API_ENDPOINTS.REGISTER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    console.log("Register response:", data)
    if (res.ok) {
      console.log("Registration successful, setting user state...")
      setUser(data.user)
      setToken(data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", data.token)
      console.log("User state set:", data.user)
      return { success: true }
    } else {
      console.log("Registration failed:", data.msg)
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
