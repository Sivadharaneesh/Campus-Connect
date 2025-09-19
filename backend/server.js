const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require('http');
const path = require('path');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const bcrypt = require("bcryptjs");
const socketIo = require('socket.io');

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const dashboardRoutes = require("./routes/dashboard");

// Import models
const User = require('./models/User');
const Message = require('./models/Message');
const Group = require('./models/Group');

require("dotenv").config();

const app = express();
const server = http.createServer(app);

// Configure CORS for both Express and Socket.io
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Connect to MongoDB
const uri = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/dashboard";

mongoose.connect(uri, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error(err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/users', require('./routes/users'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/admin', require('./routes/admin'));

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      fileUrl: fileUrl,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

app.get("/api/health", (_, res) => res.json({ ok: true }));

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error'));
    }
    
    socket.userId = user._id;
    socket.username = user.username;
    socket.isAdmin = user.isAdmin;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`${socket.username} connected`);
  
  // Join user to their personal room
  socket.join(socket.userId.toString());
  
  // Join group room
  socket.on('join group', (groupId) => {
    socket.join(groupId);
    console.log(`${socket.username} joined group ${groupId}`);
  });
  
  // Leave group room
  socket.on('leave group', (groupId) => {
    socket.leave(groupId);
    console.log(`${socket.username} left group ${groupId}`);
  });
  
  // Send message
  socket.on('send message', async (data) => {
    try {
      const { groupId, content, type = 'text', fileUrl, fileName } = data;
      
      const message = new Message({
        content,
        type: type || 'text',
        group: groupId,
        sender: socket.userId,
        ...(fileUrl && { fileUrl }),
        ...(fileName && { fileName })
      });
      
      await message.save();
      
      // Populate sender info and send to all clients in the group
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username avatar');
      
      io.to(groupId).emit('new message', populatedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', 'Failed to send message');
    }
  });
  
  // Delete message (admin only)
  socket.on('delete message', async (data) => {
    try {
      if (!socket.isAdmin) {
        return socket.emit('error', 'Admin access required');
      }
      
      const { messageId } = data;
      const message = await Message.findById(messageId);
      
      if (!message) {
        return socket.emit('error', 'Message not found');
      }
      
      message.isDeleted = true;
      message.deletedBy = socket.userId;
      await message.save();
      
      io.to(message.group.toString()).emit('message deleted', messageId);
    } catch (error) {
      socket.emit('error', 'Failed to delete message');
    }
  });
  
  // Handle typing indicators
  socket.on('typing start', (groupId) => {
    socket.to(groupId).emit('user typing', {
      userId: socket.userId,
      username: socket.username
    });
  });
  
  socket.on('typing stop', (groupId) => {
    socket.to(groupId).emit('user stop typing', {
      userId: socket.userId
    });
  });
  
  socket.on('disconnect', () => {
    console.log(`${socket.username} disconnected`);
  });
});

// Create default groups if they don't exist
const createDefaultGroups = async () => {
  const groups = [
    {
      name: 'Computer Science Study',
      description: 'Discussion group for Computer Science students',
      category: 'study'
    },
    {
      name: 'Engineering Study',
      description: 'Discussion group for Engineering students',
      category: 'study'
    },
    {
      name: 'College Events',
      description: 'Information about upcoming college events',
      category: 'event'
    },
    {
      name: 'Mathematics Study',
      description: 'Discussion group for Mathematics students',
      category: 'study'
    },
    {
      name: 'Student Activities',
      description: 'Planning and discussion for student activities',
      category: 'event'
    }
  ];
  
  // Find or create admin user
  let admin = await User.findOne({ isAdmin: true });
  if (!admin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    admin = new User({
      username: 'admin',
      email: 'admin@college.edu',
      password: hashedPassword,
      isApproved: true,
      verified: true,
      isAdmin: true
    });
    await admin.save();
    console.log('Default admin user created');
  }

  for (const groupData of groups) {
    const existingGroup = await Group.findOne({ name: groupData.name });
    if (!existingGroup) {
      const group = new Group({
        ...groupData,
        admin: admin._id,
        members: [admin._id]
      });
      await group.save();
      console.log(`Default group created: ${groupData.name}`);
    }
  }
};

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
  console.log('Uploads directory created');
}

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createDefaultGroups();
});