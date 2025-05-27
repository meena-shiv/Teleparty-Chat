export interface ChatMessage {
  isSystemMessage: boolean;
  userIcon?: string;
  userNickname?: string;
  body: string;
  permId: string;
  timestamp: string;
  userId?: string;
}

export interface User {
  id: string;
  nickname: string;
  avatar?: string;
}

export interface RoomState {
  roomId: string | null;
  isConnected: boolean;
  messages: ChatMessage[];
  users: User[];
  isTyping: boolean;
}

export type AppState = {
  currentUser: User | null;
  roomState: RoomState;
};
