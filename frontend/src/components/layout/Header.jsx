"use client"

import { motion } from "framer-motion"
import { LogOut, Brain } from "lucide-react"
import Avatar from "../ui/Avatar"
import Button from "../ui/Button"
import useAuth from "../../hooks/useAuth"

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-white/20 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-lg flex items-center justify-center">
              <Brain className="w-8 h-8 text-accent-600 drop-shadow-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">Second Brain</h1>
              <p className="text-xs text-slate-500">AI-Powered Knowledge Base</p>
            </div>
          </motion.div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Avatar name={user?.name} email={user?.email} className="ring-2 ring-primary-500 bg-primary-600" />
              <div className="hidden sm:block">
                <div className="font-semibold text-slate-900">{user?.name || "User"}</div>
                <div className="text-sm text-slate-500">{user?.email}</div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="text-slate-600 hover:text-red-600">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
