# AlgoHire

A real-time technical interview platform featuring a collaborative code editor, interactive whiteboard, and multi-language code execution. Interviewers create rooms and manage candidate admissions, while candidates can join with just a name — no account required.

---

## Features

- **Real-Time Collaborative Code Editor** — Powered by Monaco Editor with character-level change syncing via Socket.IO
- **Interactive Whiteboard** — Built with Excalidraw, synced in real-time across participants
- **Multi-Language Code Execution** — Supports JavaScript, Python, Java, and C++ via the Piston API
- **Waiting Room & Admission Control** — Interviewers approve candidates before they can enter the room
- **Guest Access** — Candidates join by entering their name only, no registration needed
- **JWT Authentication** — Secure access/refresh token flow with httpOnly cookies and automatic token refresh
- **Dark / Light Theme** — Toggle between themes with a single click
- **Interview History** — Dashboard view of past and active interviews with quick rejoin links

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 7, Tailwind CSS 4, React Router 7 |
| Code Editor | Monaco Editor (`@monaco-editor/react`) |
| Whiteboard | Excalidraw (`@excalidraw/excalidraw`) |
| Backend | Express 5, Node.js (ES Modules) |
| Database | MongoDB (Mongoose 8) |
| Authentication | JWT (access + refresh tokens), bcrypt |
| Real-Time | Socket.IO |
| Code Execution | [Piston API](https://github.com/engineer-man/piston) |

---

## Project Structure

```
AlgoHire/
├── backend/
│   ├── src/
│   │   ├── index.js              # Server entry point
│   │   ├── app.js                # Express app setup & middleware
│   │   ├── constants.js          # App-wide constants
│   │   ├── controllers/          # Route handlers
│   │   │   ├── compiler.controller.js
│   │   │   ├── room.controller.js
│   │   │   └── user.controller.js
│   │   ├── db/
│   │   │   └── index.js          # MongoDB connection
│   │   ├── middlewares/
│   │   │   └── auth.middleware.js # JWT verification
│   │   ├── models/
│   │   │   ├── interview.model.js
│   │   │   └── user.model.js
│   │   ├── routes/
│   │   │   ├── compiler.routes.js
│   │   │   ├── room.routes.js
│   │   │   └── user.routes.js
│   │   ├── socket/
│   │   │   └── socketHandler.js  # Socket.IO event handlers
│   │   └── utils/                # Shared utilities
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Routing & layout
│   │   ├── main.jsx              # App entry point
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   └── ThemeToggle.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── InterviewTable.jsx
│   │   │   ├── layout/
│   │   │   │   └── Navbar.jsx
│   │   │   └── room/
│   │   │       ├── CodeEditor.jsx
│   │   │       ├── OutputConsole.jsx
│   │   │       └── Whiteboard.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── hooks/
│   │   │   └── useTheme.js
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Landing.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Room.jsx
│   │   └── services/
│   │       ├── api.js
│   │       ├── authService.js
│   │       ├── compilerService.js
│   │       └── roomService.js
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/AlgoHire.git
cd AlgoHire
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=8000
MONGODB_URI=mongodb://localhost:27017/algohire
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=10d
```

Start the backend server:

```bash
npm run dev
```

The server will start on `http://localhost:8000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend dev server will start on `http://localhost:5173`.

---

## API Reference

### Authentication — `/api/v1/users`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/register` | No | Register a new user (fullName, email, username, password) |
| POST | `/login` | No | Log in with email/username and password |
| POST | `/logout` | Yes | Log out and clear auth cookies |
| POST | `/refresh-token` | No | Refresh access token using the refresh token cookie |

### Rooms — `/api/v1/rooms`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/create` | Yes | Create a new interview room |
| GET | `/history` | Yes | Get the interviewer's past interview rooms |
| GET | `/:roomId` | No | Get room details (used by both interviewer and candidate) |
| POST | `/:roomId/end` | Yes | End an active interview |

### Compiler — `/api/v1/compiler`

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `/execute` | No | Execute code in JavaScript, Python, Java, or C++ |

---

## Socket.IO Events

| Event | Direction | Description |
| --- | --- | --- |
| `join-room` | Client → Server | Join a room with `{ roomId, userId, role }` |
| `user-waiting` | Server → Interviewer | Notify interviewer that a candidate is waiting for admission |
| `admit-candidate` | Interviewer → Server | Approve a waiting candidate |
| `room-joined` | Server → Client | Confirm the user has been admitted to the room |
| `code-change` | Client → Server | Send incremental code editor changes |
| `code-update` | Server → Client | Broadcast code changes to other participants |
| `language-change` | Client → Server | Change the programming language |
| `language-update` | Server → All | Broadcast language change to all participants |
| `whiteboard-draw` | Client → Server | Send whiteboard drawing elements |
| `whiteboard-update` | Server → Client | Broadcast whiteboard changes to other participants |

---

## Usage

1. **Register / Log in** as an interviewer
2. **Create a room** from the Dashboard
3. **Share the room link** with the candidate
4. The candidate enters their **name** and waits to be admitted
5. The interviewer **admits** the candidate into the room
6. Both participants can now **collaborate** on the code editor and whiteboard in real-time
7. **Run code** in the output console to test solutions
8. **End the interview** when finished — it gets saved to history

---

## License

This project is open source and available under the [MIT License](LICENSE).
