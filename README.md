# Teleparty Chat

A real-time chat application built with React, TypeScript, and WebSockets, featuring a clean and intuitive user interface powered by Chakra UI.

## ✨ Features

- 🎨 **Modern UI** - Clean and responsive interface built with Chakra UI
- 💬 **Real-time Messaging** - Instant message delivery using WebSockets
- 👥 **Multi-room Support** - Create or join chat rooms with unique IDs
- 🚀 **Fast & Lightweight** - Built with Vite for optimal performance
- 🔒 **Type Safety** - Full TypeScript support for better development experience

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/meena-shiv/Teleparty-Chat.git
   cd Teleparty-Chat
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Library**: Chakra UI
- **State Management**: React Context API
- **Real-time**: WebSockets
- **Build Tool**: Vite
- **Linting**: ESLint, Prettier

## 📂 Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ChatRoom.tsx  # Chat room component
│   └── Home.tsx      # Home page component
├── contexts/         # React context providers
│   └── ChatContext.tsx
├── services/         # API and WebSocket services
│   └── websocket.ts
├── types/            # TypeScript type definitions
│   └── index.ts
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) for the amazing build tooling
- [Chakra UI](https://chakra-ui.com/) for the beautiful components
- [React](https://reactjs.org/) for the awesome library

---

Made with ❤️ by [Shiv Meena]
