import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Heading, Input } from '@chakra-ui/react';
import { useChat } from '../contexts/ChatContext';
import { chatWebSocket } from '../services/websocket';

// Simple form control component
const FormControl = ({ children, id }: { children: React.ReactNode; id: string }) => (
  <div style={{ width: '100%', marginBottom: '1rem' }} id={id}>
    {children}
  </div>
);

// Simple form label component
const FormLabel = ({ children }: { children: React.ReactNode }) => (
  <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>{children}</div>
);

// Simple stack component
const VStack = ({ children, spacing = 4 }: { children: React.ReactNode; spacing?: number }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing * 0.25}rem` }}>{children}</div>
);

// Error state management

export default function Home() {
  const [nickname, setNickname] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();
  const { dispatch } = useChat();

  const handleCreateRoom = async () => {
    if (!nickname.trim()) {
      setError('Please enter a nickname');
      return;
    }
    setError('');
    setFormError('');

    try {
      setIsCreating(true);
      const userId = `user-${Date.now()}`;
      const user = { id: userId, nickname };
      
      // Set current user in context
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
      
      // Create room and get room ID
      const newRoomId = await chatWebSocket.createRoom(user);
      
      // Set room ID in context
      dispatch({ type: 'SET_ROOM_ID', payload: newRoomId });
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
      
      // Navigate to chat room
      navigate(`/room/${newRoomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
      setFormError('Failed to create room. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!nickname.trim() || !roomId.trim()) {
      setError('Please enter both nickname and room ID');
      return;
    }
    setError('');
    setFormError('');

    try {
      setIsJoining(true);
      const userId = `user-${Date.now()}`;
      const user = { id: userId, nickname };
      
      // Set current user in context
      dispatch({ type: 'SET_CURRENT_USER', payload: user });
      
      // Join existing room
      await chatWebSocket.joinRoom(roomId, user);
      
      // Set room ID in context
      dispatch({ type: 'SET_ROOM_ID', payload: roomId });
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
      
      // Navigate to chat room
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('Error joining room:', error);
      setFormError('Failed to join room. Please check the room ID and try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Container maxW="md" py={10} px={5}>
      <VStack spacing={8}>
        <Heading as="h1" size="2xl" textAlign="center">
          Teleparty Chat
        </Heading>
        
        <Box w="100%" maxW="md" p={6} borderWidth={1} borderRadius="lg" boxShadow="lg">
          <VStack spacing={4}>
            <FormControl id="nickname">
              <FormLabel>Your Nickname</FormLabel>
              <Input
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  setError('');
                }}
                placeholder="Enter your nickname"
              />
              {error && (
                <Box color="red.500" mt={1} fontSize="sm">
                  {error}
                </Box>
              )}
            </FormControl>

            <FormControl id="roomId">
              <FormLabel>Room ID (leave empty to create a new room)</FormLabel>
              <Input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID to join"
              />
            </FormControl>

            <Button
              colorScheme="blue"
              onClick={roomId ? handleJoinRoom : handleCreateRoom}
              disabled={isCreating || isJoining}
              style={{
                width: '100%',
                marginTop: '1rem',
                position: 'relative',
                opacity: isCreating || isJoining ? 0.7 : 1,
                cursor: isCreating || isJoining ? 'not-allowed' : 'pointer',
              }}
            >
              {(isCreating || isJoining) ? (roomId ? 'Joining...' : 'Creating...') : (roomId ? 'Join Room' : 'Create New Room')}
            </Button>
          </VStack>
          {formError && (
            <Box color="red.500" mt={4} textAlign="center" fontSize="sm">
              {formError}
            </Box>
          )}
        </Box>
      </VStack>
    </Container>
  );
}
