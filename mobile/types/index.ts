export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface MessageSender extends User {}

export interface Message {
  _id: string;
  chat: string;
  sender: MessageSender | string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatLastMessage {
  _id: string;
  text: string;
  sender: MessageSender | string;
  createdAt: string;
}

export interface Chat {
  _id: string;
  participants: MessageSender;
  lastMessage?: ChatLastMessage | string;
  lastMessageAt?: string;
  createdAt: string;
}
