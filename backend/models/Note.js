const mongoose = require('mongoose');

// Note schema for text notes, PDFs, and bookmarks
const NoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'pdf', 'bookmark'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String, // For text notes or bookmark description
  },
  fileUrl: {
    type: String, // For uploaded PDFs
  },
  extractedText: {
    type: String, // For extracted PDF text
  },
  bookmarkUrl: {
    type: String, // For bookmarks
  },
  tags: [{
    type: String,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Note', NoteSchema); 