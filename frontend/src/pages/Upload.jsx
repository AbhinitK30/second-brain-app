"use client"

import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { motion } from "framer-motion"
import { FileText, Link, FileImage, UploadIcon, ArrowLeft } from "lucide-react"
import useAuth from "../hooks/useAuth"
import Header from "../components/layout/Header"
import Container from "../components/layout/Container"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import { API_ENDPOINTS } from "../config/api"

const TABS = [
  { label: "Text Note", value: "text", icon: FileText, color: "primary" },
  { label: "PDF", value: "pdf", icon: FileImage, color: "accent" },
  { label: "Bookmark", value: "bookmark", icon: Link, color: "secondary" },
]

export default function Upload() {
  const { token } = useAuth()
  const [tab, setTab] = useState("text")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editNoteId, setEditNoteId] = useState(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Form states
  const [textTitle, setTextTitle] = useState("")
  const [textContent, setTextContent] = useState("")
  const [textTags, setTextTags] = useState("")

  const [pdfTitle, setPdfTitle] = useState("")
  const [pdfFile, setPdfFile] = useState(null)
  const [pdfTags, setPdfTags] = useState("")

  const [bmTitle, setBmTitle] = useState("")
  const [bmUrl, setBmUrl] = useState("")
  const [bmContent, setBmContent] = useState("")
  const [bmTags, setBmTags] = useState("")

  // Check for editing
  useEffect(() => {
    const editId = searchParams.get("edit")
    if (editId) {
      setIsEditing(true)
      setEditNoteId(editId)
      fetchNoteForEdit(editId)
    }
  }, [searchParams, token])

  const fetchNoteForEdit = async (noteId) => {
    try {
      const res = await fetch(API_ENDPOINTS.NOTE_BY_ID(noteId), {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const note = await res.json()
        setTab(note.type)
        if (note.type === "text") {
          setTextTitle(note.title)
          setTextContent(note.content || "")
          setTextTags((note.tags || []).join(", "))
        } else if (note.type === "bookmark") {
          setBmTitle(note.title)
          setBmUrl(note.bookmarkUrl || "")
          setBmContent(note.content || "")
          setBmTags((note.tags || []).join(", "))
        } else if (note.type === "pdf") {
          setPdfTitle(note.title)
          setPdfTags((note.tags || []).join(", "))
        }
      } else {
        setError("Failed to load note for editing")
      }
    } catch {
      setError("Failed to load note for editing")
    }
  }

  const handleTextSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const url = isEditing ? API_ENDPOINTS.NOTE_BY_ID(editNoteId) : `${API_ENDPOINTS.NOTES}/text`
      const method = isEditing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: textTitle,
          content: textContent,
          tags: textTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        navigate("/dashboard")
      } else if (res.status === 401) {
        setError("Authentication failed. Please login again.")
        // Redirect to login after a short delay
        setTimeout(() => navigate("/login"), 2000)
      } else {
        setError(data.msg || `Failed to ${isEditing ? "update" : "add"} note`)
      }
    } catch {
      setError(`Failed to ${isEditing ? "update" : "add"} note`)
    }
    setLoading(false)
  }

  const handlePdfSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const formData = new FormData()
    formData.append("title", pdfTitle)
    formData.append("tags", pdfTags)
    if (pdfFile) formData.append("file", pdfFile)
    try {
      const res = await fetch(`${API_ENDPOINTS.NOTES}/pdf`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        navigate("/dashboard")
      } else if (res.status === 401) {
        setError("Authentication failed. Please login again.")
        setTimeout(() => navigate("/login"), 2000)
      } else {
        setError(data.msg || "Failed to upload PDF")
      }
    } catch {
      setError("Failed to upload PDF")
    }
    setLoading(false)
  }

  const handleBmSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const url = isEditing
        ? API_ENDPOINTS.NOTE_BY_ID(editNoteId)
        : `${API_ENDPOINTS.NOTES}/bookmark`
      const method = isEditing ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: bmTitle,
          bookmarkUrl: bmUrl,
          content: bmContent,
          tags: bmTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      })
      const data = await res.json()
      if (res.ok) {
        navigate("/dashboard")
      } else if (res.status === 401) {
        setError("Authentication failed. Please login again.")
        setTimeout(() => navigate("/login"), 2000)
      } else {
        setError(data.msg || `Failed to ${isEditing ? "update" : "add"} bookmark`)
      }
    } catch {
      setError(`Failed to ${isEditing ? "update" : "add"} bookmark`)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen">
      <Header />

      <Container className="py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>

          <Card className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{isEditing ? "Edit Note" : "Add New Note"}</h1>
              <p className="text-slate-600">
                {isEditing ? "Update your existing note" : "Create a new entry in your second brain"}
              </p>
            </div>

            {/* Tab Selector */}
            <div className="flex gap-2 mb-8 p-1 bg-slate-100 rounded-xl">
              {TABS.map((tabItem) => {
                const Icon = tabItem.icon
                return (
                  <button
                    key={tabItem.value}
                    onClick={() => setTab(tabItem.value)}
                    className={`
                      flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold
                      transition-all duration-200
                      ${
                        tab === tabItem.value
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tabItem.label}</span>
                  </button>
                )
              })}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="text-red-600 text-center">{error}</p>
              </motion.div>
            )}

            {/* Text Note Form */}
            {tab === "text" && (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleTextSubmit}
                className="space-y-6"
              >
                <Input
                  label="Title"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="Enter note title"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Content</label>
                  <textarea
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Write your note content here..."
                    rows={6}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none"
                    required
                  />
                </div>

                <Input
                  label="Tags"
                  value={textTags}
                  onChange={(e) => setTextTags(e.target.value)}
                  placeholder="e.g. research, ideas, work"
                />

                <div className="flex gap-3">
                  <Button type="submit" loading={loading} disabled={loading} className="flex-1">
                    {isEditing ? "Update Note" : "Create Note"}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={() => navigate("/")}>
                      Cancel
                    </Button>
                  )}
                </div>
              </motion.form>
            )}

            {/* PDF Form */}
            {tab === "pdf" && (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handlePdfSubmit}
                className="space-y-6"
              >
                <Input
                  label="Title"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  placeholder="Enter PDF title"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">PDF File</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setPdfFile(e.target.files[0])}
                      className="hidden"
                      id="pdf-upload"
                      required={!isEditing}
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="flex items-center justify-center gap-3 w-full px-4 py-8 border-2 border-dashed border-slate-300 rounded-xl hover:border-primary-400 hover:bg-primary-50 transition-all duration-200 cursor-pointer"
                    >
                      <UploadIcon className="w-6 h-6 text-slate-400" />
                      <div className="text-center">
                        <p className="font-medium text-slate-700">{pdfFile ? pdfFile.name : "Choose PDF file"}</p>
                        <p className="text-sm text-slate-500">
                          {pdfFile ? "Click to change file" : "Click to browse or drag and drop"}
                        </p>
                      </div>
                    </label>
                  </div>
                  {isEditing && (
                    <p className="text-sm text-slate-500 mt-2">
                      Note: PDF files cannot be edited. Upload a new file to replace.
                    </p>
                  )}
                </div>

                <Input
                  label="Tags"
                  value={pdfTags}
                  onChange={(e) => setPdfTags(e.target.value)}
                  placeholder="e.g. research, documents, reference"
                />

                <div className="flex gap-3">
                  <Button type="submit" loading={loading} disabled={loading} className="flex-1">
                    Upload PDF
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={() => navigate("/")}>
                      Cancel
                    </Button>
                  )}
                </div>
              </motion.form>
            )}

            {/* Bookmark Form */}
            {tab === "bookmark" && (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={handleBmSubmit}
                className="space-y-6"
              >
                <Input
                  label="Title"
                  value={bmTitle}
                  onChange={(e) => setBmTitle(e.target.value)}
                  placeholder="Enter bookmark title"
                  required
                />

                <Input
                  label="URL"
                  type="url"
                  value={bmUrl}
                  onChange={(e) => setBmUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={bmContent}
                    onChange={(e) => setBmContent(e.target.value)}
                    placeholder="Add a description or notes about this bookmark..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm resize-none"
                  />
                </div>

                <Input
                  label="Tags"
                  value={bmTags}
                  onChange={(e) => setBmTags(e.target.value)}
                  placeholder="e.g. articles, tools, inspiration"
                />

                <div className="flex gap-3">
                  <Button type="submit" loading={loading} disabled={loading} className="flex-1">
                    {isEditing ? "Update Bookmark" : "Save Bookmark"}
                  </Button>
                  {isEditing && (
                    <Button type="button" variant="outline" onClick={() => navigate("/")}>
                      Cancel
                    </Button>
                  )}
                </div>
              </motion.form>
            )}
          </Card>
        </motion.div>
      </Container>
    </div>
  )
}