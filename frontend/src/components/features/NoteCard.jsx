"use client"
import { FileText, Link, FileImage, Eye, Edit, Trash2, Sparkles } from "lucide-react"
import Card from "../ui/Card"
import Badge from "../ui/Badge"
import Button from "../ui/Button"
import { useState } from "react"

const typeIcons = {
  text: FileText,
  pdf: FileImage,
  bookmark: Link,
}

const typeColors = {
  text: "primary",
  pdf: "accent",
  bookmark: "secondary",
}

export default function NoteCard({ note, onDelete, onEdit, onView, onSummarize }) {
  const [showDelete, setShowDelete] = useState(false)
  const Icon = typeIcons[note.type] || FileText
  const colorVariant = typeColors[note.type] || "gray"

  const handleDelete = () => setShowDelete(true)
  const confirmDelete = () => {
    setShowDelete(false)
    onDelete?.(note._id)
  }
  const cancelDelete = () => setShowDelete(false)

  return (
    <Card className="p-6 group relative overflow-visible min-w-[320px]">
      {/* Delete Modal */}
      {showDelete && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30">
          <Card className="p-6 max-w-xs w-full text-center border-red-200 bg-red-50 z-30">
            <h4 className="text-lg font-bold text-red-700 mb-2">Delete Note?</h4>
            <p className="text-slate-700 mb-4">Are you sure you want to delete this note? This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <Button variant="danger" onClick={confirmDelete} size="sm">Delete</Button>
              <Button variant="outline" onClick={cancelDelete} size="sm">Cancel</Button>
            </div>
          </Card>
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg bg-${colorVariant === "primary" ? "primary" : colorVariant === "accent" ? "accent" : "secondary"}-100`}
          >
            <Icon
              className={`w-5 h-5 text-${colorVariant === "primary" ? "primary" : colorVariant === "accent" ? "accent" : "secondary"}-600`}
            />
          </div>
          <Badge variant={colorVariant}>{note.type}</Badge>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {note.type === "pdf" ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onSummarize?.(note._id)}
                className="text-accent-600 hover:text-accent-700"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onView?.(note._id)}
                className="text-primary-600 hover:text-primary-700"
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit?.(note._id)}
                className="text-secondary-600 hover:text-secondary-700"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold text-lg text-slate-900 line-clamp-2">{note.title}</h3>

        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="gray" className="text-xs">
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="gray" className="text-xs">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="text-slate-600 text-sm line-clamp-3">
          {note.content || note.extractedText || note.bookmarkUrl || "No content"}
        </div>

        {note.type === "bookmark" && note.bookmarkUrl && (
          <a
            href={note.bookmarkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center gap-1"
          >
            <Link className="w-3 h-3" />
            Visit Link
          </a>
        )}
      </div>
    </Card>
  )
}
