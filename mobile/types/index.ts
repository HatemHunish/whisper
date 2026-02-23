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
  participant: MessageSender;
  lastMessage?: ChatLastMessage;
  lastMessageAt?: string;
  createdAt: string;
}


export const MockChats: Chat[] = [
  {
    _id: "1",
    participant: {
      _id: "u1",
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    lastMessage: {
      _id: "m1",
      text: "Hey, how are you?",
      sender: {
        _id: "u1",
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
        avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      },
      createdAt: "2024-06-01T12:00:00Z",
    },
    lastMessageAt: "2024-06-01T12:00:00Z",
    createdAt: "2024-05-30T10:00:00Z",
  },
];
