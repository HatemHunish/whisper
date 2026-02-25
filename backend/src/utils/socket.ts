import { Socket, Server as SocketServer } from "socket.io";
import { Server as HTTPServer } from "node:http";
import { verifyToken } from "@clerk/express";
import { Message } from "../models/message.model";
import { Chat } from "../models/chat.model";
import { User } from "../models/user.model";
const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY environment variable is required");
}
const allowedOrigins = [
  "http://localhost:8081",
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];
export const onlineUsers: Map<string, string> = new Map(); // userId to socketId mapping
export function initializeSocketServer(httpServer: HTTPServer) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
    },
  });
  // verify socket connection - if the user is authenticated
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }
      const session = await verifyToken(token, {
        secretKey: CLERK_SECRET_KEY!,
      });

      const clerkId = session?.sub;
      if (!clerkId) {
        return next(new Error("Authentication error: Invalid token"));
      }
      const user = await User.findOne({ clerkId });
      if (!user) {
        return next(new Error("Authentication error: User not found"));
      }
      socket.data.userId = user._id.toString();
      next();
    } catch (error: any) {
      next(error);
    }
  });

  // this "connection" event is fired whenever a new client connects to the server
  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    console.log(`User connected: ${userId}`);

    socket.emit("online-users", Array.from(onlineUsers.keys()));

    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit("user-online", { userId });
    }
    // notify other user is online
    socket.broadcast.emit("user-online", { userId });

    socket.join(`user:${userId}`); // join a room specific to the user

    socket.on("join-chat", async (chatId: string) => {
      const chat = await Chat.findOne({
        _id: chatId,
        participants: userId,
      });
      if (!chat) {
        return socket.emit("socket-error", "Chat not found or access denied");
      }
      socket.join(`chat:${chatId}`);
    });

    socket.on("leave-chat", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on(
      "send-message",
      async (data: { chatId: string; text: string }) => {
        try {
          const { chatId, text } = data;
          const chat = await Chat.findOne({
            _id: chatId,
            participants: userId,
          });
          if (!chat) {
            return socket.emit(
              "socket-error",
              "Chat not found or access denied",
            );
          }

          const message = new Message({
            chat: chatId,
            sender: userId,
            text,
          });
          await message.save();
          chat.lastMessage = message._id;
          chat.lastMessageAt = new Date();
          await chat.save();
          await message.populate("sender", "name email avatar");
          io.to(`chat:${chatId}`).emit("new-message", message);
          for (const participantId of chat.participants) {
            io.to(`user:${participantId}`).emit("new-message", message);
          }
        } catch (error) {
          socket.emit("socket-error", "Failed to send message");
        }
      },
    );

    socket.on("typing", async (data: { chatId: string; isTyping: boolean }) => {
      const typingPayload = {
        userId,
        chatId: data.chatId,
        isTyping: data.isTyping,
      };
      // emit to chat room (for users currently in the chat)
      socket.to(`chat:${data.chatId}`).emit("typing", typingPayload);

      try {
        const chat = await Chat.findById(data.chatId);
        if (chat) { 
          const otherParticipantId = chat.participants.find(
            (p) => p.toString() !== userId,
          );
          if (otherParticipantId) {
            // emit to other user (for users not currently in the chat but want to show typing indicator in chat list)
            socket
              .to(`user:${otherParticipantId}`)
              .emit("typing", typingPayload);
          }
        }
      } catch (error) {
        // silently fail if chat not found or any error occurs, since typing indicator is just a nice-to-have feature
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
      if (userId) {
        onlineUsers.delete(userId);
        socket.broadcast.emit("user-offline", { userId });
      }
    });
  });
  return io;
}
