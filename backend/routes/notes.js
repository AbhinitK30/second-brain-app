const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdfParse = require('pdf-parse');
const auth = require('../middleware/auth');
const Note = require('../models/Note');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');
const { getEmbedding } = require('../utils/embeddings');
const { getPineconeIndex } = require('../utils/pinecone');
const rateLimit = require('express-rate-limit');

// Multer setup for file uploads (store in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Apply a simple rate limiter to all note routes
const notesLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per minute
  message: { msg: 'Too many requests, please try again later.' }
});
router.use(notesLimiter);

// Helper to upsert embedding in Pinecone (serverless format)
/**
 * Upsert a note's embedding into Pinecone vector DB
 */
async function upsertEmbedding(note, embedding) {
  const pineconeIndex = getPineconeIndex();
  if (embedding.length !== 1024) {
    throw new Error(`Embedding dimension mismatch: got ${embedding.length}, expected 1024`);
  }
  const records = [
    {
      id: note._id.toString(),
      values: embedding,
      metadata: {
        user: note.user.toString(),
        type: note.type,
        title: note.title,
      }
    }
  ];
  await pineconeIndex.upsert(records);
}

// Helper: Validate note input
/**
 * Validate note input for required fields by type
 */
function validateNoteInput({ title, content, bookmarkUrl, type }) {
  if (!title || typeof title !== 'string' || !title.trim()) {
    return 'Title is required and must be a non-empty string.';
  }
  if (type === 'text' && (!content || typeof content !== 'string' || !content.trim())) {
    return 'Content is required for text notes.';
  }
  if (type === 'bookmark' && (!bookmarkUrl || typeof bookmarkUrl !== 'string' || !bookmarkUrl.trim())) {
    return 'bookmarkUrl is required for bookmark notes.';
  }
  return null;
}

// Create a text note
router.post('/text', auth, async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const validationError = validateNoteInput({ title, content, type: 'text' });
    if (validationError) return res.status(400).json({ msg: validationError });
    const note = new Note({
      user: req.user,
      type: 'text',
      title,
      content,
      tags,
    });
    await note.save();
    const embedding = await getEmbedding(`${title} ${content}`);
    await upsertEmbedding(note, embedding);
    res.json(note);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Create a bookmark note
router.post('/bookmark', auth, async (req, res) => {
  try {
    const { title, bookmarkUrl, content, tags } = req.body;
    const validationError = validateNoteInput({ title, bookmarkUrl, type: 'bookmark' });
    if (validationError) return res.status(400).json({ msg: validationError });
    const note = new Note({
      user: req.user,
      type: 'bookmark',
      title,
      bookmarkUrl,
      content,
      tags,
    });
    await note.save();
    const embedding = await getEmbedding(`${title} ${content} ${bookmarkUrl}`);
    await upsertEmbedding(note, embedding);
    res.json(note);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Upload a PDF and create a note
router.post('/pdf', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
    const { title, tags } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ msg: 'Title is required and must be a non-empty string.' });
    }
    // Upload PDF to Cloudinary
    const uploadPromise = new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'pkb_uploads' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });
    const result = await uploadPromise;
    const data = await pdfParse(req.file.buffer);
    const note = new Note({
      user: req.user,
      type: 'pdf',
      title,
      fileUrl: result.secure_url,
      extractedText: data.text,
      tags,
    });
    await note.save();
    const embedding = await getEmbedding(`${title} ${data.text}`);
    await upsertEmbedding(note, embedding);
    res.json(note);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Semantic search endpoint
/**
 * AI-powered semantic search and Q&A over notes
 */
