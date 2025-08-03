"use client"

import { motion } from "framer-motion"

export default function Input({ label, error, className = "", containerClassName = "", ...props }) {
  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && <label className="block text-sm font-medium text-slate-700">{label}</label>}
      <motion.input
        whileFocus={{ scale: 1.01 }}
        className={`
          w-full px-4 py-3 rounded-xl border border-slate-200 
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          transition-all duration-200 bg-white/80 backdrop-blur-sm
          placeholder:text-slate-400
          ${error ? "border-red-300 focus:ring-red-500" : ""}
          ${className}
        `}
        {...props}
      />
      {error && (
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-red-600">
          {error}
        </motion.p>
      )}
    </div>
  )
}
