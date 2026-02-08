import express from 'express';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import messageRoutes from './routes/message.routes';
import chatRoutes from './routes/chat.routes';


const app = express();
app.use(express.json()); // Middleware to parse JSON bodies /

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString(),message: 'Server is healthy'});
});

app.use("/api/auth",authRoutes);
app.use("/api/users",userRoutes);
app.use("/api/messages",messageRoutes);
app.use("/api/chats",chatRoutes);

export default app;