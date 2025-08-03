"use client"

import { motion } from "framer-motion"
import { TrendingUp, FileText, Hash } from "lucide-react"
import Card from "../ui/Card"
import Badge from "../ui/Badge"

export default function AnalyticsCard({ analytics, loading, error }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-8 bg-slate-200 rounded mb-4"></div>
            <div className="h-12 bg-slate-200 rounded"></div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <p className="text-red-600 text-center">{error}</p>
      </Card>
    )
  }

  if (!analytics) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Notes */}
      <Card className="p-6 h-full min-h-[180px]">
        <div className="flex flex-col items-center justify-center h-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-4"
          >
            <FileText className="w-6 h-6 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl font-bold text-slate-900"
          >
            {analytics.totalNotes}
          </motion.div>
          <p className="text-slate-600 font-medium mt-2">Total Notes</p>
        </div>
      </Card>

      {/* Notes by Type */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-secondary-600" />
          <h3 className="font-semibold text-secondary-800">Notes by Type</h3>
        </div>
        <div className="space-y-3">
          {Object.entries(analytics.byType).map(([type, count], index) => (
            <motion.div
              key={type}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-secondary-400 to-secondary-500"></div>
                <span className="capitalize font-medium text-slate-700">{type}</span>
              </div>
              <Badge variant="secondary">{count}</Badge>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Top Tags */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Hash className="w-5 h-5 text-accent-600" />
          <h3 className="font-semibold text-accent-800">Top Tags</h3>
        </div>
        {analytics.topTags.length === 0 ? (
          <p className="text-slate-400 text-center py-4">No tags yet</p>
        ) : (
          <div className="space-y-3">
            {analytics.topTags.map(({ tag, count }, index) => (
              <motion.div
                key={tag}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-accent-400 to-accent-500"></div>
                  <span className="font-medium text-slate-700">{tag}</span>
                </div>
                <Badge variant="accent">{count}</Badge>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}