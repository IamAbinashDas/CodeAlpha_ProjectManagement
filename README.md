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

## 🚀 Quick Start

### 1. Clone & Install
```bash
git clone [https://github.com/IamAbinashDas/CodeAlpha_ProjectManagement.git](https://github.com/IamAbinashDas/CodeAlpha_ProjectManagement.git)
cd CodeAlpha_ProjectManagement
npm install