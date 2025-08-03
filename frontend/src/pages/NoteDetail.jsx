"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowLeft, Sparkles, Edit, Trash2, ExternalLink } from "lucide-react"
import { Document, Page } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import useAuth from "../hooks/useAuth"
import Header from "../components/layout/Header"
import Container from "../components/layout/Container"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import ErrorBoundary from "../components/ErrorBoundary"
import { API_ENDPOINTS } from "../config/api"

export default function NoteDetail() {
  const { id } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()

  const [note, setNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [summary, setSummary] = useState("")
  const [summarizing, setSummarizing] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [numPages, setNumPages] = useState(null)
  const [pdfError, setPdfError] = useState("")
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null)
  const [showDelete, setShowDelete] = useState(false)

  useEffect(() => {
    async function fetchNote() {
      setLoading(true)
      setError("")
      try {
        const res = await fetch(API_ENDPOINTS.NOTE_BY_ID(id), {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setNote(data)
        } else {
          setError(data.msg || "Failed to load note")
        }
      } catch {
        setError("Failed to load note")
      }
      setLoading(false)
    }
    fetchNote()
  }, [id, token])

  // Fetch PDF as blob
  useEffect(() => {
    if (note?.type === "pdf" && note.fileUrl) {
      fetch(note.fileUrl)
        .then((res) => res.blob())
        .then((blob) => setPdfBlobUrl(URL.createObjectURL(blob)))
        .catch(() => setPdfBlobUrl(null))
    }
  }, [note])

  const handleSummarize = async () => {
    setSummarizing(true)
    setSummary("")
    try {
      const res = await fetch(API_ENDPOINTS.NOTE_SUMMARIZE(id), {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) setSummary(data.summary)
      else setSummary(data.msg || "Failed to summarize")
    } catch {
      setSummary("Failed to summarize")
    }
    setSummarizing(false)
  }

  const handleDelete = () => setShowDelete(true)
  const confirmDelete = async () => {
    setDeleteLoading(true)
    try {
      const res = await fetch(API_ENDPOINTS.NOTE_BY_ID(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      
      // If status is 200 or 204, consider it successful
      if (res.ok || res.status === 200 || res.status === 204) {
        // Success - navigate to dashboard
        navigate("/dashboard")
        return
      }
      
      // Handle different error cases
      if (res.status === 401) {
        alert("Authentication failed. Please login again.")
        navigate("/login")
      } else if (res.status === 404) {
        alert("Note not found. It may have already been deleted.")
        navigate("/dashboard")
      } else {
        // Try to get error message from response
        try {
          const data = await res.json()
          alert(data.msg || `Failed to delete note (${res.status})`)
        } catch {
          // If we can't parse the response, but status indicates success, assume it worked
          if (res.status >= 200 && res.status < 300) {
            navigate("/dashboard")
          } else {
            alert(`Failed to delete note (${res.status})`)
          }
        }
      }
    } catch (error) {
      console.error("Delete error:", error)
      // Check if it's a network error
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        alert("Network error. Please check your connection and try again.")
      } else {
        alert("Failed to delete note. Please try again.")
      }
    } finally {
      setDeleteLoading(false)
      setShowDelete(false)
    }
  }
  const cancelDelete = () => setShowDelete(false)

  const handleEdit = () => {
    navigate(`/upload?edit=${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <Container className="py-8">
          <div className="flex justify-center py-16">
            <LoadingSpinner size="lg" />
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
            <p className="text-red-600">{error}</p>
            <Button onClick={() => navigate("/dashboard")} variant="outline" className="mt-4">
              Back to Dashboard
            </Button>
          </Card>
        </Container>
      </div>
    )
  }

  if (!note) return null

  return (
    <div className="min-h-screen">
      <Header />

      <Container className="py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <Card className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant={note.type === "text" ? "primary" : note.type === "pdf" ? "accent" : "secondary"}>
                    {note.type}
                  </Badge>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag, index) => (
                        <Badge key={index} variant="gray" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{note.title}</h1>
                {note.type === "bookmark" && note.bookmarkUrl && (
                  <a
                    href={note.bookmarkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {note.bookmarkUrl}
                  </a>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button onClick={handleSummarize} loading={summarizing} variant="accent" size="sm">
                  <Sparkles className="w-4 h-4" />
                  Summarize
                </Button>
                {note.type !== "pdf" && (
                  <Button onClick={handleEdit} variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                )}
                <Button onClick={handleDelete} loading={deleteLoading} variant="danger" size="sm">
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* PDF Preview */}
              {note.type === "pdf" && note.fileUrl && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">PDF Preview</h3>
                  <div className="border rounded-xl overflow-hidden bg-slate-50">
                    <ErrorBoundary>
                      {pdfBlobUrl ? (
                        <Document
                          file={pdfBlobUrl}
                          onLoadSuccess={({ numPages }) => {
                            setNumPages(numPages)
                            setPdfError("")
                          }}
                          onLoadError={() => setPdfError("Failed to load PDF preview")}
                          loading={
                            <div className="flex justify-center py-12">
                              <LoadingSpinner />
                            </div>
                          }
                          error={
                            <div className="p-8 text-center text-red-600">
                              {pdfError || "Failed to load PDF preview"}
                            </div>
                          }
                        >
                          {numPages &&
                            Array.from(new Array(numPages), (el, index) => (
                              <Page
                                key={`page_${index + 1}`}
                                pageNumber={index + 1}
                                width={Math.min(800, window.innerWidth - 100)}
                                className="mb-4"
                              />
                            ))}
                        </Document>
                      ) : (
                        <div className="flex justify-center py-12">
                          <LoadingSpinner />
                        </div>
                      )}
                    </ErrorBoundary>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">
                    If the preview is not visible, the PDF may be corrupted or CORS is not allowed.
                  </p>
                </div>
              )}

              {/* Text Content */}
              {note.type !== "pdf" && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Content</h3>
                  <div className="prose max-w-none">
                    <div className="text-slate-700 whitespace-pre-line leading-relaxed">
                      {note.content || "No content available"}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Summary */}
              {summary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-accent-50 to-purple-50 border border-accent-200 rounded-xl p-6"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-accent-600" />
                    <h3 className="font-semibold text-accent-800">AI Summary</h3>
                  </div>
                  <div className="text-slate-700 whitespace-pre-line leading-relaxed">{summary}</div>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </Container>

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <Card className="p-6 max-w-xs w-full text-center border-red-200 bg-red-50 z-50">
            <h4 className="text-lg font-bold text-red-700 mb-2">Delete Note?</h4>
            <p className="text-slate-700 mb-4">Are you sure you want to delete this note? This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="danger" onClick={confirmDelete} size="sm" loading={deleteLoading}>Delete</Button>
              <Button variant="outline" onClick={cancelDelete} size="sm">Cancel</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
