"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Brain } from "lucide-react"
import useAuth from "../hooks/useAuth"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import Card from "../components/ui/Card"

export default function Register() {
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await register(name, email, password)
    setLoading(false)
    if (res.success) {
      navigate("/")
    } else {
      setError(res.msg || "Registration failed")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Card className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-lg"
            >
              <Brain className="w-9 h-9 text-accent-600 drop-shadow-lg" />
            </motion.div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Create Your Account</h1>
            <p className="text-slate-600">Start building your Second Brain</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
              autoFocus
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
            />

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="text-red-600 text-sm text-center">{error}</p>
              </motion.div>
            )}

            <Button type="submit" loading={loading} disabled={loading} className="w-full font-bold shadow-xl text-white" size="lg" variant="accent">
              Sign Up
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="text-secondary-600 hover:text-secondary-700 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">AI-powered Personal Knowledge Base</p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
