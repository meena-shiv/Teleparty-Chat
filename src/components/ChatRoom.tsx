import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { StackProps } from '@chakra-ui/react';
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  VStack,
  HStack,
  Avatar,
  Spinner,
  Heading,
} from '@chakra-ui/react';
import { FormControl } from '@chakra-ui/form-control';
import { useChat } from '../contexts/ChatContext';
import { chatWebSocket } from '../services/websocket';

export default function ChatRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const { state, dispatch } = useChat();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle incoming messages
  useEffect(() => {
    if (!state.currentUser || !roomId) {
      navigate('/');
      return;
    }

    // Set up message handler
    const handleMessage = (msg: any) => {
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          ...msg,
          timestamp: new Date(msg.timestamp).toISOString(),
          userId: msg.permId,
        },
      });
    };

    // Set up typing handler
    const handleTyping = (isTyping: boolean) => {
      dispatch({ type: 'SET_TYPING', payload: isTyping });
    };

    // Subscribe to messages and typing events
    const cleanupMessage = chatWebSocket.onMessage(handleMessage);
    const cleanupTyping = chatWebSocket.onTypingChange(handleTyping);

    // Clean up on unmount
    return () => {
      cleanupMessage();
      cleanupTyping();
    };
  }, [dispatch, navigate, roomId, state.currentUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [state.roomState.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !state.currentUser || !roomId) return;
    
    try {
      setIsSending(true);
      await chatWebSocket.sendMessage(message);
      setMessage('');
      // Reset typing indicator
      if (isTyping) {
        setIsTyping(false);
        await chatWebSocket.setTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleTypingChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Update typing status
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      await chatWebSocket.setTyping(true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      await chatWebSocket.setTyping(false);
    }
  };

  const handleLeaveRoom = () => {
    chatWebSocket.disconnect();
    navigate('/');
  };

  const StyledVStack: React.FC<StackProps> = ({ children, ...rest }) => (
    <VStack {...rest}>{children}</VStack>
  );

  if (!state.roomState.isConnected) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <StyledVStack gap={4}>
          <Spinner size="xl" />
          <Text>Connecting to chat room...</Text>
        </StyledVStack>
      </Flex>
    );
  }

  return (
    <Flex direction="column" h="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" p={4} borderBottomWidth={1} boxShadow="sm">
        <HStack gap={4}>
        <Button onClick={handleLeaveRoom} variant="outline">Leave</Button>
          <VStack align="flex-start" gap={0}>
            <Heading size="md">Room: {roomId}</Heading>
          </VStack>
        </HStack>
      </Box>

      {/* Messages */}
      <Flex flex={1} direction="column" p={4} overflowY="auto">
        <VStack gap={4} align="stretch" width="100%" maxW="container.md" mx="auto">
          {state.roomState.messages.map((msg, index) => (
            <Box
              key={`${msg.permId}-${index}`}
              alignSelf={msg.userId === state.currentUser?.id ? 'flex-end' : 'flex-start'}
              maxW="80%"
            >
              {msg.isSystemMessage ? (
                <Text fontSize="sm" color="gray.500" textAlign="center" py={2}>
                  {msg.userNickname + ' ' + msg.body}
                </Text>
              ) : (
                <Box
                  bg={msg.userId === state.currentUser?.id ? 'blue.500' : 'white'}
                  color={msg.userId === state.currentUser?.id ? 'white' : 'gray.800'}
                  px={4}
                  py={2}
                  borderRadius="lg"
                  boxShadow="sm"
                >
                  <HStack gap={2} mb={1}>
                    <Avatar.Root size="xs">
                      <Avatar.Fallback>{msg.userNickname?.charAt(0) || 'U'}</Avatar.Fallback>
                      {msg.userIcon && <Avatar.Image src={msg.userIcon} alt={msg.userNickname} />}
                    </Avatar.Root>
                    <Text fontWeight="bold" fontSize="sm">
                      {msg.userNickname || 'Anonymous'}
                    </Text>
                    <Text fontSize="xs" opacity={0.7}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </Text>
                  </HStack>
                  <Text>{msg.body}</Text>
                </Box>
              )}
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </VStack>
      </Flex>

      {/* Typing indicator */}
      {state.roomState.isTyping && (
        <Box px={4} py={2} bg="white" borderTopWidth={1}>
          <Text fontSize="sm" color="gray.500">
            Someone is typing...
          </Text>
        </Box>
      )}

      {/* Message input */}
      <Box bg="white" p={4} borderTopWidth={1} boxShadow="md">
        <form onSubmit={handleSendMessage}>
          <HStack>
            <FormControl>
              <Input
                type="text"
                value={message}
                onChange={handleTypingChange}
                placeholder="Type a message..."
                autoFocus
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="blue"
              loading={isSending}
              loadingText="Sending"
              disabled={!message.trim()}
            >
              Send
            </Button>
          </HStack>
        </form>
      </Box>
    </Flex>
  );
}
