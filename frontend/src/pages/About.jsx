import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Brain, ShieldCheck, Search, FileText } from "lucide-react"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"

export default function About() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <Card className="p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-6">
              <Brain className="w-12 h-12 text-accent-600 drop-shadow-lg" />
            </div>
            <h1 className="text-4xl font-bold gradient-text text-center mb-4">
              Don't Just Store Your Knowledge. Understand It.
            </h1>
          </div>

          <div className="text-left text-slate-700 space-y-4 text-lg">
            <p>
              <strong>Second Brain</strong> is the intelligent workspace that transforms your scattered notes, PDFs, and bookmarks into a unified, powerful knowledge base.
            </p>
            <p>
              Our AI doesn't just search—it reads and comprehends your content. This allows you to ask complex questions in plain English and receive synthesized answers, summaries, and insights instantly. Move beyond searching for documents and start getting direct answers from within them.
            </p>
            <p>
              From academic research to personal projects, <strong>Second Brain</strong> turns your library of information from a static archive into a dynamic extension of your mind.
            </p>
          </div>

          {/* Divider */}
          <div className="my-8 w-full flex justify-center">
            <div className="h-1 w-24 bg-gradient-to-r from-accent-200 via-accent-400 to-accent-200 rounded-full opacity-60"></div>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }} className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-accent-50 to-white shadow">
              <Search className="w-10 h-10 text-accent-600 mb-3" />
              <h3 className="font-semibold text-lg mb-1">AI-Powered Search</h3>
              <p className="text-slate-600 text-sm">Ask questions in plain English and get instant, context-aware answers from all your notes and documents.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }} className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-primary-50 to-white shadow">
              <FileText className="w-10 h-10 text-primary-600 mb-3" />
              <h3 className="font-semibold text-lg mb-1">PDF & Note Summarization</h3>
              <p className="text-slate-600 text-sm">Upload PDFs or notes and let AI generate concise summaries and key insights for you.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} viewport={{ once: true }} className="flex flex-col items-center text-center p-4 rounded-xl bg-gradient-to-br from-secondary-50 to-white shadow">
              <ShieldCheck className="w-10 h-10 text-secondary-600 mb-3" />
              <h3 className="font-semibold text-lg mb-1">Secure & Private</h3>
              <p className="text-slate-600 text-sm">Your knowledge is yours alone. All your data is securely stored and never shared.</p>
            </motion.div>
          </div>

          <Button size="lg" variant="accent" className="w-full font-bold shadow-xl text-white mt-8" onClick={() => navigate("/login")}>
            Get Started
          </Button>
        </Card>
      </motion.div>
    </div>
  )
}