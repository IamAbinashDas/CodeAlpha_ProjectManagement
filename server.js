require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 1. Schemas (User, Project, Task)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "Systems Engineer" },
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  stage: { type: String, enum: ['backlog', 'in_progress', 'review', 'done'], default: 'backlog' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignee: { type: String, default: "Engineering Unit" },
  dueDate: { type: String, default: "2026-09-30" },
  createdAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, uppercase: true },
  description: { type: String, default: "" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Task = mongoose.model('Task', taskSchema);

// 2. Auth Middleware
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Auth token missing.' });
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'kinetic_secret');
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Please sign in.' });
  }
};

// 3. Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required.' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: role || "Systems Engineer" });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET || 'kinetic_secret', { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch {
    res.status(500).json({ error: 'Registration failed.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET || 'kinetic_secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch {
    res.status(500).json({ error: 'Login failed.' });
  }
});

// 4. Project & Kanban Workspace Routes
app.get('/api/projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch {
    res.status(500).json({ error: 'Could not fetch projects.' });
  }
});

app.post('/api/projects', auth, async (req, res) => {
  try {
    const { title, code, description } = req.body;
    if (!title || !code) return res.status(400).json({ error: 'Title and code are required.' });

    const project = await Project.create({
      title,
      code: code.toUpperCase(),
      description: description || "Active engineering cycle",
      owner: req.user.id
    });
    res.status(201).json(project);
  } catch {
    res.status(500).json({ error: 'Could not create workspace.' });
  }
});

// 5. Tasks & Stage Pipeline Routes
app.get('/api/projects/:id/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.id }).sort({ createdAt: -1 });
    const project = await Project.findById(req.params.id);
    res.json({ project, tasks });
  } catch {
    res.status(500).json({ error: 'Failed to retrieve tasks.' });
  }
});

app.post('/api/tasks', auth, async (req, res) => {
  try {
    const { title, description, priority, stage, projectId, assignee, dueDate } = req.body;
    if (!title || !projectId) return res.status(400).json({ error: 'Title and Project ID are required.' });

    const task = await Task.create({
      title,
      description: description || "",
      priority: priority || 'Medium',
      stage: stage || 'backlog',
      project: projectId,
      assignee: assignee || req.user.name,
      dueDate: dueDate || "2026-09-30"
    });
    res.status(201).json(task);
  } catch {
    res.status(500).json({ error: 'Task creation failed.' });
  }
});

app.patch('/api/tasks/:id/stage', auth, async (req, res) => {
  try {
    const { stage } = req.body;
    if (!['backlog', 'in_progress', 'review', 'done'].includes(stage)) {
      return res.status(400).json({ error: 'Invalid stage.' });
    }
    const task = await Task.findByIdAndUpdate(req.params.id, { stage }, { new: true });
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Stage shift failed.' });
  }
});

app.delete('/api/tasks/:id', auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted.' });
  } catch {
    res.status(500).json({ error: 'Delete failed.' });
  }
});

const PORT = process.env.PORT || 5002;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codealpha_kinetic')
  .then(() => {
    console.log('MongoDB Connected to codealpha_kinetic');
    app.listen(PORT, () => console.log(`KINETIC Flow running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('MongoDB Error:', err));