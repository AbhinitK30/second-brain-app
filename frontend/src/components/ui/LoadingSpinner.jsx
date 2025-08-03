"use client"

import { motion } from "framer-motion"

export default function LoadingSpinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      className={`
        ${sizes[size]} border-2 border-primary-200 border-t-primary-600 rounded-full
        ${className}
      `}
    />
  )
}
