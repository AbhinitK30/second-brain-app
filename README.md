# Second Brain App with AI-Powered Search

A full-stack knowledge management app ("second brain") with AI-powered search, summarization, and note management. Supports text notes, PDF uploads (with content extraction), and bookmarks. Built with Node.js, Express, MongoDB, Pinecone, Cohere, React, Vite, and Tailwind CSS.

---

## ✨ Features
- **Authentication:** Register/Login with JWT, protected routes
- **Text Notes:** Add, edit, delete, tag, and search
- **PDF Notes:** Upload PDFs, extract and search content, preview in-browser
- **Bookmarks:** Save URLs with descriptions and tags
- **AI-Powered Search:** Semantic search and direct Q&A using Cohere and Pinecone
- **AI Summarization:** Summarize any note (text, bookmark, or PDF)
- **Analytics Dashboard:** Note counts, types, and top tags
- **Modern UI:** Responsive, beautiful design with Tailwind CSS
- **Error Handling:** Robust validation, error boundaries, and rate limiting

---

## 🛠️ Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Vector Search:** Pinecone
- **AI/Embeddings/Summarization:** Cohere API
- **PDF Extraction:** pdf-parse
- **File Storage:** Cloudinary (for PDFs)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd <project-root>
```

### 2. Backend Setup
```bash
cd backend
npm install
```

#### Create a `.env` file in `backend/` with:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_pinecone_env
PINECONE_INDEX=your_pinecone_index
COHERE_API_KEY=your_cohere_api_key
```

#### Start the backend server
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 📝 Usage
- **Register/Login** to your account
- **Add notes:** Text, PDF, or bookmark
- **Search:** Use the AI-powered search bar for Q&A across all your notes
- **Summarize:** Summarize any note with one click
- **Analytics:** View your knowledge stats on the dashboard
- **Edit/Delete:** Manage your notes easily

---

## 🌐 Environment Variables
See `.env.example` in the backend for all required variables.

---

## 🙏 Credits
- [Cohere](https://cohere.com/) for AI embeddings and summarization
- [Pinecone](https://www.pinecone.io/) for vector search
- [Cloudinary](https://cloudinary.com/) for file storage
- [pdf-parse](https://www.npmjs.com/package/pdf-parse) for PDF extraction
- [Vite](https://vitejs.dev/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)

---

## 📄 License
Abhinit Khambekar, PICT