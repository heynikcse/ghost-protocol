# 👻 Ghost Protocol

A real-time anonymous chat application with self-destructing messages and live reactions.

---

## 🚀 Live Demo

👉 https://ghost-protocol-two.vercel.app/

---

## ✨ Features

* 🔥 Real-time chat using Socket.io
* 👤 Anonymous users (no login)
* ⏳ Messages auto-delete after 2 minutes
* ❤️ Emoji reactions (👍 ❤️ 🔥 😂)
* ⚡ Instant updates across users
* 🎨 Modern UI (Instagram/Gemini inspired)

---

## 🛠 Tech Stack

**Frontend**

* React (Vite)
* Tailwind CSS
* Socket.io-client

**Backend**

* Node.js
* Express
* Socket.io

**Deployment**

* Vercel (Frontend)
* Render (Backend)

---

## 📂 Project Structure

ghost-protocol/
├── backend/
├── frontend/
└── README.md

---

## ⚙️ How to Run Locally

### 1. Clone repository

git clone https://github.com/heynikcse/ghost-protocol.git

### 2. Backend setup

cd backend
npm install
node server.js

### 3. Frontend setup

cd frontend
npm install
npm run dev

---

## 🔗 Configuration

Local:
const socket = io("http://localhost:3001");

Production:
const socket = io("https://ghost-protocol-tpwp.onrender.com");

---

## 🧠 How It Works

* Messages are stored in server memory
* Each message gets a timestamp
* Server deletes messages after 2 minutes
* Updates are broadcast to all users

---

## 🎯 Use Case

* Anonymous communication
* Temporary chats
* Privacy-focused messaging
* Hackathon demo project

---

## 👨‍💻 Author

Nikhil Raj
B.Tech Computer Science Student

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
