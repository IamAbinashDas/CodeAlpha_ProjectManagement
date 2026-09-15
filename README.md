
# KINETIC // Architectural Flow Engine — Full-Stack Project Management

[![Node.js](https://img.shields.io/badge/Node.js-v18+-68a063?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47a248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38b2ac?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![CodeAlpha](https://img.shields.io/badge/Internship-CodeAlpha-0284c7?style=for-the-badge)](https://www.codealpha.tech/)

A responsive, high-velocity project management and Kanban workflow platform engineered for the **CodeAlpha Full Stack Web Development Internship** (Task 3). **KINETIC** provides real-time workspace isolation, native HTML5 drag-and-drop task stage synchronization, priority scheduling, and a dot-matrix minimalist architectural UI.

---

## ⚡ Key Features

- **Native Drag-and-Drop Kanban Engine**: Zero-dependency, fluid drag-and-drop state shifting across four distinct pipelines (*Backlog*, *In Progress*, *Code Review*, *Deployed/Done*).
- **Workspace Isolation**: Multi-project management enabling users to maintain separated engineering cycles with custom alphanumeric initiative codes (e.g., `TITAN`, `MESH`).
- **Priority Classification**: Automated priority categorization (`Critical`, `High`, `Medium`, `Low`) with color-coded badges and deadline tracking.
- **Micro-Typography & Dot-Matrix Aesthetic**: High-contrast dark theme with ambient dot-matrix layout and glassmorphic card overlays.
- **Stateless Token Authentication**: Salted credential encryption via `bcryptjs` and bearer authentication headers using `jsonwebtoken`.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript (ES6+), Tailwind CSS CDN, Native Drag-and-Drop API, Lucide Icons
- **Backend**: Node.js & Express.js REST Framework
- **Database**: MongoDB (Mongoose ODM)
- **Security**: JWT (`jsonwebtoken`), `bcryptjs`, Dotenv, CORS

---

## 📁 Directory Architecture

```text
CodeAlpha_ProjectManagement/
├── config/              # Database connection handler
├── middleware/          # JWT bearer token verification
├── models/              # Mongoose schemas (User, Project, Task)
├── routes/              # Modular Express routing endpoints
├── public/              # Static frontend client files
│   ├── css/             # Custom utility overrides
│   ├── js/              # Client scripts
│   ├── index.html       # Workspaces hub & initiative launchers
│   └── board.html       # Live interactive drag-and-drop Kanban board
├── .env                 # Environment configuration (git-ignored)
├── .gitignore           # Git ignore policy
├── package.json         # Project manifests and run scripts
├── seed.js              # Mock workspaces & task pipeline seeder
├── server.js            # Express API service entrypoint
└── README.md            # Comprehensive system documentation

```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone [https://github.com/IamAbinashDas/CodeAlpha_ProjectManagement.git](https://github.com/IamAbinashDas/CodeAlpha_ProjectManagement.git)
cd CodeAlpha_ProjectManagement
npm install

```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=5002
JWT_SECRET=kinetic_flow_secret_key_2026
MONGO_URI=mongodb://127.0.0.1:27017/codealpha_kinetic

```

### 3. Seed Demo Workspaces & Tasks

```bash
node seed.js

```

### 4. Run the Development Server

```bash
npm run dev
# or: node server.js

```

Open **`http://localhost:5002`** in your browser.

---

## 📡 RESTful API Reference

| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Register an engineering unit | No |
| `POST` | `/api/auth/login` | Sign in & retrieve JWT | No |
| `GET` | `/api/projects` | Fetch all user workspaces | Yes (Bearer Token) |
| `POST` | `/api/projects` | Initialize a new workspace | Yes (Bearer Token) |
| `GET` | `/api/projects/:id/tasks` | Query all kanban tasks for a board | Yes (Bearer Token) |
| `POST` | `/api/tasks` | Create and append a task | Yes (Bearer Token) |
| `PATCH` | `/api/tasks/:id/stage` | Update task pipeline stage (drop event) | Yes (Bearer Token) |
| `DELETE` | `/api/tasks/:id` | Delete a task card | Yes (Bearer Token) |

---

## 👨‍💻 Author

**Abinash Das**

* GitHub: [@IamAbinashDas](https://www.google.com/search?q=https://github.com/IamAbinashDas)
* Program: CodeAlpha Full Stack Web Development Internship (Task 3)

```

```
