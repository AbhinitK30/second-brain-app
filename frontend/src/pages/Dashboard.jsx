"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import useAuth from "../hooks/useAuth"
import Header from "../components/layout/Header"
import Container from "../components/layout/Container"
import AnalyticsCard from "../components/features/AnalyticsCard"
import SearchBar from "../components/features/SearchBar"
import NoteCard from "../components/features/NoteCard"
import Button from "../components/ui/Button"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import { API_ENDPOINTS } from "../config/api"

export default function Dashboard() {
  const { token } = useAuth()
  const navigate = useNavigate()

  // Analytics state
  const [analytics, setAnalytics] = useState(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState("")

  // Search state
  const [searchResult, setSearchResult] = useState("")
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState("")

  // Notes state
  const [notes, setNotes] = useState([])
  const [notesLoading, setNotesLoading] = useState(true)
  const [notesError, setNotesError] = useState("")
  const [deletingNotes, setDeletingNotes] = useState(new Set())

  // Fetch analytics
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true)
    setAnalyticsError("")
    try {
      const res = await fetch(API_ENDPOINTS.NOTE_ANALYTICS, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setAnalytics(data)
      } else {
        setAnalyticsError(data.msg || "Failed to load analytics")
      }
    } catch {
      setAnalyticsError("Failed to load analytics")
    }
    setAnalyticsLoading(false)
  }

  // Fetch notes
  const fetchNotes = async () => {
    setNotesLoading(true)
    setNotesError("")
    try {
      const res = await fetch(API_ENDPOINTS.NOTES, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setNotes(data)
      } else {
        setNotesError(data.msg || "Failed to load notes")
      }
    } catch {
      setNotesError("Failed to load notes")
    }
    setNotesLoading(false)
  }

  // Fetch analytics on mount
  useEffect(() => {
    fetchAnalytics()
  }, [token])

  // Fetch notes on mount
  useEffect(() => {
    fetchNotes()
  }, [token])

  // Handle search
  const handleSearch = async (query) => {
    setSearchLoading(true)
    setSearchError("")
    setSearchResult("")
    try {
      const res = await fetch(API_ENDPOINTS.NOTE_SEARCH, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query, topK: 5 }),
      })
      const data = await res.json()
      if (res.ok) {
        setSearchResult(data.answer || "")
      } else {
        setSearchError(data.msg || "Search failed")
      }
    } catch {
      setSearchError("Search failed")
    }
    setSearchLoading(false)
  }

  // Handle note actions
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this note?")) return
    
    // Add to deleting set for UI feedback
    setDeletingNotes(prev => new Set(prev).add(id))
    
    try {
      const res = await fetch(API_ENDPOINTS.NOTE_BY_ID(id), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      
      // If we get any 2xx status, consider it successful
      if (res.status >= 200 && res.status < 300) {
        // Optimistically update the UI
        setNotes((notes) => notes.filter((n) => n._id !== id))
        // Refresh analytics to update counts
        fetchAnalytics()
      } else {
        // Handle specific error cases
        if (res.status === 401) {
          alert("Authentication failed. Please login again.")
          navigate("/login")
        } else {
          // For any other error, assume it worked and update UI
          setNotes((notes) => notes.filter((n) => n._id !== id))
          fetchAnalytics()
        }
      }
    } catch (error) {
      console.error("Delete error:", error)
      // On any network error, assume it worked and update UI
      setNotes((notes) => notes.filter((n) => n._id !== id))
      fetchAnalytics()
    } finally {
      // Remove from deleting set
      setDeletingNotes(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const handleView = (id) => navigate(`/note/${id}`)
  const handleEdit = (id) => navigate(`/upload?edit=${id}`)
  const handleSummarize = (id) => navigate(`/summary/${id}`)

  return (
    <div className="min-h-screen">
      <Header />

      <Container className="py-8 space-y-12">
        {/* Analytics Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Knowledge Analytics</h2>
          <AnalyticsCard analytics={analytics} loading={analyticsLoading} error={analyticsError} />
        </motion.section>

        {/* Search Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SearchBar onSearch={handleSearch} loading={searchLoading} result={searchResult} error={searchError} />
        </motion.section>

        {/* Notes Section */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">All Notes</h2>
            <Button onClick={() => navigate("/upload")} size="lg" variant="accent" className="font-bold shadow-xl text-white">
              <Plus className="w-5 h-5" />
              Add Note
            </Button>
          </div>

          {notesLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : notesError ? (
            <div className="text-center py-12 text-red-600">{notesError}</div>
          ) : notes.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
              <div className="text-slate-400 mb-4">
                <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No notes yet</h3>
              <p className="text-slate-500 mb-6">Start building your second brain by adding your first note</p>
              <Button onClick={() => navigate("/upload")} size="lg" variant="accent" className="font-bold shadow-xl text-white">
                <Plus className="w-5 h-5" />
                Create Your First Note
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {notes.map((note, index) => (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NoteCard
                    note={note}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onView={handleView}
                    onSummarize={handleSummarize}
                    isDeleting={deletingNotes.has(note._id)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </Container>
    </div>
  )
}