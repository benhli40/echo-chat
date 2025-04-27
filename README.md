# Echo Chat

🚀 **Echo Chat** is a real-time messaging app built with **FastAPI** (backend) and **Vanilla JavaScript** (frontend).

It supports:
- Live text chatting 💬
- Voice message recording and playback 🎙️
- Upload and preview images 📷
- Upload and preview text files 📄
- Download other files 📎
- Edit sent messages ✏️
- Drag-and-drop file uploads 🖱️

---

## 📸 Screenshots

> (You can add screenshots later if you want — optional)

---

## 🛠️ Tech Stack

| Frontend | Backend |
|:--|:--|
| HTML, CSS (Vanilla) | FastAPI (Python) |
| JavaScript (Vanilla) | WebSockets |
| Web Audio API (for recording) | CORS Middleware |

---

## 📦 Project Structure

/echo-chat /frontend index.html style.css app.js favicon.png /backend app.py README.md


---

## 🚀 How to Run Locally

1. Clone the repository:

```bash
git clone https://github.com/yourusername/echo-chat.git
cd echo-chat

    Install Python dependencies:

cd backend
pip install fastapi uvicorn

    Start the backend server:

uvicorn app:app --reload

    Open the frontend:

    Open frontend/index.html directly in your browser OR

    Serve it using a simple server like Live Server (VSCode extension).

    Start chatting!

🌐 Deployment Options

You can deploy Echo Chat backend to:

    Render

    Railway

    Fly.io

Frontend can be hosted on:

    GitHub Pages (static frontend)

    Netlify

    Vercel

✨ Features

Send and edit text messages

Record and send voice messages

Upload images and view inline

Upload and preview text files

Upload any file as downloadable link

Drag-and-drop file uploading

Real-time live messaging

User join/leave notifications

    Typing indicator (coming soon!)

📃 License

MIT License — Free to use and modify.
🧠 Built with Heart ❤️

Created by Benjamin Liles.