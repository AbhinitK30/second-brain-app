"use client"

import { motion } from "framer-motion"
import { User } from "lucide-react"

export default function Avatar({ name, email, size = "md", className = "" }) {
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-lg",
    lg: "w-12 h-12 text-xl",
    xl: "w-16 h-16 text-2xl",
  }

  const initial = name?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || null

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`
        ${sizes[size]} rounded-full bg-primary-100 ring-2 ring-primary-400
        flex items-center justify-center font-bold shadow-lg
        ${className}
      `}
    >
      {initial ? (
        <span className="text-primary-900 text-xl">{initial}</span>
      ) : (
        <User className="w-6 h-6 text-primary-900" />
      )}
    </motion.div>
  )
}
