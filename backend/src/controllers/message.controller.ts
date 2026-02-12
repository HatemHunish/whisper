import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth";
import { Chat } from "../models/chat.model";
import { Message } from "../models/message.model";

export async function getMessages(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.userId;
    const { chatId } = req.params;
    // what does $all do in mongoose query :
    // It matches arrays that contain all elements specified in the query.
    const chat = await Chat.findOne({
      _id: chatId,
      participants: { $all: [userId] },
    });
    if (!chat)
      return res
        .status(404)
        .json({ message: "Chat not found or access denied" });

    const messages = await Message.find({ chatId })
      .populate("sender", "name email avatar")
      .sort({ createdAt: 1 });// ascending order

    res.status(200).json(messages);
  } catch (error) {
    res.status(500);
    next(error);
  }
}
