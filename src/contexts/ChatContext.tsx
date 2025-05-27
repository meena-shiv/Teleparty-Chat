import { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { AppState, User, ChatMessage } from '../types';

type ChatAction =
  | { type: 'SET_CURRENT_USER'; payload: User }
  | { type: 'SET_ROOM_ID'; payload: string }
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'REMOVE_USER'; payload: string }
  | { type: 'RESET_STATE' };

const initialState: AppState = {
  currentUser: null,
  roomState: {
    roomId: '',
    isConnected: false,
    messages: [],
    users: [],
    isTyping: false,
  },
};

const chatReducer = (state: AppState, action: ChatAction): AppState => {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUser: action.payload,
      };
    case 'SET_ROOM_ID':
      return {
        ...state,
        roomState: {
          ...state.roomState,
          roomId: action.payload,
        },
      };
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        roomState: {
          ...state.roomState,
          isConnected: action.payload,
        },
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        roomState: {
          ...state.roomState,
          messages: [...state.roomState.messages, action.payload],
        },
      };
    case 'SET_TYPING':
      return {
        ...state,
        roomState: {
          ...state.roomState,
          isTyping: action.payload,
        },
      };
    case 'ADD_USER':
      // Check if user already exists
      if (state.roomState.users.some(user => user.id === action.payload.id)) {
        return state;
      }
      return {
        ...state,
        roomState: {
          ...state.roomState,
          users: [...state.roomState.users, action.payload],
        },
      };
    case 'REMOVE_USER':
      return {
        ...state,
        roomState: {
          ...state.roomState,
          users: state.roomState.users.filter((user) => user.id !== action.payload),
        },
      };
    case 'RESET_STATE':
      return {
        ...initialState,
        currentUser: state.currentUser, // Keep current user on reset
        roomState: {
          ...initialState.roomState,
          isConnected: false,
        },
      };
    default:
      return state;
  }
};

const ChatContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<ChatAction>;
  actions: {
    resetState: () => void;
  };
}>({
  state: initialState,
  dispatch: () => null,
  actions: {
    resetState: () => {},
  },
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const actions = {
    resetState: () => dispatch({ type: 'RESET_STATE' }),
  };

  return (
    <ChatContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
