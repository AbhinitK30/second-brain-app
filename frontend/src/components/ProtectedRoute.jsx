"use client"

import { Navigate, Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import useAuth from "../hooks/useAuth"
import LoadingSpinner from "./ui/LoadingSpinner"

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  
  console.log("ProtectedRoute - user:", user, "loading:", loading)

  if (loading) {
    console.log("ProtectedRoute - showing loading spinner")
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-slate-600">Loading...</p>
        </motion.div>
      </div>
    )
  }

  if (!user) {
    console.log("ProtectedRoute - no user, redirecting to login")
    return <Navigate to="/login" replace />
  }

  console.log("ProtectedRoute - user authenticated, rendering outlet")
  return <Outlet />
}
