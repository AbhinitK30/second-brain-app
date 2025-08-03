"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Download, Sparkles } from "lucide-react"
import useAuth from "../hooks/useAuth"
import Header from "../components/layout/Header"
import Container from "../components/layout/Container"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import { API_ENDPOINTS } from "../config/api"

export default function Summary() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [note, setNote] = useState(null)
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchNoteAndSummary() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(API_ENDPOINTS.NOTE_BY_ID(id), {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setNote(data)
          // Fetch summary
          const sumRes = await fetch(API_ENDPOINTS.NOTE_SUMMARIZE(id), {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          })
          const sumData = await sumRes.json()
          if (sumRes.ok) setSummary(sumData.summary)
          else setError(sumData.msg || "Failed to summarize")
        } else {
          setError(data.msg || "Failed to load note")
        }
      } catch {
        setError("Failed to load note or summary")
      }
      setLoading(false)
    }
    fetchNoteAndSummary()
  }, [id, token])

  const handleDownload = () => {
    if (!note || !summary) return
    const filename = `${note.title.replace(/\s+/g, "_")}_summary.txt`
    const content = `${note.title}\n${"=".repeat(note.title.length)}\n\nAI Summary:\n${summary}`
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <Container className="py-8">
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-slate-600">Generating AI summary...</p>
          </div>
        </Container>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header />
        <Container className="py-8">
          <Card className="p-8 text-center border-red-200 bg-red-50">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate("/")} variant="outline">
              Back to Dashboard
            </Button>
          </Card>
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <Container className="py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Card className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant="accent">PDF Summary</Badge>
                  {note?.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag, index) => (
                        <Badge key={index} variant="gray" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-slate-900">{note?.title}</h1>
              </div>

              <Button onClick={handleDownload} disabled={!summary} variant="secondary">
                <Download className="w-4 h-4" />
                Download Summary
              </Button>
            </div>

            {/* Summary Content */}
            {summary ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-accent-50 to-purple-50 border border-accent-200 rounded-xl p-8"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-accent-500 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-accent-800">AI-Generated Summary</h2>
                </div>
                <div className="prose max-w-none">
                  <div className="text-slate-700 whitespace-pre-line leading-relaxed text-lg">{summary}</div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center py-12 text-slate-500">No summary available</div>
            )}
          </Card>
        </motion.div>
      </Container>
    </div>
  )
}
