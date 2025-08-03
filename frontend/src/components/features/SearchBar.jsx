"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search, Sparkles } from "lucide-react"
import Button from "../ui/Button"
import Card from "../ui/Card"

export default function SearchBar({ onSearch, loading, result, error }) {
  const [query, setQuery] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-700 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about your notes... (AI-powered search)"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            />
          </div>
          <Button type="submit" loading={loading} disabled={!query.trim()} size="lg" variant="primary" className="font-bold shadow-xl min-w-[120px] text-white disabled:opacity-80 disabled:bg-accent-400">
            <Sparkles className="w-5 h-5" />
            Search
          </Button>
        </form>
      </Card>

      {error && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4 border-red-200 bg-red-50">
            <p className="text-red-600 text-center">{error}</p>
          </Card>
        </motion.div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 border-accent-200 bg-gradient-to-r from-accent-50 to-purple-50">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-accent-600" />
              <h3 className="font-semibold text-accent-800">AI Answer</h3>
            </div>
            <div className="text-slate-700 whitespace-pre-line leading-relaxed">{result}</div>
          </Card>
        </motion.div>
      )}
    </div>
  )
}