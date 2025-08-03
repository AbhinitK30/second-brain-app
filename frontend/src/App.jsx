"use client"

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AnimatePresence } from "framer-motion"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import NoteDetail from "./pages/NoteDetail"
import Upload from "./pages/Upload"
import Summary from "./pages/Summary"
import AuthProvider from "./components/AuthProvider"
import ProtectedRoute from "./components/ProtectedRoute"
import About from "./pages/About"

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/note/:id" element={<NoteDetail />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/summary/:id" element={<Summary />} />
              </Route>
            </Routes>
          </AnimatePresence>
        </div>
      </Router>
    </AuthProvider>
  )
}
