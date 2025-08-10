import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { socketService } from '@/services/socket.service';
import { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  isConnecting: false,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { getToken, isSignedIn, isLoaded } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      // Clean up socket when user signs out
      if (socket) {
        console.log('SocketContext: User signed out, cleaning up socket');
        socketService.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const initSocket = async () => {
      try {
        setIsConnecting(true);
        console.log('SocketContext: Initializing global socket connection...');
        const token = await getToken();
        if (token) {
          console.log('SocketContext: Token obtained, connecting socket...');
          const newSocket = socketService.connect(token);
          setSocket(newSocket);

          newSocket.on('connect', () => {
            console.log('SocketContext: Global socket connected successfully!');
            setIsConnected(true);
            setIsConnecting(false);
          });
          
          newSocket.on('disconnect', () => {
            console.log('SocketContext: Global socket disconnected');
            setIsConnected(false);
          });
          
          newSocket.on('error', (error) => {
            console.error('SocketContext: Global socket error:', error);
            setIsConnecting(false);
          });
        } else {
          console.error('SocketContext: Failed to get token for socket connection');
          setIsConnecting(false);
        }
      } catch (error) {
        console.error('SocketContext: Global socket connection error:', error);
        setIsConnecting(false);
      }
    };

    initSocket();

    return () => {
      console.log('SocketContext: Cleaning up global socket connection');
      socketService.disconnect();
      setSocket(null);
      setIsConnected(false);
      setIsConnecting(false);
    };
  }, [getToken, isLoaded, isSignedIn]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, isConnecting }}>
      {children}
    </SocketContext.Provider>
  );
};
