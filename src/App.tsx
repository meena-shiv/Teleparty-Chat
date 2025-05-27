import { Box } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChatProvider } from './contexts/ChatContext';
import Home from './components/Home';
import ChatRoom from './components/ChatRoom';

function App() {
  return (
    <ChatProvider>
      <Router>
        <Box minH="100vh" bg="gray.50">
          <Routes>
            <Route path="/Teleparty-Chat/" element={<Home />} />
            <Route path="/Teleparty-Chat/room/:roomId" element={<ChatRoom />} />
          </Routes>
        </Box>
      </Router>
    </ChatProvider>
  );
}

export default App;
