"use client"

import { motion } from "framer-motion"

const variants = {
  primary: "bg-primary-100 text-primary-800 border-primary-200",
  secondary: "bg-secondary-100 text-secondary-800 border-secondary-200",
  accent: "bg-accent-100 text-accent-800 border-accent-200",
  gray: "bg-slate-100 text-slate-800 border-slate-200",
}

export default function Badge({ children, variant = "gray", className = "" }) {
  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        border transition-colors
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </motion.span>
  )
}
