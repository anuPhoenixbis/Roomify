🏠 Roomify – AI-Powered Room Visualizer

Roomify is a full-stack AI-powered architectural visualization platform that transforms 2D room layouts into AI-generated 3D visualizations.

Built using modern React architecture, serverless cloud backend via Puter, and generative AI workflows.

🚀 Live Concept

Upload a room layout →
AI processes it →
Generates a realistic 3D visualization →
Hosts and displays it via cloud infrastructure.

✨ Features

🧠 AI-based 3D visualization generation

☁️ Cloud storage & hosting using Puter

⚡ Serverless worker-based AI processing

🖼️ Image upload + preview system

🔄 Dynamic routing with React Router

🐳 Dockerized for deployment

📦 Modular architecture with clean separation of concerns

🛠️ Tech Stack
Frontend

React + TypeScript

React Router (File-based routing)

Vite

Custom UI components

CSS styling

Backend & Cloud

Puter.js (Web OS + cloud API layer)

Serverless workers (puter.worker.js)

Cloud file hosting

AI action abstraction layer

DevOps

Docker

Type-safe configuration

Modular lib architecture

📁 Project Structure
app/
  routes/
    home.tsx
    visualizer.$id.tsx
  root.tsx

components/
  Navbar.tsx
  Upload.tsx
  ui/Button.tsx

lib/
  ai.actions.ts        → AI request handling
  puter.action.ts      → Puter API logic
  puter.hosting.ts     → Cloud hosting
  puter.worker.js      → Background worker
  constants.ts
  utils.ts

🧠 Architecture Overview
User Upload
     ↓
Upload Component
     ↓
AI Action (ai.actions.ts)
     ↓
Puter Worker
     ↓
AI Model Processing
     ↓
Hosted Result
     ↓
Visualizer Route (/visualizer/:id)


The application separates:

UI Layer

AI Logic Layer

Cloud Storage Layer

Worker Processing Layer

This makes it scalable and provider-agnostic.

⚙️ Installation

Clone the repository:

git clone https://github.com/anuPhoenixbis/Roomify.git
cd Roomify


Install dependencies:

npm install

🔑 Environment Variables

Create a .env file:

PUTER_API_KEY=


Add your API keys accordingly.

▶️ Run Locally
npm run dev


App runs at:

http://localhost:5173