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

// 1. Schemas
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "Systems Engineer" },
  createdAt: { type: Date, default: Date.now }
});

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  code: { type: String, required: true, uppercase: true },
  description: { type: String, default: "" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: String }], // Collaborator emails who share this board
  createdAt: { type: Date, default: Date.now }
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  stage: { type: String, enum: ['backlog', 'in_progress', 'review', 'done'], default: 'backlog' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignee: { type: String, default: "Unassigned" },
  dueDate: { type: String, default: "2026-09-30" },
  checklists: [{ 
    text: { type: String, required: true }, 
    completed: { type: Boolean, default: false } 
  }],
  comments: [{
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Task = mongoose.model('Task', taskSchema);

// 2. Auth Middleware
const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ error: 'Auth token missing' });
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'kinetic_flow_secret_key_2026');
    next();
  } catch {
    res.status(401).json({ error: 'Session expired' });
  }
};

// 3. Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: role || "Systems Engineer" });
    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET || 'kinetic_flow_secret_key_2026', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, name: user.name, email: user.email }, process.env.JWT_SECRET || 'kinetic_flow_secret_key_2026', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
});

// 4. Project / Workspace Routes (Group Collaboration)
app.get('/api/projects', auth, async (req, res) => {
  try {
    // Shows projects owned by user OR projects where user was added as a member
    const projects = await Project.find({
      $or: [{ owner: req.user.id }, { members: req.user.email }]
    }).sort({ createdAt: -1 });
    res.json(projects);
  } catch {
    res.status(500).json({ error: 'Could not fetch workspaces' });
  }
});

app.post('/api/projects', auth, async (req, res) => {
  try {
    const { title, code, description } = req.body;
    if (!title || !code) return res.status(400).json({ error: 'Title and code are required' });
    const project = await Project.create({
      title,
      code: code.toUpperCase(),
      description: description || "Active engineering cycle",
      owner: req.user.id,
      members: [req.user.email]
    });
    res.status(201).json(project);
  } catch {
    res.status(500).json({ error: 'Failed to create workspace' });
  }
});

// Add Member to Group Project (Trello / Asana Invite)
app.post('/api/projects/:id/members', auth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { members: email.trim().toLowerCase() } },
      { new: true }
    );
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Could not add team member' });
  }
});

// 5. Tasks & Discussion Routes
app.get('/api/projects/:id/tasks', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    const tasks = await Task.find({ project: req.params.id }).sort({ createdAt: -1 });
    res.json({ project, tasks });
  } catch {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/api/tasks', auth, async (req, res) => {
  try {
    const { title, description, priority, stage, projectId, assignee, dueDate } = req.body;
    const task = await Task.create({
      title,
      description: description || "",
      priority: priority || 'Medium',
      stage: stage || 'backlog',
      project: projectId,
      assignee: assignee || req.user.name,
      dueDate: dueDate || "2026-09-30",
      checklists: []
    });
    res.status(201).json(task);
  } catch {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

app.patch('/api/tasks/:id/stage', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { stage: req.body.stage }, { new: true });
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Stage shift failed' });
  }
});

// Post a comment in a task (In-task communication like Asana/Trello)
app.post('/api/tasks/:id/comments', auth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Comment text required' });

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            authorName: req.user.name,
            authorEmail: req.user.email,
            text
          }
        }
      },
      { new: true }
    );
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// Toggle subtask checklist item
app.patch('/api/tasks/:id/checklist/:index', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    const idx = parseInt(req.params.index, 10);
    if (task && task.checklists[idx] !== undefined) {
      task.checklists[idx].completed = !task.checklists[idx].completed;
      await task.save();
      return res.json(task);
    }
    res.status(400).json({ error: 'Index out of bounds' });
  } catch {
    res.status(500).json({ error: 'Checklist update failed' });
  }
});

// Append subtask checklist item
app.post('/api/tasks/:id/checklist', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $push: { checklists: { text, completed: false } } },
      { new: true }
    );
    res.json(task);
  } catch {
    res.status(500).json({ error: 'Failed to add checklist item' });
  }
});

app.delete('/api/tasks/:id', auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Delete failed' });
  }
});

const PORT = process.env.PORT || 5002;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codealpha_kinetic')
  .then(() => {
    console.log('MongoDB Connected to codealpha_kinetic');
    app.listen(PORT, () => console.log(`KINETIC Flow running on http://localhost:${PORT}`));
  })
  .catch(console.error);