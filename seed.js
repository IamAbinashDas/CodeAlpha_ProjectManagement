require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
});

const projectSchema = new mongoose.Schema({
  title: String,
  code: String,
  description: String,
  owner: mongoose.Schema.Types.ObjectId
});

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  priority: String,
  stage: String,
  project: mongoose.Schema.Types.ObjectId,
  assignee: String,
  dueDate: String
});

const User = mongoose.model('User', userSchema);
const Project = mongoose.model('Project', projectSchema);
const Task = mongoose.model('Task', taskSchema);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/codealpha_kinetic');
  await User.deleteMany({});
  await Project.deleteMany({});
  await Task.deleteMany({});

  const pwd = await bcrypt.hash('password123', 10);
  const demoUser = await User.create({
    name: "Abinash Das",
    email: "abinash@example.com",
    password: pwd,
    role: "Lead Systems Architect"
  });

  const coreProject = await Project.create({
    title: "Project Titan — Core Mesh Protocol",
    code: "TITAN",
    description: "High-throughput asynchronous event brokers and state synchronization pipelines.",
    owner: demoUser._id
  });

  await Task.create([
    {
      title: "Implement distributed consensus raft log",
      description: "Verify replication consistency across replica sets under split-brain tests.",
      priority: "Critical",
      stage: "backlog",
      project: coreProject._id,
      assignee: "Abinash Das",
      dueDate: "2026-09-20"
    },
    {
      title: "Design zero-copy ring buffers for network ingress",
      description: "Optimize IO throughput on IPC sockets to sustain 100k msg/sec benchmarks.",
      priority: "High",
      stage: "in_progress",
      project: coreProject._id,
      assignee: "Abinash Das",
      dueDate: "2026-09-22"
    },
    {
      title: "Benchmarking Redis cache eviction latency",
      description: "Audit p99 response times during multi-tenant write bursts.",
      priority: "Medium",
      stage: "review",
      project: coreProject._id,
      assignee: "Core Eng",
      dueDate: "2026-09-18"
    },
    {
      title: "Establish baseline JWT stateless validation guards",
      description: "Setup bearer headers and salted bcrypt credential hashing.",
      priority: "Low",
      stage: "done",
      project: coreProject._id,
      assignee: "Security Sec",
      dueDate: "2026-09-15"
    }
  ]);

  console.log("✓ Demo workspace and Kanban tasks seeded into codealpha_kinetic!");
  process.exit(0);
}

seed().catch(console.error);