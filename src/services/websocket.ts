import { TelepartyClient, SocketMessageTypes, type SocketEventHandler } from 'teleparty-websocket-lib';
import type { ChatMessage, User } from '../types';

export class ChatWebSocket {
  private client: TelepartyClient | null = null;
  private messageCallbacks: Array<(message: ChatMessage) => void> = [];
  private typingCallbacks: Array<(isTyping: boolean) => void> = [];
  private connectionCallbacks: Array<(isConnected: boolean) => void> = [];
  private roomId: string | null = null;
  private user: User | null = null;

  private readonly eventHandler: SocketEventHandler = {
    onConnectionReady: () => {
      this.connectionCallbacks.forEach(callback => callback(true));
    },
    onClose: () => {
      this.connectionCallbacks.forEach(callback => callback(false));
    },
    onMessage: (message: any) => this.handleMessage(message),
  };

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    this.client = new TelepartyClient(this.eventHandler);
  }

  async createRoom(user: User): Promise<string> {
    if (!this.client) throw new Error('WebSocket client not initialized');
    this.user = user;
    this.roomId = await this.client.createChatRoom(user.nickname, user.avatar || '');
    return this.roomId;
  }

  async joinRoom(roomId: string, user: User): Promise<void> {
    if (!this.client) throw new Error('WebSocket client not initialized');
    this.user = user;
    this.roomId = roomId;
    await this.client.joinChatRoom(user.nickname, roomId, user.avatar || '');
  }

  async sendMessage(content: string): Promise<void> {
    if (!this.client || !this.roomId || !this.user) {
      throw new Error('Not connected to a chat room');
    }

    try {
      // Use the sendChatMessage method provided by TelepartyClient
      await (this.client as any).sendMessage(SocketMessageTypes.SEND_MESSAGE, {
        body: content,
        type: 'text',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async setTyping(isTyping: boolean): Promise<void> {
    if (!this.client || !this.roomId || !this.disconnect) return;

    try {
      this.client.sendMessage(SocketMessageTypes.SET_TYPING_PRESENCE, { typing: isTyping });
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  }

  private handleMessage(message: any) {
    if (!message || !message.type) return;

    try {
      switch (message.type) {
        case SocketMessageTypes.SEND_MESSAGE: {
          const chatMessage: ChatMessage = {
            ...message.data,
            timestamp: new Date(message.data.timestamp).toISOString(),
            userId: message.data.permId,
            userNickname: message.data.userNickname || 'Anonymous',
            isSystemMessage: message.data.isSystemMessage || false,
          };
          this.messageCallbacks.forEach(callback => callback(chatMessage));
          break;
        }
        case SocketMessageTypes.SET_TYPING_PRESENCE: {
          const { anyoneTyping } = message.data;
          this.typingCallbacks.forEach(callback => callback(anyoneTyping));
          break;
        }
      }
    } catch (error) {
      console.error('Error handling message:', error, message);
    }
  }

  onMessage(callback: (message: ChatMessage) => void): () => void {
    this.messageCallbacks.push(callback);
    // Return a cleanup function to remove the callback
    return () => {
      const index = this.messageCallbacks.indexOf(callback);
      if (index > -1) {
        this.messageCallbacks.splice(index, 1);
      }
    };
  }

  onTypingChange(callback: (isTyping: boolean) => void): () => void {
    this.typingCallbacks.push(callback);
    // Return a cleanup function to remove the callback
    return () => {
      const index = this.typingCallbacks.indexOf(callback);
      if (index > -1) {
        this.typingCallbacks.splice(index, 1);
      }
    };
  }

  onConnectionChange(callback: (isConnected: boolean) => void): () => void {
    this.connectionCallbacks.push(callback);
    // Return a cleanup function to remove the callback
    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  getRoomId(): string | null {
    return this.roomId;
  }

  disconnect(): void {
    if (this.client) {
      this.client.teardown();
      this.roomId = null;
      this.user = null;
    }
  }
}

export const chatWebSocket = new ChatWebSocket();
