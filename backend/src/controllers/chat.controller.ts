import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { Chat } from "../models/chat.model";
import { Types } from "mongoose";

export async function getChats(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  // Implementation for fetching chats
  try {
    const userId = req.userId;

    const chats = await Chat.find({ participants: { $all: [userId] } })
      .populate("participants", "name email avatar")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 }); // descending order
    const formatedChats = chats.map((chat) => {
      const otherParticipant = chat.participants.filter(
        (participant) => participant._id.toString() !== userId,
      )[0];
      return {
        _id: chat._id,
        participant: otherParticipant,
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt,
      };
    });
    res.status(200).json(formatedChats);
  } catch (error) {
    res.status(500);
    next(error);
  }
}
type ChatParams = { participantId: string };

export async function getOrCreateChat(
  req: AuthenticatedRequest<ChatParams>,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    const { participantId } = req.params;
    if (!participantId) {
      return res.status(400).json({ message: "participantId is required" });
    }

    if (!Types.ObjectId.isValid(participantId)) {
      return res.status(400).json({ message: "Invalid participantId" });
    }

    if (participantId === userId) {
      return res
        .status(400)
        .json({ message: "Cannot create chat with yourself" });
    }
    let chat = await Chat.findOne({
      participants: { $all: [userId, participantId] },
    })
      .populate("participants", "name email avatar")
      .populate("lastMessage");
    if (!chat) {
      const newChat = new Chat({
        participants: [userId, participantId],
      });
      await newChat.save();
      chat = await newChat.populate("participants", "name email avatar");
    }
    const otherParticipant = chat.participants.find(
      (p: any) => p._id.toString() !== userId,
    );
    res.status(200).json({
      _id: chat._id,
      participant: otherParticipant ?? null,
      lastMessage: chat.lastMessage,
      lastMessageAt: chat.lastMessageAt,
      createdAt: chat.createdAt,
    });
  } catch (error) {
    res.status(500);
    next(error);
  }
}

export async function deleteChat(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    console.log("Delete chat request received with params:", req.params);
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    const { chatId } = req.params;
    if (!chatId) {
      return res.status(400).json({ message: "chatId is required" });
    }
    if (!Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid chatId" });
    }
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }
    if (!chat.participants.includes(userId as any)) {
      return res
        .status(403)
        .json({ message: "Not a participant of this chat" });
    }
    await Chat.findByIdAndDelete(chatId);
    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500);
    next(error);
  }
}