router.post('/search', auth, async (req, res) => {
  try {
    const { query, topK } = req.body;
    const embedding = await getEmbedding(query);
    const pineconeIndex = getPineconeIndex();
    const result = await pineconeIndex.query({
      vector: embedding,
      topK: topK || 5,
      includeMetadata: true,
    });
    const ids = result.matches.map((m) => m.id);
    // Query MongoDB using string IDs directly
    const notes = await Note.find({ _id: { $in: ids }, user: req.user });
    const notesMap = Object.fromEntries(notes.map(n => [n._id.toString(), n]));
    const sortedNotes = ids.map(id => notesMap[id]).filter(Boolean);

    // Build context for Cohere: always include top-matching PDF note (if present), truncate PDF text, cap total context
    const maxNotes = 2;
    const maxPdfText = 1000;
    let context = '';
    let charCount = 0;
    let notesUsed = [];
    // First, add up to maxNotes top notes (truncating PDF text)
    for (let i = 0; i < sortedNotes.length && notesUsed.length < maxNotes; i++) {
      const n = sortedNotes[i];
      let noteText = '';
      if (n.type === 'text') noteText = `Note ${notesUsed.length+1}: ${n.title}\n${n.content}`;
      if (n.type === 'bookmark') noteText = `Note ${notesUsed.length+1}: ${n.title}\n${n.content}\n${n.bookmarkUrl}`;
      if (n.type === 'pdf') noteText = `Note ${notesUsed.length+1}: ${n.title}\n${(n.extractedText || '').slice(0, maxPdfText)}`;
      if (charCount + noteText.length > 3000) break;
      context += (context ? '\n---\n' : '') + noteText;
      charCount += noteText.length;
      notesUsed.push(n._id.toString());
    }
    // Then, if a PDF note exists in sortedNotes and wasn't included, add it (truncated)
    const pdfNote = sortedNotes.find(n => n.type === 'pdf' && !notesUsed.includes(n._id.toString()));
    if (pdfNote && charCount < 3000) {
      let noteText = `Note ${notesUsed.length+1}: ${pdfNote.title}\n${(pdfNote.extractedText || '').slice(0, maxPdfText)}`;
      if (charCount + noteText.length <= 3000) {
        context += (context ? '\n---\n' : '') + noteText;
        charCount += noteText.length;
      }
    }
    let answer = '';
    if (context.trim().length > 0) {
      const axios = require('axios');
      try {
        const response = await axios.post(
          'https://api.cohere.ai/v1/generate',
          {
            model: 'command-r-plus',
            prompt: `Answer the following question using the provided notes.\n\nQuestion: ${query}\n\nNotes:\n${context}\n\nAnswer:`,
            max_tokens: 150,
            temperature: 0.3,
            stop_sequences: ["--END--"]
          },
          {
            headers: {
              'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
        answer = response.data.generations?.[0]?.text?.trim() || '';
      } catch (err) {
        console.error('Cohere answer generation error:', err);
        answer = '';
      }
    }
    res.json({ answer, notes: sortedNotes });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get all notes for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Get a single note by ID
router.get('/analytics', auth, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user });
    const totalNotes = notes.length;
    const byType = notes.reduce((acc, note) => {
      acc[note.type] = (acc[note.type] || 0) + 1;
      return acc;
    }, {});
    // Count tags
    const tagCounts = {};
    notes.forEach(note => {
      (note.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    // Get top 5 tags
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));
    res.json({ totalNotes, byType, topTags });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user });
    if (!note) return res.status(404).json({ msg: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Update a note by ID (and update embedding in Pinecone)
router.put('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user });
    if (!note) return res.status(404).json({ msg: 'Note not found' });
    const { title, content, tags, bookmarkUrl } = req.body;
    const validationError = validateNoteInput({ title: title ?? note.title, content: content ?? note.content, bookmarkUrl: bookmarkUrl ?? note.bookmarkUrl, type: note.type });
    if (validationError) return res.status(400).json({ msg: validationError });
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (bookmarkUrl !== undefined) note.bookmarkUrl = bookmarkUrl;
    await note.save();
    let textForEmbedding = note.title;
    if (note.type === 'text') textForEmbedding += ' ' + note.content;
    if (note.type === 'bookmark') textForEmbedding += ' ' + note.content + ' ' + note.bookmarkUrl;
    if (note.type === 'pdf') textForEmbedding += ' ' + note.extractedText;
    const embedding = await getEmbedding(textForEmbedding);
    if (!embedding || !Array.isArray(embedding)) {
      return res.status(500).json({ msg: 'Server error', error: 'Invalid embedding from Cohere' });
    }
    await upsertEmbedding(note, embedding);
    res.json(note);
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Delete a note by ID (and remove from Pinecone)
router.delete('/:id', auth, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!note) return res.status(404).json({ msg: 'Note not found' });
    // Remove from Pinecone (serverless expects ids array)
    const pineconeIndex = getPineconeIndex();
    await pineconeIndex.delete({ ids: [note._id.toString()] });
    res.json({ msg: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// Summarize a note (AI-powered)
router.post('/:id/summarize', auth, async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user });
    if (!note) return res.status(404).json({ msg: 'Note not found' });
    let textToSummarize = note.title;
    if (note.type === 'text') textToSummarize += ' ' + note.content;
    if (note.type === 'bookmark') textToSummarize += ' ' + note.content + ' ' + note.bookmarkUrl;
    if (note.type === 'pdf') textToSummarize += ' ' + note.extractedText;
    if (!textToSummarize || textToSummarize.length < 20) {
      return res.status(400).json({ msg: 'Not enough content to summarize.' });
    }
    // Truncate to first 3000 characters to avoid token overflow
    const maxChars = 3000;
    if (textToSummarize.length > maxChars) {
      textToSummarize = textToSummarize.slice(0, maxChars);
    }
    // Dynamically set max_tokens for summary
    let maxTokens = 80;
    if (note.type === 'pdf') {
      if (textToSummarize.length < 1000) maxTokens = 80;
      else if (textToSummarize.length < 2000) maxTokens = 120;
      else maxTokens = 180;
    } else {
      if (textToSummarize.length < 500) maxTokens = 60;
      else if (textToSummarize.length < 1500) maxTokens = 100;
      else maxTokens = 120;
    }
    // Call Cohere's generate endpoint for summarization
    const axios = require('axios');
    const response = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        model: 'command-r-plus',
        prompt: `Summarize this in 3-4 sentences:\n${textToSummarize}`,
        max_tokens: maxTokens,
        temperature: 0.3,
        stop_sequences: ["--END--"]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.COHERE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const summary = response.data.generations?.[0]?.text?.trim() || 'No summary generated.';
    res.json({ summary });
  } catch (err) {
    // Aggressive error logging and reporting
    console.error('Summarize endpoint error:', err);
    let errorDetails = {
      message: err.message,
      stack: err.stack,
      response: err.response ? {
        status: err.response.status,
        headers: err.response.headers,
        data: err.response.data
      } : undefined,
      toString: err.toString()
    };
    res.status(500).json({ msg: 'Server error', error: errorDetails });
  }
});

module.exports = router; 